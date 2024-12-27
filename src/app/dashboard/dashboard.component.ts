import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf],
  template: `
    <p>
      This is a protected page.
      <button (click)="showUserDetails()">Show user info</button>
      <button (click)="logout()">logout</button>
    </p>

    <pre *ngIf="user">
      {{user}}
    </pre>
  `,
  styles: `
    button{
      margin-inline: 0.5rem; 
    }
  `
})
export class DashboardComponent {

  /**
   *
   */
  public user:string ='';
  constructor(private authService : AuthService, private router : Router) {
    
  }
  showUserDetails(){
    this.authService.getUserDetails().subscribe({
      next : (resp : any) =>{
        this.user = JSON.stringify(resp,null,2);
      }
    })
  }

  logout(){
    this.authService.logout()
  }
}
