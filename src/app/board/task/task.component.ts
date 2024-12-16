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

  constructor(private taskService: TaskServiceService) {
    if (navigator.maxTouchPoints > 0) {
      this.isMobile = true;
    }
  }

  /**
   * Returns the number of subtasks that are completed.
   */
  get completedSubtasks(): number {
    return this.task.subtasks.filter(subtask => subtask.completed).length;
  }

  /**
   * Returns the total number of subtasks.
   */
  get totalSubtasks(): number {
    return this.task.subtasks.length;
  }

  /**
   * Opens the specified task by setting the openedTask flag to true.
   * @param task The task to be opened.
   */
  openTask(task: Task) {
    this.openedTask = true;
  }

  /**
   * Closes the task by setting the openedTask flag to false.
   */
  onTaskClosed() {
    this.openedTask = false;
  }

  /**
   * Sets the editing task flag to the specified value.
   * @param editingTask The new value of the editing task flag.
   */
  onEditingTaskChange(editingTask: boolean) {
    this.editingTask = editingTask;
  }


  /**
   * Sets the column of the task to the given column.
   * This will also update the task in the database.
   * @param column The column to set the task to.
   */
  setColumn(column: string) {
    let assignedTo = this.task.assignedTo.map((contact: any) => contact.id);
    this.taskService.updateTask({ ...this.task, column, assignedTo });
    this.openedMenu = false;
  }

  @HostListener('document:click', ['$event'])
  /**
   * Closes the opened menu when a click event occurs anywhere in the document.
   * @param event The mouse event triggered by the document click.
   */
  onDocumentClick(event: MouseEvent): void {
    if (this.openedMenu) {
      this.openedMenu = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  /**
   * Checks if the window width is less than 800px after a resize event
   * and sets the isMobile flag accordingly.
   * @param event The resize event triggered by the window.
   */
  onResize(event: Event): void {
    this.checkIfMobile();
  }


  /**
   * Checks if the window is a mobile device or not.
   * If the window is a mobile device, sets the isMobile flag to true.
   * Otherwise, sets the isMobile flag to false.
   */
  checkIfMobile() {
    if (navigator.maxTouchPoints > 0) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

}
