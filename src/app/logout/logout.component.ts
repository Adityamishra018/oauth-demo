import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-logout',
  imports: [],
  template: `
    <p>
      logging out...
    </p>
  `,
  styles: ``
})
export class LogoutComponent implements OnInit {

  /**
   *
   */
  constructor(private router : Router, private authService : AuthService) {
  }
  ngOnInit(): void {
    this.authService.clearLocalTokens();
    this.router.navigate(['/login'])
  }

}
