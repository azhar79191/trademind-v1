# TradeMind AI Trading Platform

> **AI-Powered Trading Intelligence Platform** with real-time market data, technical analysis, and automated trading strategies.

## 🚀 Features

### Core Features
- ✅ **Real-time Market Data**: Live OHLCV data from Yahoo Finance
- ✅ **AI Trading Assistant**: Intelligent Q&A powered by real trading data
- ✅ **Technical Analysis**: 10+ indicators (RSI, MACD, Bollinger Bands, EMA, ATR, etc.)
- ✅ **Automated Strategies**: Create and deploy trading bots
- ✅ **Portfolio Management**: Track performance, P&L, and risk metrics
- ✅ **Signal Generation**: AI-powered buy/sell signals with confidence scores
- ✅ **Market News**: Curated news with sentiment analysis
- ✅ **Risk Management**: Position sizing, stop-loss, take-profit automation

### Authentication
- 🔐 **Google OAuth 2.0**: Secure authentication with Google accounts
- 🔒 **JWT Sessions**: Secure session management
- 👤 **User Roles**: User, Admin, Super Admin tiers
- 💎 **Subscription Tiers**: Free, Premium, Enterprise

### AI Agent Features
- 🤖 **Trained on Real Data**: Uses Yahoo Finance historical & live data
- 📊 **Market Analysis**: Trend detection, support/resistance identification
- 🎯 **Trade Recommendations**: Entry/exit points with risk-reward ratios
- 📚 **Knowledge Base**: Answers trading questions (strategies, indicators, risk management)
- ⚡ **Fast Responses**: Sub-second analysis using pandas & technical analysis libraries

## 📁 Project Structure

```
app/
├── ai-agent/                  # Python AI Agent (FastAPI)
│   ├── main.py               # AI agent server
│   ├── requirements.txt      # Python dependencies
│   └── README.md            # AI agent documentation
├── api/                      # Backend API (Hono + tRPC)
│   ├── chat-router.ts       # AI chat integration
│   ├── auth-router.ts       # Google OAuth
│   ├── market-router.ts     # Market data endpoints
│   ├── trading-router.ts    # Trading operations
│   ├── strategy-router.ts   # Strategy management
│   └── ...
├── db/                       # Database (Drizzle ORM + MySQL)
│   ├── schema.ts            # Database schema
│   └── migrations/          # Database migrations
├── src/                      # Frontend (React + TypeScript)
│   ├── pages/               # Application pages
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   └── providers/          # Context providers
├── GOOGLE_OAUTH_SETUP.md    # Google OAuth guide
├── IMPLEMENTATION_GUIDE.md   # Complete implementation guide
└── test-ai-agent.js         # AI agent test suite
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **React Router 7** for navigation
- **TanStack Query** for data fetching
- **tRPC** for type-safe APIs
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### Backend
- **Hono** - Fast web framework
- **tRPC** - End-to-end type safety
- **Drizzle ORM** - Type-safe SQL
- **MySQL** - Database
- **JWT** - Authentication
- **Google OAuth 2.0** - User authentication

### AI Agent
- **Python 3.10+**
- **FastAPI** - Modern async API framework
- **yfinance** - Real-time market data
- **pandas** - Data manipulation
- **ta** - Technical analysis indicators
- **scikit-learn** - Machine learning
- **numpy** - Numerical computations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8+
- Google Cloud account (for OAuth)

### 1. Clone & Install

```bash
# Install Node dependencies
npm install

# Install Python dependencies for AI agent
cd ai-agent
pip install -r requirements.txt
cd ..
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate APP_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env and add:
# - DATABASE_URL (MySQL connection string)
# - GOOGLE_CLIENT_ID (from Google Cloud Console)
# - GOOGLE_CLIENT_SECRET (from Google Cloud Console)
# - APP_SECRET (generated above)
# - AI_AGENT_API_URL=http://localhost:8000
```

### 3. Database Setup

```bash
# Push database schema
npm run db:push

# (Optional) Seed with sample data
# npm run db:seed
```

### 4. Google OAuth Setup

Follow the complete guide in [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md)

### 5. Start Services

```bash
# Terminal 1: Start AI Agent
cd ai-agent
python main.py
# AI Agent will run on http://localhost:8000

# Terminal 2: Start Backend + Frontend
npm run dev
# App will run on http://localhost:5173
```

### 6. Test Everything

```bash
# Test AI Agent
node test-ai-agent.js

