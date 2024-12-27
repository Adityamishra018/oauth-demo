import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  template: `
    <p>
      <button (click)="initiateLogin()">Click here to Login !</button>
    </p>
  `,
  styles: ``
})
export class LoginComponent {
  constructor(private authService : AuthService) {}

  initiateLogin(){
    this.authService.login();
  }

}
