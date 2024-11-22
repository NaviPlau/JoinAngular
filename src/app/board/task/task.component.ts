import { Component, Input } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { OpenedTaskComponent } from "../opened-task/opened-task.component";

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, MaterialModule, OpenedTaskComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  @Input() task!: Task;
  openedTask: boolean = false;

  get completedSubtasks(): number {
    return this.task.subtasks.filter(subtask => subtask.completed).length;
  }
  get totalSubtasks(): number {
    return this.task.subtasks.length;
  }

  openTask(task: Task) {
    console.log(task);
    this.openedTask = true;
  }
}