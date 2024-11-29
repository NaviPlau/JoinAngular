import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
    selector: 'app-header',
    imports: [MaterialModule, CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit, OnDestroy, OnInit {
  showLinks = false;
  authService = inject(AuthService);
  
  @ViewChild('initials') initials!: ElementRef;
  @ViewChild('links') links!: ElementRef;

  clickListener?: () => void;

  constructor(private renderer: Renderer2) {}


  get isGuestUser() {
    return this.authService.isGuestUser();
  }

  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  }

  get headerInitials() {
    return this.authService.headerInitials();
  }


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

  ngOnInit(): void {
   
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

