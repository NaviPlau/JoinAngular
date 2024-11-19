import { Component } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { RouterLink, RouterLinkActive, } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

}
