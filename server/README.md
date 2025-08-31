# NiunMango Server

Backend server for the NiunMango application built with Express.js, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp dev.env .env
   # Edit .env with your database credentials
   ```

3. **Set up database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed database (optional)
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Start all services**

   ```bash
   docker-compose up -d
   ```

2. **View logs**

   ```bash
   docker-compose logs -f backend
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 📁 Project Structure

```
server/
├── prisma/           # Database schema and migrations
├── dist/            # Compiled JavaScript (production)
├── index.ts         # Main server file
├── tsconfig.json    # TypeScript configuration
├── nodemon.json     # Development server configuration
├── Dockerfile       # Docker configuration
└── package.json     # Dependencies and scripts
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🌐 API Endpoints

- `GET /health` - Health check
- `GET /api/status` - API status
- `GET /api/db-test` - Database connection test

## 🔧 Configuration

### Environment Variables

| Variable       | Description                  | Default                 |
| -------------- | ---------------------------- | ----------------------- |
| `NODE_ENV`     | Environment mode             | `development`           |
| `PORT`         | Server port                  | `3001`                  |
| `DATABASE_URL` | PostgreSQL connection string | -                       |
| `CLIENT_URL`   | Frontend URL for CORS        | `http://localhost:3000` |
| `JWT_SECRET`   | JWT signing secret           | -                       |

### Database

The server uses PostgreSQL with Prisma ORM. Make sure to:

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. Run migrations: `npm run db:migrate`

## 🐳 Docker

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker build -t niunmango-server .
docker run -p 3001:3001 niunmango-server
```

## 📊 Health Checks

The server includes health checks for:

- Database connectivity
- Server status
- API endpoints

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation
- Rate limiting (can be added)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Logging

Uses Morgan for HTTP request logging and console logging for application events.

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**

   - Check `DATABASE_URL` in environment variables
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Port already in use**

   - Change `PORT` in environment variables
   - Kill process using the port

3. **Prisma client not generated**
   - Run `npm run db:generate`
   - Check Prisma schema syntax

### Debug Mode

Set `LOG_LEVEL=debug` in environment variables for detailed logging.

## 📚 Dependencies

### Production

- Express.js - Web framework
- Prisma - Database ORM
- CORS - Cross-origin resource sharing
- Helmet - Security headers
- Morgan - HTTP request logger

### Development

- TypeScript - Type safety
- Nodemon - Development server
- ts-node - TypeScript execution

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use Prisma for database operations
3. Add proper error handling
4. Include API documentation
5. Write tests for new features

## 📄 License

ISC License
