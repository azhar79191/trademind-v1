"""
Professional Trading Knowledge Base - Wall Street Grade
========================================================
Enterprise-level trading knowledge for business automation
Includes: Advanced strategies, institutional insights, automation logic
"""

# ============================================================================
# PROFESSIONAL TRADING STRATEGIES - INSTITUTIONAL LEVEL
# ============================================================================

PROFESSIONAL_STRATEGIES = {
    "market_making": {
        "level": "Advanced",
        "description": "Provide liquidity by placing both buy and sell orders to profit from the spread",
        "requirements": {
            "capital": "High ($50,000+)",
            "knowledge": "Expert",
            "time": "Automated (24/7)",
            "exchange": "Must support API"
        },
        "how_it_works": [
            "Place limit buy orders below market price",
            "Place limit sell orders above market price",
            "Profit from the bid-ask spread",
            "Continuously adjust orders based on market conditions"
        ],
        "profitability": "Consistent 5-15% monthly returns with proper risk management",
        "risks": [
            "Inventory risk (holding depreciating assets)",
            "Gap risk (sudden price movements)",
            "Requires constant monitoring or bot automation"
        ],
        "automation_strategy": {
            "entry": "Place orders at ±0.5% from mid-price",
            "exit": "Cancel and replace every 5 minutes",
            "risk": "Max 10% of capital in inventory at any time",
            "stop": "Emergency shutdown if volatility > 5%/hour"
        },
        "business_value": "Generates passive income through automated market making bots"
    },
    
    "statistical_arbitrage": {
        "level": "Expert",
        "description": "Exploit price differences of correlated assets using statistical models",
        "requirements": {
            "capital": "Medium ($10,000+)",
            "knowledge": "Expert (statistics/programming)",
            "time": "Automated",
            "tools": "Python, statistical libraries"
        },
        "pairs_trading": {
            "concept": "Trade two correlated assets when their price relationship diverges",
            "example": "BTC/ETH correlation typically 0.85. When it drops to 0.6, trade the divergence",
            "execution": [
                "1. Calculate correlation coefficient (30-day rolling)",
                "2. Calculate z-score of price ratio",
                "3. When z-score > 2: Short outperformer, Long underperformer",
                "4. Exit when z-score returns to 0"
            ]
        },
        "profitability": "8-12% monthly with 2-3% drawdown",
        "automation_strategy": {
            "data": "Fetch OHLCV every 1 hour",
            "calculation": "Rolling correlation, z-score",
            "entry": "z-score > 2 or < -2",
            "exit": "z-score crosses 0",
            "position_size": "Risk 1% per pair"
        },
        "business_value": "Systematic, emotion-free trading with consistent returns"
    },
    
    "momentum_following": {
        "level": "Intermediate",
        "description": "Ride strong trends using momentum indicators and volume analysis",
        "institutional_approach": [
            "Identify assets with strong 20-day momentum (>10% gain)",
            "Confirm with volume (volume today > 1.5x average)",
            "Enter on pullback to 20 EMA",
            "Hold until momentum breaks (MACD crossover)"
        ],
        "entry_rules": {
            "momentum": "20-day return > 10%",
            "volume": "Volume > 150% of 20-day average",
            "pullback": "Price touches 20 EMA",
            "confirmation": "RSI > 50 and MACD > signal line"
        },
        "exit_rules": {
            "profit": "Take 50% at +15%, let rest run with trailing stop",
            "stop": "Below 20 EMA or -7% from entry",
            "time": "Exit after 30 days regardless (momentum fades)"
        },
        "profitability": "15-25% per winning trade, 55% win rate",
        "automation_strategy": {
            "scan": "Scan top 50 cryptos daily for momentum",
            "rank": "Sort by (return × volume × RSI)",
            "entry": "Auto-buy when all conditions met",
            "exit": "Auto-sell on exit signals"
        },
        "business_value": "Captures major market moves systematically, 24/7 monitoring"
    },
    
    "mean_reversion_advanced": {
        "level": "Intermediate",
        "description": "Professional mean reversion using Bollinger Bands and statistical analysis",
        "institutional_approach": [
            "Use 20-day Bollinger Bands (2 std dev)",
            "Calculate RSI (14) and %B indicator",
            "Trade only in established ranges (not trends)",
            "Use multiple timeframes for confirmation"
        ],
        "entry_rules": {
            "oversold": [
                "Price < Lower Bollinger Band",
                "RSI < 30",
                "%B < 0 (below lower band)",
                "Volume > average (selling exhaustion)"
            ],
            "overbought": [
                "Price > Upper Bollinger Band",
                "RSI > 70",
                "%B > 1 (above upper band)",
                "Volume > average (buying exhaustion)"
            ]
        },
        "exit_rules": {
            "profit_target": "Middle Bollinger Band (20 SMA)",
            "stop_loss": "2 ATR from entry",
            "time_stop": "72 hours (if no mean reversion)"
        },
        "profitability": "5-10% per trade, 65% win rate, 20-30 trades/month",
        "automation_strategy": {
            "market_filter": "Only trade if ADX < 25 (ranging market)",
            "entry": "Auto-enter when all conditions met",
            "exit": "Auto-exit at middle band or stop",
            "scaling": "Add to position if price extends further"
        },
        "business_value": "High-probability setups in ranging markets, fully automated"
    },
    
    "breakout_professional": {
        "level": "Intermediate",
        "description": "Trade breakouts from consolidation with institutional precision",
        "consolidation_identification": [
            "Price in 10-20 day range",
            "Volatility contraction (ATR declining)",
            "Volume declining (accumulation phase)",
            "Bollinger Bands squeezing (width < 50% of 6-month average)"
        ],
        "entry_rules": {
            "breakout_signal": "Close above resistance + 2%",
            "volume_confirmation": "Volume > 200% of average",
            "retest_entry": "Wait for pullback to breakout level (50% of time)",
            "momentum": "RSI > 60 on breakout"
        },
        "exit_rules": {
            "target": "Height of consolidation range projected upward",
            "stop": "Below breakout level (tight stop)",
            "trailing": "Use 2 ATR trailing stop after +10%"
        },
        "profitability": "20-40% per trade, 45% win rate, R:R 1:3",
        "automation_strategy": {
            "scanner": "Scan for narrowing Bollinger Bands daily",
            "alert": "Alert when BB width < 50% of 6-month average",
            "entry": "Auto-buy on confirmed breakout",
            "exit": "Auto-manage with trailing stop"
        },
        "business_value": "Catches explosive moves early, systematic entry/exit"
    },
    
    "grid_trading": {
        "level": "Beginner-Friendly",
        "description": "Place buy/sell orders at fixed intervals to profit from volatility",
        "how_it_works": [
            "Set a price range (e.g., $95,000 - $105,000 for BTC)",
            "Divide into grids (e.g., 20 levels = $500 per level)",
            "Place buy orders at each level below current price",
            "Place sell orders at each level above current price",
            "Profit from price oscillations"
        ],
        "setup": {
            "capital": "$10,000",
            "range": "$95k - $105k",
            "grids": 20,
            "capital_per_grid": "$500",
            "buy_levels": "$95k, $95.5k, $96k... $100k",
            "sell_levels": "$100.5k, $101k, $101.5k... $105k"
        },
        "profitability": "0.5% profit per grid trade × 20 grids = 10% on full cycle",
        "best_for": "Sideways/ranging markets, stable coins",
        "automation_strategy": {
            "setup": "Define range and grid count",
            "execution": "Bot places all orders automatically",
            "rebalance": "Adjust range every 7 days based on volatility",
            "safety": "Emergency close all if price breaks range"
        },
        "business_value": "Passive income from market volatility, set and forget"
    },
    
    "dca_smart": {
        "level": "Beginner-Friendly",
        "description": "Dollar Cost Averaging with professional enhancements",
        "traditional_dca": "Buy fixed amount at fixed intervals (e.g., $100/week)",
        "smart_dca": {
            "concept": "Adjust buy amount based on market conditions",
            "rules": [
                "Buy 2x normal amount when RSI < 30 (oversold)",
                "Buy 1.5x when RSI 30-40",
                "Buy 1x when RSI 40-60",
                "Buy 0.5x when RSI 60-70",
                "Skip buy when RSI > 70 (overbought)"
            ],
            "value_averaging": "Adjust amount to reach target portfolio value",
            "momentum_adjustment": "Increase buys during downtrends, reduce in uptrends"
        },
        "profitability": "Outperforms regular DCA by 15-30% over 12 months",
        "automation_strategy": {
            "schedule": "Weekly buys every Monday",
            "calculation": "Calculate RSI on Sunday night",
            "execution": "Auto-buy calculated amount",
            "tracking": "Track average entry price and total invested"
        },
        "business_value": "Systematic accumulation with better entry prices than basic DCA"
    }
}

