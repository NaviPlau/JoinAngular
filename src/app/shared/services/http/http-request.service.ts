import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {
  authToken: string | null = null;
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  constructor() { }

  async makeHttpRequest(url: string, method: string, body?: any) {
    const headers = { 'Content-Type': 'application/json', ...(this.authToken ? { Authorization: `Token ${this.authToken}` } : {}),};
    try {
      const response = await fetch(url, { method, headers,body: body ? JSON.stringify(body) : undefined, });
      let responseData = null;
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } 
      if (!response.ok) {
        this.handleHttpErrors(response, responseData); 
      }
      return responseData; 
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Server returned an invalid response.');
      }
      throw error;
    }
  }
  handleHttpErrors(response: Response, errorDetails: any) {
    if (!response.ok) {
      if (response.status === 400 && errorDetails.error === "Invalid email or password") {
        throw new Error("Invalid email or password");
      }
  
      if (errorDetails.email) {
        throw new Error(errorDetails.email[0]);
      }
  
      throw new Error(errorDetails.message || "An unknown error occurred.");
    }
  }
}

