"""
Enhanced Knowledge Base for TradeMind AI
==========================================
Comprehensive trading knowledge, patterns, strategies, and real-world scenarios
"""

# ============================================================================
# TRADING PSYCHOLOGY & MINDSET
# ============================================================================
TRADING_PSYCHOLOGY = {
    "fear_and_greed": {
        "title": "Fear and Greed in Trading",
        "description": "The two dominant emotions that drive market movements and trader decisions.",
        "concepts": {
            "Fear": "Causes panic selling, missing opportunities, and cutting winners too early",
            "Greed": "Causes overtrading, ignoring stop losses, and holding losers too long",
            "Solution": "Use a trading plan, set rules before entering, and stick to them emotionally-free"
        },
        "fear_greed_index": "A metric (0-100) showing whether market is fearful or greedy. Use it as contrarian indicator.",
        "tips": [
            "When everyone is greedy (80-100), consider taking profits",
            "When everyone is fearful (0-20), look for buying opportunities",
            "Never trade when emotionally compromised",
            "Take breaks after losing streaks"
        ]
    },
    "fomo": {
        "title": "FOMO - Fear of Missing Out",
        "description": "The anxiety of missing profitable trades that others are making",
        "symptoms": [
            "Jumping into trades without analysis",
            "Chasing pumps and rallies",
            "Ignoring your trading plan",
            "Overtrading to 'catch up'"
        ],
        "solutions": [
            "Remember: there's ALWAYS another trade",
            "Stick to your strategy",
            "Journal missed opportunities vs bad entries",
            "Focus on process, not profits"
        ]
    },
    "revenge_trading": {
        "title": "Revenge Trading",
        "description": "Trading to 'get back' money lost in previous trades",
        "warning": "This is the FASTEST way to blow up your account!",
        "signs": [
            "Increasing position size after losses",
            "Taking trades outside your strategy",
            "Emotional decision making",
            "Not following stop losses"
        ],
        "prevention": [
            "Take a break after 2 consecutive losses",
            "Set daily loss limits (e.g., 5% max)",
            "Review trades when calm, not angry",
            "Remember: losses are part of trading"
        ]
    },
    "discipline": {
        "title": "Trading Discipline",
        "principles": [
            "Follow your trading plan EVERY time",
            "Never move stop losses away from entry",
            "Take profits at predetermined levels",
            "Don't trade when tired, angry, or distracted",
            "Journal EVERY trade with reasoning",
            "Review performance weekly, not daily"
        ]
    }
}