# ============================================================================
# PROFESSIONAL RISK MANAGEMENT - INSTITUTIONAL GRADE
# ============================================================================

PROFESSIONAL_RISK = {
    "portfolio_risk": {
        "max_portfolio_risk": "Never risk more than 20% of total capital at once",
        "position_limits": {
            "single_asset": "Max 30% in any single cryptocurrency",
            "correlated_assets": "Max 50% in correlated assets (e.g., L1 blockchains)",
            "high_risk": "Max 10% in small-cap/new tokens"
        },
        "leverage_limits": {
            "beginners": "No leverage (1x)",
            "intermediate": "Max 2-3x leverage",
            "advanced": "Max 5x leverage with strict stop losses",
            "never": "Never use 10x+ leverage (95% of traders get liquidated)"
        },
        "kelly_criterion": {
            "formula": "f = (bp - q) / b",
            "conservative": "Use 1/4 Kelly for safety",
            "example": "60% win rate, 2:1 R:R → Kelly = 40% → Use 10% position size"
        }
    },
    
    "stop_loss_professional": {
        "types": {
            "fixed_percentage": "3-5% from entry (simple, works well)",
            "atr_based": "2-3 × ATR below entry (adjusts for volatility)",
            "support_based": "Below nearest support level + buffer",
            "time_based": "Exit after 72 hours if no progress",
            "trailing": "Lock profits while allowing upside"
        },
        "institutional_approach": [
            "Always set stop loss BEFORE entering trade",
            "Never move stop loss away from entry (only toward profit)",
            "Use mental stops for large positions (avoid stop hunts)",
            "Accept losses quickly - they're part of trading"
        ],
        "position_sizing_with_stops": {
            "formula": "Position Size = Risk Amount / (Entry - Stop)",
            "example": "$10k account, 2% risk = $200. Entry $100, Stop $95. Position = $200/$5 = 40 units"
        }
    },
    
    "drawdown_management": {
        "definition": "Maximum peak-to-valley decline in account value",
        "acceptable_levels": {
            "conservative": "10% max drawdown",
            "moderate": "20% max drawdown",
            "aggressive": "30% max drawdown"
        },
        "recovery_rules": [
            "After 10% drawdown: Reduce position sizes by 25%",
            "After 20% drawdown: Stop trading for 1 week, analyze mistakes",
            "After 30% drawdown: Reset strategy, consider switching approach"
        ],
        "prevention": [
            "Diversify across strategies (not just assets)",
            "Use stop losses religiously",
            "Take profits regularly - don't get greedy",
            "Keep cash reserves (20-30% of portfolio)"
        ]
    },
    
    "portfolio_construction": {
        "modern_portfolio_theory": {
            "concept": "Maximize returns for given risk level",
            "diversification": "Combine uncorrelated or negatively correlated assets",
            "rebalancing": "Rebalance quarterly to target allocation"
        },
        "sample_portfolios": {
            "conservative": {
                "btc": "50%",
                "eth": "30%",
                "stablecoins": "15%",
                "large_caps": "5%",
                "expected_return": "30-50% annually",
                "max_drawdown": "30-40%"
            },
            "moderate": {
                "btc": "40%",
                "eth": "30%",
                "large_caps": "20%",
                "mid_caps": "10%",
                "expected_return": "50-100% annually",
                "max_drawdown": "40-60%"
            },
            "aggressive": {
                "btc": "30%",
                "eth": "25%",
                "large_caps": "20%",
                "mid_caps": "15%",
                "small_caps": "10%",
                "expected_return": "100-200% annually",
                "max_drawdown": "60-80%"
            }
        }
    }
}

