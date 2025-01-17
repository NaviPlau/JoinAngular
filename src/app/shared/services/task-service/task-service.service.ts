import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Task } from '../../interfaces/task';
import { HttpRequestService } from '../http/http-request.service';
import { UserProfile } from '../../interfaces/user-profile';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {
  BASE_URL = 'http://vm.paul-ivan.com/join/tasks/';
  httpService = inject(HttpRequestService)
  allTasks = signal<Task[]>([]);
  assignedTo: UserProfile[] = []
  userProfiles = signal<UserProfile[]>([])
  constructor() { }


  /**
   * Fetches all tasks from the database and stores them in the component's
   * `allTasks` state variable. Also, fetches the assigned users for each task
   * and stores them in the `assignedTo` state variable.
   */
  async getTasksFromDB(): Promise<Task[]> {
    const token = localStorage.getItem('authToken');
    if (!token) { return []; }
    try {
      const tasks = await this.httpService.get(this.BASE_URL, token).toPromise() as Task[];
      for (const task of tasks) {
        const assignedProfiles = await this.getTasksAssignedUsers(task);
        task.assignedTo = assignedProfiles;
      }
      this.allTasks.set(tasks);
      return tasks;
    } catch (error: any) {
      console.error('Error fetching tasks from DB:', error);
      return [];
    }
  }


  /**
   * Posts a new task to the server.
   * Converts assigned users to their respective IDs before sending.
   * Throws an error if authentication token is not available.
   * @param task - The task object to be posted, which includes title, description, dueDate, priority, category, assignedTo, and subtasks.
   * @returns A promise that resolves to the server's response.
   * @throws An error if the post request fails or if authentication token is missing.
   */
  async postTask(task: Task | any): Promise<any> {
    const token = localStorage.getItem('authToken');
    task.assignedTo = task.assignedTo.map((user: any) => user.id);
    if (!token) { throw new Error('Authentication token is required') }
    try {
      const response = await this.httpService.post(this.BASE_URL, task, token).toPromise();
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Fetches user profiles for the users assigned to a given task.
   *
   * Utilizes the `assignedTo` property of the task, which contains user IDs,
   * to request each user's profile from the server. The profiles are fetched
   * concurrently and returned as an array.
   *
   * @param task - The task object containing a list of user IDs in its `assignedTo` field.
   * @returns A promise that resolves to an array of user profiles.
   * @throws An error if the authentication token is missing or if fetching profiles fails.
   */
  async getTasksAssignedUsers(task: Task | any): Promise<any[]> {
    const token = localStorage.getItem('authToken');
    if (!token) { throw new Error('Authentication token is required') }
    try {
      const profileFetchPromises = task.assignedTo.map((userId: number) =>
        this.httpService.get(`http://vm.paul-ivan.com/join/auth/api/profile/${userId}/`, token).toPromise()
      );
      const profiles = await Promise.all(profileFetchPromises);
      return profiles;
    } catch (error: any) {
      console.error('Error fetching assigned user profiles:', error);
      throw error;
    }
  }

  /**
   * Fetches user profiles from the server and updates the user profiles signal
   *
   * This method will be called by components that need to display user profiles,
   * such as the contact list component. It will request all user profiles from
   * the server and update the user profiles signal with the received data.
   *
   * If the authentication token is not available, this method does nothing.
   *
   * @returns void
   * @throws An error if fetching user profiles fails.
   */
  getUsersProfileFromDb() {
    let token = localStorage.getItem('authToken');
    if (!token) { return }
    this.httpService.get('http://vm.paul-ivan.com/join/auth/api/profiles/', token).subscribe({
      next: (userProfile: any) => {
        this.userProfiles.set(userProfile)
      },
      error: (profileError: any) => {
        console.error('Error fetching user profile:', profileError);
      },
    })
  }



  /**
   * Deletes a task from the server.
   * @param task The task to delete. Must have an `id` property.
   * @returns void
   * @throws An error if the task could not be deleted.
   */
  deleteTask(task: Task | any) {
    const token = localStorage.getItem('authToken');
    if (!token) { return }
    this.httpService.delete(`http://vm.paul-ivan.com/join/tasks/${task.id}/`, token)
      .subscribe({
        error: (err) => console.error('Error deleting task:', err),
      });
  }


  /**
   * Updates a task in the database with the provided task data.
   * This function sends a PATCH request to the server with the updated task data.
   * If the update is successful, it refreshes the list of tasks by fetching them from the database.
   * @param task - The task object containing the updated information. Must include an `id` property.
   * @throws Logs an error message if the update request fails.
   */
  async updateTask(task: Task | any) {
    const token = localStorage.getItem('authToken');
    if (!token) { return; }
    try {
      await lastValueFrom(this.httpService.patch(`http://vm.paul-ivan.com/join/tasks/${task.id}/`, task, token));
      await this.getTasksFromDB();
    } catch (error: any) {
      console.error('Error updating task:', error);
    }
  }

}
