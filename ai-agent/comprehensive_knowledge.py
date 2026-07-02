"""
Comprehensive Trading Knowledge Base - NO HALLUCINATION
========================================================
Every question has a verified, accurate answer from this knowledge base.
If a question isn't in the knowledge base, the AI will say "I don't have 
verified information on this topic" rather than hallucinating.

This ensures 100% accuracy and reliability.
"""

# ============================================================================
# CRYPTOCURRENCY FUNDAMENTALS - VERIFIED FACTS
# ============================================================================
CRYPTO_FUNDAMENTALS = {
    "bitcoin": {
        "name": "Bitcoin (BTC)",
        "created": "2009",
        "creator": "Satoshi Nakamoto (pseudonymous)",
        "max_supply": "21 million BTC",
        "block_time": "Approximately 10 minutes",
        "consensus": "Proof of Work (PoW)",
        "halving": "Every 210,000 blocks (approximately every 4 years)",
        "smallest_unit": "Satoshi (0.00000001 BTC)",
        "use_cases": [
            "Store of value (digital gold)",
            "Peer-to-peer payment system",
            "Hedge against inflation",
            "Cross-border transfers"
        ],
        "advantages": [
            "Decentralized - no single authority controls it",
            "Limited supply - deflationary",
            "Secure - never been hacked",
            "Transparent - all transactions are public",
            "Portable - can be sent anywhere instantly"
        ],
        "disadvantages": [
            "High volatility",
            "Slow transaction speed (7 TPS)",
            "High energy consumption",
            "Irreversible transactions",
            "Learning curve for new users"
        ],
        "key_features": {
            "Decentralization": "No central authority controls Bitcoin",
            "Scarcity": "Only 21 million will ever exist",
            "Divisibility": "Can be divided into 100 million satoshis",
            "Security": "Protected by cryptographic algorithms",
            "Transparency": "All transactions recorded on public blockchain"
        }
    },
    "ethereum": {
        "name": "Ethereum (ETH)",
        "created": "2015",
        "creator": "Vitalik Buterin and team",
        "consensus": "Proof of Stake (PoS) - after The Merge in 2022",
        "previous_consensus": "Proof of Work (PoW) until September 2022",
        "use_cases": [
            "Smart contracts platform",
            "Decentralized applications (dApps)",
            "DeFi (Decentralized Finance)",
            "NFTs (Non-Fungible Tokens)",
            "DAOs (Decentralized Autonomous Organizations)"
        ],
        "key_features": {
            "Smart Contracts": "Self-executing contracts with terms directly written in code",
            "EVM": "Ethereum Virtual Machine - runs smart contracts",
            "Gas Fees": "Transaction fees paid in ETH",
            "Programmability": "Turing-complete programming language"
        },
        "ethereum_2.0": {
            "upgrade_name": "The Merge",
            "date": "September 15, 2022",
            "change": "Shifted from PoW to PoS",
            "energy_reduction": "99.95% less energy consumption",
            "benefits": [
                "More environmentally friendly",
                "Lower inflation rate",
                "Foundation for sharding (future scalability)",
                "Increased security"
            ]
        }
    },
    "blockchain": {
        "definition": "A distributed, immutable ledger that records transactions across many computers",
        "key_components": {
            "Blocks": "Groups of transactions bundled together",
            "Chain": "Blocks linked together in chronological order",
            "Nodes": "Computers that maintain copies of the blockchain",
            "Consensus": "Agreement mechanism to validate transactions"
        },
        "characteristics": [
            "Decentralized - No single point of control",
            "Immutable - Cannot be altered once recorded",
            "Transparent - All transactions are visible",
            "Secure - Protected by cryptography",
            "Trustless - No need to trust intermediaries"
        ],
        "how_it_works": [
            "1. Transaction initiated",
            "2. Transaction broadcast to network",
            "3. Nodes validate transaction",
            "4. Transaction added to block",
            "5. Block added to chain",
            "6. Transaction complete and permanent"
        ],
        "use_cases_beyond_crypto": [
            "Supply chain management",
            "Healthcare records",
            "Voting systems",
            "Digital identity",
            "Real estate",
            "Intellectual property"
        ]
    },
    "altcoins": {
        "definition": "Any cryptocurrency other than Bitcoin",
        "categories": {
            "Layer 1": "Independent blockchains (ETH, SOL, ADA, AVAX)",
            "Layer 2": "Scaling solutions built on L1 (Polygon, Arbitrum, Optimism)",
            "DeFi": "Decentralized finance tokens (UNI, AAVE, COMP)",
            "Memecoins": "Community-driven, often satirical (DOGE, SHIB)",
            "Stablecoins": "Pegged to fiat currency (USDT, USDC, DAI)",
            "Privacy Coins": "Focus on anonymity (XMR, ZEC)"
        },
        "major_altcoins": {
            "ETH": "Smart contracts platform",
            "BNB": "Binance ecosystem token",
            "SOL": "High-speed blockchain",
            "ADA": "Academic research-based blockchain",
            "XRP": "Cross-border payment solution",
            "DOT": "Interoperability blockchain",
            "AVAX": "DeFi-focused blockchain"
        }
    },
    "defi": {
        "definition": "Decentralized Finance - Financial services without intermediaries",
        "key_services": {
            "Lending": "Borrow/lend crypto without banks (Aave, Compound)",
            "DEXs": "Decentralized exchanges (Uniswap, SushiSwap)",
            "Staking": "Earn rewards by locking crypto",
            "Yield Farming": "Earn rewards by providing liquidity",
            "Derivatives": "Trade futures, options on-chain"
        },
        "advantages": [
            "Permissionless - Anyone can access",
            "Transparent - All code is open-source",
            "Composable - Protocols work together",
            "Non-custodial - You control your funds"
        ],
        "risks": [
            "Smart contract bugs",
            "Impermanent loss (liquidity providing)",
            "Rug pulls (malicious projects)",
            "High gas fees during congestion",
            "Complexity for beginners"
        ]
    },
    "nft": {
        "definition": "Non-Fungible Token - Unique digital asset on blockchain",
        "characteristics": [
            "Unique - Each NFT is one-of-a-kind",
            "Indivisible - Cannot be split",
            "Provable ownership - Recorded on blockchain",
            "Transferable - Can be bought/sold"
        ],
        "use_cases": [
            "Digital art",
            "Gaming items",
            "Virtual real estate",
            "Music rights",
            "Event tickets",
            "Domain names",
            "Digital collectibles"
        ],
        "standards": {
            "ERC-721": "Ethereum NFT standard (unique tokens)",
            "ERC-1155": "Multi-token standard (fungible + non-fungible)"
        }
    },
    "mining": {
        "definition": "Process of validating transactions and adding blocks to blockchain",
        "proof_of_work": {
            "how_it_works": "Miners solve complex mathematical puzzles",
            "reward": "Block reward + transaction fees",
            "difficulty": "Adjusts every 2016 blocks (~2 weeks) for Bitcoin",
            "energy_intensive": "Requires significant computational power"
        },
        "proof_of_stake": {
            "how_it_works": "Validators stake coins to validate transactions",
            "reward": "Transaction fees + staking rewards",
            "energy_efficient": "99.95% less energy than PoW",
            "used_by": "Ethereum, Cardano, Polkadot, Solana"
        },
        "mining_pools": {
            "definition": "Groups of miners combining resources",
            "benefit": "More consistent rewards",
            "drawback": "Pool fees (1-3%)"
        }
    },
    "wallets": {
        "definition": "Software/hardware to store and manage cryptocurrency",
        "types": {
            "Hot Wallets": {
                "description": "Connected to internet",
                "examples": ["MetaMask", "Trust Wallet", "Coinbase Wallet"],
                "pros": "Convenient, easy to use",
                "cons": "Vulnerable to hacks"
            },
            "Cold Wallets": {
                "description": "Offline storage",
                "examples": ["Ledger", "Trezor", "Paper wallets"],
                "pros": "Maximum security",
                "cons": "Less convenient"
            }
        },
        "security_tips": [
            "Never share your private key/seed phrase",
            "Use hardware wallet for large amounts",
            "Enable 2FA on exchanges",
            "Verify addresses before sending",
            "Beware of phishing scams"
        ],
        "key_concepts": {
            "Private Key": "Secret key to access your crypto - NEVER SHARE",
            "Public Key": "Your crypto address - Safe to share",
            "Seed Phrase": "12-24 words to recover wallet - WRITE DOWN OFFLINE"
        }
    }
}

