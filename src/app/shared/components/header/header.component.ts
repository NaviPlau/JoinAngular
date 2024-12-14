import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-header',
    imports: [MaterialModule, CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit, OnDestroy, OnInit {
  showLinks = false;
  authService = inject(AuthService);
  profileForm!: FormGroup;

  
  @ViewChild('initials') initials!: ElementRef;
  @ViewChild('links') links!: ElementRef;

  clickListener?: () => void;

  constructor(private renderer: Renderer2) {
    this.profileForm = new FormGroup({
      fullname: new FormControl(this.user.fullname, [
        Validators.required,
        Validators.pattern(/^\b\p{L}{3,}\b \b\p{L}{3,}\b$/u)
      ]),
      email: new FormControl(this.user.email, [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]),
      phone: new FormControl(this.user.phone, [
        Validators.required,
        Validators.pattern('^[0-9]{10,15}$')
      ])
    });
  }

 

  get user() {
    return this.authService.userData();
  }

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

