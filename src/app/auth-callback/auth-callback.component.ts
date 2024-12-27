import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  template: `
    <p>
      Redirecting...
    </p>
  `,
  styles: ``
})
export class AuthCallbackComponent implements OnInit{


  constructor(private activateRoute : ActivatedRoute, private router : Router, private authService : AuthService ) {
  }

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe(params =>{
      const code = params['code']
      const state = params['state']

      if (code && state){
        this.authService.handleLoginCallback(code,state).subscribe({
          next : (resp:any) =>{
            console.log(resp)
            // Store tokens
            sessionStorage.setItem('access_token', resp.access_token);
            sessionStorage.setItem('refresh_token', resp.refresh_token);
            sessionStorage.setItem('id_token', resp.id_token);
            
            // Store expiry time
            const expiresIn = resp.expires_in;
            const expiryTime = new Date().getTime() + expiresIn * 1000;
            sessionStorage.setItem('token_expiry', expiryTime.toString());
            
            this.router.navigate(['/dashboard']);
          },
          error : (err) =>{
            console.log("Something went wrong in token exchange")
            this.router.navigate(['/login']);
          } 
        })
      }
      else{
        console.log("Something went wrong in code generation")
        this.router.navigate(['/login']);
      }
    })
  }

}