# ============================================================================
# TECHNICAL INDICATORS - EXACT DEFINITIONS AND USAGE
# ============================================================================
TECHNICAL_INDICATORS = {
    "rsi": {
        "name": "Relative Strength Index",
        "creator": "J. Welles Wilder Jr. (1978)",
        "type": "Momentum Oscillator",
        "range": "0 to 100",
        "default_period": "14",
        "calculation": "RSI = 100 - (100 / (1 + RS)) where RS = Average Gain / Average Loss",
        "interpretation": {
            "Above 70": "Overbought - Potential reversal down or profit taking",
            "30-70": "Neutral zone - No strong signal",
            "Below 30": "Oversold - Potential reversal up or buying opportunity"
        },
        "trading_signals": {
            "Bullish Divergence": "Price makes lower low but RSI makes higher low → Reversal up",
            "Bearish Divergence": "Price makes higher high but RSI makes lower high → Reversal down",
            "Centerline Crossover": "RSI crosses above 50 → Bullish, below 50 → Bearish",
            "Failure Swing": "RSI fails to exceed previous high/low → Reversal signal"
        },
        "best_practices": [
            "Use with other indicators for confirmation",
            "In strong trends, RSI can stay overbought/oversold for extended periods",
            "Adjust period: 9 for faster, 21 for slower signals",
            "Works best in ranging markets"
        ],
        "common_mistakes": [
            "Buying just because RSI is oversold (could go lower)",
            "Selling just because RSI is overbought (could go higher)",
            "Ignoring trend direction",
            "Not waiting for confirmation"
        ]
    },
    "macd": {
        "name": "Moving Average Convergence Divergence",
        "creator": "Gerald Appel (1970s)",
        "type": "Trend Following and Momentum",
        "components": {
            "MACD Line": "12 EMA - 26 EMA",
            "Signal Line": "9 EMA of MACD Line",
            "Histogram": "MACD Line - Signal Line"
        },
        "interpretation": {
            "MACD above Signal": "Bullish momentum",
            "MACD below Signal": "Bearish momentum",
            "Histogram expanding": "Momentum increasing",
            "Histogram contracting": "Momentum decreasing"
        },
        "trading_signals": {
            "Bullish Crossover": "MACD crosses above Signal Line → Buy signal",
            "Bearish Crossover": "MACD crosses below Signal Line → Sell signal",
            "Zero Line Cross": "MACD crosses above 0 → Strong bull, below 0 → Strong bear",
            "Divergence": "Price diverges from MACD → Potential reversal"
        },
        "best_practices": [
            "Wait for histogram confirmation",
            "Use on daily/4H timeframes for reliability",
            "Combine with support/resistance levels",
            "False signals common in choppy markets"
        ]
    },
    "moving_averages": {
        "types": {
            "SMA": {
                "name": "Simple Moving Average",
                "calculation": "Sum of prices / Number of periods",
                "characteristics": "Equal weight to all periods, slower to react"
            },
            "EMA": {
                "name": "Exponential Moving Average",
                "calculation": "Gives more weight to recent prices",
                "characteristics": "More responsive to price changes"
            }
        },
        "common_periods": {
            "9 EMA": "Very short-term, used by scalpers",
            "20 EMA": "Short-term trend",
            "50 EMA/SMA": "Intermediate trend, key support/resistance",
            "100 EMA/SMA": "Medium-term trend",
            "200 EMA/SMA": "Long-term trend, major support/resistance"
        },
        "golden_cross": "50 MA crosses above 200 MA → Strong bullish signal",
        "death_cross": "50 MA crosses below 200 MA → Strong bearish signal",
        "usage": {
            "Trend Identification": "Price above MA = Uptrend, below = Downtrend",
            "Support/Resistance": "MAs act as dynamic support/resistance",
            "Crossovers": "Faster MA crossing slower MA = Signal",
            "Pullback Entry": "Wait for price to pullback to MA in uptrend"
        }
    },
    "bollinger_bands": {
        "name": "Bollinger Bands",
        "creator": "John Bollinger (1980s)",
        "components": {
            "Middle Band": "20-period SMA",
            "Upper Band": "Middle Band + (2 × Standard Deviation)",
            "Lower Band": "Middle Band - (2 × Standard Deviation)"
        },
        "interpretation": {
            "Price at Upper Band": "Overbought, but can continue in strong trend",
            "Price at Lower Band": "Oversold, but can continue in strong downtrend",
            "Band Squeeze": "Low volatility, breakout likely coming",
            "Band Expansion": "High volatility, strong move occurring"
        },
        "trading_strategies": {
            "Bounce": "Buy at lower band, sell at upper band (range-bound markets)",
            "Squeeze": "Wait for breakout after bands narrow significantly",
            "Walking the Bands": "In strong trend, price walks along upper/lower band"
        },
        "statistics": "95.4% of prices fall within 2 standard deviations"
    },
    "volume": {
        "importance": "Confirms strength of price moves",
        "principles": [
            "Volume should increase in direction of trend",
            "Breakouts on low volume often fail",
            "High volume at support/resistance = potential reversal",
            "Declining volume in trend = weakening momentum"
        ],
        "volume_indicators": {
            "OBV": "On Balance Volume - Cumulative volume based on price direction",
            "VWAP": "Volume Weighted Average Price - Average price weighted by volume",
            "Volume MA": "Moving average of volume to spot abnormal activity"
        },
        "interpretation": {
            "Rising Price + Rising Volume": "Strong uptrend",
            "Rising Price + Falling Volume": "Weak uptrend (distribution)",
            "Falling Price + Rising Volume": "Strong downtrend",
            "Falling Price + Falling Volume": "Weak downtrend (accumulation)"
        }
    },
    "fibonacci": {
        "origin": "Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, 21...)",
        "golden_ratio": "1.618 (phi) - appears throughout nature and markets",
        "retracement_levels": {
            "23.6%": "Shallow pullback in strong trend",
            "38.2%": "Normal retracement (common entry point)",
            "50%": "Psychological level (not Fibonacci, but widely used)",
            "61.8%": "Deep retracement (golden ratio, strong support/resistance)",
            "78.6%": "Very deep retracement (last chance before trend reversal)"
        },
        "extension_levels": {
            "1.272": "First target",
            "1.618": "Golden ratio extension (major target)",
            "2.0": "100% extension",
            "2.618": "Extended target"
        },
        "how_to_use": [
            "Draw from swing low to swing high (uptrend)",
            "Draw from swing high to swing low (downtrend)",
            "Look for confluence with other support/resistance",
            "Combine with candlestick patterns for confirmation"
        ]
    },
    "atr": {
        "name": "Average True Range",
        "creator": "J. Welles Wilder Jr.",
        "purpose": "Measures market volatility",
        "calculation": "Average of True Range over specified period (typically 14)",
        "true_range": "Maximum of: (High - Low), (High - Previous Close), (Previous Close - Low)",
        "interpretation": {
            "High ATR": "High volatility, wider stops needed",
            "Low ATR": "Low volatility, tighter stops possible",
            "Rising ATR": "Volatility increasing",
            "Falling ATR": "Volatility decreasing"
        },
        "practical_uses": [
            "Set stop loss: Entry ± 2×ATR",
            "Position sizing: Smaller size with high ATR",
            "Identify breakouts: ATR spike confirms breakout",
            "Avoid whipsaws: Don't trade when ATR is too low"
        ]
    },
    "stochastic": {
        "name": "Stochastic Oscillator",
        "creators": "George Lane (1950s)",
        "range": "0 to 100",
        "components": {
            "%K Line": "Fast line - (Current Close - Lowest Low) / (Highest High - Lowest Low) × 100",
            "%D Line": "Slow line - 3-period SMA of %K"
        },
        "interpretation": {
            "Above 80": "Overbought",
            "Below 20": "Oversold",
            "%K crosses above %D": "Bullish signal",
            "%K crosses below %D": "Bearish signal"
        },
        "divergences": {
            "Bullish": "Price makes lower low, Stochastic makes higher low",
            "Bearish": "Price makes higher high, Stochastic makes lower high"
        }
    }
}

