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

  async makeHttpRequest(url: string, method: string, body: any = null): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Token ${this.authToken}`; 
    }
    const options: RequestInit = {method: method, headers: headers,};
    if (body) {
      options.body = JSON.stringify(body);
    }
    return await fetch(url, options);
  }
}

