import { Component } from '@angular/core';
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { HeaderComponent } from "../shared/components/header/header.component";
import { MaterialModule } from '../material/material.module';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, MaterialModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {

}