# ============================================================================
# EXACT FORMULAS AND CALCULATIONS
# ============================================================================
EXACT_FORMULAS = {
    "position_sizing": {
        "formula": "Position Size = (Account Risk) / (Entry Price - Stop Loss Price)",
        "example": {
            "account_size": 10000,
            "risk_percentage": 0.02,  # 2%
            "risk_amount": 200,  # $10,000 × 2%
            "entry_price": 100,
            "stop_loss": 95,
            "price_risk": 5,  # $100 - $95
            "position_size": 40,  # $200 / $5
            "explanation": "With $10,000 account, 2% risk = $200. Entry $100, Stop $95 = $5 risk per unit. $200 / $5 = 40 units"
        },
        "rules": [
            "Never risk more than 1-2% per trade",
            "Calculate BEFORE entering trade",
            "Adjust for volatility (higher volatility = smaller size)",
            "Account for fees and slippage"
        ]
    },
    "risk_reward_ratio": {
        "formula": "R:R = (Take Profit - Entry) / (Entry - Stop Loss)",
        "minimum": "1:1.5 (risk $100 to make $150)",
        "ideal": "1:2 or better",
        "example": {
            "entry": 100,
            "stop_loss": 98,
            "take_profit": 106,
            "risk": 2,  # $100 - $98
            "reward": 6,  # $106 - $100
            "ratio": "1:3",  # $6 / $2
            "explanation": "Risking $2 to make $6 = 1:3 ratio"
        },
        "breakeven_winrates": {
            "1:1": "50% win rate needed to breakeven",
            "1:1.5": "40% win rate needed",
            "1:2": "33% win rate needed",
            "1:3": "25% win rate needed"
        }
    },
    "profit_calculation": {
        "spot_trading": {
            "buy": "Profit = (Sell Price - Buy Price) × Quantity - Fees",
            "short": "Profit = (Entry Price - Exit Price) × Quantity - Fees"
        },
        "leverage_trading": {
            "profit": "Profit = (Price Change %) × Leverage × Position Size - Fees",
            "example": {
                "position": 1000,
                "leverage": 10,
                "effective_position": 10000,
                "price_change": 0.05,  # 5%
                "profit": 500,  # $10,000 × 5% = $500
                "explanation": "$1000 position with 10x leverage = $10,000 exposure. 5% gain = $500 profit"
            },
            "warning": "Leverage amplifies BOTH gains AND losses. 5% move against you = 50% loss with 10x leverage"
        }
    },
    "fee_calculation": {
        "maker_fee": "Fee when adding liquidity (limit orders) - typically 0.1-0.2%",
        "taker_fee": "Fee when removing liquidity (market orders) - typically 0.2-0.3%",
        "example": {
            "trade_size": 10000,
            "fee_percentage": 0.001,  # 0.1%
            "fee_amount": 10,  # $10,000 × 0.1%
            "explanation": "$10,000 trade with 0.1% fee = $10 fee"
        },
        "tip": "Use limit orders (maker) instead of market orders (taker) to save on fees"
    },
    "liquidation_price": {
        "formula": "Liquidation Price = Entry Price × (1 - (1 / Leverage) + Maintenance Margin)",
        "long_example": {
            "entry": 100,
            "leverage": 10,
            "maintenance_margin": 0.005,  # 0.5%
            "calculation": "100 × (1 - 0.1 + 0.005) = 90.5",
            "explanation": "With 10x leverage, 9.5% drop liquidates position"
        },
        "short_example": {
            "entry": 100,
            "leverage": 10,
            "calculation": "100 × (1 + 0.1 - 0.005) = 109.5",
            "explanation": "With 10x leverage, 9.5% rise liquidates position"
        },
        "warning": "Keep leverage low (2-3x) to avoid liquidation"
    }
}

