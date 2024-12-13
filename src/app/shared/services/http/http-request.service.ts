import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth-service/auth.service';
@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {
  
  

  getHeaders(authToken?: string): HttpHeaders {
    const headersConfig: { [header: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headersConfig['Authorization'] = `Token ${authToken}`; // Add token if available
    }

    return new HttpHeaders(headersConfig);
  }

  constructor(private http: HttpClient) {}
  get<T>(url: string, token?: string, params?: { [key: string]: any }): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.get<T>(url, { headers, params });
  }

  // POST request
  post<T>(url: string, body: any, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.post<T>(url, body, { headers });
  }

  // PUT request
  put<T>(url: string, body: any, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.put<T>(url, body, { headers });
  }

  // PATCH request
  patch<T>(url: string, body: any, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.patch<T>(url, body, { headers });
  }

  // DELETE request
  delete<T>(url: string, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.delete<T>(url, { headers });
  }
  
}

