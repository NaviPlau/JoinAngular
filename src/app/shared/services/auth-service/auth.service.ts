import { inject, Injectable, signal } from '@angular/core';
import { HttpRequestService } from '../http/http-request.service';
import { RegisterData } from '../../interfaces/register-data';
import { Router } from '@angular/router';
import { ContactsService } from '../contacts-service/contacts.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  httpService = inject(HttpRequestService)

  REGISTER_URL = 'http://127.0.0.1:8000/auth/api/register/'
  LOGIN_URL = 'http://127.0.0.1:8000/auth/api/login/'
  GUEST_LOGIN_URL = 'http://127.0.0.1:8000/api/auth/guestlogin/';
  registerdata = {} as RegisterData
  loginData = {}
  userIsLoggedIn = signal(false); 
  isGuestUser = signal(false); 
  headerInitials = signal(''); 
  userData = signal<any>(null);
  errorMessage = signal('');
  registerSuccess = signal(false);
  userLoggedIn = signal(false);
  authToken = signal('');


  async registerUser() {
    this.httpService.post(this.REGISTER_URL, this.registerdata).subscribe({
      next: () => {
        this.registerSuccess.set(true);
        this.redirectAfterRegister();
      },
      error: (error: any) => {
        if (error.error && error.error.email) {
          this.errorMessage.set(error.error.email[0]); 
        } else {
          this.errorMessage.set(error.message || 'Registration failed.');
        }
        this.registerSuccess.set(false);
      },
    });
  }

  loginUser() {
    this.httpService.post(this.LOGIN_URL, this.loginData).subscribe({
      next: (loginResponse: any) => {
        const token = loginResponse.token;
        this.httpService.get('http://127.0.0.1:8000/auth/api/profile/', token).subscribe({
          next: (userProfile: any) => {
            this.setUserData(userProfile, false);
            this.userIsLoggedIn.set(true);
            this.authToken.set(token);
            localStorage.setItem('authToken', token);
          },
          error: (profileError: any) => {
            console.error('Error fetching user profile:', profileError);
            this.errorMessage.set(profileError.message || 'Failed to fetch user profile.');
          },
        });
      },
      error: (loginError: any) => {
        console.error('Login error:', loginError);
        this.errorMessage.set(loginError.message || 'Failed to log in.');
      },
    });
  }



  async guestLogin() {
    try {
      this.userIsLoggedIn.set(true);
    } catch (error) {
      console.error('Guest login error:', error);
    }
  }

  logoutUser() {
    this.userIsLoggedIn.set(false);
    this.clearUserData();
    this.goToLogin();
  }

  goToLogin(){
    this.router.navigate(['/']);
  }

  redirectAfterRegister(){
    setTimeout(() => {
      this.registerSuccess.set(false);
      this.goToLogin();
    }, 2000);
  }

  initializeState() {
    const authToken = localStorage.getItem('authToken');
    const guestToken = localStorage.getItem('guestToken');
    const storedInitials = localStorage.getItem('userInitials') || '';
    const storedUserData = localStorage.getItem('userData');
    if (authToken) {
      this.setTokenAndState(authToken, false);
      this.headerInitials.set(storedInitials);
      if (storedUserData) {
        this.userData.set(JSON.parse(storedUserData));
      }
    } else if (guestToken) {
      this.setTokenAndState(guestToken, true);
      this.headerInitials.set('GU');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        this.userData.set({
          ...userData,
          name: 'Guest User',
        });
      }
    } else {
      this.clearState();
    }
  }


  redirectUser() {
    this.router.navigate(['/summary']);
  }

  setUserData(userData: any, isGuest: boolean) {
    this.userData.set({
      ...userData,
      name: isGuest ? 'Guest User' : userData.name, 
    });
    this.userIsLoggedIn.set(true);
    this.isGuestUser.set(isGuest);
    const initials = isGuest ? 'GU' : userData.initials || '';
    this.headerInitials.set(initials);
    const tokenKey = isGuest ? 'guestToken' : 'authToken';
    this.authToken.set(userData.token);
    localStorage.setItem(tokenKey, userData.token);
    localStorage.setItem('userInitials', initials); 
    localStorage.setItem('userData', JSON.stringify(this.userData())); 
    this.redirectUser();
  }

  clearUserData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('guestToken');
    localStorage.removeItem('userInitials');
    localStorage.removeItem('userData');
    this.authToken.set('');
    this.clearState();
  }


  clearState() {
    this.userIsLoggedIn.set(false);
    this.isGuestUser.set(false);
    this.headerInitials.set('');
    this.userData.set(null);
  }

  setTokenAndState(token: string, isGuest: boolean) {
    this.authToken.set(token);
    this.userIsLoggedIn.set(true);
    this.isGuestUser.set(isGuest);
    this.headerInitials.set(isGuest ? 'GU' : '');
  }

}