# Visit the app
# http://localhost:5173
```

## 📖 Documentation

- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Complete setup and implementation details
- **[Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)** - Google authentication configuration
- **[AI Agent README](./ai-agent/README.md)** - AI agent documentation

## 🧪 Testing

### Test AI Agent

```bash
# Run all tests
node test-ai-agent.js

# Show API examples
node test-ai-agent.js examples

# Set custom AI Agent URL
AI_AGENT_API_URL=http://localhost:8000 node test-ai-agent.js
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Chat query
curl -X POST http://localhost:8000/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Should I buy BTC?","pair":"BTC-USD"}'

# Market analysis
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"pair":"BTC/USDT","timeframe":"1d","period":"90d"}'
```

### Interactive API Docs

Visit `http://localhost:8000/docs` when AI agent is running for interactive Swagger UI.

## 📊 AI Agent Usage

### Ask Questions

```python
# Natural language questions
"Should I buy BTC?"
"Explain RSI"
"What is MACD?"
"How to manage risk?"
"Create a scalping strategy"
"What are support levels?"
```

### Market Analysis

```python
# Analyze any pair
"Analyze BTC/USDT"
"Analyze ETH/USDT"
"Analyze AAPL"  # Works with stocks too!
```

### Get Technical Indicators

The AI agent provides:
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- EMA (20, 50, 200)
- ATR (Average True Range)
- ADX (Average Directional Index)
- Stochastic Oscillator
- Volume Analysis

## 🔐 Security

- **Google OAuth 2.0** for secure authentication
- **JWT tokens** with HTTP-only cookies
- **Environment variables** for sensitive data
- **SQL injection prevention** via ORM
- **CORS** configuration
- **Rate limiting** (recommended for production)

## 🌐 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker (Optional)

```dockerfile
# AI Agent Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY ai-agent/requirements.txt .
RUN pip install -r requirements.txt
COPY ai-agent/ .
CMD ["python", "main.py"]
```

```bash
# Build and run
docker build -t trademind-ai -f Dockerfile.ai .
docker run -p 8000:8000 trademind-ai
```

## 📈 Supported Assets

### Cryptocurrencies
BTC, ETH, SOL, BNB, ADA, XRP, DOGE, AVAX, LINK, DOT, MATIC, and more

### Stocks
AAPL, TSLA, GOOGL, MSFT, AMZN, and all major stocks

### Indices
^GSPC (S&P 500), ^DJI (Dow Jones), ^IXIC (NASDAQ)

**Format**: Use Yahoo Finance symbols (BTC-USD for crypto, AAPL for stocks)

## 🐛 Troubleshooting

### AI Agent Not Responding
```bash
# Check if it's running
curl http://localhost:8000/health

# Check logs
cd ai-agent
python main.py
# Watch for errors in output
```

### Google OAuth Errors
- **redirect_uri_mismatch**: Check URIs in Google Cloud Console
- **invalid_client**: Verify CLIENT_ID and CLIENT_SECRET in `.env`
- **access_blocked**: Add test users in Google Cloud Console

### Database Issues
```bash
# Check MySQL connection
mysql -u username -p

# Reset database
npm run db:push
```

### Port Already in Use
```bash
# Kill process on port 8000 (AI Agent)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

## 🎯 Roadmap

- [x] AI Agent with real trading data
- [x] Backend integration
- [ ] Google OAuth implementation
- [ ] Make all pages dynamic
- [ ] Add more AI features:
  - [ ] Sentiment analysis from news
  - [ ] Portfolio optimization
  - [ ] Risk prediction
  - [ ] Strategy backtesting
- [ ] Real exchange integrations (Binance, Bybit, etc.)
- [ ] Mobile app (React Native)
- [ ] Advanced charting (TradingView integration)
- [ ] Social trading features
- [ ] Notifications (email, SMS, push)

## 🤝 Contributing

Contributions are welcome! Please read the implementation guide first.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
1. Check [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)
2. Review AI agent logs
3. Check browser console for frontend errors
4. Review backend logs for API errors

## ⚠️ Disclaimer

This platform is for educational and research purposes only. Trading involves significant risk of loss. Always conduct your own research and never invest more than you can afford to lose.

---

**Built with ❤️ using React, Python, and AI**

🚀 **Ready to start trading smarter?** Follow the Quick Start guide above!
