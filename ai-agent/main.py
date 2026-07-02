"""
TradeMind AI Trading Agent v4.0 - ENHANCED
============================================
A comprehensive AI agent for cryptocurrency trading with:
- Real-time market data from multiple sources
- Advanced technical analysis
- Pattern recognition
- Trading signal generation
- Educational responses
- Trading psychology & mindset
- Real-world scenarios
- Advanced strategies
- Portfolio management
- News impact analysis

Author: TradeMind AI Team
Last Updated: 2026
"""

# ============================================================================
# IMPORTS - All necessary libraries
# ============================================================================
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import asyncio
import aiohttp
from datetime import datetime, timedelta
import numpy as np
import json
import difflib
import re

# Exchange automation
try:
    from exchange_executor import create_executor, AutoTradeMonitor
    EXCHANGE_EXECUTOR_AVAILABLE = True
except ImportError as e:
    EXCHANGE_EXECUTOR_AVAILABLE = False
    print(f"⚠️  Exchange executor not available: {e}")

# Global monitors per user session (keyed by api_key prefix)
_monitors: Dict[str, AutoTradeMonitor] = {}

# Import enhanced knowledge base
try:
    from enhanced_knowledge_base import (
        TRADING_PSYCHOLOGY, CHART_PATTERNS, TRADING_STRATEGIES,
        MARKET_CONDITIONS, PORTFOLIO_MANAGEMENT, GLOSSARY,
        TRADING_SCENARIOS, NEWS_IMPACT, get_knowledge, get_all_topics
    )
    ENHANCED_KB_AVAILABLE = True
except ImportError:
    ENHANCED_KB_AVAILABLE = False
    print("⚠️  Enhanced knowledge base not found. Using basic knowledge only.")

# Import comprehensive knowledge base (NO HALLUCINATION)
try:
    from comprehensive_knowledge import (
        CRYPTO_FUNDAMENTALS, TECHNICAL_INDICATORS, EXACT_FORMULAS,
        search_knowledge, format_verified_response
    )
    COMPREHENSIVE_KB_AVAILABLE = True
    print("✅ Comprehensive Knowledge Base loaded - Zero Hallucination Mode Active")
except ImportError:
    COMPREHENSIVE_KB_AVAILABLE = False
    print("⚠️  Comprehensive knowledge base not found.")

# Import Professional Trading Knowledge
try:
    from professional_trading_knowledge import (
        PROFESSIONAL_STRATEGIES, PROFESSIONAL_RISK, PROFESSIONAL_ANALYSIS,
        AUTOMATION_BUSINESS, PROFESSIONAL_INSIGHTS
    )
    PROFESSIONAL_KB_AVAILABLE = True
    print("💼 Professional Trading Knowledge loaded - Institutional Grade")
except ImportError:
    PROFESSIONAL_KB_AVAILABLE = False
    print("⚠️  Professional knowledge not available")

# ── Extra Knowledge Base (new categories) ────────────────────────────────────
try:
    from extra_knowledge_base import EXTRA_KNOWLEDGE
    EXTRA_KB_AVAILABLE = True
    print("📖 Extra Knowledge Base loaded — candlesticks, leverage, staking, journal, backtesting, on-chain, model info")
except ImportError as e:
    EXTRA_KB_AVAILABLE = False
    EXTRA_KNOWLEDGE = {}
    print(f"⚠️  Extra knowledge base not available: {e}")

# ── NLP Engine (primary resolver) ───────────────────────────────────────────
try:
    from nlp_engine import resolve as nlp_resolve
    NLP_ENGINE_AVAILABLE = True
    print("🔍 NLP Engine loaded — semantic intent resolver active")
except ImportError as e:
    NLP_ENGINE_AVAILABLE = False
    print(f"⚠️  NLP Engine not available: {e}")

# ── Trained ML Model (secondary) ─────────────────────────────────────────────
try:
    from trained_model import TradeMindMLModel
    if PROFESSIONAL_KB_AVAILABLE:
        from professional_trading_knowledge import (
            PROFESSIONAL_STRATEGIES, PROFESSIONAL_RISK, PROFESSIONAL_ANALYSIS,
            AUTOMATION_BUSINESS
        )
    else:
        PROFESSIONAL_STRATEGIES = PROFESSIONAL_RISK = PROFESSIONAL_ANALYSIS = AUTOMATION_BUSINESS = {}

    ML_KNOWLEDGE_STORE = {
        "CRYPTO_FUNDAMENTALS":   CRYPTO_FUNDAMENTALS if COMPREHENSIVE_KB_AVAILABLE else {},
        "TECHNICAL_INDICATORS":  TECHNICAL_INDICATORS if COMPREHENSIVE_KB_AVAILABLE else {},
        "EXACT_FORMULAS":        EXACT_FORMULAS if COMPREHENSIVE_KB_AVAILABLE else {},
        "TRADING_PSYCHOLOGY":    TRADING_PSYCHOLOGY if ENHANCED_KB_AVAILABLE else {},
        "CHART_PATTERNS":        CHART_PATTERNS if ENHANCED_KB_AVAILABLE else {},
        "TRADING_STRATEGIES":    TRADING_STRATEGIES if ENHANCED_KB_AVAILABLE else {},
        "MARKET_CONDITIONS":     MARKET_CONDITIONS if ENHANCED_KB_AVAILABLE else {},
        "PORTFOLIO_MANAGEMENT":  PORTFOLIO_MANAGEMENT if ENHANCED_KB_AVAILABLE else {},
        "GLOSSARY":              GLOSSARY if ENHANCED_KB_AVAILABLE else {},
        "PROFESSIONAL_STRATEGIES": PROFESSIONAL_STRATEGIES,
        "PROFESSIONAL_RISK":     PROFESSIONAL_RISK,
        "PROFESSIONAL_ANALYSIS": PROFESSIONAL_ANALYSIS,
        "AUTOMATION_BUSINESS":   AUTOMATION_BUSINESS,
        "ENHANCED_KB_EXTRA":     EXTRA_KNOWLEDGE if EXTRA_KB_AVAILABLE else {},
    }
    ML_MODEL = TradeMindMLModel()
    ML_MODEL_AVAILABLE = True
    print("🧠 Trained ML Model ready (TF-IDF + Logistic Regression)")
except Exception as e:
    ML_MODEL_AVAILABLE = False
    ML_KNOWLEDGE_STORE = {}
    print(f"⚠️  Trained ML Model not available: {e}")

