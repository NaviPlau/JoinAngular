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
  registerSuccess = signal(false);
  userLoggedIn = signal(false);


  async registerUser() {
    try {
      await this.httpService.makeHttpRequest(this.REGISTER_URL, 'POST', this.registerdata);
      this.registerSuccess.set(true);
      this.redirectAfterRegister();
    } catch (error: any) {
      this.errorMessage.set(error.message);
      this.registerSuccess.set(false);
    }
  }

  async loginUser() {
    try {
      const userData = await this.httpService.makeHttpRequest(this.LOGIN_URL, 'POST', this.loginData);
      console.log('Login response data:', userData);
      this.setUserData(userData, false);
      this.userIsLoggedIn.set(true);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Wrong email or password.');
    }
  }

  async guestLogin() {
    try {
      const guestData = await this.httpService.makeHttpRequest(this.GUEST_LOGIN_URL, 'POST');
      this.setUserData(guestData, true);
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


  clearState() {
    this.userIsLoggedIn.set(false);
    this.isGuestUser.set(false);
    this.headerInitials.set('');
    this.userData.set(null);
  }

  setTokenAndState(token: string, isGuest: boolean) {
    this.httpService.setAuthToken(token);
    this.userIsLoggedIn.set(true);
    this.isGuestUser.set(isGuest);
    this.headerInitials.set(isGuest ? 'GU' : '');
  }

}

