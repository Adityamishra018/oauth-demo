import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authConfig = {
    authority: 'http://localhost:8080/realms/internalapps',
    clientId: 'oauth-demo',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'openid profile email',
    logoutUri : 'http://localhost:4200/logout'
  };

  constructor(private http: HttpClient) { }

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
    return this.http.get(userEndPoint, {
      headers: { 'Authorization': `Bearer ${this.getAccessToken()}` }
    });
  }

  logout(){
    const logoutUrl = `${this.authConfig.authority}/protocol/openid-connect/logout?` +
      `id_token_hint=${this.getIdToken()}&` +
      `post_logout_redirect_uri=${encodeURIComponent(this.authConfig.logoutUri)}`;
    
    window.location.href = logoutUrl;
  }

  private getIdToken(){
    return sessionStorage.getItem('id_token')
  }

  private getAccessToken(){
    return sessionStorage.getItem('access_token')
  }

  private generateRandomState() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public clearLocalTokens() {
    // Clear all auth-related items from sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('token_expiry');
    localStorage.removeItem('auth_state');
  }
}
