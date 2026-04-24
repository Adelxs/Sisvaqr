# SisvaQR API - REST API for QR Access Control

REST API built with Node.js and Express that powers the SisvaQR platform. Handles user management, QR code generation, access validation, incident reports, and action history logging.

### Related Repository
- **Web Platform (PHP):** [https://github.com/Adelxs/Sisva_php](https://github.com/Adelxs/Sisva_php)
- **Live Demo:** [https://www.sisvaqr.cl](https://www.sisvaqr.cl)

### Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MySQL
- **Libraries:** bcrypt, nodemailer, speakeasy, qrcode, multer, uuid, dotenv

### Features

- User registration and authentication with encrypted passwords (bcrypt)
- Chilean RUT validation on every relevant endpoint
- Role-based access control (Administrator, User, Validator)
- QR code generation linked to each user's personal data
- Access validation and entry logging
- Incident report system with image upload support
- Password recovery via email (nodemailer)
- Two-factor authentication (2FA) with Google Authenticator (speakeasy)
- Action history logging for auditing purposes
- Admin panel authentication

### API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/usuarios` | Get all users |
| POST | `/usuarios` | Create a new user (admin only) |
| PUT | `/usuarios/rut/:rut` | Update user by RUT |
| DELETE | `/usuarios/rut/:rut` | Delete user by RUT |
| GET | `/usuario/:codigo` | Get user by code |
| GET | `/usuario/rut/:rut` | Get user by RUT |
| GET | `/usuarios/conteo` | Get total user count |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Web platform login |
| POST | `/auth/panel` | Mobile app login |
| POST | `/usuarios/recuperar-password` | Request password recovery email |
| POST | `/usuarios/reset-password` | Reset password with token |
| POST | `/usuarios/cambiar-password` | Change password |
| POST | `/usuarios/activar-2fa` | Enable 2FA for a user |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reportes` | Get all incident reports |
| POST | `/reportes` | Create a new report (supports image upload) |
| DELETE | `/reportes/:id` | Close/delete a report |
| POST | `/reportes/:id/asignar` | Assign a manager to a report |
| GET | `/reportes/usuario/:codigo` | Get reports by user |
| GET | `/reportes/conteo` | Get total report count |

### History & QR
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/historial` | Log an action |
| GET | `/historial/acciones` | Get full action history with user names |
| GET | `/historial/conteo-escaneos` | Get total QR scan count |
| GET | `/historial/conteo-total` | Get total action count |
| GET | `/me` | Get user data by RUT and log action |
| POST | `/registrar-escaneo` | Register a QR scan |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/encargados` | Get all managers |
| GET | `/usuario_por_rut/:rut` | Search user by RUT |

## 🚀 Installation

### Requirements
- Node.js v18 or higher
- MySQL database

```bash
# Clone the repository
git clone https://github.com/Adelxs/Sisvaqr.git

# Navigate to the project folder
cd Sisvaqr

# Install dependencies
npm install

# Configure your environment variables
cp .env.example .env
# Fill in your credentials in the .env file

# Start the server
node index.js
```

Environment Variables

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password
```

### User Roles

| Role | Description |
|------|-------------|
| **Administrator** | Manages users, reports, and accesses the admin panel |
| **User** | Has a personal account with a unique QR code for facility access |
| **Validator** | Uses the mobile app to scan and validate QR codes at entry points |

### Access Flow

1. Administrator registers a new user in the platform
2. The system generates a unique QR code linked to the user's data
3. User presents their QR code at the facility entrance
4. Validator scans the QR using the mobile application
5. The API verifies the user's data and logs the entry in the action history

### License

This project is licensed under the MIT License.