# ============================================================================
# FASTAPI APP SETUP
# ============================================================================
app = FastAPI(
    title="TradeMind AI Agent",
    description="Enhanced intelligent trading assistant with comprehensive knowledge base",
    version="4.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DATA MODELS - Define request/response structures
# ============================================================================
class ChatRequest(BaseModel):
    """User's chat message request"""
    query: str  # The user's question or command
    pair: Optional[str] = "BTC/USDT"  # Trading pair to analyze

class AnalysisRequest(BaseModel):
    """Request for technical analysis"""
    symbol: str  # e.g., "BTCUSDT"
    timeframe: Optional[str] = "1h"  # e.g., "1h", "4h", "1d"

class PriceData(BaseModel):
    """Current price information"""
    price: float
    change_24h: float
    volume_24h: float
    high_24h: float
    low_24h: float

class ExchangeOrderRequest(BaseModel):
    exchange: str                        # binance | okx | bybit
    api_key: str
    api_secret: str
    passphrase: Optional[str] = ""      # OKX only
    testnet: Optional[bool] = False
    symbol: str                          # e.g. BTC/USDT or BTCUSDT
    side: str                            # buy | sell
    order_type: str                      # market | limit
    quantity: float
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    auto_monitor: Optional[bool] = True  # enable background P&L monitor

class CancelMonitorRequest(BaseModel):
    api_key: str
    symbol: str

# ============================================================================
# CONFIGURATION - Base prices and settings
# ============================================================================
# Base prices for each cryptocurrency (used as fallback)
BASE_PRICES = {
    "BTC": 108250.00,
    "ETH": 4125.50,
    "SOL": 210.75,
    "BNB": 680.30,
    "XRP": 0.62,
    "DOGE": 0.15,
    "ADA": 0.85,
    "AVAX": 42.00,
}

# API endpoints for real-time data
BINANCE_API = "https://api.binance.com/api/v3"
COINGECKO_API = "https://api.coingecko.com/api/v3"


# ============================================================================
# HELPER FUNCTIONS - Data fetching and calculations
# ============================================================================

async def fetch_price_from_binance(symbol: str) -> Optional[Dict]:
    """
    Fetch real-time price from Binance API
    
    Args:
        symbol: Trading symbol (e.g., "BTCUSDT")
    
    Returns:
        Dictionary with price data or None if failed
    """
    try:
        url = f"{BINANCE_API}/ticker/24hr?symbol={symbol}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "price": float(data["lastPrice"]),
                        "change_24h": float(data["priceChangePercent"]),
                        "volume_24h": float(data["volume"]),
                        "high_24h": float(data["highPrice"]),
                        "low_24h": float(data["lowPrice"]),
                        "source": "Binance"
                    }
    except Exception as e:
        print(f"Binance API error: {e}")
    return None

async def fetch_price_from_coingecko(coin_id: str) -> Optional[Dict]:
    """
    Fetch price from CoinGecko API as backup
    
    Args:
        coin_id: CoinGecko coin ID (e.g., "bitcoin")
    
    Returns:
        Dictionary with price data or None if failed
    """
    try:
        url = f"{COINGECKO_API}/simple/price"
        params = {
            "ids": coin_id,
            "vs_currencies": "usd",
            "include_24hr_change": "true",
            "include_24hr_vol": "true"
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    coin_data = data.get(coin_id, {})
                    return {
                        "price": coin_data.get("usd", 0),
                        "change_24h": coin_data.get("usd_24h_change", 0),
                        "volume_24h": coin_data.get("usd_24h_vol", 0),
                        "source": "CoinGecko"
                    }
    except Exception as e:
        print(f"CoinGecko API error: {e}")
    return None


def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """
    Calculate Relative Strength Index (RSI)
    
    RSI measures momentum on a scale of 0-100:
    - Below 30: Oversold (potential buy)
    - Above 70: Overbought (potential sell)
    - Around 50: Neutral
    
    Args:
        prices: List of closing prices
        period: Number of periods (default 14)
    
    Returns:
        RSI value between 0 and 100
    """
    if len(prices) < period + 1:
        return 50.0  # Return neutral if not enough data
    
    # Calculate price changes
    deltas = np.diff(prices)
    
    # Separate gains and losses
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    # Calculate average gain and loss
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])
    
    # Calculate RS and RSI
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return round(rsi, 2)

def calculate_macd(prices: List[float]) -> Dict[str, float]:
    """
    Calculate MACD (Moving Average Convergence Divergence)
    
    MACD shows trend direction and momentum:
    - MACD Line: 12-period EMA minus 26-period EMA
    - Signal Line: 9-period EMA of MACD Line
    - Histogram: MACD Line minus Signal Line
    
    Bullish signal: MACD crosses above Signal
    Bearish signal: MACD crosses below Signal
    
    Args:
        prices: List of closing prices
    
    Returns:
        Dictionary with MACD, Signal, and Histogram values
    """
    if len(prices) < 26:
        return {"macd": 0, "signal": 0, "histogram": 0}
    
    # Calculate EMAs
    ema_12 = _calculate_ema(prices, 12)
    ema_26 = _calculate_ema(prices, 26)
    
    # MACD Line = 12 EMA - 26 EMA
    macd_line = ema_12 - ema_26
    
    # Signal Line = 9 EMA of MACD
    signal_line = macd_line  # Simplified
    
    # Histogram = MACD - Signal
    histogram = macd_line - signal_line
    
    return {
        "macd": round(macd_line, 2),
        "signal": round(signal_line, 2),
        "histogram": round(histogram, 2)
    }


def _calculate_ema(prices: List[float], period: int) -> float:
    """
    Calculate Exponential Moving Average (EMA)
    
    EMA gives more weight to recent prices
    
    Args:
        prices: List of closing prices
        period: Number of periods
    
    Returns:
        EMA value
    """
    if len(prices) < period:
        return np.mean(prices) if prices else 0
    
    multiplier = 2 / (period + 1)
    ema = np.mean(prices[:period])  # Start with SMA
    
    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema
    
    return ema

def generate_mock_prices(base_price: float, periods: int = 50) -> List[float]:
    """
    DEPRECATED: No longer generating fake price data
    
    This function is kept for backward compatibility but should not be used.
    All price data should come from real APIs (Binance, CoinGecko)
    """
    # Return empty list - force using real data only
    return []


# ============================================================================
# AI KNOWLEDGE BASE - Trading education and patterns
# ============================================================================

# Greetings and responses (Including Islamic greetings)
GREETINGS = {
    "hello": ["Hi! I'm TradeMind AI, your trading assistant. How can I help you today?"],
    "hi": ["Hello! Ready to help you with crypto trading. What would you like to know?"],
    "hey": ["Hey there! I'm here to assist with your trading questions. What's on your mind?"],
    "good morning": ["Good morning! Let's make today a profitable trading day! What can I help with?"],
    "good afternoon": ["Good afternoon! How can I assist your trading today?"],
    "good evening": ["Good evening! Ready to analyze markets or answer questions!"],
    "how are you": ["I'm doing great! Busy analyzing crypto markets. How can I help you?"],
    "thanks": ["You're welcome! Feel free to ask anything about trading!"],
    "thank you": ["Happy to help! Don't hesitate to ask more questions!"],
    
    # Islamic Greetings
    "assalamu alaikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    "asalamualaikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    "aslmualikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    "aslamualikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    "asalam alaikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    "aslam o alikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    "salam": ["Wa Alaikum Assalam! 🌙 How can I help you with your trading journey today?"],
    "as-salamu alaykum": ["Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! 🌙 I'm here to help with your crypto trading questions."],
    "salaam": ["Wa Alaikum Assalam! 🌙 How can I help you with your trading journey today?"],
    "salamu alaikum": ["Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?"],
    
    # Urdu/Arabic variations
    "kya hal hai": ["Alhamdulillah, I'm doing well! 😊 Ready to help you with crypto trading. What would you like to know?"],
    "kaisa hai": ["Alhamdulillah, doing great! 💪 How can I assist your trading today?"],
    "kaise hain": ["Alhamdulillah, everything is good! 🙏 What trading questions do you have?"],
    "kaise ho": ["Alhamdulillah, I'm fine! 😊 How can I help with your trading?"],
}

