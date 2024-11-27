import { Component, computed, Host, HostListener, inject } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { Task } from '../shared/interfaces/task';
import { TaskComponent } from "./task/task.component";
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { AddTaskTemplateComponent } from "../shared/components/templates/add-task-template/add-task-template.component";
import { TaskServiceService } from '../shared/services/task-service/task-service.service';

type Column = "awaitingFeedback" | "toDo" | "inProgress" | "done";

@Component({
    selector: 'app-board',
    imports: [CommonModule, HeaderComponent, SidebarComponent, MaterialModule, TaskComponent, AddTaskTemplateComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent {
  taskService = inject(TaskServiceService)

  tasks: Task[] = [];

  addingNewTask: boolean = false;
  toDoTasks = computed(() =>
    this.taskService.allTasks().filter((task) => task.column === 'toDo')
  );

  inProgressTasks = computed(() =>
    this.taskService.allTasks().filter((task) => task.column === 'inProgress')
  );

  awaitingFeedbackTasks = computed(() =>
    this.taskService.allTasks().filter((task) => task.column === 'awaitingFeedback')
  );

  doneTasks = computed(() =>
    this.taskService.allTasks().filter((task) => task.column === 'done')
  );

  selectedColumn: Column  = 'toDo';

  filterTaskByColumn(column: string): Task[] {
    return this.tasks.filter(task => task.column === column);
  }

  onDrop(event: CdkDragDrop<Task[]>, targetColumn: Column): void {
    const draggedTask = event.previousContainer.data[event.previousIndex];
    
    if (event.previousContainer !== event.container) {
      draggedTask.column = targetColumn;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  addTask(event: Event): void {
    event.stopPropagation(); 
    this.addingNewTask = true;
  }

  closeOverlay(): void {
    const template = document.querySelector('app-add-task-template');
    if (template) {
      template.classList.add('fade-out-to-left');
      setTimeout(() => {
        this.addingNewTask = false; 
      }, 500); 
    } else {
      this.addingNewTask = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.addingNewTask && !target.closest('.overlay')) {
      this.closeOverlay();
    }
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.closeOverlay();
    }
  }

  setColumn(column: Column): void {
    this.selectedColumn = column; 
  }

  async ngOnInit(): Promise<void> {
    await this.taskService.getTasksFromDB();
  }
}

