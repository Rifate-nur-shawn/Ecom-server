# Atom Drops E-Commerce Backend

Enterprise-grade Node.js/Express/TypeScript backend for e-commerce platform with secure payment integration.

## 🚀 Features

- ✅ **JWT Authentication** with HTTP-only cookies
- ✅ **Payment Integration** (bKash ready)
- ✅ **Order Management** with transaction safety
- ✅ **Product Management** with CRUD operations
- ✅ **Input Validation** with Zod schemas
- ✅ **Rate Limiting** for API protection
- ✅ **CORS & Helmet** security headers
- ✅ **PostgreSQL** database with Prisma ORM
- ✅ **TypeScript** for complete type safety
- ✅ **Error Handling** with centralized middleware

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Rifate-nur-shawn/Ecom-server.git
cd atom-drops-backend
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/atom_drops

# Security (IMPORTANT: Use a strong, random 32+ character string)
JWT_SECRET=your-super-secret-key-at-least-32-characters-long-change-this

# Frontend
FRONTEND_URL=http://localhost:5173

# Payment Gateway (Optional for now)
# BKASH_USERNAME=
# BKASH_PASSWORD=
# BKASH_APP_KEY=
# BKASH_SECRET=
```

### 3. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## 📦 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes (production)
- **Auth Rate Limiting**: 5 login attempts per 15 minutes
- **Helmet.js**: Secure HTTP headers
- **JWT Authentication**: HTTP-only cookies
- **Input Validation**: Zod schema validation on all routes
- **CORS Protection**: Configured for specific frontend origin
- **Environment Validation**: Ensures all required variables are present

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Health Check

```http
GET /health
```

### Authentication Endpoints

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Product Endpoints

#### Get All Products

```http
GET /api/v1/products
```

#### Create Product (Authenticated)

```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 2999,
  "stock": 100
}
```

### Order Endpoints

#### Create Order (Authenticated)

```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

#### Get My Orders (Authenticated)

```http
GET /api/v1/orders/my
Authorization: Bearer <token>
```

### Payment Endpoints

#### Initialize Payment (Authenticated)

```http
POST /api/v1/payments/init
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "order-uuid"
}
```

## 🏗️ Project Structure

```
atom-drops-backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment variable validation
│   ├── modules/
│   │   ├── auth/               # Authentication module
│   │   ├── products/           # Product management
│   │   ├── orders/             # Order management
│   │   └── payments/           # Payment integration
│   ├── shared/
│   │   ├── middlewares/        # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── utils/              # Utility functions
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Server entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── .env.example                # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚢 Production Deployment

### Prerequisites

- Set `NODE_ENV=production`
- Use a strong JWT_SECRET (32+ characters)
- Configure production database URL
- Set proper FRONTEND_URL

### Build and Start

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t atom-drops-backend .
docker run -p 5000:5000 --env-file .env atom-drops-backend
```

## 🔧 Environment Variables

| Variable       | Required | Description                                     |
| -------------- | -------- | ----------------------------------------------- |
| `PORT`         | No       | Server port (default: 5000)                     |
| `NODE_ENV`     | No       | Environment (development/production/test)       |
| `DATABASE_URL` | Yes      | PostgreSQL connection string                    |
| `JWT_SECRET`   | Yes      | JWT signing secret (min 32 chars)               |
| `FRONTEND_URL` | No       | Frontend URL for CORS (default: localhost:5173) |
| `BKASH_*`      | No       | bKash payment credentials (for production)      |

## 🧪 Testing

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Rifate Nur Shawn**

- GitHub: [@Rifate-nur-shawn](https://github.com/Rifate-nur-shawn)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email rifatenurshawn@gmail.com or open an issue in the repository.

---

Built with ❤️ using Node.js, Express, TypeScript, and Prisma