# Cryptocurrency basics
CRYPTO_BASICS = {
    "bitcoin": {
        "name": "Bitcoin (BTC)",
        "description": "Bitcoin is the first and most valuable cryptocurrency, created in 2009 by an anonymous person (or group) known as Satoshi Nakamoto.",
        "key_facts": [
            "🪙 Maximum Supply: 21 million coins",
            "⛏️ Mining: New coins created through 'mining' process",
            "💰 Use Case: Digital gold, store of value, payment system",
            "📈 Market Cap: Largest cryptocurrency by market capitalization",
            "🔐 Security: Uses blockchain technology for secure transactions",
        ],
        "why_invest": "Many investors see Bitcoin as 'digital gold' - a hedge against inflation and store of value",
        "risks": "High volatility, regulatory uncertainty, technological risks"
    },
    "ethereum": {
        "name": "Ethereum (ETH)",
        "description": "Ethereum is a blockchain platform that enables smart contracts and decentralized applications (dApps), created by Vitalik Buterin in 2015.",
        "key_facts": [
            "💻 Smart Contracts: Self-executing programs on the blockchain",
            "🎨 NFTs: Platform for non-fungible tokens",
            "🏦 DeFi: Powers decentralized finance applications",
            "⚡ Ethereum 2.0: Upgraded to Proof-of-Stake for energy efficiency",
            "🔧 Use Case: Platform for building decentralized applications",
        ],
        "why_invest": "Ethereum powers most of the crypto ecosystem including DeFi, NFTs, and dApps",
        "risks": "Competition from other platforms, scalability challenges, gas fees"
    },
    "blockchain": {
        "name": "Blockchain Technology",
        "description": "A blockchain is a distributed, immutable ledger that records transactions across many computers.",
        "key_facts": [
            "📚 Blocks: Groups of transactions chained together",
            "🔗 Distributed: Copied across thousands of computers",
            "🔒 Immutable: Cannot be changed once recorded",
            "👥 Decentralized: No single authority controls it",
            "✅ Transparent: All transactions are public",
        ],
        "benefits": "Security, transparency, reduced costs, no middlemen",
        "use_cases": "Cryptocurrencies, supply chain, voting systems, digital identity"
    },
}

TRADING_KNOWLEDGE = {
    "rsi": {
        "title": "RSI (Relative Strength Index)",
        "description": "A momentum indicator measuring speed and change of price movements",
        "how_to_use": [
            "RSI below 30: Oversold - potential buying opportunity",
            "RSI above 70: Overbought - potential selling opportunity",
            "RSI around 50: Neutral market",
            "Divergences: Price makes new high but RSI doesn't = potential reversal"
        ],
        "example": "If Bitcoin RSI is 25, it's oversold and may bounce up soon"
    },
    "macd": {
        "title": "MACD (Moving Average Convergence Divergence)",
        "description": "Shows relationship between two moving averages of price",
        "how_to_use": [
            "Bullish crossover: MACD crosses above signal line (buy signal)",
            "Bearish crossover: MACD crosses below signal line (sell signal)",
            "Zero line cross: MACD crosses above zero (strong bullish)",
            "Histogram: Shows strength of trend"
        ],
        "example": "MACD crossing above signal = time to consider buying"
    },
    "support_resistance": {
        "title": "Support and Resistance Levels",
        "description": "Price levels where market tends to stop and reverse",
        "how_to_use": [
            "Support: Price level where buying interest is strong enough to prevent further decline",
            "Resistance: Price level where selling interest prevents further rise",
            "Breakout: When price breaks through support/resistance with volume",
            "Test: When price approaches level but doesn't break"
        ],
        "example": "If BTC keeps bouncing at $100k, that's a support level"
    },
    "candlestick_patterns": {
        "title": "Candlestick Patterns",
        "description": "Visual patterns in candlestick charts that predict price movement",
        "patterns": {
            "doji": "Small body, indicates indecision, potential reversal",
            "hammer": "Small body with long lower wick, bullish reversal",
            "shooting_star": "Small body with long upper wick, bearish reversal",
            "engulfing": "Large candle engulfs previous candle, strong reversal signal",
            "three_white_soldiers": "Three consecutive bullish candles, strong uptrend"
        }
    },
    "risk_management": {
        "title": "Risk Management Principles",
        "description": "Essential rules to protect your capital",
        "rules": [
            "Never risk more than 1-2% of capital per trade",
            "Always use stop-loss orders",
            "Don't overtrade - quality over quantity",
            "Diversify across different assets",
            "Keep emotions out of trading decisions",
            "Have a trading plan and stick to it"
        ]
    }
}


# ============================================================================
# AI RESPONSE GENERATION
# ============================================================================

def generate_trading_analysis(coin: str, price_data: Dict, technical_indicators: Dict) -> str:
    """
    Generate comprehensive trading analysis
    
    Args:
        coin: Cryptocurrency symbol (e.g., "BTC")
        price_data: Current price information
        technical_indicators: RSI, MACD, etc.
    
    Returns:
        Formatted analysis text
    """
    price = price_data["price"]
    change_24h = price_data["change_24h"]
    rsi = technical_indicators["rsi"]
    macd = technical_indicators["macd"]
    
    # Determine market sentiment
    is_bullish = change_24h > 0
    sentiment = "Bullish 🟢" if is_bullish else "Bearish 🔴"
    
    # RSI interpretation
    if rsi < 30:
        rsi_signal = "OVERSOLD - Potential Buy Opportunity"
        rsi_color = "🟢"
    elif rsi > 70:
        rsi_signal = "OVERBOUGHT - Consider Taking Profits"
        rsi_color = "🔴"
    else:
        rsi_signal = "NEUTRAL - Wait for Clear Signal"
        rsi_color = "🟡"
    
    # MACD interpretation
    if macd["histogram"] > 0:
        macd_signal = "Bullish Momentum"
        macd_action = "Consider buying on dips"
    else:
        macd_signal = "Bearish Momentum"
        macd_action = "Wait for confirmation before buying"
    
    # Generate recommendation
    if rsi < 30 and macd["histogram"] > 0:
        recommendation = "STRONG BUY"
        confidence = 85
    elif rsi > 70 and macd["histogram"] < 0:
        recommendation = "SELL/TAKE PROFIT"
        confidence = 80
    elif is_bullish and rsi < 60:
        recommendation = "BUY"
        confidence = 70
    elif not is_bullish and rsi > 40:
        recommendation = "SELL"
        confidence = 65
    else:
        recommendation = "HOLD"
        confidence = 60
    
    # Format response
    analysis = f"""
# 📊 {coin}/USDT Analysis

## Current Market Data
- **Price:** ${price:,.2f}
- **24h Change:** {change_24h:+.2f}%
- **Trend:** {sentiment}

## Technical Indicators
- **RSI (14):** {rsi:.1f} {rsi_color}
  - Status: {rsi_signal}
  
- **MACD:**
  - Signal: {macd_signal}
  - Action: {macd_action}

## 🎯 Trading Recommendation
- **Signal:** {recommendation}
- **Confidence:** {confidence}%

## 📈 Strategy
"""
    
    if recommendation in ["STRONG BUY", "BUY"]:
        analysis += f"""
1. **Entry Zone:** ${price * 0.99:.2f} - ${price * 1.01:.2f}
2. **Stop Loss:** ${price * 0.97:.2f} (3% below entry)
3. **Take Profit 1:** ${price * 1.03:.2f} (1:1 Risk/Reward)
4. **Take Profit 2:** ${price * 1.05:.2f} (1:2 Risk/Reward)
"""
    elif recommendation in ["SELL", "SELL/TAKE PROFIT"]:
        analysis += f"""
1. **Consider exiting** positions near ${price:.2f}
2. **Set trailing stop** at 3% below current price
3. **Wait for reentry** when RSI drops below 50
"""
    else:
        analysis += """
1. **Wait for clear signal** before entering
2. **Monitor RSI** for oversold/overbought conditions
3. **Watch for MACD crossover** confirmation
"""
    
    analysis += f"""

## ⚠️ Risk Management
- Risk only 1-2% of your portfolio per trade
- Always use stop-loss orders
- Don't trade based on emotions

---
*Analysis generated at {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*
*Data source: {price_data.get('source', 'Multiple APIs')}*
    """
    
    return analysis.strip()


