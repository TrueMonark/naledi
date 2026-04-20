# Naledi Day and Boarding School - Backend Server

A comprehensive backend system for managing the school website, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Blog Management**: Create, read, update, and delete blog posts with image uploads
- **Gallery Management**: Upload and manage school photos with categorization
- **Devotion Management**: Daily devotion system with scheduling
- **File Upload**: Secure file upload with validation for images and PDFs
- **Security**: Helmet, rate limiting, and input validation
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```
   MONGODB_URI=mongodb://localhost:27017/naledi_school
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ADMIN_EMAIL=admin@naledi.ac.bw
   ADMIN_PASSWORD=admin123
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Create admin user** (optional - see API documentation)

## Project Structure

```
server/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User model
│   ├── Blog.js              # Blog post model
│   ├── Gallery.js           # Gallery image model
│   └── Devotion.js          # Devotion model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── blogRoutes.js        # Blog management routes
│   ├── galleryRoutes.js     # Gallery management routes
│   └── devotionRoutes.js    # Devotion management routes
├── uploads/                 # File upload directory
│   ├── images/              # Image uploads
│   ├── documents/           # PDF documents
│   └── misc/                # Other files
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── server.js              # Main server file
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Blog Management
- `GET /api/blogs` - Get all published blogs (public)
- `GET /api/blogs/latest` - Get latest blogs for homepage
- `GET /api/blogs/:id` - Get single blog post
- `POST /api/blogs` - Create new blog (admin only)
- `PUT /api/blogs/:id` - Update blog (admin only)
- `DELETE /api/blogs/:id` - Delete blog (admin only)

### Gallery Management
- `GET /api/gallery` - Get all gallery images (public)
- `GET /api/gallery/categories` - Get image categories
- `POST /api/gallery` - Upload new image (admin only)
- `PUT /api/gallery/:id` - Update image (admin only)
- `DELETE /api/gallery/:id` - Delete image (admin only)
- `PUT /api/gallery/reorder` - Reorder images (admin only)

### Devotion Management
- `GET /api/devotions/current` - Get current active devotion (public)
- `GET /api/devotions/previous` - Get previous devotions (public)
- `GET /api/devotions` - Get all devotions (admin only)
- `GET /api/devotions/:id` - Get single devotion
- `POST /api/devotions` - Create new devotion (admin only)
- `PUT /api/devotions/:id` - Update devotion (admin only)
- `DELETE /api/devotions/:id` - Delete devotion (admin only)
- `PUT /api/devotions/:id/activate` - Set devotion as active (admin only)

### Health Check
- `GET /api/health` - Server health status

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **admin**: Full access to all endpoints
- **user**: Limited access (future use)

## File Uploads

The server supports file uploads for:
- **Images**: JPEG, PNG, GIF (for blogs, gallery, devotions)
- **Documents**: PDF files (for requirements)

Files are stored in the `uploads/` directory with organized subdirectories.

### Upload Limits
- Maximum file size: 5MB (configurable)
- Supported image formats: JPEG, PNG, GIF
- Supported document formats: PDF

## Database Models

### User
- name, email, password, role, isActive, lastLogin

### Blog
- title, excerpt, content, author, category, image, tags, isPublished, publishedAt, views

### Gallery
- title, description, imageUrl, category, tags, isVisible, order

### Devotion
- title, verse, reference, message, author, image, isActive, scheduledDate

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Express-validator for request validation
- **File Upload Security**: Type and size validation
- **Password Hashing**: bcryptjs for password security
- **JWT**: Secure token-based authentication

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Testing
```bash
npm test
```

### Environment Variables

Required environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/naledi_school |
| JWT_SECRET | Secret key for JWT signing | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| MAX_FILE_SIZE | Maximum upload file size in bytes | 5242880 |
| UPLOAD_PATH | File upload directory | ./uploads |
| ADMIN_EMAIL | Default admin email | admin@naledi.ac.bw |
| ADMIN_PASSWORD | Default admin password | admin123 |

## Deployment

### Production Setup

1. **Set environment to production**
   ```bash
   NODE_ENV=production
   ```

2. **Use a process manager**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "naledi-server"
   ```

3. **Set up MongoDB Atlas** (recommended for production)

4. **Configure reverse proxy** (nginx recommended)

5. **Set up SSL certificate**

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## Monitoring and Logging

The server uses Morgan for HTTP request logging. In production, consider adding:

- Error tracking (Sentry)
- Performance monitoring
- Health checks
- Database monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Email: support@naledi.ac.bw
- Documentation: See API documentation
- Issues: Create an issue in the repository

## License

This project is licensed under the MIT License.