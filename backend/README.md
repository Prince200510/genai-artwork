# ArtisanHub Backend

A comprehensive Node.js backend API for ArtisanHub - Traditional Art Marketplace with AI integration.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **AI Integration**: Gemini AI for product descriptions, content generation, and recommendations
- **File Upload**: Multer-based image upload system with proper validation
- **Dynamic Content**: AI-powered product descriptions and marketing content
- **Recommendation System**: Smart artwork suggestions using AI algorithms
- **Image Storage**: Proper file management for artwork images
- **RESTful API**: Clean MVC architecture with comprehensive endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **AI Service**: Google Gemini AI
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/follow/:id` - Follow user
- `DELETE /api/auth/follow/:id` - Unfollow user

### Products/Artworks

- `GET /api/products` - Get all products with filters
- `POST /api/products` - Create new product (Artisan only)
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product (Owner only)
- `DELETE /api/products/:id` - Delete product (Owner only)
- `POST /api/products/:id/like` - Like/unlike product
- `POST /api/products/:id/favorite` - Add/remove from favorites
- `GET /api/products/featured` - Get featured products
- `POST /api/products/ai/generate-content` - Generate AI content for product
- `GET /api/products/:id/analytics` - Get product analytics

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (Owner only)
- `DELETE /api/posts/:id` - Delete post (Owner only)
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment to post
- `POST /api/posts/ai/generate-content` - Generate AI content for post

### Comments

- `PUT /api/comments/:id` - Update comment (Owner only)
- `DELETE /api/comments/:id` - Delete comment (Owner only)
- `POST /api/comments/:id/like` - Like/unlike comment

### AI Recommendations

- `GET /api/recommendations/products` - Get personalized product recommendations
- `GET /api/recommendations/products/:id/similar` - Get similar products
- `GET /api/recommendations/trending` - Get trending products
- `GET /api/recommendations/artists/top` - Get top artists
- `GET /api/recommendations/insights` - Get AI market insights
- `GET /api/recommendations/feed` - Get personalized feed

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Gemini AI API key

### Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Update the `.env` file with your actual values:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   JWT_EXPIRE=30d
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   UPLOAD_MAX_SIZE=5242880
   ```

4. **Start the server**

   Development mode:

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

### Getting API Keys

#### Gemini AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

#### MongoDB Setup

1. **Local MongoDB**: Install MongoDB locally or use MongoDB Compass
2. **MongoDB Atlas**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
3. Get your connection string and add it to the `.env` file

## AI Features

### Product Description Generation

- Automatically generates compelling product descriptions
- Includes cultural significance and craftsmanship details
- Optimized for search and engagement

### Content Creation

- Social media post generation
- Blog article creation
- Video script development
- Marketing content optimization

### Smart Recommendations

- Personalized product suggestions
- Similar artwork recommendations
- Trending analysis
- Market insights

### Performance Analytics

- AI-powered performance analysis
- Pricing recommendations
- Market trend insights
- Engagement optimization

## File Upload System

- **Product Images**: Up to 5 images per product
- **Post Images**: Up to 3 images per post
- **User Avatars**: Profile picture uploads
- **File Validation**: Only image files allowed
- **Size Limits**: Maximum 5MB per file
- **Storage**: Local file system with organized folder structure

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request data sanitization
- **File Upload Security**: File type and size validation

## Database Models

### User Model

- Authentication fields
- Profile information
- User relationships (followers/following)
- Favorites and preferences

### Product Model

- Artwork details
- Image management
- Pricing and availability
- AI-generated content
- Analytics tracking

### Post Model

- Content creation
- Media attachments
- Engagement metrics
- AI content flags

### Comment Model

- Nested comments support
- Like system
- Edit tracking

## API Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (when applicable)
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

### Folder Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic services
├── uploads/         # File upload storage
├── .env            # Environment variables
├── server.js       # Main server file
└── package.json    # Dependencies
```

### Adding New Features

1. Create model in `models/` directory
2. Add controller logic in `controllers/`
3. Define routes in `routes/`
4. Update server.js to include new routes
5. Test endpoints with API client

## Testing

Use tools like Postman or Insomnia to test the API endpoints. The health check endpoint `/api/health` can be used to verify the server is running.

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL certificates
5. Use PM2 or similar for process management
6. Configure reverse proxy (nginx)

## Contributing

1. Follow MVC architecture patterns
2. Add proper error handling
3. Include input validation
4. Write clean, documented code
5. Test all endpoints thoroughly
