import { Component, Host, HostListener } from '@angular/core';
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

type Column = "awaitingFeedback" | "toDo" | "inProgress" | "done";

@Component({
    selector: 'app-board',
    imports: [CommonModule, HeaderComponent, SidebarComponent, MaterialModule, TaskComponent, AddTaskTemplateComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent {
  tasks: Task[] = [
    {
      title: "Implement Authentication",
      description: "Set up authentication flow using Firebase for the project.",
      dueDate: new Date("2024-11-30"),
      subtasks: [
        { title: "Set up Firebase project", completed: true },
        { title: "Implement login form", completed: true },
        { title: "Test authentication flow", completed: true }
      ],
      priority: "urgent",
      category: "technical-task",
      contacts: [
      ],
      column: "toDo"
    },
    {
      title: "Design User Dashboard",
      description: "Create a user-friendly dashboard interface for the app.",
      dueDate: new Date("2024-12-05"),
      subtasks: [
        { title: "Wireframe the layout", completed: true },
        { title: "Design mockup", completed: false },
        { title: "Implement dashboard", completed: false }
      ],
      priority: "medium",
      category: "user-story",
      contacts: [
      ],
      column: "inProgress"
    },
    {
      title: "Optimize Database Queries",
      description: "Improve performance of Firestore queries to reduce loading times.",
      dueDate: new Date("2024-11-25"),
      subtasks: [
        { title: "Identify slow queries", completed: false },
        { title: "Optimize indexing", completed: false },
        { title: "Test performance", completed: false }
      ],
      priority: "urgent",
      category: "technical-task",
      contacts: [
      ],
      column: "toDo"
    },
    {
      title: "Develop Notification System",
      description: "Create a notification system for user actions and updates.",
      dueDate: new Date("2024-12-10"),
      subtasks: [
        { title: "Research notification solutions", completed: false },
        { title: "Implement basic notifications", completed: false },
        { title: "Test across devices", completed: false }
      ],
      priority: "medium",
      category: "technical-task",
      contacts: [
      ],
      column: "awaitingFeedback"
    },
    {
      title: "Write User Documentation",
      description: "Draft user documentation for the main features of the app.",
      dueDate: new Date("2024-12-15"),
      subtasks: [
        { title: "List key features", completed: false },
        { title: "Write user guide", completed: false },
        { title: "Review with the team", completed: false }
      ],
      priority: "low",
      category: "user-story",
      contacts: [
      ],
      column: "toDo"
    },
    {
      title: "Launch Marketing Campaign",
      description: "Plan and execute the marketing campaign for the app launch.",
      dueDate: new Date("2024-12-20"),
      subtasks: [
        { title: "Create campaign strategy", completed: false },
        { title: "Prepare promotional materials", completed: false },
        { title: "Schedule social media posts", completed: false },
        { title: "Launch advertisements", completed: false }
      ],
      priority: "urgent",
      category: "user-story",
      contacts: [
      ],
      column: "toDo"
    }
  ];

  addingNewTask: boolean = false;
  toDoTasks: Task[] = this.filterTaskByColumn("toDo");
  inProgressTasks: Task[] = this.filterTaskByColumn("inProgress");
  awaitingFeedbackTasks: Task[] = this.filterTaskByColumn("awaitingFeedback");
  doneTasks: Task[] = this.filterTaskByColumn("done");

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
}

