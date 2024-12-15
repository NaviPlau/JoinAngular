import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Task } from '../../interfaces/task';
import { HttpRequestService } from '../http/http-request.service';
import { UserProfile } from '../../interfaces/user-profile';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {
  BASE_URL = 'http://127.0.0.1:8000/api/join_app/tasks';
  httpService = inject(HttpRequestService)
  allTasks = signal<Task[]>([]);
  assignedTo: UserProfile[] = []
  userProfiles = signal<UserProfile[]>([])
  constructor() { }


  async getTasksFromDB(): Promise<Task[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return [];
    }
  
    try {
      const tasks = await this.httpService
        .get('http://127.0.0.1:8000/join/tasks/', token)
        .toPromise() as Task[];
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

  




  async postTask(task: Task | any): Promise<any> {
    const token = localStorage.getItem('authToken');

    task.assignedTo = task.assignedTo.map((user: any) => user.id);
    
    if (!token) {
      console.error('No auth token found');
      throw new Error('Authentication token is required');
    }
  
    try {
      
      const response = await this.httpService
        .post('http://127.0.0.1:8000/join/tasks/', task, token)
        .toPromise();
  
      return response; // Return the response for further processing if needed
    } catch (error: any) {
      console.error('Error creating task:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }

  async getTasksAssignedUsers(task: Task | any): Promise<any[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      throw new Error('Authentication token is required');
    }
    try {
      const profileFetchPromises = task.assignedTo.map((userId: number) =>
        this.httpService.get(`http://127.0.0.1:8000/auth/api/profile/${userId}/`, token).toPromise()
      );
      const profiles = await Promise.all(profileFetchPromises); 
  
      return profiles;
    } catch (error: any) {
      console.error('Error fetching assigned user profiles:', error);
      throw error; 
    }
  }

  getUsersProfileFromDb(){
    let token = localStorage.getItem('authToken');
    if(!token) return
      
    
    this.httpService.get('http://127.0.0.1:8000/auth/api/profiles/', token).subscribe({
      next: (userProfile: any) => {
        this.userProfiles.set(userProfile)
        
      },
      error: (profileError: any) => {
        console.error('Error fetching user profile:', profileError);
      },
    })
  }

  

  deleteTask(task: Task | any) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }
    this.httpService.delete(`http://127.0.0.1:8000/join/tasks/${task.id}/`, token)
      .subscribe({
        error: (err) => console.error('Error deleting task:', err),
      });
  }


  async updateTask(task: Task | any) {
    const token = localStorage.getItem('authToken');
    if (!token) { return; }
    try {
      await lastValueFrom(
        this.httpService.patch(`http://127.0.0.1:8000/join/tasks/${task.id}/`, task, token)
      );
      await this.getTasksFromDB();
    } catch (error: any) {
      console.error('Error updating task:', error);
    }
  }

}
