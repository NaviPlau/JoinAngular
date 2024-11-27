import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  constructor() { }

  async makeHttpRequest(url: string, method: string, body: any = null): Promise<Response> {
    const options: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return await fetch(url, options);
  }
}
