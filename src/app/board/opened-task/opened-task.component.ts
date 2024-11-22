import { Component, Input } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-opened-task',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './opened-task.component.html',
  styleUrl: './opened-task.component.scss'
})
export class OpenedTaskComponent {
  @Input() task!: Task;
}