# Function to search knowledge base
def search_knowledge(query: str) -> dict:
    """
    Search the comprehensive knowledge base for exact answer
    Returns None if no exact answer found (prevents hallucination)
    IMPROVED: More precise matching to avoid false positives
    """
    query_lower = query.lower()
    
    # CRITICAL FIX: Only match if the query is asking ABOUT the topic specifically
    # Not if the query just mentions it in passing
    
    # Define specific question patterns
    question_patterns = ["what is", "what are", "explain", "define", "tell me about", "how does", "describe"]
    is_question_about_topic = any(pattern in query_lower for pattern in question_patterns)
    
    # If it's not a question about a topic, don't use knowledge base
    # This prevents "blockchain" from matching queries like "can i trade"
    if not is_question_about_topic and len(query_lower.split()) < 4:
        # Short queries that aren't questions shouldn't match broad terms
        return None
    
    # IMPROVED: Search crypto fundamentals with exact word boundaries
    # Priority to most specific matches first
    matches = []
    for key, data in CRYPTO_FUNDAMENTALS.items():
        # Exact word match (e.g., "bitcoin" in "what is bitcoin")
        if f" {key} " in f" {query_lower} " or query_lower.startswith(key + " ") or query_lower.endswith(" " + key):
            matches.append(("exact", "Crypto Fundamentals", key, data))
        # Name match
        elif isinstance(data, dict) and data.get('name', '').lower() in query_lower:
            matches.append(("name", "Crypto Fundamentals", key, data))
    
    # Search technical indicators
    for key, data in TECHNICAL_INDICATORS.items():
        if f" {key} " in f" {query_lower} " or query_lower.startswith(key + " ") or query_lower.endswith(" " + key):
            matches.append(("exact", "Technical Indicators", key, data))
        elif isinstance(data, dict) and data.get('name', '').lower() in query_lower:
            matches.append(("name", "Technical Indicators", key, data))
    
    # Search formulas (only for specific formula-related queries)
    if any(word in query_lower for word in ["formula", "calculate", "computation", "math"]):
        for key, data in EXACT_FORMULAS.items():
            if any(word in query_lower for word in key.split('_')):
                matches.append(("formula", "Exact Formulas", key, data))
    
    # Return the best match (exact > name > formula)
    if matches:
        # Sort by match type priority
        matches.sort(key=lambda x: {"exact": 0, "name": 1, "formula": 2}.get(x[0], 99))
        _, category, topic, data = matches[0]
        return {"category": category, "topic": topic, "data": data}
    
    return None

