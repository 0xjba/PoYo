# Poyo - Cryptocurrency Analysis Service

A real-time cryptocurrency analysis service that monitors conversations for cryptocurrency mentions and provides market insights using CoinMarketCap data and AI-powered analysis.

## 🚀 Features

- Real-time cryptocurrency mention detection in text
- Detailed market data analysis using CoinMarketCap API
- AI-powered market insights using Claude API
- Caching system for optimal performance
- RESTful API endpoints for data access
- Web interface for visualization
- Docker support for easy deployment

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker (optional)
- CoinMarketCap API key
- RedPill API key (for AI analysis)

## 🛠 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd poyo
```

2. Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
CMC_API_KEY=your_coinmarketcap_api_key
REDPILL_API_KEY=your_redpill_api_key
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

### Production Mode

Using Docker:
```bash
docker-compose up -d
```

Or manually:
```bash
cd backend
npm run start
```

## 📚 API Endpoints

### POST `/crypto-analysis`
Analyzes text for cryptocurrency mentions and provides market data.

Query Parameters:
- `session_id`: Session identifier
- `uid`: User identifier

Request Body:
```json
[
  {
    "text": "Your text containing cryptocurrency mentions"
  }
]
```

### GET `/analyses`
Retrieves historical analyses.

Query Parameters:
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

### GET `/analyses/:tokenId`
Retrieves specific token analysis.

### GET `/health`
Health check endpoint.

## 🏗 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── hooks/
        └── assets/
```

## 🔧 Configuration

The application can be configured through environment variables and the `config.js` file:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CMC_API_KEY`: CoinMarketCap API key
- `REDPILL_API_KEY`: RedPill API key for AI analysis
- `CORS_ORIGIN`: Allowed CORS origin

## 🚨 Error Handling

The application uses Winston for logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

## 🔄 Caching

The application implements two levels of caching:
- Market data: 5-minute TTL
- Token list: 24-hour TTL

## 🐳 Docker Support

The application includes Docker configuration for easy deployment:
- `Dockerfile`: Container configuration
- `docker-compose.yml`: Service orchestration
- Volume mapping for persistent data storage
- Health checks included

## 🧪 Testing

Run the test suite:
```bash
cd backend
npm test
```

## 🔒 Security

The application implements several security measures:
- CORS protection
- Helmet.js security headers
- Rate limiting
- API key validation
- Input validation

## 📈 Monitoring

- Health check endpoint at `/health`
- Winston logging system
- Docker health checks
- Webhook monitoring system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.