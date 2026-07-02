# TradeMind AI Agent

AI-powered trading assistant trained on real market data from Yahoo Finance and technical analysis libraries.

## Features

- **Real-time Market Analysis**: Fetches live data from Yahoo Finance
- **Technical Indicators**: RSI, MACD, Bollinger Bands, EMA, ATR, ADX, Stochastic
- **Intelligent Q&A**: Answers trading questions using knowledge base
- **Pattern Recognition**: Identifies market trends and patterns
- **Risk Assessment**: Calculates risk levels and position sizing
- **Support/Resistance**: Identifies key price levels

## Setup

1. **Install Python 3.10+**

2. **Install Dependencies**:
```bash
cd ai-agent
pip install -r requirements.txt
```

3. **Configuration**:
```bash
cp .env.example .env
# Edit .env if needed (PORT, OPENAI_API_KEY)
```

4. **Run the Agent**:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### `POST /chat/query`
Answer trading questions
```json
{
  "query": "Should I buy BTC?",
  "pair": "BTC-USD",
  "context": {}
}
```

### `POST /analyze`
Analyze a trading pair
```json
{
  "pair": "BTC/USDT",
  "timeframe": "1d",
  "period": "90d"
}
```

### `GET /market/data/{symbol}`
Get raw market data with indicators
```
GET /market/data/BTC-USD?period=30d&interval=1d
```

## Data Sources

- **Yahoo Finance**: Real-time OHLCV data for all major cryptocurrencies
- **TA Library**: Technical analysis indicators
- **Custom Knowledge Base**: Trading concepts and strategies

## Training Data

The AI is trained on:
1. Real historical price data from Yahoo Finance
2. Technical indicators calculated from price data
3. Trading knowledge base (RSI, MACD, risk management, etc.)
4. Pattern recognition from historical trends

## Integration with TradeMind App

The backend (`app/api/chat-router.ts`) calls this AI agent to provide intelligent responses.

```typescript
// Example integration
const response = await fetch('http://localhost:8000/chat/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userQuestion, pair: 'BTC/USDT' })
});
```

## Supported Pairs

Any pair available on Yahoo Finance:
- BTC-USD, ETH-USD, SOL-USD
- AAPL, TSLA, GOOGL (stocks)
- ^GSPC (S&P 500), ^DJI (Dow Jones)

## Example Questions

- "Should I buy BTC?"
- "Explain RSI"
- "What's my portfolio performance?"
- "Create a scalping strategy"
- "What are support levels?"
- "Explain risk management"

## Docker (Optional)

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

Build and run:
```bash
docker build -t trademind-ai .
docker run -p 8000:8000 trademind-ai
```
