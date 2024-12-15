import { Component, EventEmitter, Host, HostListener, Input, Output } from '@angular/core';
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
  openedMenu: boolean = false;
  isMobile: boolean = false;

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


  setColumn(column: string) {
    let assignedTo = this.task.assignedTo.map((contact: any) => contact.id);
    this.taskService.updateTask({...this.task, column, assignedTo});
    this.openedMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openedMenu) {
      this.openedMenu = false;
    }
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.isMobile = true;
    console.log('Touch event detected, setting isMobile to true.');
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.isMobile = false;
    console.log('Touch event ended.');
  }
}