# ============================================================================
# ADVANCED CHART PATTERNS
# ============================================================================
CHART_PATTERNS = {
    "head_and_shoulders": {
        "title": "Head and Shoulders",
        "type": "Reversal Pattern (Bearish)",
        "description": "A peak (head) between two lower peaks (shoulders), indicating trend reversal from bullish to bearish",
        "components": [
            "Left Shoulder: First peak",
            "Head: Higher peak in the middle",
            "Right Shoulder: Lower peak, similar to left shoulder",
            "Neckline: Support line connecting the lows"
        ],
        "how_to_trade": {
            "Entry": "When price breaks below neckline with volume",
            "Stop Loss": "Above the right shoulder",
            "Target": "Distance from head to neckline, projected downward from breakout"
        },
        "example": "BTC forms head at $110k, shoulders at $105k. Neckline at $100k. Break below $100k = sell signal with target at $90k"
    },
    "inverse_head_shoulders": {
        "title": "Inverse Head and Shoulders",
        "type": "Reversal Pattern (Bullish)",
        "description": "Opposite of head and shoulders - signals bullish reversal",
        "how_to_trade": {
            "Entry": "When price breaks above neckline",
            "Stop Loss": "Below right shoulder",
            "Target": "Distance from head to neckline, projected upward"
        }
    },
    "double_top": {
        "title": "Double Top",
        "type": "Reversal Pattern (Bearish)",
        "description": "Two peaks at similar price level, showing resistance and potential reversal",
        "characteristics": [
            "Two peaks at approximately same price",
            "Valley (support) between the peaks",
            "Break below support confirms pattern"
        ],
        "reliability": "High - especially on higher timeframes (4H, Daily)",
        "false_signals": "Watch for third peak attempt - invalidates pattern"
    },
    "double_bottom": {
        "title": "Double Bottom",
        "type": "Reversal Pattern (Bullish)",
        "description": "Two troughs at similar price level, showing support and potential bullish reversal",
        "how_to_trade": {
            "Entry": "Break above resistance (peak between bottoms)",
            "Stop Loss": "Below second bottom",
            "Target": "Distance from bottom to resistance, projected upward"
        }
    },
    "cup_and_handle": {
        "title": "Cup and Handle",
        "type": "Continuation Pattern (Bullish)",
        "description": "A rounded bottom (cup) followed by slight pullback (handle), indicating bullish continuation",
        "duration": "Usually forms over weeks to months",
        "components": [
            "Cup: U-shaped or rounded bottom",
            "Handle: Small consolidation/pullback",
            "Breakout: Above handle resistance"
        ],
        "target": "Depth of cup added to breakout point",
        "volume": "Should decrease in handle, increase on breakout"
    },
    "triangle_ascending": {
        "title": "Ascending Triangle",
        "type": "Continuation Pattern (Bullish)",
        "description": "Flat top resistance with rising support, showing accumulation",
        "how_to_trade": {
            "Entry": "Break above flat resistance",
            "Stop Loss": "Below last higher low",
            "Target": "Height of triangle projected upward"
        }
    },
    "triangle_descending": {
        "title": "Descending Triangle",
        "type": "Continuation Pattern (Bearish)",
        "description": "Flat bottom support with falling resistance, showing distribution",
        "how_to_trade": {
            "Entry": "Break below flat support",
            "Stop Loss": "Above last lower high",
            "Target": "Height of triangle projected downward"
        }
    },
    "wedge_rising": {
        "title": "Rising Wedge",
        "type": "Reversal Pattern (Bearish)",
        "description": "Both support and resistance rising, but narrowing - typically bearish",
        "counter_intuitive": "Yes! Rising wedge is bearish despite upward movement",
        "signal": "Break below support line"
    },
    "wedge_falling": {
        "title": "Falling Wedge",
        "type": "Reversal Pattern (Bullish)",
        "description": "Both support and resistance falling, but narrowing - typically bullish",
        "signal": "Break above resistance line"
    },
    "flag": {
        "title": "Flag Pattern",
        "type": "Continuation Pattern",
        "description": "Sharp move (flagpole) followed by consolidation (flag), then continuation",
        "bullish_flag": "Flagpole up, flag slopes slightly down, breakout up",
        "bearish_flag": "Flagpole down, flag slopes slightly up, breakout down",
        "duration": "Usually 1-4 weeks",
        "target": "Length of flagpole projected from breakout"
    }
}

# ============================================================================
# ADVANCED TRADING STRATEGIES
# ============================================================================
TRADING_STRATEGIES = {
    "breakout_trading": {
        "title": "Breakout Trading Strategy",
        "description": "Trading when price breaks through support/resistance levels",
        "types": {
            "Range Breakout": "Break out of consolidation range",
            "Trendline Breakout": "Break of ascending/descending trendline",
            "Pattern Breakout": "Break from triangles, wedges, etc."
        },
        "rules": [
            "Wait for confirmed break (close beyond level)",
            "Volume should increase on breakout",
            "Retest of broken level is common (entry opportunity)",
            "Set stop loss below/above breakout level"
        ],
        "false_breakouts": [
            "Low volume breakouts often fail",
            "Use 1-2% beyond level as confirmation",
            "Watch for quick return inside range (trap)"
        ],
        "example": "BTC consolidates at $100k-$105k for 2 weeks. Breaks above $105k with volume. Enter at $105.5k, stop at $104k, target $110k (range height added)"
    },
    "trend_following": {
        "title": "Trend Following Strategy",
        "description": "Trading in direction of established trend",
        "rules": [
            "Identify trend: Higher highs + higher lows = Uptrend",
            "Enter on pullbacks to support (in uptrend)",
            "Use moving averages as dynamic support",
            "Never fight the trend"
        ],
        "timeframes": {
            "Daily": "Major trend direction",
            "4H": "Entry timing",
            "1H": "Fine-tune entry"
        },
        "indicators": [
            "EMA 20/50/200 for trend direction",
            "MACD for momentum confirmation",
            "RSI for overbought/oversold in trend"
        ]
    },
    "mean_reversion": {
        "title": "Mean Reversion Strategy",
        "description": "Trading the expectation that price returns to average",
        "best_for": "Range-bound markets, not trending markets",
        "rules": [
            "Identify the mean (MA 50 or 200)",
            "Buy when price is significantly below mean",
            "Sell when price is significantly above mean",
            "Use Bollinger Bands for extremes"
        ],
        "indicators": [
            "RSI below 30 = oversold (buy)",
            "RSI above 70 = overbought (sell)",
            "Price at lower Bollinger Band (buy)",
            "Price at upper Bollinger Band (sell)"
        ],
        "warning": "Does NOT work in strong trends! Price can stay extended for long periods."
    },
    "pullback_strategy": {
        "title": "Pullback/Retracement Strategy",
        "description": "Buying dips in uptrend or selling rallies in downtrend",
        "fibonacci_levels": [
            "23.6% - Shallow pullback",
            "38.2% - Normal pullback",
            "50% - Psychological level",
            "61.8% - Deep pullback (last chance)"
        ],
        "rules": [
            "Confirm trend on higher timeframe",
            "Wait for pullback to support/Fib level",
            "Look for reversal candlestick pattern",
            "Enter with tight stop below support"
        ],
        "example": "BTC uptrend from $100k to $110k. Pulls back to $106.2k (38.2% Fib). Bullish engulfing candle forms. Enter long at $106.5k."
    },
    "scalping": {
        "title": "Scalping Strategy",
        "description": "Very short-term trades (seconds to minutes) for small profits",
        "characteristics": [
            "Many trades per day (10-100+)",
            "Small profit targets (0.1% - 0.5%)",
            "Tight stop losses",
            "High win rate required (60%+)"
        ],
        "best_markets": "High liquidity, low spreads (BTC, ETH)",
        "requirements": [
            "Fast execution",
            "Low trading fees",
            "Strong mental discipline",
            "Significant time commitment"
        ],
        "not_for_beginners": "High stress, requires experience"
    },
    "swing_trading": {
        "title": "Swing Trading Strategy",
        "description": "Holding positions for days to weeks to capture 'swings'",
        "advantages": [
            "Less time intensive than day trading",
            "Lower transaction costs",
            "Can capture bigger moves",
            "Less stressful"
        ],
        "typical_timeframes": "4H and Daily charts",
        "profit_targets": "3% - 10% per trade",
        "holding_period": "2 days to 2 weeks"
    }
}