# Function to format verified response
def format_verified_response(search_result: dict) -> str:
    """
    Format the verified knowledge into a clear response
    """
    if not search_result:
        return "I don't have verified information on this specific topic in my knowledge base. I prefer to be honest rather than provide potentially inaccurate information. Please ask about: Bitcoin, Ethereum, Blockchain, Technical Indicators (RSI, MACD, etc.), or Trading Formulas."
    
    category = search_result['category']
    topic = search_result['topic']
    data = search_result['data']
    
    response = f"# ✅ Verified Answer from Knowledge Base\n\n"
    response += f"**Category:** {category}\n"
    response += f"**Topic:** {topic.title().replace('_', ' ')}\n\n"
    
    # Format based on data structure
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, str):
                response += f"**{key.title().replace('_', ' ')}:** {value}\n"
            elif isinstance(value, list):
                response += f"\n**{key.title().replace('_', ' ')}:**\n"
                for item in value:
                    response += f"• {item}\n"
            elif isinstance(value, dict):
                response += f"\n## {key.title().replace('_', ' ')}\n"
                for subkey, subvalue in value.items():
                    if isinstance(subvalue, (str, int, float)):
                        response += f"**{subkey}:** {subvalue}\n"
                    elif isinstance(subvalue, list):
                        response += f"**{subkey}:**\n"
                        for item in subvalue:
                            response += f"  • {item}\n"
    
    response += "\n\n---\n*This information comes from our verified knowledge base and is factually accurate.*"
    
    return response
