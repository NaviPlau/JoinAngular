import { Component, Input } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  @Input() task!: Task;

  get completedSubtasks(): number {
    return this.task.subtasks.filter(subtask => subtask.completed).length;
  }
  get totalSubtasks(): number {
    return this.task.subtasks.length;
  }
}