# ============================================================================
# MARKET CONDITIONS & ENVIRONMENTS
# ============================================================================
MARKET_CONDITIONS = {
    "bull_market": {
        "title": "Bull Market",
        "description": "Prolonged period of rising prices and positive sentiment",
        "characteristics": [
            "Higher highs and higher lows",
            "Increasing volume on up moves",
            "Positive news dominates",
            "Dips bought quickly",
            "Fear of Missing Out (FOMO) common"
        ],
        "strategies": [
            "Buy the dip",
            "Trend following",
            "Hold winners longer",
            "Avoid shorting"
        ],
        "risks": "Complacency, overconfidence, ignoring risk management"
    },
    "bear_market": {
        "title": "Bear Market",
        "description": "Prolonged period of falling prices and negative sentiment",
        "characteristics": [
            "Lower highs and lower lows",
            "Increasing volume on down moves",
            "Negative news dominates",
            "Rallies sold quickly",
            "Fear and panic common"
        ],
        "strategies": [
            "Sell the rip",
            "Short selling",
            "Cash is a position",
            "Wait for clear bottoming signals"
        ],
        "duration": "Typically shorter but more severe than bull markets"
    },
    "sideways_choppy": {
        "title": "Sideways/Choppy Market",
        "description": "No clear trend, price moves within range",
        "characteristics": [
            "Price bounces between support and resistance",
            "Lower volume",
            "Mixed news flow",
            "False breakouts common"
        ],
        "strategies": [
            "Range trading (buy support, sell resistance)",
            "Mean reversion",
            "Reduce position size",
            "Wait for breakout"
        ],
        "difficulty": "Hardest for trend followers, easier for range traders"
    },
    "high_volatility": {
        "title": "High Volatility Environment",
        "description": "Large price swings in short time periods",
        "causes": [
            "Major news events",
            "Regulatory announcements",
            "Large liquidations",
            "Market uncertainty"
        ],
        "adjustments": [
            "Widen stop losses",
            "Reduce position size",
            "Use lower leverage",
            "Be patient for entries"
        ]
    }
}

