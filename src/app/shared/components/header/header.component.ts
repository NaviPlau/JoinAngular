import { AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  showLinks = false;
  
  @ViewChild('initials') initials!: ElementRef;
  @ViewChild('links') links!: ElementRef;

  clickListener?: () => void;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.clickListener = this.renderer.listen('document', 'click', (event: Event) => {
      if (this.initials?.nativeElement && this.links?.nativeElement) {
        if (!this.initials.nativeElement.contains(event.target) &&
            !this.links.nativeElement.contains(event.target)) {
          this.showLinks = false;
        }
      }
    });
  }

  toggleLinks() {
    this.showLinks = !this.showLinks;
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}

