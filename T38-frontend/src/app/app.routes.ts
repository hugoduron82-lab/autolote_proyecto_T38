import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { VehiculosComponent } from './component/vehiculos/vehiculos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'vehiculos', component: VehiculosComponent },
  // Redirigir cualquier otra ruta a login
  { path: '**', redirectTo: 'login' }
];
