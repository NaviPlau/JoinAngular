import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth-service/auth.service';
@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {
  
  /**
   * Returns an instance of HttpHeaders with the Content-Type header set to
   * application/json. If a token is provided, it adds an Authorization header
   */
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
  
  /**
   * Sends a GET request to the specified URL.
   */
  get<T>(url: string, token?: string, params?: { [key: string]: any }): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.get<T>(url, { headers, params });
  }

  /**
   * Sends a POST request to the specified URL with the given body.
   */
  post<T>(url: string, body: any, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.post<T>(url, body, { headers });
  }

  /**
   * Sends a PUT request to the specified URL with the given body.
   */
  put<T>(url: string, body: any, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.put<T>(url, body, { headers });
  }
  
  /**
   * Sends a PATCH request to the specified URL with the given body.  
   */
  patch<T>(url: string, body: any, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.patch<T>(url, body, { headers });
  }

  
  /**
   * Sends a DELETE request to the specified URL.
   */
  delete<T>(url: string, token?: string): Observable<T> {
    const headers = this.getHeaders(token);
    return this.http.delete<T>(url, { headers });
  }
  
}

