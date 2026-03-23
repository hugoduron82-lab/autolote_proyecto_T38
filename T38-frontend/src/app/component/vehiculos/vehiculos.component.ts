import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vehiculos',
  imports: [CommonModule],
  templateUrl: './vehiculos.component.html',
  styleUrl: './vehiculos.component.scss'
})
export class VehiculosComponent implements OnInit {
  vehiculos: any[] = [];
  errorMessage: string = '';
  loading: boolean = true;
  userName: string = '';

  constructor(
    private usersService: UserService,
    public authService: AuthService,  // ← PUBLIC (accesible desde HTML)
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener nombre del usuario
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = `${user.nombre} ${user.apellido}`;
    }

    this.loadVehiculos();
  }

  loadVehiculos() {
    this.loading = true;
    this.errorMessage = '';
    
    this.usersService.getVehiculos().subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.status === 200) {
          this.vehiculos = response.data;
        } else {
          this.vehiculos = response.results || [];
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al obtener vehículos:', error);

        if (error.status === 401) {
          this.errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifique que el servidor esté corriendo.';
        } else {
          this.errorMessage = error.error?.message || 'Error al cargar los vehículos.';
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}