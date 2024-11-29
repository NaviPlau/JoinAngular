import { inject, Injectable, signal } from '@angular/core';
import { HttpRequestService } from '../http/http-request.service';
import { RegisterData } from '../../interfaces/register-data';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  httpService = inject(HttpRequestService)

  REGISTER_URL = 'http://127.0.0.1:8000/api/auth/registration/'
  LOGIN_URL = 'http://127.0.0.1:8000/api/auth/login/'
  GUEST_LOGIN_URL = 'http://127.0.0.1:8000/api/auth/guestlogin/';
  registerdata = {} as RegisterData
  loginData = {}
  userIsLoggedIn = signal(false); 
  isGuestUser = signal(false); 
  headerInitials = signal(''); 
  userData = signal<any>(null);
  errorMessage = signal('');
  userRegistered = signal(false);


  async registerUser() {
    try {
      const response = await this.httpService.makeHttpRequest(this.REGISTER_URL, 'POST', this.registerdata);
      await this.handleHttpErrors(response);
      this.userRegistered.set(true);
    } catch (error: any) {
      this.errorMessage.set(error.message);
    }
  }

  async loginUser() {
    try {
      const response = await this.httpService.makeHttpRequest(this.LOGIN_URL, 'POST', this.loginData);
      this.handleHttpErrors(response);

      const userData = await response.json();
      this.setUserData(userData, false);
      console.log('User logged in successfully', userData);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async guestLogin() {
    try {
      const response = await this.httpService.makeHttpRequest(this.GUEST_LOGIN_URL, 'POST');
      this.handleHttpErrors(response);
      const guestData = await response.json();
      this.setUserData(guestData, true);
      console.log('Guest logged in successfully', guestData);
    } catch (error) {
      console.error('Guest login error:', error);
    }
  }

  logoutUser() {
    this.clearUserData();
    this.router.navigate(['/']);
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
    this.httpService.setAuthToken(userData.token);

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
    this.httpService.setAuthToken(null);
    this.clearState();
  }


  private clearState() {
    this.userIsLoggedIn.set(false);
    this.isGuestUser.set(false);
    this.headerInitials.set('');
    this.userData.set(null);
  }

  private setTokenAndState(token: string, isGuest: boolean) {
    this.httpService.setAuthToken(token);
    this.userIsLoggedIn.set(true);
    this.isGuestUser.set(isGuest);
    this.headerInitials.set(isGuest ? 'GU' : '');
  }

  private async handleHttpErrors(response: Response) {
    if (!response.ok) {
        let errorDetails: any;
        try {
            errorDetails = await response.json();
            console.log("Error details:", errorDetails); 
        } catch (e) {
            throw new Error("Failed to parse error details. An unknown error occurred.");
        }

        if (errorDetails.email) {
            throw new Error(errorDetails.email[0]);
        }

        throw new Error(errorDetails.message || "An unknown error occurred.");
    }
  }
}