# ============================================================================
# MARKET ANALYSIS - PROFESSIONAL LEVEL
# ============================================================================

PROFESSIONAL_ANALYSIS = {
    "market_structure": {
        "uptrend_characteristics": [
            "Higher highs and higher lows",
            "50 EMA > 200 EMA (Golden Cross)",
            "Price consistently above 20/50/200 EMA",
            "Volume increasing on up moves",
            "RSI > 50, MACD positive"
        ],
        "downtrend_characteristics": [
            "Lower lows and lower highs",
            "50 EMA < 200 EMA (Death Cross)",
            "Price consistently below 20/50/200 EMA",
            "Volume increasing on down moves",
            "RSI < 50, MACD negative"
        ],
        "ranging_characteristics": [
            "Price bouncing between support/resistance",
            "Low ADX (< 25) - no trend",
            "Bollinger Bands flat or narrow",
            "Decreasing volume"
        ]
    },
    
    "support_resistance": {
        "identification": [
            "Historical price levels where price reversed 2+ times",
            "Round numbers ($100k, $50k, $10k psychological levels)",
            "Moving averages (20, 50, 200 EMA)",
            "Fibonacci levels (38.2%, 61.8%)",
            "Previous highs and lows"
        ],
        "trading_rules": {
            "buy_support": "Buy within 1% of support with stop 2% below",
            "sell_resistance": "Sell within 1% of resistance",
            "breakout": "Buy breakout above resistance with 2% confirmation",
            "breakdown": "Short breakdown below support with 2% confirmation"
        },
        "professional_tips": [
            "Support/Resistance are zones, not exact lines",
            "Stronger levels have more touches and higher volume",
            "Broken resistance becomes support (and vice versa)",
            "Combine multiple timeframes for best levels"
        ]
    },
    
    "volume_analysis": {
        "accumulation": "Price stable/declining, volume increasing = buying",
        "distribution": "Price stable/rising, volume increasing = selling",
        "markup": "Price rising, volume increasing = healthy uptrend",
        "markdown": "Price falling, volume increasing = healthy downtrend",
        "professional_indicators": {
            "obv": "On Balance Volume - cumulative volume indicator",
            "vwap": "Volume Weighted Average Price - institutional entry point",
            "volume_profile": "Shows price levels with most volume (value areas)"
        }
    },
    
    "market_cycles": {
        "accumulation": {
            "description": "Smart money accumulating, public pessimistic",
            "indicators": ["Low volatility", "Declining volume", "RSI < 40 for weeks"],
            "strategy": "Start DCA, build positions"
        },
        "markup": {
            "description": "Bull market, public getting interested",
            "indicators": ["Rising prices", "Increasing volume", "Media coverage"],
            "strategy": "Hold, add on pullbacks, take some profits"
        },
        "distribution": {
            "description": "Smart money selling, public euphoric",
            "indicators": ["High volatility", "Parabolic moves", "Everyone bullish"],
            "strategy": "Take profits, reduce positions, increase stop losses"
        },
        "markdown": {
            "description": "Bear market, public capitulating",
            "indicators": ["Falling prices", "High volume on drops", "Fear/panic"],
            "strategy": "Stay in stablecoins, wait for accumulation phase"
        }
    }
}