# ============================================================================
# PORTFOLIO & RISK MANAGEMENT
# ============================================================================
PORTFOLIO_MANAGEMENT = {
    "diversification": {
        "title": "Portfolio Diversification",
        "description": "Spreading risk across different assets",
        "crypto_allocation": {
            "Conservative": "70% BTC, 20% ETH, 10% Large-caps",
            "Moderate": "50% BTC, 30% ETH, 20% Large-caps",
            "Aggressive": "30% BTC, 30% ETH, 40% Mid/Small-caps"
        },
        "rules": [
            "Don't put all eggs in one basket",
            "Diversify across sectors (L1, L2, DeFi, Gaming)",
            "Rebalance periodically",
            "Consider correlation (don't buy 10 similar coins)"
        ],
        "over_diversification": "Too many positions = hard to manage, lower returns"
    },
    "position_sizing": {
        "title": "Position Sizing",
        "description": "Determining how much capital to risk per trade",
        "fixed_percentage": "Risk 1-2% of total capital per trade",
        "formula": "Position Size = (Account Size × Risk %) / (Entry Price - Stop Loss Price)",
        "example": "$10,000 account, 2% risk = $200 risk\nEntry $100, Stop $95 = $5 risk per unit\nPosition Size = $200 / $5 = 40 units",
        "rules": [
            "Never risk more than 2% per trade",
            "Adjust for volatility (more volatile = smaller size)",
            "Consider total portfolio exposure",
            "Scale out of winners"
        ]
    },
    "kelly_criterion": {
        "title": "Kelly Criterion",
        "description": "Mathematical formula for optimal position sizing",
        "formula": "f = (bp - q) / b",
        "where": {
            "f": "Fraction of capital to bet",
            "b": "Odds received (reward/risk ratio)",
            "p": "Probability of winning",
            "q": "Probability of losing (1-p)"
        },
        "example": "60% win rate, 2:1 reward/risk\nf = (2×0.6 - 0.4) / 2 = 0.4 or 40%",
        "caution": "Use Half-Kelly or Quarter-Kelly to be conservative"
    },
    "risk_reward_ratio": {
        "title": "Risk-Reward Ratio",
        "description": "Comparing potential profit to potential loss",
        "minimum": "Always aim for at least 1:1.5",
        "ideal": "1:2 or better",
        "calculation": "(Take Profit - Entry) / (Entry - Stop Loss)",
        "example": "Buy BTC at $100k, Stop at $98k, Target $106k\nRisk = $2k, Reward = $6k, R:R = 1:3 ✓",
        "breakeven_winrate": {
            "1:1": "Need 50% win rate",
            "1:2": "Need 33% win rate",
            "1:3": "Need 25% win rate"
        }
    }
}

# ============================================================================
# TRADING GLOSSARY - COMMON TERMS
# ============================================================================
GLOSSARY = {
    "slippage": "Difference between expected price and execution price. Higher in low liquidity or volatile markets.",
    "spread": "Difference between bid (buy) and ask (sell) price. Lower spread = better for trading.",
    "liquidity": "How easily asset can be bought/sold without affecting price. BTC/ETH = high liquidity.",
    "order_book": "List of all buy and sell orders at different price levels. Shows supply/demand.",
    "market_order": "Order to buy/sell immediately at current market price. Guarantees execution but not price.",
    "limit_order": "Order to buy/sell at specific price or better. Guarantees price but not execution.",
    "stop_loss_order": "Order that triggers when price reaches stop level. Protects against large losses.",
    "trailing_stop": "Stop loss that moves with price. Locks in profits while allowing upside.",
    "pump_and_dump": "Manipulation scheme where price is artificially inflated then dumped. AVOID!",
    "whale": "Large holder who can move markets with big orders. Watch for whale activity.",
    "bag_holder": "Someone holding losing position hoping for recovery. Don't become one!",
    "ath": "All-Time High - highest price ever reached",
    "atl": "All-Time Low - lowest price ever reached",
    "bullish": "Expecting prices to rise",
    "bearish": "Expecting prices to fall",
    "hodl": "Hold On for Dear Life - buy and hold long-term strategy",
    "fud": "Fear, Uncertainty, Doubt - negative news/rumors to drive price down",
    "fomo": "Fear Of Missing Out - anxiety about missing profits",
    "dca": "Dollar Cost Averaging - buying fixed amount regularly regardless of price",
    "dyor": "Do Your Own Research - never blindly follow others",
    "nfa": "Not Financial Advice - disclaimer in trading discussions"
}

