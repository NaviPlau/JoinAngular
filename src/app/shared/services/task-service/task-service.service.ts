import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Task } from '../../interfaces/task';
import { HttpRequestService } from '../http/http-request.service';
import { UserProfile } from '../../interfaces/user-profile';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService implements OnInit {
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
      // Fetch tasks from the server
      const tasks = await this.httpService
        .get('http://127.0.0.1:8000/join/tasks/', token)
        .toPromise() as Task[];
      console.log('Tasks fetched successfully:', tasks);
      console.log(tasks);
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

  



  async ngOnInit(): Promise <void> {
    await this.getTasksFromDB();

  }

  async postTask(task: Task | any): Promise<any> {
    const token = localStorage.getItem('authToken');
    console.log(task);
    task.assignedTo = task.assignedTo.map((user: any) => user.id);
    
    if (!token) {
      console.error('No auth token found');
      throw new Error('Authentication token is required');
    }
  
    try {
      console.log(task);
      
      const response = await this.httpService
        .post('http://127.0.0.1:8000/join/tasks/', task, token)
        .toPromise();
  
      console.log('Task created successfully:', response);
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
      console.log('Fetched assigned user profiles:', profiles);
  
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
        this.userProfiles = userProfile
        console.log('User profile fetched successfully:', userProfile);
        
      },
      error: (profileError: any) => {
        console.error('Error fetching user profile:', profileError);
      },
    })
  }

  // async postTask(task: Task | any) {
  //   this.httpService.makeHttpRequest(this.BASE_URL, 'POST', task).then(() => this.getTasksFromDB());
  // }

  

  // async deleteTask(task: Task | any) {
  //   this.httpService.makeHttpRequest(this.BASE_URL + `/${task.id}`, 'DELETE').then(() => this.getTasksFromDB());
  // }

  // async updateTask(task: Task | any) {
  //   this.httpService.makeHttpRequest(this.BASE_URL + `/${task.id}`, 'PUT', task).then(() => this.getTasksFromDB());
  // }

}