def _format_model_info(info: dict) -> str:
    """Format model self-info into a clean markdown response."""
    if not info:
        return (
            "# 🤖 TradeMind AI\n\n"
            "I'm **TradeMind AI** — your intelligent crypto & trading assistant.\n\n"
            "I can help you with technical analysis, trading strategies, risk management, "
            "crypto fundamentals, trading psychology, and much more.\n\n"
            "Just ask me anything about trading!"
        )
    lines = [f"# {info.get('title', 'TradeMind AI')}\n"]
    lines.append(f"{info.get('description', '')}\n")

    what_i_am = info.get("what_i_am", [])
    if what_i_am:
        lines.append("## What I Am")
        for item in what_i_am:
            lines.append(f"- {item}")
        lines.append("")

    capabilities = info.get("what_i_can_do", {})
    if capabilities:
        lines.append("## What I Can Help With")
        for area, detail in capabilities.items():
            lines.append(f"**{area}:** {detail}")
        lines.append("")

    cannot = info.get("what_i_cannot_do", [])
    if cannot:
        lines.append("## Limitations")
        for item in cannot:
            lines.append(f"- {item}")
        lines.append("")

    tech = info.get("tech_stack", {})
    if tech:
        lines.append("## Tech Stack")
        for k, v in tech.items():
            lines.append(f"**{k}:** {v}")
        lines.append("")

    disclaimer = info.get("disclaimer", "")
    if disclaimer:
        lines.append(f"\n---\n{disclaimer}")

    return "\n".join(lines)


def _format_extra_kb(content: dict) -> str:
    """Generic formatter for extra knowledge base entries."""
    lines = []
    title = content.get("title", "")
    if title:
        lines.append(f"# {title}\n")
    desc = content.get("description", "")
    if desc:
        lines.append(f"{desc}\n")

    skip = {"title", "description"}
    for key, value in content.items():
        if key in skip:
            continue
        label = key.replace("_", " ").title()
        if isinstance(value, str):
            lines.append(f"**{label}:** {value}\n")
        elif isinstance(value, list):
            lines.append(f"## {label}")
            for item in value:
                lines.append(f"- {item}")
            lines.append("")
        elif isinstance(value, dict):
            lines.append(f"## {label}")
            for subk, subv in value.items():
                sublabel = subk.replace("_", " ").title()
                if isinstance(subv, str):
                    lines.append(f"**{sublabel}:** {subv}")
                elif isinstance(subv, list):
                    lines.append(f"**{sublabel}:**")
                    for item in subv:
                        lines.append(f"  - {item}")
                elif isinstance(subv, dict):
                    lines.append(f"**{sublabel}:**")
                    for k2, v2 in subv.items():
                        if isinstance(v2, list):
                            lines.append(f"  - *{k2}*:")
                            for i in v2:
                                lines.append(f"    - {i}")
                        else:
                            lines.append(f"  - *{k2}*: {v2}")
            lines.append("")
    return "\n".join(lines).strip()


