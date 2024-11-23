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
        { initials: 'SM', initialsColor: '#00bcd4', fullName: 'Sofia Müller', selected: false, email: '6VtY0@example.com1', phone: '123-456-7890' },
        { initials: 'AM', initialsColor: '#ff5722', fullName: 'Anton Mayer', selected: false, email: '6VtY0@example.com2', phone: '234-567-8901' }
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
        { initials: 'AS', initialsColor: '#9c27b0', fullName: 'Anja Schulz', selected: false, email: '6VtY0@example.com3', phone: '345-678-9012' }
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
        { initials: 'BZ', initialsColor: '#3f51b5', fullName: 'Benedikt Ziegler', selected: false, email: '6VtY0@example.com4', phone: '456-789-0123' }
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
        { initials: 'DE', initialsColor: '#e91e63', fullName: 'David Eisenberg', selected: false, email: '6VtY0@example.com5', phone: '567-890-1234' },
        { initials: 'JB', initialsColor: '#4caf50', fullName: 'Julia Braun', selected: false, email: '6VtY0@example.com6', phone: '678-901-2345' }
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
        { initials: 'LT', initialsColor: '#673ab7', fullName: 'Lena Thomas', selected: false, email: '6VtY0@example.com8', phone: '890-123-4567' }
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
        { initials: 'RC', initialsColor: '#f44336', fullName: 'Rita Cohen', selected: false, email: 'rc@example.com', phone: '123-456-7890' },
        { initials: 'MH', initialsColor: '#3f51b5', fullName: 'Michael Harper', selected: false, email: 'mh@example.com', phone: '234-567-8901' },
        { initials: 'JK', initialsColor: '#4caf50', fullName: 'Jackie Kennedy', selected: false, email: 'jk@example.com', phone: '345-678-9012' },
        { initials: 'AR', initialsColor: '#e91e63', fullName: 'Alexis Rodriguez', selected: false, email: 'ar@example.com', phone: '456-789-0123' },
        { initials: 'TN', initialsColor: '#ff9800', fullName: 'Tom Nguyen', selected: false, email: 'tn@example.com', phone: '567-890-1234' },
        { initials: 'MW', initialsColor: '#00bcd4', fullName: 'Mona Winters', selected: false, email: 'mw@example.com', phone: '678-901-2345' },
        { initials: 'JS', initialsColor: '#9c27b0', fullName: 'Jennifer Smith', selected: false, email: 'js@example.com', phone: '789-012-3456' }
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