# ============================================================================
# REAL-WORLD TRADING SCENARIOS
# ============================================================================
TRADING_SCENARIOS = {
    "scenario_1": {
        "title": "The False Breakout Trap",
        "situation": "BTC breaks above $110k resistance with weak volume. You enter long. Price immediately reverses below $110k.",
        "mistake": "Entered breakout without volume confirmation",
        "lesson": "Always check volume on breakouts. Low volume breakouts often fail.",
        "prevention": "Wait for confirmed close above level + volume spike"
    },
    "scenario_2": {
        "title": "The Stop Loss Hunt",
        "situation": "You set stop at $99k. Price wicks down to $98.9k, hits your stop, then rallies to $105k.",
        "mistake": "Stop loss too tight, placed at obvious level",
        "lesson": "Market makers hunt obvious stop levels. Give your trades room to breathe.",
        "prevention": "Use wider stops, place below support + buffer, or use mental stops"
    },
    "scenario_3": {
        "title": "The Revenge Trade",
        "situation": "Lost $500 on BTC short. Immediately enter larger long position without analysis. Lose another $1000.",
        "mistake": "Emotional trading, revenge trading, increased risk after loss",
        "lesson": "Never trade angry. Losses are part of the game. Revenge trading = account killer.",
        "prevention": "Take break after 2 losses. Review trades when calm. Stick to risk rules."
    },
    "scenario_4": {
        "title": "The Moving Stop Loss",
        "situation": "Entry $100k, stop $98k. Price drops to $98.5k. You move stop to $97k 'to give it more room'. Price hits $97k.",
        "mistake": "Moving stop loss away from entry = breaking your plan",
        "lesson": "Stop loss is there for a reason. Moving it = acknowledging you were wrong but refusing to accept it.",
        "prevention": "Set stop and NEVER move it away. Only move it toward profit (trailing stop)."
    },
    "scenario_5": {
        "title": "The Overleverage Disaster",
        "situation": "Using 10x leverage on $10k account. 10% move against you = liquidation. Account blown.",
        "mistake": "Too much leverage, poor risk management",
        "lesson": "Leverage amplifies BOTH gains and losses. Most retail traders blow accounts with high leverage.",
        "prevention": "Use 2-3x max leverage. Better yet, trade spot until consistently profitable."
    }
}

# ============================================================================
# NEWS & FUNDAMENTAL ANALYSIS
# ============================================================================
NEWS_IMPACT = {
    "high_impact": {
        "events": [
            "Interest rate decisions (Fed)",
            "Inflation data (CPI, PPI)",
            "Regulatory announcements",
            "Major exchange hacks",
            "ETF approvals/rejections",
            "Country bans/adoptions"
        ],
        "behavior": "Can cause 5-15% swings in minutes. Volatility spikes.",
        "strategy": "Close positions before major news or trade the reaction after dust settles"
    },
    "medium_impact": {
        "events": [
            "Earnings from crypto companies",
            "Large institutional purchases",
            "Protocol upgrades",
            "Partnerships",
            "Trading volume reports"
        ],
        "behavior": "2-5% moves typical",
        "strategy": "Can be traded if you have quick reflexes and understand context"
    },
    "low_impact": {
        "events": [
            "General market commentary",
            "Small partnerships",
            "Community updates"
        ],
        "behavior": "Minimal price impact",
        "strategy": "Safe to ignore for trading decisions"
    }
}

# Function to get knowledge by topic
def get_knowledge(topic: str) -> dict:
    """
    Retrieve knowledge for a specific topic
    """
    topic_lower = topic.lower()
    
    # Search in all knowledge bases
    all_knowledge = {
        **TRADING_PSYCHOLOGY,
        **CHART_PATTERNS,
        **TRADING_STRATEGIES,
        **MARKET_CONDITIONS,
        **PORTFOLIO_MANAGEMENT,
        **TRADING_SCENARIOS
    }
    
    # Direct match
    if topic_lower in all_knowledge:
        return all_knowledge[topic_lower]
    
    # Partial match
    for key, value in all_knowledge.items():
        if topic_lower in key or key in topic_lower:
            return value
    
    # Search in glossary
    if topic_lower in GLOSSARY:
        return {"term": topic_lower, "definition": GLOSSARY[topic_lower]}
    
    return {}

# Function to get all available topics
def get_all_topics() -> dict:
    """
    Get list of all available topics
    """
    return {
        "Psychology": list(TRADING_PSYCHOLOGY.keys()),
        "Chart Patterns": list(CHART_PATTERNS.keys()),
        "Strategies": list(TRADING_STRATEGIES.keys()),
        "Market Conditions": list(MARKET_CONDITIONS.keys()),
        "Portfolio Management": list(PORTFOLIO_MANAGEMENT.keys()),
        "Scenarios": list(TRADING_SCENARIOS.keys()),
        "Glossary": len(GLOSSARY)
    }
