import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Task } from '../../interfaces/task';
import { HttpRequestService } from '../http/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService implements OnInit {
  BASE_URL = 'http://127.0.0.1:8000/api/join_app/tasks';
  httpService = inject(HttpRequestService)
  allTasks = signal<Task[]>([]);
  constructor() { }


  async getTasksFromDB(): Promise<Task[]> {
    try {
      const tasks = await this.httpService.makeHttpRequest(this.BASE_URL, 'GET');
      this.allTasks.set(tasks);
      return tasks;
    } catch (error: any) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }
  }

  async ngOnInit(): Promise <void> {
    await this.getTasksFromDB();

  }

  async postTask(task: Task | any) {
    this.httpService.makeHttpRequest(this.BASE_URL, 'POST', task).then(() => this.getTasksFromDB());
  }

  async deleteTask(task: Task | any) {
    this.httpService.makeHttpRequest(this.BASE_URL + `/${task.id}`, 'DELETE').then(() => this.getTasksFromDB());
  }

  async updateTask(task: Task | any) {
    this.httpService.makeHttpRequest(this.BASE_URL + `/${task.id}`, 'PUT', task).then(() => this.getTasksFromDB());
  }

}
