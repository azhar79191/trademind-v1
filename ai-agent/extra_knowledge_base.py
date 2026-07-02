"""
Extra Knowledge Base - TradeMind AI
=====================================
Covers: Candlestick Patterns, Order Types, Leverage/Margin,
        Staking/Yield, Trading Journal, Backtesting,
        On-Chain Analysis, Model Self-Info, Trading Tools
"""

EXTRA_KNOWLEDGE = {

    # =========================================================================
    # CANDLESTICK PATTERNS
    # =========================================================================
    "candlestick_patterns": {
        "title": "Candlestick Patterns",
        "description": "Visual price patterns formed by one or more candles that signal potential market direction.",
        "reading_basics": {
            "Body": "Distance between open and close price",
            "Wick/Shadow": "High and low extremes beyond the body",
            "Bullish Candle": "Close > Open (usually green/white)",
            "Bearish Candle": "Close < Open (usually red/black)",
        },
        "single_candle_patterns": {
            "Doji": "Open ≈ Close — indecision, potential reversal. Watch for context.",
            "Hammer": "Small body, long lower wick — bullish reversal at bottom of downtrend.",
            "Inverted Hammer": "Small body, long upper wick at bottom — potential bullish reversal.",
            "Shooting Star": "Small body, long upper wick at top — bearish reversal signal.",
            "Hanging Man": "Looks like hammer but at top of uptrend — bearish warning.",
            "Marubozu": "No wicks, full body — strong momentum in candle direction.",
            "Spinning Top": "Small body, equal wicks — indecision, neither bulls nor bears in control.",
            "Pin Bar": "Long wick rejecting a price level — strong reversal signal.",
        },
        "two_candle_patterns": {
            "Bullish Engulfing": "Large green candle fully engulfs previous red candle — strong buy signal.",
            "Bearish Engulfing": "Large red candle fully engulfs previous green candle — strong sell signal.",
            "Tweezer Tops": "Two candles with same high — resistance rejection, bearish.",
            "Tweezer Bottoms": "Two candles with same low — support holding, bullish.",
        },
        "three_candle_patterns": {
            "Morning Star": "Red candle → small doji/candle → green candle — bullish reversal.",
            "Evening Star": "Green candle → small doji/candle → red candle — bearish reversal.",
            "Three White Soldiers": "Three consecutive green candles — strong bullish momentum.",
            "Three Black Crows": "Three consecutive red candles — strong bearish momentum.",
        },
        "pro_tips": [
            "Always confirm patterns with volume — high volume = stronger signal",
            "Higher timeframes (4H, Daily) give more reliable signals",
            "Never trade a pattern in isolation — use support/resistance context",
            "Doji at key levels is more powerful than doji in the middle of nowhere",
        ],
    },

    # =========================================================================
    # ORDER TYPES
    # =========================================================================
    "order_types": {
        "title": "Trading Order Types",
        "description": "Different ways to enter and exit trades on exchanges.",
        "basic_orders": {
            "Market Order": "Executes immediately at current market price. Guarantees fill, not price. Best for urgent entries.",
            "Limit Order": "Executes only at your specified price or better. Guarantees price, not fill. Saves on fees (maker).",
            "Stop Order (Stop Market)": "Triggers a market order when price hits your stop level. Used for stop losses.",
            "Stop Limit Order": "Triggers a limit order when stop is hit. More control but may not fill in fast markets.",
        },
        "advanced_orders": {
            "OCO (One Cancels Other)": "Two orders placed simultaneously — when one fills, the other cancels. Perfect for setting TP and SL together.",
            "Trailing Stop": "Stop loss that moves with price. Locks in profits while allowing upside. Set as % or fixed amount.",
            "Take Profit Order": "Closes position automatically when target price is reached.",
            "Post Only Order": "Ensures your order is always a maker (limit) order — never a taker. Saves fees.",
            "Fill or Kill (FOK)": "Must fill entire order immediately or cancel. Used for large orders.",
            "Immediate or Cancel (IOC)": "Fill as much as possible immediately, cancel the rest.",
            "TWAP": "Time-Weighted Average Price — splits large order over time to minimize market impact.",
        },
        "best_practices": [
            "Use limit orders instead of market orders to save 0.1-0.2% in fees",
            "Always set OCO (TP + SL) immediately after entering a trade",
            "Use trailing stops to protect profits in strong trends",
            "Avoid market orders during high volatility — slippage can be severe",
            "Stop limit orders may not fill during flash crashes — use stop market for critical stops",
        ],
    },

    # =========================================================================
    # LEVERAGE & MARGIN
    # =========================================================================
    "leverage_margin": {
        "title": "Leverage & Margin Trading",
        "description": "Borrowing capital to increase position size beyond your account balance.",
        "key_concepts": {
            "Leverage": "Multiplier on your position. 10x leverage = $1,000 controls $10,000.",
            "Margin": "Collateral required to open a leveraged position.",
            "Initial Margin": "Minimum deposit to open position (e.g., 10% for 10x leverage).",
            "Maintenance Margin": "Minimum equity to keep position open (typically 0.5-1%).",
            "Margin Call": "Warning that your equity is near maintenance margin — add funds or reduce position.",
            "Liquidation": "Exchange forcibly closes your position when equity hits maintenance margin.",
            "Funding Rate": "Periodic payment between longs and shorts in perpetual futures. Positive = longs pay shorts.",
        },
        "margin_types": {
            "Cross Margin": "All account balance used as collateral. Lower liquidation risk but losses affect entire account.",
            "Isolated Margin": "Only allocated margin used as collateral. Limits loss to that position only. Recommended for beginners.",
        },
        "leverage_guide": {
            "Beginners": "1x (spot only) — learn without liquidation risk",
            "Intermediate": "2-3x — small amplification with manageable risk",
            "Advanced": "5x max — only with strict stop losses and small position sizes",
            "Never": "10x+ — 95% of retail traders get liquidated at high leverage",
        },
        "perpetual_futures": {
            "definition": "Futures contracts with no expiry date",
            "funding": "Paid every 8 hours — positive rate means longs pay shorts",
            "mark_price": "Used for liquidation calculation (not last traded price)",
            "advantage": "Can hold indefinitely, high liquidity",
            "risk": "Funding costs accumulate over time",
        },
        "warnings": [
            "⚠️ 10x leverage means 10% move against you = 100% loss",
            "⚠️ Most retail traders lose money using leverage",
            "⚠️ Never use leverage without a stop loss",
            "⚠️ Start with spot trading until consistently profitable",
        ],
    },

    # =========================================================================
    # STAKING & YIELD
    # =========================================================================
    "staking_yield": {
        "title": "Staking & Yield Generation",
        "description": "Earning passive income from cryptocurrency holdings.",
        "staking": {
            "definition": "Locking crypto to support a Proof-of-Stake blockchain and earn rewards",
            "how_it_works": "Validators stake coins as collateral to validate transactions and earn block rewards",
            "apy_range": "Typically 3-20% APY depending on the network",
            "popular_coins": {
                "ETH": "3-5% APY (Ethereum staking)",
                "SOL": "5-7% APY (Solana staking)",
                "ADA": "3-5% APY (Cardano staking)",
                "DOT": "10-14% APY (Polkadot staking)",
                "AVAX": "7-10% APY (Avalanche staking)",
            },
            "liquid_staking": "Stake and receive a liquid token (e.g., stETH for ETH) that can still be used in DeFi",
            "risks": ["Slashing (penalty for validator misbehavior)", "Lock-up periods", "Price volatility of staked asset"],
        },
        "yield_farming": {
            "definition": "Providing liquidity to DeFi protocols in exchange for rewards",
            "how_it_works": "Deposit tokens into liquidity pools, earn trading fees + protocol tokens",
            "apy_range": "5-100%+ APY (higher = higher risk)",
            "impermanent_loss": "Loss from price divergence of paired tokens in liquidity pool. Major risk.",
            "popular_platforms": ["Uniswap", "Aave", "Compound", "Curve Finance", "PancakeSwap"],
        },
        "comparison": {
            "Staking": "Lower risk, stable APY, supports network security",
            "Yield Farming": "Higher potential returns, higher risk (smart contract + impermanent loss)",
            "Lending": "Lend crypto on Aave/Compound, earn interest (5-15% APY)",
            "Savings Accounts": "CeFi platforms (Nexo, BlockFi) — simpler but custodial risk",
        },
        "tips": [
            "Always research the protocol before staking — check audits",
            "Diversify across multiple platforms to reduce risk",
            "Factor in gas fees — small amounts may not be worth it",
            "Liquid staking (Lido, Rocket Pool) gives flexibility without lock-up",
        ],
    },

    # =========================================================================
    # TRADING JOURNAL
    # =========================================================================
    "trading_journal": {
        "title": "Trading Journal",
        "description": "A systematic record of all trades used to analyze performance and improve strategy.",
        "why_journal": [
            "Identifies patterns in your wins and losses",
            "Reveals emotional trading mistakes",
            "Tracks strategy performance over time",
            "Builds discipline and accountability",
            "Required for serious traders and tax purposes",
        ],
        "what_to_record": {
            "Entry Details": "Date, time, asset, direction (long/short), entry price, position size",
            "Exit Details": "Exit price, exit reason (TP hit / SL hit / manual), P&L",
            "Setup": "Strategy used, timeframe, indicators, chart pattern",
            "Psychology": "Emotional state before/during/after trade (1-10 scale)",
            "Notes": "What went right, what went wrong, lessons learned",
        },
        "template": """
| Date | Asset | Direction | Entry | Exit | Size | P&L | Strategy | Emotion | Notes |
|------|-------|-----------|-------|------|------|-----|----------|---------|-------|
| 2024-01-15 | BTC | Long | $100k | $103k | 0.1 | +$300 | Breakout | 7/10 | Followed plan |
        """,
        "weekly_review": [
            "Total trades, win rate, average R:R",
            "Best and worst trades — what was different?",
            "Emotional patterns — did fear/greed affect decisions?",
            "Strategy performance — which setups worked best?",
            "Adjustments for next week",
        ],
        "tools": [
            "Tradervue — professional trade journal",
            "Edgewonk — analytics-focused journal",
            "TraderSync — automated import from brokers",
            "Excel/Google Sheets — free, fully customizable",
            "Notion — flexible, good for notes + data",
        ],
        "tax_note": "Most countries require reporting crypto gains. Journal provides accurate cost basis and P&L records.",
    },

    # =========================================================================
    # BACKTESTING
    # =========================================================================
    "backtesting": {
        "title": "Backtesting & Strategy Validation",
        "description": "Testing a trading strategy on historical data to evaluate its performance before risking real money.",
        "why_backtest": [
            "Validates strategy has a statistical edge",
            "Reveals weaknesses before real money is at risk",
            "Builds confidence in your system",
            "Helps optimize parameters (e.g., RSI period, stop distance)",
        ],
        "backtesting_process": {
            "Step 1": "Define strategy rules precisely (entry, exit, position size)",
            "Step 2": "Choose historical data (minimum 2-3 years, multiple market conditions)",
            "Step 3": "Run backtest — manually or with software",
            "Step 4": "Analyze results (win rate, R:R, drawdown, Sharpe ratio)",
            "Step 5": "Optimize carefully — avoid overfitting",
            "Step 6": "Forward test on paper trading before going live",
        },
        "key_metrics": {
            "Win Rate": "% of trades that are profitable (aim for 40%+ with good R:R)",
            "Profit Factor": "Gross profit / Gross loss (aim for 1.5+)",
            "Max Drawdown": "Largest peak-to-valley loss (keep under 20%)",
            "Sharpe Ratio": "Return per unit of risk (aim for 1.0+)",
            "Expectancy": "(Win Rate × Avg Win) - (Loss Rate × Avg Loss) — must be positive",
            "Total Trades": "Need 100+ trades for statistical significance",
        },
        "paper_trading": {
            "definition": "Trading with simulated money in real market conditions",
            "purpose": "Bridge between backtesting and live trading",
            "duration": "Trade paper for 1-3 months before going live",
            "platforms": ["TradingView Paper Trading", "Binance Testnet", "eToro Virtual Portfolio"],
        },
        "common_mistakes": [
            "Overfitting — strategy works perfectly on past data but fails live",
            "Survivorship bias — only testing on assets that survived",
            "Ignoring fees and slippage in calculations",
            "Testing on too little data (less than 100 trades)",
            "Not testing across different market conditions (bull, bear, sideways)",
        ],
        "tools": [
            "TradingView Pine Script — built-in backtesting",
            "Python (backtrader, vectorbt) — flexible, powerful",
            "3Commas — bot backtesting",
            "Cryptohopper — automated strategy backtesting",
        ],
    },

    # =========================================================================
    # ON-CHAIN ANALYSIS
    # =========================================================================
    "on_chain_analysis": {
        "title": "On-Chain Analysis",
        "description": "Analyzing blockchain data directly to understand market behavior, investor sentiment, and network health.",
        "why_on_chain": [
            "Blockchain is transparent — all transactions are public",
            "Reveals what large holders (whales) are actually doing",
            "Provides leading indicators not visible in price charts",
            "Helps identify accumulation and distribution phases",
        ],
        "key_metrics": {
            "NVT Ratio": "Network Value to Transactions — like P/E ratio for crypto. High NVT = overvalued.",
            "MVRV Ratio": "Market Value to Realized Value. MVRV > 3.5 = historically overvalued. MVRV < 1 = undervalued.",
            "SOPR": "Spent Output Profit Ratio. > 1 = holders selling at profit. < 1 = selling at loss (capitulation).",
            "Realized Cap": "Total value of all coins at price they last moved. More stable than market cap.",
            "Exchange Inflow": "Crypto moving TO exchanges = potential selling pressure.",
            "Exchange Outflow": "Crypto moving FROM exchanges = accumulation (self-custody).",
            "Active Addresses": "Number of unique addresses active daily — measures network usage.",
            "Hash Rate": "Bitcoin mining power — high hash rate = network security and miner confidence.",
            "Long/Short Ratio": "Ratio of leveraged longs vs shorts — extreme readings signal potential reversals.",
            "Funding Rate": "Positive = longs paying shorts (bullish sentiment). Negative = shorts paying longs (bearish).",
        },
        "whale_watching": {
            "definition": "Tracking large wallet movements to anticipate market moves",
            "signals": {
                "Whale buying": "Large wallets accumulating = bullish signal",
                "Exchange deposits": "Whales sending to exchange = potential sell",
                "Exchange withdrawals": "Whales removing from exchange = holding/accumulating",
            },
            "tools": ["Whale Alert (Twitter/Telegram)", "Glassnode", "CryptoQuant", "Nansen"],
        },
        "tools": [
            "Glassnode — comprehensive on-chain metrics",
            "CryptoQuant — exchange flows and miner data",
            "Nansen — wallet labeling and smart money tracking",
            "Dune Analytics — custom on-chain queries",
            "IntoTheBlock — on-chain signals for traders",
        ],
        "fundamental_analysis": {
            "definition": "Evaluating crypto based on technology, team, tokenomics, and adoption",
            "factors": [
                "Team and development activity (GitHub commits)",
                "Tokenomics (supply, inflation, vesting schedules)",
                "Partnerships and real-world adoption",
                "Network effects and user growth",
                "Competitive landscape",
            ],
        },
    },

    # =========================================================================
    # MODEL SELF-INFO
    # =========================================================================
    "model_info": {
        "title": "About TradeMind AI",
        "description": "I'm TradeMind AI — an intelligent trading assistant built to help you navigate crypto and financial markets with confidence.",
        "what_i_am": [
            "🤖 An AI trading assistant trained on comprehensive trading knowledge",
            "📊 Powered by NLP + ML (TF-IDF + Logistic Regression) for intent understanding",
            "📚 Built on a verified knowledge base — I don't hallucinate or make up data",
            "⚡ Fast, accurate, and always improving",
        ],
        "what_i_can_do": {
            "Technical Analysis": "RSI, MACD, Bollinger Bands, Fibonacci, EMA, ATR, Stochastic, Volume — all explained with how-to-use guides",
            "Chart Patterns": "Head & Shoulders, Double Top/Bottom, Triangles, Wedges, Flags, Candlestick patterns",
            "Trading Strategies": "Scalping, Swing Trading, Breakout, Trend Following, Mean Reversion, DCA, Grid Trading, Market Making",
            "Risk Management": "Position sizing, Stop loss strategies, Drawdown management, Risk/Reward ratios, Kelly Criterion",
            "Trading Psychology": "FOMO, Revenge trading, Fear & Greed, Discipline, Mindset coaching",
            "Crypto Fundamentals": "Bitcoin, Ethereum, Blockchain, DeFi, NFTs, Altcoins, Mining, Wallets, Staking",
            "Market Analysis": "Support/Resistance, Market Structure, Market Cycles, On-Chain Analysis, Volume Analysis",
            "Professional Strategies": "Statistical Arbitrage, Momentum Trading, Automated Trading, Business Models",
            "Education": "Backtesting, Trading Journal, Order Types, Leverage/Margin, Candlestick Patterns",
            "Live Data": "Real-time price analysis when connected to Binance API",
        },
        "what_i_cannot_do": [
            "❌ Predict exact future prices — no one can",
            "❌ Guarantee profits — trading always involves risk",
            "❌ Execute trades on your behalf",
            "❌ Provide personalized financial advice",
            "❌ Access real-time news (I recommend trusted sources instead)",
        ],
        "tech_stack": {
            "Backend": "FastAPI (Python) — fast async API",
            "NLP Engine": "Custom semantic matching with Jaccard + Overlap scoring",
            "ML Model": "TF-IDF vectorizer + Logistic Regression classifier",
            "Knowledge Base": "5 curated knowledge modules covering 100+ trading topics",
            "Data": "Real-time prices from Binance API + CoinGecko fallback",
        },
        "disclaimer": "⚠️ TradeMind AI is for educational purposes only. Always do your own research (DYOR) and never invest more than you can afford to lose.",
    },

    # =========================================================================
    # TRADING TOOLS (already in main.py but also here for ML model access)
    # =========================================================================
    "trading_tools": {
        "title": "Essential Trading Tools",
        "description": "The best tools professional traders use for analysis, execution, and portfolio management.",
        "charting": {
            "TradingView": "https://tradingview.com — Best charting platform. 100+ indicators, Pine Script, multi-timeframe. Free tier available.",
            "Coinigy": "https://coinigy.com — Multi-exchange charting + portfolio tracking.",
        },
        "market_data": {
            "CoinGecko": "https://coingecko.com — Prices, market caps, on-chain metrics, DeFi tracking.",
            "CoinMarketCap": "https://coinmarketcap.com — Real-time prices, trending coins, portfolio tracker.",
            "TradingView Screener": "https://tradingview.com/crypto-screener — Filter coins by RSI, MACD, volume, % change.",
        },
        "sentiment": {
            "Fear & Greed Index": "https://alternative.me/crypto/fear-and-greed-index — Daily sentiment score 0-100.",
            "LunarCrush": "https://lunarcrush.com — Social media sentiment + influencer tracking.",
        },
        "on_chain": {
            "Glassnode": "https://glassnode.com — Comprehensive on-chain metrics.",
            "CryptoQuant": "https://cryptoquant.com — Exchange flows, miner data.",
            "Nansen": "https://nansen.ai — Smart money wallet tracking.",
        },
        "bots_automation": {
            "3Commas": "https://3commas.io — DCA bots, grid bots, smart terminal.",
            "Pionex": "https://pionex.com — 16 free built-in trading bots.",
            "Cryptohopper": "https://cryptohopper.com — Strategy backtesting + automation.",
        },
        "portfolio": {
            "CoinTracking": "https://cointracking.info — Tax reporting + P&L tracking.",
            "Delta App": "https://delta.app — Mobile portfolio tracker with real-time P&L.",
        },
        "pro_tip": "Start with TradingView (charts) + CoinGecko (data) + Fear & Greed Index (sentiment). That covers 80% of what most traders need.",
    },
}
