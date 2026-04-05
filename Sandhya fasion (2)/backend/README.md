# Sandhya Fashion Backend

A comprehensive Spring Boot backend for the Sandhya Fashion B2B/B2C textile platform.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Support for both B2C and B2B users with verification
- **Product Management**: CRUD operations for fashion products with category and size filtering
- **Order Management**: Complete order lifecycle with retail/wholesale pricing
- **Analytics Dashboard**: Business metrics and data visualization support
- **MongoDB Integration**: Atlas cloud database with stable connection configuration

## Technology Stack

- **Spring Boot 3.2.0**
- **Spring Security 6.x** with JWT
- **MongoDB** with Spring Data MongoDB
- **Lombok** for boilerplate reduction
- **Maven** for dependency management

## Database Configuration

The application connects to MongoDB Atlas using the following configuration:
```
mongodb+srv://sandhya_fasion:Pass%408767@cluster0.5ajay9u.mongodb.net/sandhya_fashion_db
```

## Default Credentials

- **Admin User**: `admin@sandhya.com` / `admin123`
- **Database**: Automatically initialized with sample products on startup

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password recovery

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `POST /api/products/filter` - Filter products by category and sizes
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/my-orders` - Get current user's orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status (Admin only)

### Analytics (Admin only)
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/sales` - Sales data with period filtering
- `GET /api/analytics/categories` - Category distribution
- `GET /api/analytics/growth` - Growth rates and metrics
- `GET /api/analytics/order-status` - Order status distribution

### Admin (Admin only)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/inventory` - Product inventory
- `GET /api/admin/orders` - All orders management
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product

## Running the Application

1. Ensure MongoDB Atlas is accessible with the provided credentials
2. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The application will start on `http://localhost:8080`

## Security Features

- JWT token-based authentication
- Role-based authorization (ADMIN/USER)
- CORS configuration for frontend integration
- Password encryption with BCrypt
- User verification for B2B accounts

## Data Models

### User
- id, name, email, password, shopName, gstNumber, phone, role, isVerified, isActive

### Product
- id, name, description, category, price, wholesalePrice, stockQuantity, imageUrl, sizes, ratings, badge, badgeColor

### Order
- id, userId, items, totalAmount, savings, orderType, status, orderDate, deliveryDate, shippingAddress, paymentMethod

## Frontend Integration

The backend is designed to work seamlessly with the React frontend at `http://localhost:5173` with proper CORS configuration and JWT authentication flow.
