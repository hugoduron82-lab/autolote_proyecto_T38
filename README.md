# autolote_proyecto_T38
# 🚗 SISTEMA DE GESTIÓN PARA AUTOLOTE

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express.js-4.18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![JWT](https://img.shields.io/badge/JWT-Authentication-purple)
![Postman](https://img.shields.io/badge/Postman-Tests-orange)
![GitFlow](https://img.shields.io/badge/GitFlow-Workflow-blue)

> Proyecto final de Desarrollo de Aplicaciones Web I  
> **Tecnólogo en Desarrollo de Aplicaciones Web**

---

## 📋 TABLA DE CONTENIDO

- [Objetivo del Sistema](#-objetivo-del-sistema)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [API Externa - Tasas de Cambio](#-api-externa---tasas-de-cambio)
- [Colección de Postman](#-colección-de-postman)
- [Control de Versiones con GitFlow](#-control-de-versiones-con-gitflow)
- [Equipo de Desarrollo](#-equipo-de-desarrollo)
- [Pruebas Realizadas](#-pruebas-realizadas)
- [Trabajo Futuro](#-trabajo-futuro)
- [Conclusión](#-conclusión)

---

## 🎯 OBJETIVO DEL SISTEMA

Desarrollar un sistema de gestión integral para un autolote (concesionario de vehículos) que permita:

### Para Clientes:
- ✅ Visualizar el inventario de vehículos disponibles
- ✅ Solicitar pruebas de manejo
- ✅ Enviar consultas sobre vehículos específicos
- ✅ Ver precios en diferentes monedas (especialmente Lempiras HNL)

### Para Administradores/Vendedores:
- ✅ Gestionar el inventario de vehículos (CRUD completo)
- ✅ Administrar clientes y su historial de consultas
- ✅ Registrar ventas con cálculo automático de impuestos
- ✅ Consultar reportes de ventas por vendedor

### Características Técnicas:
- ✅ API RESTful con Node.js y Express.js
- ✅ Autenticación segura con JWT (JSON Web Tokens)
- ✅ Integración con API externa de tasas de cambio en tiempo real
- ✅ Conversión de precios USD a Lempiras Hondureños (HNL)
- ✅ Base de datos MySQL con relaciones normalizadas
- ✅ Control de versiones profesional con GitFlow

---

## ✨ FUNCIONALIDADES IMPLEMENTADAS

### 🔐 Módulo de Autenticación
| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/api/auth/register` | POST | Registro de nuevos usuarios | Público |
| `/api/auth/login` | POST | Inicio de sesión y generación de token JWT | Público |

**Características:**
- Contraseñas encriptadas con bcrypt (hash + salt)
- Tokens JWT con expiración de 8 horas
- Roles: admin, vendedor, cliente

---

### 🚗 Módulo de Vehículos
| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/api/vehiculos` | GET | Listar todos los vehículos (con filtros) | JWT |
| `/api/vehiculos/:id` | GET | Obtener vehículo por ID | JWT |
| `/api/vehiculos` | POST | Crear nuevo vehículo | JWT |
| `/api/vehiculos/:id` | PUT | Actualizar vehículo | JWT |
| `/api/vehiculos/:id` | DELETE | Eliminar vehículo | JWT |

**Filtros disponibles:**
- Por marca: `?marca=Toyota`
- Por modelo: `?modelo=Civic`
- Por precio máximo: `?precio_max=25000`
- Por estado: `?estado=disponible`

**Campos del vehículo:**
- `id`: Identificador único
- `marca`: Marca del vehículo (ej: Toyota, Honda)
- `modelo`: Modelo específico
- `año`: Año de fabricación
- `precio_usd`: Precio en dólares americanos
- `estado`: disponible, vendido, reservado
- `imagenes`: URLs de imágenes (separadas por comas)
- `descripcion`: Descripción detallada

---

### 💱 Módulo de Tasas de Cambio (Lempiras HNL)
| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/api/exchange/rates` | GET | Obtener todas las tasas de cambio | Público |
| `/api/exchange/to-hnl/:monto` | GET | Convertir USD a Lempiras | Público |
| `/api/exchange/convert` | POST | Convertir a múltiples monedas | JWT |
| `/api/exchange/precio-vehiculo/:id` | GET | Precio de vehículo en Lempiras | JWT |

**Monedas soportadas:**
- 🇺🇸 USD - Dólar Americano (base)
- 🇭🇳 HNL - Lempira Hondureño (moneda local)
- 🇪🇺 EUR - Euro
- 🇬🇹 GTQ - Quetzal Guatemalteco
- 🇳🇮 NIO - Córdoba Nicaragüense

---

### 👥 Módulo de Clientes
| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/api/clientes` | GET | Listar todos los clientes | JWT |
| `/api/clientes/:id` | GET | Obtener cliente por ID | JWT |
| `/api/clientes` | POST | Crear nuevo cliente | JWT |
| `/api/clientes/:id` | PUT | Actualizar cliente | JWT |
| `/api/clientes/:id` | DELETE | Eliminar cliente | JWT |
| `/api/clientes/:id/consultas` | POST | Registrar consulta | JWT |
| `/api/clientes/:id/consultas` | GET | Historial de consultas | JWT |
| `/api/clientes/:id/pruebas` | POST | Solicitar prueba de manejo | JWT |

**Campos del cliente:**
- `id`: Identificador único
- `nombre`: Nombre del cliente
- `apellido`: Apellido del cliente
- `email`: Correo electrónico (único)
- `telefono`: Número de teléfono
- `direccion`: Dirección física
- `fecha_registro`: Fecha de registro automática

---

### 💰 Módulo de Ventas
| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/api/ventas` | GET | Listar todas las ventas | JWT |
| `/api/ventas/:id` | GET | Obtener venta por ID | JWT |
| `/api/ventas` | POST | Registrar nueva venta | JWT |
| `/api/ventas/vendedor/:id` | GET | Ventas por vendedor | JWT |

**Cálculo automático:**
- **Impuestos**: 15% (ISV Honduras)
- **Total en USD**: precio + (precio × 0.15)
- **Total en HNL**: total en USD × tasa de cambio del día
- Actualización automática del estado del vehículo a "vendido"

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | 18.x | Entorno de ejecución backend |
| **Express.js** | 4.18 | Framework web para API REST |
| **MySQL** | 8.0 | Base de datos relacional |
| **mysql2** | 3.6 | Driver MySQL con soporte de promesas |
| **JWT (jsonwebtoken)** | 9.0 | Autenticación y autorización |
| **bcrypt** | 5.1 | Encriptación de contraseñas |
| **axios** | 1.5 | Cliente HTTP para API externa |
| **dotenv** | 16.3 | Variables de entorno |
| **cors** | 2.8 | Middleware para CORS |
| **nodemon** | 3.0 | Recarga automática en desarrollo |
| **Git** | 2.x | Control de versiones |
| **GitFlow** | - | Metodología de branching |
| **Postman** | - | Pruebas de API |

---

## 🏗️ ARQUITECTURA DEL SISTEMA




---

## 📁 ESTRUCTURA DEL PROYECTO
autolote-gestion/
│
├── 📁 backend/
│ ├── 📁 config/
│ │ └── db.js # Conexión a MySQL con pool
│ │
│ ├── 📁 middleware/
│ │ └── authMiddleware.js # Verificación de tokens JWT
│ │
│ ├── 📁 routes/
│ │ ├── authRoutes.js # Registro y login
│ │ ├── vehiculoRoutes.js # CRUD de vehículos
│ │ ├── exchangeRoutes.js # API de tasas de cambio
│ │ ├── clienteRoutes.js # CRUD de clientes
│ │ └── ventaRoutes.js # CRUD de ventas
│ │
│ ├── server.js # Punto de entrada
│ ├── package.json # Dependencias y scripts
│ ├── .env # Variables de entorno
│ └── .env.example # Ejemplo de variables
│
├── 📁 database/
│ └── schema.sql # Script de creación de BD
│
├── 📁 postman/
│ ├── Autolote API Tests.postman_collection.json # Colección de pruebas
│ ├── Autolote.postman_environment.json # Variables de entorno
│ └── README.md # Instrucciones
│
├── .gitignore # Archivos excluidos de git
└── README.md # Este archivo



---

## 📦 INSTALACIÓN Y CONFIGURACIÓN

### Prerrequisitos

- **Node.js** v18 o superior
  ```bash
  node --version  # Debe mostrar v18.x o superior
  npm --version   # Debe mostrar 9.x o superior


  Pasos de Instalación
1. Clonar el repositorio
bash
git clone https://github.com/TU-USUARIO/autolote-gestion.git
cd autolote-gestion
2. Instalar dependencias del backend
bash
cd backend
npm install
3. Configurar variables de entorno
bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# Windows:
notepad .env

# Mac/Linux:
nano .env
Configuración del archivo .env:

env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=autolote_db
JWT_SECRET_KEY=tu_clave_secreta_muy_segura_2024
4. Crear la base de datos
bash
# Ejecutar el script SQL
mysql -u root -p < ../database/schema.sql

# O dentro de MySQL:
mysql -u root -p
source ../database/schema.sql
exit;
Verificar que la base de datos se creó correctamente:

sql
USE autolote_db;
SHOW TABLES;
SELECT * FROM Usuario;
SELECT * FROM Vehiculo;
5. Iniciar el servidor
bash
# Modo desarrollo (recomendado - con recarga automática)
npm run dev

# Modo producción
npm start
Deberías ver:

text
═══════════════════════════════════════════════════
🚀 Servidor de Autolote iniciado correctamente
📡 Puerto: 3000
🔗 URL: http://localhost:3000
🏥 Health check: http://localhost:3000/api/health
═══════════════════════════════════════════════════
6. Probar que el servidor funciona
bash
# En otra terminal o en Postman
curl http://localhost:3000/api/health
Respuesta esperada:

json
{
    "status": "OK",
    "message": "Servidor funcionando correctamente",
    "timestamp": "2024-03-23T..."
}


BASE DE DATOS
Tablas
Tabla	        |Descripción                            |	Registros de prueba
Usuario	        |Usuarios del sistema (admin, vendedor) |	3 registros
Vehiculo        |Inventario de vehículos                |   6 registros
Cliente	        |Datos de clientes                      |   4 registros
Consulta        |Consultas de clientes                  |   4 registros
PruebaManejo    |Solicitudes de prueba de manejo        |	3 registros
Venta	        |Registro de ventas                     |	2 registros

API EXTERNA - TASAS DE CAMBIO
ExchangeRate-API
Descripción: API gratuita que proporciona tasas de cambio de divisas en tiempo real.

Documentación oficial: https://www.exchangerate-api.com

Endpoint utilizado:

text
https://api.exchangerate-api.com/v4/latest/USD

Formato de respuesta:

{
  "base": "USD",
  "date": "2024-03-23",
  "rates": {
    "USD": 1,
    "HNL": 24.75,
    "EUR": 0.92,
    "GBP": 0.79,
    "GTQ": 7.75,
    "NIO": 36.50
  }
}

Mecanismo de fallback:
Si la API externa no responde o hay error de conexión, el sistema utiliza tasas de cambio por defecto para garantizar la disponibilidad del servicio.

javascript
// Tasas por defecto (fallback)
const TASAS_DEFECTO = {
    USD: 1,
    HNL: 24.75,
    EUR: 0.92,
    GTQ: 7.75,
    NIO: 36.50
};

COLECCIÓN DE POSTMAN
Archivos incluidos
Archivo	Descripción
Autolote API Tests.postman_collection.json	22 pruebas de la API
Autolote.postman_environment.json	Variables de entorno (token, IDs)
Cómo importar
Abrir Postman

Hacer clic en "Import" (botón en la esquina superior izquierda)

Seleccionar los archivos:

Autolote API Tests.postman_collection.json

Autolote.postman_environment.json

Seleccionar el Environment:

En el dropdown superior derecho, selecciona "Autolote"

Cómo ejecutar las pruebas
Ejecuta primero "Login (Guardar Token)" - esto guarda el token automáticamente

Ejecuta cualquier otra solicitud - el token se usará automáticamente

Para ejecutar todas las pruebas:

Haz clic en los tres puntos (...) de la colección

Selecciona "Run collection"

Haz clic en "Run Autolote API Tests"

CONTROL DE VERSIONES CON GITFLOW
Estructura de ramas

main (producción)
  │
  └── develop (desarrollo)
       │
       ├── feature/auth (Coordinador)
       │    └── Autenticación JWT, estructura base
       │
       ├── feature/vehiculos-exchange (Compañero 1)
       │    └── CRUD vehículos, API de tasas de cambio
       │
       └── feature/clientes-ventas (Compañero 2)
            └── CRUD clientes, consultas, ventas



Flujo de trabajo
Cada desarrollador trabaja en su rama feature

bash
git checkout feature/tu-rama
git add .
git commit -m "Descripción de los cambios"
git push origin feature/tu-rama
Crear Pull Request hacia develop

Desde GitHub, selecciona la rama feature

Crea Pull Request hacia develop

Espera revisión del coordinador

Merge a develop

El coordinador revisa el código

Aprueba el Pull Request

Se fusionan los cambios

Release a main

Al finalizar todas las features

Se crea rama release/v1.0.0

Se prueba y se fusiona a main

Comandos útiles
bash
# Ver todas las ramas
git branch -a

# Cambiar a una rama
git checkout nombre-rama

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Fusionar rama actual con develop
git merge develop

# Ver estado de los cambios
git status


PRUEBAS REALIZADAS
Pruebas de Autenticación
✅ Registro con datos válidos

✅ Registro con email duplicado (debe dar error)

✅ Login con credenciales correctas

✅ Login con credenciales incorrectas

✅ Acceso a rutas protegidas con token válido

✅ Acceso a rutas protegidas sin token (debe dar 401)


Pruebas de Vehículos
✅ Listado de todos los vehículos

✅ Filtrado por marca

✅ Filtrado por precio máximo

✅ Creación de vehículo con datos válidos

✅ Creación de vehículo con campos faltantes (debe dar error)

✅ Actualización de vehículo existente

✅ Eliminación de vehículo

Pruebas de Tasas de Cambio
✅ Obtener tasas de cambio desde API externa

✅ Conversión USD → HNL

✅ Fallback a tasas por defecto cuando API falla

✅ Precio de vehículo en Lempiras

Pruebas de Clientes
✅ Creación de cliente

✅ Listado de clientes

✅ Registro de consulta

✅ Historial de consultas por cliente

✅ Solicitud de prueba de manejo

Pruebas de Ventas
✅ Registro de venta

✅ Cálculo automático de impuestos (15%)

✅ Actualización automática del estado del vehículo

✅ Transacción SQL (rollback en error)

✅ Reporte de ventas por vendedor

Resultados
Total de pruebas: 22
Pruebas exitosas: 22
Pruebas fallidas: 0
Tasa de éxito: 100%


TRABAJO FUTURO
Frontend en Angular
Interfaz gráfica para usuarios

Dashboard administrativo con estadísticas

Vista pública para clientes

Formularios reactivos para gestión

Mejoras de Seguridad
Refresh tokens para sesiones más largas

Rate limiting para prevenir ataques

Validación de datos más estricta

Logs de auditoría

Funcionalidades Adicionales
Subida de imágenes a la nube (Cloudinary)

Envío de correos de confirmación

Reportes gráficos con Chart.js

Exportar reportes a PDF/Excel

Búsqueda avanzada de vehículos

Notificaciones push para pruebas de manejo

Optimizaciones
Caché para tasas de cambio

Paginación en listados grandes

Índices en la base de datos

Tests automatizados con Jest


CONCLUSIÓN
Logros Alcanzados
✅ API RESTful completa con 22 endpoints funcionales
✅ Autenticación JWT segura con bcrypt
✅ Base de datos normalizada con 6 tablas relacionadas
✅ Integración con API externa de tasas de cambio
✅ Conversión a Lempiras en tiempo real
✅ CRUD completo para vehículos, clientes y ventas
✅ Cálculo automático de impuestos (15%)
✅ Transacciones SQL para consistencia de datos
✅ GitFlow implementado para trabajo colaborativo
✅ Documentación completa en README
✅ Colección de Postman con 22 pruebas

Aprendizajes
Trabajo en equipo con GitFlow permite desarrollo paralelo sin conflictos

Middleware de autenticación protege rutas de manera elegante

Mecanismos de fallback garantizan disponibilidad del servicio

Transacciones SQL son esenciales para operaciones críticas

Documentación clara facilita la integración y pruebas

Impacto
El sistema está listo para ser implementado en un autolote real, ofreciendo:

Eficiencia operativa en la gestión del inventario

Mejor experiencia para clientes con consultas y pruebas de manejo

Control financiero con cálculos automáticos de impuestos

Visibilidad en tiempo real de precios en moneda local

LICENCIA
Este proyecto es desarrollado con fines académicos para la clase de Desarrollo de Aplicaciones Web I del Tecnólogo en Desarrollo de Aplicaciones Web.

Prohibido su uso comercial sin autorización de los autores.

CONTACTO
Nombre	                |Rol|               
[Hugo Duron]	        |Coordinador|	
[Oscar Ucles]	        |Desarrollador|	
[Tania Pavon]	        |Desarrollador|	
GitHub Repository:https://github.com/hugoduron82-lab/autolote_proyecto_T38

AGRADECIMIENTOS
A nuestro maestro por la guía durante el curso

A ExchangeRate-API por proveer el servicio gratuito

A la comunidad de Node.js por la excelente documentación

A todos los compañeros que colaboraron en este proyecto