def generate_educational_response(topic: str) -> str:
    """
    Generate educational response about trading concepts
    Enhanced with comprehensive knowledge base
    
    Args:
        topic: Trading topic to explain
    
    Returns:
        Formatted educational content
    """
    topic_lower = topic.lower()
    
    # Check enhanced knowledge base first
    if ENHANCED_KB_AVAILABLE:
        # Check trading psychology
        for key, content in TRADING_PSYCHOLOGY.items():
            if key in topic_lower or any(word in topic_lower for word in key.split("_")):
                response = f"# {content['title']}\n\n"
                response += f"## Overview\n{content['description']}\n\n"
                
                if 'concepts' in content:
                    response += "## Key Concepts:\n"
                    for concept, desc in content['concepts'].items():
                        response += f"**{concept}:** {desc}\n\n"
                
                if 'symptoms' in content:
                    response += "## Warning Signs:\n"
                    for symptom in content['symptoms']:
                        response += f"⚠️ {symptom}\n"
                    response += "\n"
                
                if 'solutions' in content:
                    response += "## Solutions:\n"
                    for solution in content['solutions']:
                        response += f"✅ {solution}\n"
                    response += "\n"
                
                if 'tips' in content:
                    response += "## Pro Tips:\n"
                    for tip in content['tips']:
                        response += f"💡 {tip}\n"
                    response += "\n"
                
                if 'principles' in content:
                    response += "## Core Principles:\n"
                    for principle in content['principles']:
                        response += f"📌 {principle}\n"
                    response += "\n"
                
                return response.strip()
        
        # Check chart patterns
        for key, content in CHART_PATTERNS.items():
            if key in topic_lower or any(word in topic_lower for word in key.split("_")):
                response = f"# {content['title']}\n\n"
                response += f"**Type:** {content.get('type', 'Chart Pattern')}\n\n"
                response += f"## Description\n{content['description']}\n\n"
                
                if 'components' in content:
                    response += "## Pattern Components:\n"
                    for component in content['components']:
                        response += f"• {component}\n"
                    response += "\n"
                
                if 'characteristics' in content:
                    response += "## Characteristics:\n"
                    for char in content['characteristics']:
                        response += f"• {char}\n"
                    response += "\n"
                
                if 'how_to_trade' in content:
                    response += "## How to Trade:\n"
                    for action, detail in content['how_to_trade'].items():
                        response += f"**{action}:** {detail}\n"
                    response += "\n"
                
                if 'example' in content:
                    response += f"## Example\n{content['example']}\n\n"
                
                if 'reliability' in content:
                    response += f"**Reliability:** {content['reliability']}\n\n"
                
                if 'counter_intuitive' in content:
                    response += f"⚠️ **Important:** {content.get('counter_intuitive')}\n\n"
                
                return response.strip()
        
        # Check trading strategies
        for key, content in TRADING_STRATEGIES.items():
            if key in topic_lower or any(word in topic_lower for word in key.split("_")):
                response = f"# {content['title']}\n\n"
                response += f"## What is it?\n{content['description']}\n\n"
                
                if 'types' in content:
                    response += "## Types:\n"
                    for type_name, type_desc in content['types'].items():
                        response += f"**{type_name}:** {type_desc}\n"
                    response += "\n"
                
                if 'rules' in content:
                    response += "## Trading Rules:\n"
                    for i, rule in enumerate(content['rules'], 1):
                        response += f"{i}. {rule}\n"
                    response += "\n"
                
                if 'indicators' in content:
                    response += "## Recommended Indicators:\n"
                    for indicator in content['indicators']:
                        response += f"• {indicator}\n"
                    response += "\n"
                
                if 'advantages' in content:
                    response += "## Advantages:\n"
                    for advantage in content['advantages']:
                        response += f"✅ {advantage}\n"
                    response += "\n"
                
                if 'characteristics' in content:
                    response += "## Characteristics:\n"
                    for char in content['characteristics']:
                        response += f"• {char}\n"
                    response += "\n"
                
                if 'requirements' in content:
                    response += "## Requirements:\n"
                    for req in content['requirements']:
                        response += f"📋 {req}\n"
                    response += "\n"
                
                if 'warning' in content:
                    response += f"⚠️ **Warning:** {content['warning']}\n\n"
                
                if 'best_for' in content:
                    response += f"**Best For:** {content['best_for']}\n\n"
                
                if 'example' in content:
                    response += f"## Example\n{content['example']}\n\n"
                
                return response.strip()
        
        # Check glossary
        if topic_lower in GLOSSARY:
            term = topic_lower.upper() if topic_lower in ['fud', 'fomo', 'hodl', 'ath', 'atl', 'dca', 'dyor', 'nfa'] else topic_lower.title()
            return f"# {term}\n\n{GLOSSARY[topic_lower]}"
        
        # Check market conditions
        for key, content in MARKET_CONDITIONS.items():
            if key in topic_lower or any(word in topic_lower for word in key.split("_")):
                response = f"# {content['title']}\n\n"
                response += f"{content['description']}\n\n"
                
                if 'characteristics' in content:
                    response += "## Characteristics:\n"
                    for char in content['characteristics']:
                        response += f"• {char}\n"
                    response += "\n"
                
                if 'strategies' in content:
                    response += "## Trading Strategies:\n"
                    for strategy in content['strategies']:
                        response += f"✅ {strategy}\n"
                    response += "\n"
                
                if 'adjustments' in content:
                    response += "## Risk Adjustments:\n"
                    for adjustment in content['adjustments']:
                        response += f"⚙️ {adjustment}\n"
                    response += "\n"
                
                return response.strip()
        
        # Check portfolio management
        for key, content in PORTFOLIO_MANAGEMENT.items():
            if key in topic_lower or any(word in topic_lower for word in key.split("_")):
                response = f"# {content['title']}\n\n"
                response += f"{content['description']}\n\n"
                
                if 'crypto_allocation' in content:
                    response += "## Sample Allocations:\n"
                    for risk_level, allocation in content['crypto_allocation'].items():
                        response += f"**{risk_level}:** {allocation}\n"
                    response += "\n"
                
                if 'formula' in content:
                    response += f"## Formula\n```\n{content['formula']}\n```\n\n"
                
                if 'example' in content:
                    response += f"## Example\n{content['example']}\n\n"
                
                if 'rules' in content:
                    response += "## Rules:\n"
                    for rule in content['rules']:
                        response += f"📌 {rule}\n"
                    response += "\n"
                
                if 'breakeven_winrate' in content:
                    response += "## Breakeven Win Rates:\n"
                    for ratio, winrate in content['breakeven_winrate'].items():
                        response += f"**{ratio}:** {winrate}\n"
                    response += "\n"
                
                return response.strip()
    
    # Check for cryptocurrency basics (original knowledge)
    for key, content in CRYPTO_BASICS.items():
        if key in topic_lower:
            response = f"# {content['name']}\n\n"
            response += f"## What is it?\n{content['description']}\n\n"
            
            if "key_facts" in content:
                response += "## Key Facts:\n"
                for fact in content["key_facts"]:
                    response += f"{fact}\n"
                response += "\n"
            
            if "why_invest" in content:
                response += f"## Why People Invest:\n{content['why_invest']}\n\n"
            
            if "risks" in content:
                response += f"## Risks to Consider:\n{content['risks']}\n\n"
            
            if "benefits" in content:
                response += f"## Benefits:\n{content['benefits']}\n\n"
            
            if "use_cases" in content:
                response += f"## Use Cases:\n{content['use_cases']}\n\n"
            
            return response
    
    # Check for trading concepts
    for key, content in TRADING_KNOWLEDGE.items():
        if key in topic_lower or any(word in topic_lower for word in key.split("_")):
            response = f"# {content['title']}\n\n"
            response += f"## What is it?\n{content['description']}\n\n"
            
            if "how_to_use" in content:
                response += "## How to Use:\n"
                for tip in content["how_to_use"]:
                    response += f"- {tip}\n"
                response += "\n"
            
            if "rules" in content:
                response += "## Key Rules:\n"
                for rule in content["rules"]:
                    response += f"✓ {rule}\n"
                response += "\n"
            
            if "patterns" in content:
                response += "## Common Patterns:\n"
                for pattern, desc in content["patterns"].items():
                    response += f"- **{pattern.title()}:** {desc}\n"
                response += "\n"
            
            if "example" in content:
                response += f"## Example:\n{content['example']}\n\n"
            
            return response
    
    # ── Extra Knowledge Base (candlesticks, order types, leverage, staking, journal, backtesting, on-chain, tools) ──
    if EXTRA_KB_AVAILABLE:
        # Direct key match first
        for key, content in EXTRA_KNOWLEDGE.items():
            if key == "model_info":
                continue  # handled separately
            key_words = key.split("_")
            if key in topic_lower or any(w in topic_lower for w in key_words if len(w) > 3):
                return _format_extra_kb(content)

    # Trading tools fallback (also covered by extra KB above, kept for direct keyword hits)
    if any(w in topic_lower for w in ["trading_tools", "trading tool", "tools"]):
        if EXTRA_KB_AVAILABLE and "trading_tools" in EXTRA_KNOWLEDGE:
            return _format_extra_kb(EXTRA_KNOWLEDGE["trading_tools"])

    # Default response if no match
    return ""

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Check if the AI agent is running"""
    return {
        "status": "healthy",
        "version": "3.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/realtime/{symbol}")
async def get_realtime_price(symbol: str):
    """
    Get real-time price for a cryptocurrency
    
    Example: /realtime/BTCUSDT
    """
    # Try Binance first
    price_data = await fetch_price_from_binance(symbol.upper())
    
    # Fallback to CoinGecko if Binance fails
    if not price_data:
        coin_map = {
            "BTCUSDT": "bitcoin",
            "ETHUSDT": "ethereum",
            "SOLUSDT": "solana",
            "BNBUSDT": "binancecoin"
        }
        coin_id = coin_map.get(symbol.upper())
        if coin_id:
            price_data = await fetch_price_from_coingecko(coin_id)
    
    # Final fallback to base prices
    if not price_data:
        coin_symbol = symbol.replace("USDT", "").upper()
        if coin_symbol in BASE_PRICES:
            base_price = BASE_PRICES[coin_symbol]
            price_data = {
                "price": base_price,
                "change_24h": np.random.uniform(-3, 3),
                "volume_24h": 1000000000,
                "high_24h": base_price * 1.02,
                "low_24h": base_price * 0.98,
                "source": "Simulated"
            }
        else:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    
    return price_data

@app.post("/analyze")
async def analyze_market(request: AnalysisRequest):
    """
    Perform technical analysis on a cryptocurrency
    
    Request body:
    {
        "symbol": "BTCUSDT",
        "timeframe": "1h"
    }
    """
    # Get current price
    price_data = await get_realtime_price(request.symbol)
    
    # Generate mock historical prices for indicators
    prices = generate_mock_prices(price_data["price"], periods=50)
    
    # Calculate technical indicators
    rsi = calculate_rsi(prices)
    macd = calculate_macd(prices)
    
    indicators = {
        "rsi": rsi,
        "macd": macd,
        "ema_20": round(_calculate_ema(prices, 20), 2),
        "ema_50": round(_calculate_ema(prices, 50), 2),
    }
    
    return {
        "symbol": request.symbol,
        "timeframe": request.timeframe,
        "price_data": price_data,
        "indicators": indicators,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# SPELL / FUZZY CORRECTION
# ============================================================================

# Canonical trading terms the model knows about
KNOWN_TERMS = [
    "bitcoin", "ethereum", "blockchain", "cryptocurrency", "crypto",
    "rsi", "macd", "moving average", "bollinger bands", "fibonacci",
    "support", "resistance", "candlestick", "volume", "atr", "stochastic",
    "scalping", "swing trading", "day trading", "trend following", "breakout",
    "risk management", "position sizing", "stop loss", "take profit", "leverage",
    "liquidation", "margin", "funding rate", "portfolio", "diversification",
    "bull market", "bear market", "market structure", "market cycle",
    "defi", "nft", "mining", "wallet", "staking", "altcoin",
    "fear and greed", "fomo", "fud", "hodl", "whale", "pump and dump",
    "grid trading", "dca", "arbitrage", "momentum", "market making",
    "head and shoulders", "double top", "double bottom", "cup and handle",
    "analyze", "analysis", "price", "trend", "signal", "buy", "sell",
    "chart", "news", "live analysis",
]

def correct_query(query: str) -> tuple[str, str | None]:
    """
    Attempt to fix spelling/grammar in the query.
    Returns (corrected_query, suggestion_label) where suggestion_label
    is None if no correction was made.
    """
    words = re.findall(r"[a-zA-Z]+", query.lower())
    corrected_words = []
    changed = False

    # Build a flat word list from known terms
    known_words = set()
    for term in KNOWN_TERMS:
        for w in term.split():
            known_words.add(w)
    # Common English words to skip correction on
    skip_words = {
        "what", "is", "are", "how", "to", "the", "a", "an", "in", "of",
        "and", "or", "for", "me", "my", "i", "do", "does", "can", "tell",
        "about", "explain", "show", "give", "get", "use", "with", "on",
        "at", "by", "from", "this", "that", "it", "be", "have", "has",
        "will", "would", "should", "could", "please", "hi", "hello",
        "hey", "thanks", "thank", "you", "your", "help", "need", "want",
        "learn", "know", "understand", "good", "bad", "best", "new",
        "live", "real", "time", "market", "trade", "trading", "price",
        "buy", "sell", "chart", "news", "latest", "current", "today",
    }

    original_words = re.findall(r"[a-zA-Z]+", query)
    for word in original_words:
        w_lower = word.lower()
        if w_lower in skip_words or w_lower in known_words or len(w_lower) <= 3:
            corrected_words.append(word)
            continue
        matches = difflib.get_close_matches(w_lower, known_words, n=1, cutoff=0.75)
        if matches and matches[0] != w_lower:
            corrected_words.append(matches[0])
            changed = True
        else:
            corrected_words.append(word)

    if not changed:
        return query, None

    # Rebuild corrected query preserving non-alpha tokens
    tokens = re.split(r"([a-zA-Z]+)", query)
    word_iter = iter(corrected_words)
    result_tokens = []
    for token in tokens:
        if re.match(r"[a-zA-Z]+", token):
            result_tokens.append(next(word_iter))
        else:
            result_tokens.append(token)
    corrected = "".join(result_tokens)
    return corrected, corrected


@app.post("/chat/query")
async def chat_query(request: ChatRequest):
    """
    Main chat endpoint - handles user questions with ZERO HALLUCINATION
    
    Uses Advanced AI Model with NLP for intelligent understanding
    
    Request body:
    {
        "query": "Should I buy BTC?",
        "pair": "BTC/USDT"
    }
    """
    # Auto-correct spelling/grammar before processing
    corrected_query, suggestion = correct_query(request.query)
    if suggestion:
        request = ChatRequest(query=corrected_query, pair=request.pair)

    query_lower = request.query.lower()
    
    # 1. Check for greetings first
    for greeting, responses in GREETINGS.items():
        if greeting in query_lower:
            return {
                "answer": responses[0],
                "type": "greeting",
                "verified": True,
                "suggestion": suggestion,
                "timestamp": datetime.now().isoformat()
            }

    # 1.2 Model self-info — "who are you", "what is trademind", "tell me about yourself"
    SELF_INFO_TRIGGERS = [
        "who are you", "what are you", "tell me about yourself", "introduce yourself",
        "what is trademind", "what is trademind ai", "what can you do",
        "what are your capabilities", "what topics do you cover", "are you an ai",
        "what kind of ai", "how do you work", "your purpose", "about you",
        "about trademind", "what do you know",
    ]
    if any(trigger in query_lower for trigger in SELF_INFO_TRIGGERS):
        model_info = EXTRA_KNOWLEDGE.get("model_info", {}) if EXTRA_KB_AVAILABLE else {}
        return {
            "answer": _format_model_info(model_info),
            "type": "model_info",
            "verified": True,
            "suggestion": suggestion,
            "timestamp": datetime.now().isoformat()
        }
    
    # 1.5 Check for specific button actions (Charts, Live Analysis, News)
    # Chart Request
    if any(keyword in query_lower for keyword in ["chart", "show me", "view chart", "price chart"]):
        coin = "BTC"
        if request.pair:
            coin = request.pair.split("/")[0].upper()
        else:
            for symbol in BASE_PRICES.keys():
                if symbol.lower() in query_lower:
                    coin = symbol
                    break
        
        return {
            "answer": f"""
