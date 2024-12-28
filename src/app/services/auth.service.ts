import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authConfig = {
    authority: 'http://localhost:8080/realms/internalapps',
    clientId: 'oauth-demo',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'openid profile email',
    logoutUri : 'http://localhost:4200/logout',
  };

  private excludedUrls = [
    '/protocol/openid-connect/token',
    '/protocol/openid-connect/auth',
    '/protocol/openid-connect/logout'
  ];

  public excludeUrlFromInterception(url : string){
    for (const s of this.excludedUrls){
      if (url.includes(s))
        return true;
    }
    return false
  }

  constructor(private http: HttpClient, private router : Router) { }

  getValidToken(): Observable<string> {
    const accessToken = sessionStorage.getItem('access_token');
    const expiryTime = sessionStorage.getItem('token_expiry');

    if (!accessToken || !expiryTime) {
      return throwError(() => new Error('No token found'));
    }

    // Check if token is expired or will expire in next 30 seconds
    const isExpiring = parseInt(expiryTime) - new Date().getTime() < 30000;

    if (isExpiring) {
      return this.refreshToken();
    }

    return from(Promise.resolve(accessToken));
  }

  refreshToken(): Observable<string> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.authConfig.clientId,
      refresh_token: refreshToken
    });

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const tokenEndpoint = `${this.authConfig.authority}/protocol/openid-connect/token`
    return this.http.post<any>(tokenEndpoint, body.toString(), { headers })
      .pipe(
        switchMap(tokens => {
          this.storeTokens(tokens);
          return from(Promise.resolve(tokens.access_token));
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400 || error.status === 401) {
            // Refresh token is invalid or expired
            this.clearLocalTokens();
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
  }

  public storeTokens(resp:any){
    // Store tokens
    sessionStorage.setItem('access_token', resp.access_token);
    sessionStorage.setItem('refresh_token', resp.refresh_token);
    sessionStorage.setItem('id_token', resp.id_token);
    
    // Store expiry time
    const expiresIn = resp.expires_in;
    const expiryTime = new Date().getTime() + expiresIn * 1000;
    sessionStorage.setItem('token_expiry', expiryTime.toString());
  }

  login() {
    const state = this.generateRandomState();
    localStorage.setItem('auth_state', state);
    
    const authUrl = `${this.authConfig.authority}/protocol/openid-connect/auth?` +
      `client_id=${this.authConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.authConfig.redirectUri)}&` +
      `scope=${encodeURIComponent(this.authConfig.scope)}&` +
      `response_type=code&` +
      `state=${state}`;
    
    window.location.href = authUrl;
  }

  handleLoginCallback(code: string, state: string) {
    const savedState = localStorage.getItem('auth_state');
    if (state !== savedState) {
      throw new Error('Invalid state');
    }

    const tokenEndpoint = `${this.authConfig.authority}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.authConfig.clientId,
      code: code,
      redirect_uri: this.authConfig.redirectUri
    });

    return this.http.post(tokenEndpoint, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  getUserDetails(){
    const userEndPoint = `${this.authConfig.authority}/protocol/openid-connect/userinfo`;
    return this.http.get(userEndPoint);
  }

  logout(){
    const logoutUrl = `${this.authConfig.authority}/protocol/openid-connect/logout?` +
      `id_token_hint=${this.getIdToken()}&` +
      `post_logout_redirect_uri=${encodeURIComponent(this.authConfig.logoutUri)}`;
    
    window.location.href = logoutUrl;
  }

  getIdToken(){
    return sessionStorage.getItem('id_token')
  }

  getAccessToken(){
    return sessionStorage.getItem('access_token')
  }

  private generateRandomState() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  clearLocalTokens() {
    // Clear all auth-related items from sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('token_expiry');
    localStorage.removeItem('auth_state');
  }
}
