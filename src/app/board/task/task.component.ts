import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { OpenedTaskComponent } from "../opened-task/opened-task.component";
import { TaskServiceService } from '../../shared/services/task-service/task-service.service';

@Component({
    selector: 'app-task',
    imports: [CommonModule, MaterialModule, OpenedTaskComponent],
    templateUrl: './task.component.html',
    styleUrl: './task.component.scss'
})
export class TaskComponent {

  @Output() touchStart = new EventEmitter<TouchEvent>();
  @Output() touchMove = new EventEmitter<TouchEvent>();
  @Output() touchEnd = new EventEmitter<TouchEvent>();
  @Input() task!: Task;
  openedTask: boolean = false;
  editingTask: boolean = false;

  constructor(private taskService: TaskServiceService) { }

  get completedSubtasks(): number {
    return this.task.subtasks.filter(subtask => subtask.completed).length;
  }
  get totalSubtasks(): number {
    return this.task.subtasks.length;
  }

  openTask(task: Task) {
    this.openedTask = true;
  }

  onTaskClosed() {
    this.openedTask = false;
  }

  onEditingTaskChange(editingTask: boolean) {
    this.editingTask = editingTask;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStart.emit(event); 
  }

  onTouchMove(event: TouchEvent): void {
    this.touchMove.emit(event); 
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEnd.emit(event); 
    
  }
}