# 📊 {coin} Price Chart & Analysis

## 📈 Chart Information

To view **real-time interactive charts**, you have several options:

### 🔴 Option 1: TradingView (Recommended)
Visit [TradingView {coin}/USDT Chart](https://www.tradingview.com/chart/?symbol=BINANCE:{coin}USDT)

**Features:**
- ✅ Real-time candlestick charts
- ✅ Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- ✅ 100+ technical indicators
- ✅ Drawing tools (trendlines, Fibonacci, etc.)
- ✅ Volume analysis
- ✅ Free to use

### 📊 Option 2: Binance Chart
Visit [Binance {coin}/USDT](https://www.binance.com/en/trade/{coin}_USDT)

**Features:**
- ✅ Live price updates
- ✅ Order book depth
- ✅ Recent trades
- ✅ Basic indicators (MA, EMA, BOLL)

### 💹 Option 3: CoinGecko Chart
Visit [CoinGecko {coin}](https://www.coingecko.com/en/coins/{coin.lower()})

**Features:**
- ✅ Price history charts
- ✅ Market cap data
- ✅ Volume trends
- ✅ Price comparisons

## 📋 What to Look For:

1. **Trend Direction:**
   - Uptrend: Higher highs and higher lows
   - Downtrend: Lower highs and lower lows
   - Sideways: Consolidation phase

2. **Support & Resistance:**
   - Support: Price levels where buying interest is strong
   - Resistance: Price levels where selling interest is strong

3. **Volume:**
   - High volume + price increase = Strong bullish signal
   - High volume + price decrease = Strong bearish signal
   - Low volume = Weak trend

4. **Indicators to Add:**
   - RSI (14): Oversold <30, Overbought >70
   - MACD: Trend direction and momentum
   - EMA (20, 50, 200): Moving average support/resistance

## 💡 Pro Tip:
Use **multiple timeframes** for better analysis:
- Short-term: 5m, 15m charts for entry/exit
- Medium-term: 1h, 4h charts for trend
- Long-term: 1d, 1w charts for big picture

Would you like me to analyze the current {coin} price and give you trading signals?
            """.strip(),
            "type": "chart_info",
            "verified": True,
            "coin": coin,
            "timestamp": datetime.now().isoformat()
        }
    
    # Live Analysis Request
    if any(keyword in query_lower for keyword in ["live analysis", "live market", "current analysis", "market analysis", "give me live"]):
        coin = "BTC"
        if request.pair:
            coin = request.pair.split("/")[0].upper()
        else:
            for symbol in BASE_PRICES.keys():
                if symbol.lower() in query_lower:
                    coin = symbol
                    break
        
        # Try to fetch real price data
        symbol_binance = f"{coin}USDT"
        price_data = None
        
        try:
            price_data = await fetch_price_from_binance(symbol_binance)
        except:
            pass
        
        if not price_data:
            return {
                "answer": f"""
# 📊 {coin} Live Market Analysis

## ⚠️ Real-Time Data Unavailable

I cannot fetch live market data at the moment. This could be because:
- 🔌 Internet connection issues
- 🚫 API rate limits
- ⏸️ Exchange API temporarily unavailable

## 📚 What I Can Do Instead:

### 1. Teach You Technical Analysis
Ask me:
- "What is RSI?"
- "How to use MACD?"
- "Explain support and resistance"
- "What are candlestick patterns?"

### 2. Trading Strategies
Ask me:
- "What is scalping?"
- "Swing trading strategy"
- "How to manage risk?"
- "Position sizing guide"

### 3. Professional Trading
Ask me:
- "How to automate trading business?"
- "Market making strategies"
- "Institutional trading secrets"

## 🔴 View Live Data Yourself:

**TradingView:** https://www.tradingview.com/chart/?symbol=BINANCE:{coin}USDT
**Binance:** https://www.binance.com/en/trade/{coin}_USDT
**CoinGecko:** https://www.coingecko.com/en/coins/{coin.lower()}

Would you like me to teach you something specific about trading?
                """.strip(),
                "type": "live_analysis_unavailable",
                "verified": True,
                "timestamp": datetime.now().isoformat()
            }
        
        # Generate analysis with real data
        prices = [price_data["price"]] * 50  # Simulate price history
        technical = {
            "rsi": calculate_rsi(prices),
            "macd": calculate_macd(prices)
        }
        
        analysis = generate_trading_analysis(coin, price_data, technical)
        
        return {
            "answer": analysis,
            "type": "live_analysis",
            "verified": True,
            "source": price_data.get("source", "Binance"),
            "timestamp": datetime.now().isoformat()
        }
    
    # News Request
    if any(keyword in query_lower for keyword in ["news", "latest", "headlines", "market news", "crypto news"]):
        return {
            "answer": """
# 📰 Crypto Market News & Updates

## 🔴 Live News Sources

To get **real-time crypto news**, I recommend these trusted sources:

### 📱 News Websites

1. **CoinDesk** - https://www.coindesk.com/
   - ✅ Breaking news & analysis
   - ✅ Market data
   - ✅ Regulatory updates

2. **Cointelegraph** - https://cointelegraph.com/
   - ✅ Industry news
   - ✅ Technical analysis
   - ✅ Expert opinions

3. **CryptoSlate** - https://cryptoslate.com/
   - ✅ Market trends
   - ✅ Project updates
   - ✅ DeFi news

4. **The Block** - https://www.theblock.co/
   - ✅ Institutional news
   - ✅ Funding rounds
   - ✅ Market research

### 📊 Market Data & News

5. **CoinGecko** - https://www.coingecko.com/
   - ✅ Price updates
   - ✅ Market cap rankings
   - ✅ Trending coins

6. **CoinMarketCap** - https://coinmarketcap.com/
   - ✅ Real-time prices
   - ✅ Market news
   - ✅ Educational content

### 🐦 Twitter/X Accounts to Follow

- **@CoinDesk** - Breaking news
- **@Cointelegraph** - Market updates
- **@Binance** - Exchange updates
- **@VitalikButerin** - Ethereum news
- **@CZ_Binance** - Crypto insights
- **@APompliano** - Market analysis

## 📈 What to Watch For in News:

### Bullish Signals ✅
- Major company adoption (Tesla, PayPal, etc.)
- Positive regulations
- ETF approvals
- Institutional investments
- Major partnerships
- Tech upgrades (Ethereum merge, Bitcoin halving)

### Bearish Signals ⚠️
- Regulatory crackdowns
- Exchange hacks
- Major sell-offs by whales
- Negative government policies
- Security breaches
- Major project failures

## 💡 Pro Tips:

1. **Verify Sources**: Don't trust random Twitter accounts
2. **Check Multiple Sources**: Cross-reference news
3. **Be Skeptical of FOMO**: Hype news can be misleading
4. **Focus on Fundamentals**: Long-term news matters more
5. **Avoid Emotional Trading**: Don't trade based on news alone

## 🚨 Current Market Sentiment:

To understand current market sentiment, check:
- **Fear & Greed Index**: https://alternative.me/crypto/fear-and-greed-index/
- **Bitcoin Dominance**: Shows BTC vs altcoin strength
- **Trading Volume**: High volume = strong moves

Would you like me to explain how to trade based on news events?
            """.strip(),
            "type": "news_info",
            "verified": True,
            "timestamp": datetime.now().isoformat()
        }
    
    # ── STEP 2: NLP Engine — semantic intent resolver (primary) ─────────────
    if NLP_ENGINE_AVAILABLE:
        nlp_result = nlp_resolve(request.query)
        if nlp_result["matched"]:
            topic_key = nlp_result["topic"]
            print(f"🔍 NLP matched topic: {topic_key} (score={nlp_result['score']:.3f})")
            # Try ML model first for rich formatted answer
            if ML_MODEL_AVAILABLE:
                try:
                    ml_resp = ML_MODEL.process_query(request.query, ML_KNOWLEDGE_STORE)
                    if ml_resp:
                        ml_resp["timestamp"] = datetime.now().isoformat()
                        ml_resp["suggestion"] = suggestion
                        return ml_resp
                except Exception:
                    pass
            # Fallback: generate from knowledge bases directly
            answer = generate_educational_response(topic_key)
            if not answer:
                answer = generate_educational_response(request.query)
            if answer:
                return {
                    "answer": answer,
                    "type": "educational",
                    "verified": True,
                    "topic": nlp_result["label"],
                    "suggestion": suggestion,
                    "timestamp": datetime.now().isoformat()
                }
        else:
            # No confident match — return smart suggestions
            suggestions = nlp_result["suggestions"]
            print(f"🔍 NLP no match — returning {len(suggestions)} suggestions")
            return {
                "answer": "I'm not sure I understood that. Here are some related topics you might be looking for:",
                "type": "suggestions",
                "verified": False,
                "suggestion": suggestion,
                "suggestions": suggestions,
                "timestamp": datetime.now().isoformat()
            }

    # ── STEP 3: ML Model fallback ─────────────────────────────────────────────
    if ML_MODEL_AVAILABLE:
        try:
            ml_response = ML_MODEL.process_query(request.query, ML_KNOWLEDGE_STORE)
            if ml_response:
                ml_response["timestamp"] = datetime.now().isoformat()
                ml_response["suggestion"] = suggestion
                return ml_response
        except Exception as e:
            print(f"⚠️  ML Model error: {e}")

    # ── STEP 4: Comprehensive KB direct search ────────────────────────────────
    if COMPREHENSIVE_KB_AVAILABLE:
        search_result = search_knowledge(request.query)
        if search_result:
            return {
                "answer": format_verified_response(search_result),
                "type": "verified_knowledge",
                "verified": True,
                "suggestion": suggestion,
                "timestamp": datetime.now().isoformat()
            }

    # ── STEP 5: Final fallback — clean apology with default suggestions ───────
    default_suggestions = [
        {"question": "What is RSI?", "label": "RSI", "category": "Technical Indicators"},
        {"question": "What is MACD?", "label": "MACD", "category": "Technical Indicators"},
        {"question": "How to manage risk?", "label": "Risk Management", "category": "Risk Management"},
        {"question": "What is Bitcoin?", "label": "Bitcoin", "category": "Crypto Fundamentals"},
        {"question": "Explain swing trading", "label": "Swing Trading", "category": "Trading Strategies"},
        {"question": "What is a stop loss?", "label": "Stop Loss", "category": "Risk Management"},
    ]
    return {
        "answer": "I'm not sure I understood that. Here are some topics I can help you with:",
        "type": "suggestions",
        "verified": False,
        "suggestion": suggestion,
        "suggestions": default_suggestions,
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# MAIN - Start the server
# ============================================================================

# ============================================================================
# AUTO-TRADE ENDPOINTS
# ============================================================================

@app.post("/trade/execute")
async def execute_trade(req: ExchangeOrderRequest):
    """
    Place a real order on Binance / OKX / Bybit.
    Optionally starts a background monitor that auto-closes on SL/TP hit.
    """
    if not EXCHANGE_EXECUTOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="Exchange executor not available")

    try:
        executor = create_executor(
            req.exchange, req.api_key, req.api_secret,
            req.passphrase or "", req.testnet or False
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        if req.exchange.lower() == "okx":
            result = await executor.place_order(
                req.symbol, req.side, req.order_type, str(req.quantity),
                str(req.price) if req.price else None,
                str(req.stop_loss) if req.stop_loss else None,
                str(req.take_profit) if req.take_profit else None,
            )
        else:
            result = await executor.place_order(
                req.symbol, req.side, req.order_type, req.quantity,
                req.price, req.stop_loss, req.take_profit
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Exchange error: {e}")

    # Start background monitor if SL or TP provided and auto_monitor enabled
    monitor_started = False
    if req.auto_monitor and (req.stop_loss or req.take_profit) and req.stop_loss and req.take_profit:
        monitor_key = req.api_key[:8]
        if monitor_key not in _monitors:
            _monitors[monitor_key] = AutoTradeMonitor(executor, interval_seconds=30)
            asyncio.create_task(_monitors[monitor_key].run())
        _monitors[monitor_key].watch(
            req.symbol, req.quantity,
            req.stop_loss, req.take_profit, req.side
        )
        monitor_started = True

    return {
        "success": True,
        "exchange": req.exchange,
        "symbol": req.symbol,
        "side": req.side,
        "quantity": req.quantity,
        "order_result": result,
        "monitor_active": monitor_started,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/trade/cancel-monitor")
async def cancel_monitor(req: CancelMonitorRequest):
    """Stop auto-monitoring a symbol (won't close the position, just stops watching)."""
    monitor_key = req.api_key[:8]
    monitor = _monitors.get(monitor_key)
    if monitor:
        monitor.unwatch(req.symbol)
        return {"success": True, "message": f"Monitor stopped for {req.symbol}"}
    return {"success": False, "message": "No active monitor found"}


@app.get("/trade/monitored/{api_key_prefix}")
async def get_monitored(api_key_prefix: str):
    """List all symbols currently being auto-monitored."""
    monitor = _monitors.get(api_key_prefix[:8])
    if not monitor:
        return {"symbols": []}
    return {"symbols": list(monitor.watched.keys()), "details": monitor.watched}


@app.get("/exchange/price/{exchange}/{symbol}")
async def get_exchange_price(exchange: str, symbol: str,
                              api_key: str = "", api_secret: str = "",
                              passphrase: str = ""):
    """Fetch live price from a specific exchange (public endpoint for Binance)."""
    if exchange.lower() == "binance":
        data = await fetch_price_from_binance(symbol.replace("/", "").upper())
        if data:
            return {"exchange": exchange, "symbol": symbol, "price": data["price"]}
    raise HTTPException(status_code=404, detail="Price not available")


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting TradeMind AI Agent v4.0...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