# ============================================================================
# TRADING AUTOMATION - BUSINESS LOGIC
# ============================================================================

AUTOMATION_BUSINESS = {
    "automated_trading_setup": {
        "requirements": [
            "Exchange API keys (read + trade permissions)",
            "Server (VPS) for 24/7 operation",
            "Python trading bot or platform",
            "Risk management rules coded",
            "Monitoring and alerting system"
        ],
        "recommended_platforms": {
            "coding": "Python + CCXT library (flexible, powerful)",
            "no_code": "3Commas, Cryptohopper, TradingView alerts",
            "advanced": "Custom bot with ML/AI"
        }
    },
    
    "business_models": {
        "market_making_service": {
            "revenue": "$5,000-$50,000/month",
            "capital_needed": "$50,000+",
            "risk": "Medium",
            "time": "Automated after setup",
            "skills": "Programming, market making"
        },
        "signal_service": {
            "revenue": "$1,000-$10,000/month",
            "capital_needed": "$10,000 (for credibility)",
            "risk": "Low (reputation risk)",
            "time": "2-4 hours/day",
            "skills": "Analysis, communication"
        },
        "portfolio_management": {
            "revenue": "1-2% AUM annually + 20% performance fee",
            "capital_needed": "Client funds",
            "risk": "High (liability)",
            "time": "Full-time",
            "skills": "Expert trading + legal compliance"
        },
        "bot_development": {
            "revenue": "$5,000-$50,000 per bot",
            "capital_needed": "$0 (development)",
            "risk": "Low",
            "time": "Project-based",
            "skills": "Programming, trading knowledge"
        }
    },
    
    "scaling_business": {
        "phase_1": "Manual trading - learn and develop strategy (6-12 months)",
        "phase_2": "Semi-automated - alerts and partial automation (3-6 months)",
        "phase_3": "Fully automated - bot handles everything (ongoing)",
        "phase_4": "Multiple strategies - diversify approaches (ongoing)",
        "phase_5": "Manage others' capital or sell services (business)"
    }
}

# ============================================================================
# PROFESSIONAL INSIGHTS & WISDOM
# ============================================================================

PROFESSIONAL_INSIGHTS = {
    "institutional_secrets": [
        "Institutions buy the dip in bull markets (when RSI < 40)",
        "They sell the rip in bear markets (when RSI > 60)",
        "Big players create liquidity traps near key levels",
        "Volume spikes often mark temporary tops/bottoms",
        "Real money moves happen during low liquidity (weekends, holidays)"
    ],
    
    "common_mistakes": [
        "Over-leveraging (biggest account killer)",
        "No stop losses (hope is not a strategy)",
        "Revenge trading (emotional decisions)",
        "Chasing pumps (FOMO trading)",
        "Ignoring risk management (focusing only on profits)"
    ],
    
    "path_to_profitability": [
        "Month 1-3: Learn basics, paper trade, lose money",
        "Month 4-6: Develop strategy, backtest, small live trading",
        "Month 7-12: Refine strategy, manage psychology, break even",
        "Month 13-18: Consistent small profits, build confidence",
        "Month 19-24: Profitable, scale up capital",
        "Year 3+: Professional trader, consider it career"
    ],
    
    "professional_mindset": [
        "Trading is a business, not gambling",
        "Focus on process, not profits",
        "Losses are feedback, not failures",
        "Consistency beats home runs",
        "Simple strategies work best long-term",
        "Psychology is 80% of trading"
    ]
}
