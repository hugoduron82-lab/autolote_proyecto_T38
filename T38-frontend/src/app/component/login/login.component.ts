import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  contrasenia: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.username || !this.contrasenia) {
      this.errorMessage = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      username: this.username,
      password: this.contrasenia
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Login exitoso:', response);
        // Redirigir a vehículos
        this.router.navigate(['/vehiculos']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error de login:', error);
        
        if (error.status === 401) {
          this.errorMessage = error.error?.message || 'Credenciales incorrectas.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifique que el servidor esté corriendo.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
        }
      }
    });
  }
}