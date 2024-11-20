import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {

}
