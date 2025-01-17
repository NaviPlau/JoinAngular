import { inject, Injectable, signal } from '@angular/core';
import { HttpRequestService } from '../http/http-request.service';
import { RegisterData } from '../../interfaces/register-data';
import { Router } from '@angular/router';
import { ContactsService } from '../contacts-service/contacts.service';
import { getLocaleMonthNames } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  httpService = inject(HttpRequestService)

  REGISTER_URL = 'http://vm.paul-ivan.com/join/auth/api/register/'
  LOGIN_URL = 'http://vm.paul-ivan.com/join/auth/api/login/'
  GUEST_LOGIN_URL = 'http://vm.paul-ivan.com/join/api/auth/guestlogin/';
  registerdata = {} as RegisterData
  loginData = {}
  userIsLoggedIn = signal(false);
  isGuestUser = signal(false);
  userData = signal<any>(null);
  errorMessage = signal('');
  registerSuccess = signal(false);
  userLoggedIn = signal(false);
  authToken = signal('');


  /**
   * Registers a new user based on the data stored in the registerdata field.
   * The data is sent to the server as a POST request to the REGISTER_URL endpoint.
   * The request's response is handled by a subscription to the observable returned by the httpService.
   * If the request is successful, the registerSuccess signal is set to true and the redirectAfterRegister method is called.
   * If the request fails, the registerSuccess signal is set to false and the errorMessage signal is set to the error message from the server.
   * The error message is either the first error message from the server for the 'email' field, or the generic error message from the server.
   */
  async registerUser() {
    this.httpService.post(this.REGISTER_URL, this.registerdata).subscribe({
      next: () => { this.registerSuccess.set(true); this.redirectAfterRegister(); },
      error: (error: any) => {
        if (error.error && error.error.email) { this.errorMessage.set(error.error.email[0]) }
        else { this.errorMessage.set(error.message || 'Registration failed.') };
        this.registerSuccess.set(false);
      },
    });
  }

  /**
   * Logs in the user with the email and password stored in the loginData field.
   * The data is sent to the server as a POST request to the LOGIN_URL endpoint.
   * The request's response is handled by a subscription to the observable returned by the httpService.
   * If the request is successful, the user's profile is fetched using the received token and the user is logged in.
   * If the request fails, the error message is set to 'Invalid email or password'.
   */
  loginUser() {
    this.httpService.post(this.LOGIN_URL, this.loginData).subscribe({
      next: (loginResponse: any) => {
        const token = loginResponse.token;
        this.httpService.get('http://vm.paul-ivan.com/join/auth/api/profile/', token).subscribe({
          next: (userProfile: any) => { this.setUserData(userProfile); this.setLoginUserStateAndToken(token); },
          error: (profileError: any) => { this.errorMessage.set(profileError.message || 'Failed to fetch user profile.'); },
        });
      },
      error: (loginError: any) => { this.errorMessage.set('Invalid email or password'); },
    });
  }

  /**
   * Sets the user's login state to true and stores the authentication token in
   * the component's state and in local storage.
   * @param token The authentication token received from the server.
   */
  setLoginUserStateAndToken(token: string) {
    this.userIsLoggedIn.set(true);
    this.authToken.set(token);
    localStorage.setItem('authToken', token);
  }

  /**
   * Logs in the user as a guest.
   * This function sets default guest credentials and logs in the user
   * by calling the loginUser method. It marks the user as a guest
   * and stores the guest status in local storage.
   */
  guestLoginUser() {
    this.loginData = {};
    this.loginData = { email: 'guest@user.com', password: 'guest123', };
    this.loginUser();
    this.isGuestUser.set(true);
    localStorage.setItem('isGuest', 'true');
  }

  /**
   * Logs out the user by resetting the user's login state and clearing user data.
   * After clearing the data, it redirects the user to the login page.
   */
  logoutUser() {
    this.userIsLoggedIn.set(false);
    this.clearUserData();
    this.goToLogin();
  }

  /**
   * Navigates the user to the login page.
   */
  goToLogin() {
    this.router.navigate(['/']);
  }

  /**
   * Redirects the user to the login page after a successful registration.
   * This is called after a successful registration, and it sets the registerSuccess flag to false
   * and navigates the user to the login page after a delay of 2 seconds.
   */
  redirectAfterRegister() {
    setTimeout(() => {
      this.registerSuccess.set(false);
      this.goToLogin();
    }, 2000);
  }

  /**
   * Initializes the state of the authentication service.
   * It checks if there is a stored auth token or guest token in local storage.
   * If there is an auth token, it sets the token and the user's state.
   * If there is a guest token, it sets the token and the user's state as a guest.
   * After setting the token and state, it retrieves the user's data from local storage
   * and sets it to the userData property.
   * If there is no stored token, it clears the state of the authentication service.
   */
  initializeState() {
    const authToken = localStorage.getItem('authToken');
    const guestToken = localStorage.getItem('guestToken');
    const storedUserData = localStorage.getItem('userData');
    if (authToken) {
      this.setTokenAndState(authToken, false);
      if (storedUserData) { this.userData.set(JSON.parse(storedUserData)); }
    } else
      if (guestToken) {
        this.setTokenAndState(guestToken, true);
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          this.userData.set({ ...userData, name: 'Guest User', });
        }
      } else {
        this.clearState();
      }
  }

  /**
   * Redirects the user to the summary page after a successful login.
   */
  redirectUser() {
    this.router.navigate(['/summary']);
  }

  /**
   * Sets the user data in the authentication service and in local storage.
   * @param userData The user data to set, which should contain the following properties:
   *   - token: The authentication token for the user.
   *   - name: The full name of the user.
   *   - initials: The initials of the user.
   * After setting the user data, it sets the userIsLoggedIn flag to true and redirects the user to the summary page.
   */
  setUserData(userData: any) {
    this.userData.set({ ...userData, name: userData.name });
    this.userIsLoggedIn.set(true);
    const initials = userData.initials || '';
    const tokenKey = 'authToken';
    this.authToken.set(userData.token);
    localStorage.setItem(tokenKey, userData.token);
    localStorage.setItem('userInitials', initials);
    localStorage.setItem('userData', JSON.stringify(this.userData()));
    this.redirectUser();
  }

  /**
   * Clears the user data from the authentication service and local storage.
   * Removes the authentication token, guest token, user initials and user data from local storage.
   * Sets the authentication token to an empty string and clears the user state.
   */
  clearUserData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('guestToken');
    localStorage.removeItem('userInitials');
    localStorage.removeItem('userData');
    this.authToken.set('');
    this.clearState();
  }

  /**
   * Clears the user's state by setting the userIsLoggedIn flag to false, the
   * isGuestUser flag to false, and the userData property to null.
   * This function is used to log out the user and clear their data from the
   * authentication service and local storage.
   */
  clearState() {
    this.userIsLoggedIn.set(false);
    this.isGuestUser.set(false);
    this.userData.set(null);
  }

  /**
   * Sets the authentication token and the user's state.
   * @param token The authentication token to set.
   * @param isGuest A boolean indicating if the user is a guest user.
   * It sets the authentication token to the given token, sets the userIsLoggedIn flag to true,
   * and sets the isGuestUser flag to the given value.
   */
  setTokenAndState(token: string, isGuest: boolean) {
    this.authToken.set(token);
    this.userIsLoggedIn.set(true);
    this.isGuestUser.set(isGuest)
  }

  /**
   * Updates the user data for the given user ID.
   * @param userData The new user data to update.
   * @param userId The ID of the user to update.
   * The user data is updated with the given data, and the userIsLoggedIn flag is set to true.
   * If the request fails, the error message is set with the error message from the response.
   */
  updateUserData(userData: any, userId: number) {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      this.httpService.patch(`http://vm.paul-ivan.com/join/auth/api/profile/${userId}/`, userData, authToken).subscribe({
        next: () => {this.userData.set({...this.userData(), ...userData, });},
        error: (error: any) => { this.errorMessage.set(error.message || 'Failed to update user data.');},
      });
    }
  }

}

