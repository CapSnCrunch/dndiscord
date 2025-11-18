# DnDiscord Server

Express.js server for the DnDiscord application, providing API endpoints for managing Discord-based Dungeons & Dragons campaigns.

## Features

- **Express.js** with TypeScript
- **Firebase Admin SDK** for authentication and database access
- **Global error handling** with custom exception classes
- **Authentication middleware** for protecting routes
- **Structured logging** with Pino
- **Docker support** for containerized deployment
- **Environment variable** configuration with dotenv

## Setup

### Prerequisites

- Node.js >= 18.0.0
- Firebase service account key file (`service-account.json`)
- Environment variables configured (see below)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### Firebase Setup

1. Download your Firebase service account key from the Firebase Console
2. Place it as `service-account.json` in the server directory
3. Ensure the service account has the necessary permissions for your Firebase project

## Development

### Run in development mode (with watch)

```bash
npm run dev
```

### Build TypeScript

```bash
npm run build
```

### Run production build

```bash
npm run start:prod
```

## Docker

### Build the Docker image

```bash
docker build -t dndiscord-server .
```

### Run the container

```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -v $(pwd)/service-account.json:/usr/src/app/service-account.json \
  dndiscord-server
```

## Project Structure

```
server/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── routes.ts              # Route definitions
│   ├── exceptions/
│   │   └── AppException.ts   # Custom exception classes
│   ├── lib/
│   │   ├── firebase-admin.ts # Firebase Admin SDK setup
│   │   └── logger.ts         # Logger configuration
│   └── middleware/
│       ├── auth.middleware.ts        # Authentication middleware
│       └── global-error.middleware.ts # Global error handler
├── Dockerfile
├── package.json
└── tsconfig.json
```

## API Structure

All API routes are prefixed with `/api`. Routes are defined in `src/routes.ts` and can be organized into separate route files as the application grows.

### Authentication

Use the `authenticateUser()` middleware to protect routes:

```typescript
import { authenticateUser } from './middleware/auth.middleware.ts';

router.get('/protected', authenticateUser(), asyncHandler(async (req, res) => {
  // req.userId contains the authenticated user's ID
  // req.isAdmin indicates if the user has admin privileges
}));
```

### Error Handling

The server uses a global error handler that catches all errors. Use custom exceptions for consistent error responses:

```typescript
import { NotFoundException, ValidationException } from './exceptions/AppException.ts';

// Throw exceptions in your route handlers
throw new NotFoundException('Resource not found');
throw new ValidationException('Invalid input');
```

## License

MIT

