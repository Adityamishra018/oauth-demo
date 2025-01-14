import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutComponent } from './logout/logout.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {path : 'login', component : LoginComponent},
    {path : 'logout', component : LogoutComponent},
    {path : 'dashboard', component : DashboardComponent, canActivate : [authGuard]},
    {path : 'callback', component : AuthCallbackComponent},
    {path : '', redirectTo : 'login', pathMatch : 'full'}
];
