"""
TradeMind NLP Engine - Smart Intent Resolver
=============================================
Replaces the broken fallback chain with a real semantic matching engine:
  1. Tokenize + normalize query
  2. Score every known topic using TF-IDF cosine similarity
  3. Pick best match above threshold → return answer
  4. Below threshold → return ranked suggestions from top-N matches
"""

import re
import math
from typing import Optional, Dict, List, Tuple

# ── Stop words ────────────────────────────────────────────────────────────────
STOP_WORDS = {
    "a","an","the","is","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could","should",
    "may","might","shall","can","need","dare","ought","used",
    "i","me","my","we","our","you","your","he","she","it","they","them",
    "what","which","who","whom","this","that","these","those",
    "am","at","by","for","in","of","on","to","up","as","into","through",
    "about","above","after","before","between","during","without",
    "how","when","where","why","please","tell","explain","describe",
    "give","show","help","want","need","know","understand","learn",
    "get","make","let","just","also","very","really","quite","so",
    "and","or","but","if","then","than","too","more","most","some",
    "any","all","both","each","few","many","much","other","such",
    "no","not","only","same","own","like","well","back","even","still",
    "way","take","come","go","see","look","use","find","think","say",
}

# ── Topic index: (keywords, aliases, category) ───────────────────────────────
# Each entry: topic_key → { "terms": [...], "category": "...", "label": "..." }
TOPIC_INDEX: Dict[str, Dict] = {
    # Crypto Fundamentals
    "bitcoin": {
        "terms": ["bitcoin","btc","satoshi","nakamoto","digital gold","21 million","halving","proof of work","pow","mining reward"],
        "category": "Crypto Fundamentals", "label": "Bitcoin (BTC)"
    },
    "ethereum": {
        "terms": ["ethereum","eth","vitalik","smart contract","dapp","defi platform","evm","gas fee","merge","proof of stake","pos"],
        "category": "Crypto Fundamentals", "label": "Ethereum (ETH)"
    },
    "blockchain": {
        "terms": ["blockchain","distributed ledger","immutable","decentralized","block","chain","node","consensus","transaction"],
        "category": "Crypto Fundamentals", "label": "Blockchain Technology"
    },
    "altcoins": {
        "terms": ["altcoin","altcoins","alt coin","layer 1","layer 2","l1","l2","sol","bnb","ada","xrp","avax","dot","matic","polygon"],
        "category": "Crypto Fundamentals", "label": "Altcoins"
    },
    "defi": {
        "terms": ["defi","decentralized finance","yield farming","liquidity pool","uniswap","aave","compound","dex","lending","borrowing"],
        "category": "Crypto Fundamentals", "label": "DeFi"
    },
    "nft": {
        "terms": ["nft","non fungible","non-fungible","erc721","digital art","collectible","opensea","token"],
        "category": "Crypto Fundamentals", "label": "NFTs"
    },
    "mining": {
        "terms": ["mining","miner","mine","proof of work","hash rate","hashrate","mining pool","block reward","asic"],
        "category": "Crypto Fundamentals", "label": "Crypto Mining"
    },
    "wallets": {
        "terms": ["wallet","metamask","ledger","trezor","cold wallet","hot wallet","seed phrase","private key","hardware wallet","trust wallet"],
        "category": "Crypto Fundamentals", "label": "Crypto Wallets"
    },
    # Technical Indicators
    "rsi": {
        "terms": ["rsi","relative strength index","overbought","oversold","momentum oscillator","rsi 14","rsi divergence"],
        "category": "Technical Indicators", "label": "RSI"
    },
    "macd": {
        "terms": ["macd","moving average convergence","divergence","signal line","histogram","macd crossover","macd bullish","macd bearish"],
        "category": "Technical Indicators", "label": "MACD"
    },
    "moving_averages": {
        "terms": ["moving average","ema","sma","exponential moving average","simple moving average","golden cross","death cross","200 ema","50 ema","20 ema"],
        "category": "Technical Indicators", "label": "Moving Averages"
    },
    "bollinger_bands": {
        "terms": ["bollinger","bollinger band","bb","band squeeze","upper band","lower band","standard deviation","volatility band"],
        "category": "Technical Indicators", "label": "Bollinger Bands"
    },
    "fibonacci": {
        "terms": ["fibonacci","fib","retracement","golden ratio","61.8","38.2","23.6","fib level","extension level"],
        "category": "Technical Indicators", "label": "Fibonacci"
    },
    "volume": {
        "terms": ["volume","trading volume","obv","on balance volume","vwap","volume analysis","volume spike","volume indicator"],
        "category": "Technical Indicators", "label": "Volume Analysis"
    },
    "atr": {
        "terms": ["atr","average true range","volatility","true range","stop loss atr","atr stop"],
        "category": "Technical Indicators", "label": "ATR"
    },
    "stochastic": {
        "terms": ["stochastic","stoch","k line","d line","stochastic oscillator","stochastic overbought","stochastic oversold"],
        "category": "Technical Indicators", "label": "Stochastic Oscillator"
    },
    # Strategies
    "scalping": {
        "terms": ["scalping","scalp","scalp trade","quick trade","1 minute","5 minute","fast trade","micro profit"],
        "category": "Trading Strategies", "label": "Scalping"
    },
    "swing_trading": {
        "terms": ["swing trading","swing trade","swing","days to weeks","medium term","4h chart","daily chart"],
        "category": "Trading Strategies", "label": "Swing Trading"
    },
    "breakout_trading": {
        "terms": ["breakout","break out","resistance break","support break","breakout strategy","false breakout","volume breakout"],
        "category": "Trading Strategies", "label": "Breakout Trading"
    },
    "trend_following": {
        "terms": ["trend following","trend trade","follow trend","trend strategy","ride trend","trend direction"],
        "category": "Trading Strategies", "label": "Trend Following"
    },
    "mean_reversion": {
        "terms": ["mean reversion","revert to mean","range trading","range bound","bounce strategy","oversold bounce"],
        "category": "Trading Strategies", "label": "Mean Reversion"
    },
    "pullback_strategy": {
        "terms": ["pullback","buy the dip","dip","retracement entry","dip buying","pullback entry"],
        "category": "Trading Strategies", "label": "Pullback Strategy"
    },
    "grid_trading": {
        "terms": ["grid trading","grid bot","grid strategy","grid levels","buy sell grid","automated grid"],
        "category": "Trading Strategies", "label": "Grid Trading"
    },
    "dca_smart": {
        "terms": ["dca","dollar cost averaging","dollar cost","average in","smart dca","weekly buy","regular buy"],
        "category": "Trading Strategies", "label": "DCA Strategy"
    },
    "market_making": {
        "terms": ["market making","market maker","bid ask spread","liquidity provider","provide liquidity","spread profit"],
        "category": "Professional Strategies", "label": "Market Making"
    },
    "statistical_arbitrage": {
        "terms": ["arbitrage","arb","statistical arbitrage","pairs trading","price difference","cross exchange","correlation trade"],
        "category": "Professional Strategies", "label": "Statistical Arbitrage"
    },
    # Risk Management
    "position_sizing": {
        "terms": ["position sizing","position size","how much to risk","risk per trade","lot size","trade size","kelly criterion"],
        "category": "Risk Management", "label": "Position Sizing"
    },
    "risk_reward_ratio": {
        "terms": ["risk reward","risk to reward","r:r","rr ratio","1:2","1:3","reward ratio","profit loss ratio"],
        "category": "Risk Management", "label": "Risk/Reward Ratio"
    },
    "stop_loss_professional": {
        "terms": ["stop loss","stop-loss","stoploss","trailing stop","hard stop","mental stop","stop order","cut loss"],
        "category": "Risk Management", "label": "Stop Loss"
    },
    "drawdown_management": {
        "terms": ["drawdown","max drawdown","peak to valley","account drawdown","recover drawdown","losing streak"],
        "category": "Risk Management", "label": "Drawdown Management"
    },
    "portfolio_risk": {
        "terms": ["risk management","manage risk","portfolio risk","leverage risk","risk rules","protect capital"],
        "category": "Risk Management", "label": "Risk Management"
    },
    # Psychology
    "fear_and_greed": {
        "terms": ["fear greed","fear and greed","fear greed index","market emotion","greed index","fear index"],
        "category": "Trading Psychology", "label": "Fear & Greed"
    },
    "fomo": {
        "terms": ["fomo","fear of missing out","chasing","chase pump","missed trade","fomo trade"],
        "category": "Trading Psychology", "label": "FOMO"
    },
    "revenge_trading": {
        "terms": ["revenge trading","revenge trade","emotional trade","trade after loss","angry trade","tilt"],
        "category": "Trading Psychology", "label": "Revenge Trading"
    },
    "discipline": {
        "terms": ["discipline","trading discipline","stick to plan","follow rules","trading plan","consistency"],
        "category": "Trading Psychology", "label": "Trading Discipline"
    },
    # Chart Patterns
    "head_and_shoulders": {
        "terms": ["head and shoulders","head shoulders","h&s","bearish reversal pattern","neckline"],
        "category": "Chart Patterns", "label": "Head & Shoulders"
    },
    "double_top": {
        "terms": ["double top","two peaks","double top pattern","bearish double"],
        "category": "Chart Patterns", "label": "Double Top"
    },
    "double_bottom": {
        "terms": ["double bottom","two troughs","double bottom pattern","bullish double","w pattern"],
        "category": "Chart Patterns", "label": "Double Bottom"
    },
    "cup_and_handle": {
        "terms": ["cup and handle","cup handle","rounded bottom","cup pattern"],
        "category": "Chart Patterns", "label": "Cup & Handle"
    },
    "triangle_ascending": {
        "terms": ["ascending triangle","ascending triangle pattern","flat top triangle","rising support"],
        "category": "Chart Patterns", "label": "Ascending Triangle"
    },
    "triangle_descending": {
        "terms": ["descending triangle","descending triangle pattern","flat bottom triangle","falling resistance"],
        "category": "Chart Patterns", "label": "Descending Triangle"
    },
    "wedge_rising": {
        "terms": ["rising wedge","rising wedge pattern","bearish wedge","wedge up"],
        "category": "Chart Patterns", "label": "Rising Wedge"
    },
    "wedge_falling": {
        "terms": ["falling wedge","falling wedge pattern","bullish wedge","wedge down"],
        "category": "Chart Patterns", "label": "Falling Wedge"
    },
    "flag": {
        "terms": ["flag pattern","bull flag","bear flag","flagpole","flag breakout","continuation flag"],
        "category": "Chart Patterns", "label": "Flag Pattern"
    },
    # Market Conditions
    "bull_market": {
        "terms": ["bull market","bullish market","uptrend","bull run","crypto bull","market rally"],
        "category": "Market Conditions", "label": "Bull Market"
    },
    "bear_market": {
        "terms": ["bear market","bearish market","downtrend","bear run","crypto bear","market crash","market decline"],
        "category": "Market Conditions", "label": "Bear Market"
    },
    "sideways_choppy": {
        "terms": ["sideways","choppy","ranging","range bound","consolidation","no trend","flat market"],
        "category": "Market Conditions", "label": "Sideways Market"
    },
    "high_volatility": {
        "terms": ["high volatility","volatile market","big swings","price swings","volatile","volatility spike"],
        "category": "Market Conditions", "label": "High Volatility"
    },
    # Analysis
    "support_resistance": {
        "terms": ["support","resistance","support level","resistance level","key level","price level","support resistance"],
        "category": "Market Analysis", "label": "Support & Resistance"
    },
    "market_structure": {
        "terms": ["market structure","higher high","higher low","lower high","lower low","trend structure","hh hl","lh ll"],
        "category": "Market Analysis", "label": "Market Structure"
    },
    "market_cycles": {
        "terms": ["market cycle","accumulation","distribution","markup","markdown","wyckoff","cycle phase"],
        "category": "Market Analysis", "label": "Market Cycles"
    },
    # Formulas
    "profit_calculation": {
        "terms": ["profit calculation","calculate profit","leverage profit","how much profit","pnl","p&l","profit formula"],
        "category": "Formulas", "label": "Profit Calculation"
    },
    "liquidation_price": {
        "terms": ["liquidation","liquidation price","liquidated","margin call","avoid liquidation","liq price"],
        "category": "Formulas", "label": "Liquidation Price"
    },
    # Glossary
    "hodl": {"terms": ["hodl","hold long term","buy and hold"], "category": "Glossary", "label": "HODL"},
    "fud": {"terms": ["fud","fear uncertainty doubt","negative news"], "category": "Glossary", "label": "FUD"},
    "whale": {"terms": ["whale","big holder","large holder","whale activity","whale buy","whale sell"], "category": "Glossary", "label": "Whale"},
    "pump_and_dump": {"terms": ["pump and dump","pump dump","manipulation","rug pull","scam coin"], "category": "Glossary", "label": "Pump & Dump"},
    "slippage": {"terms": ["slippage","price slippage","execution price","fill price"], "category": "Glossary", "label": "Slippage"},
    "liquidity": {"terms": ["liquidity","liquid market","illiquid","market depth","order depth"], "category": "Glossary", "label": "Liquidity"},
    # Automation
    "automated_trading_setup": {
        "terms": ["automate trading","trading bot","bot setup","build bot","automated trading","algo trading","algorithmic"],
        "category": "Automation", "label": "Automated Trading"
    },
    "business_models": {
        "terms": ["trading business","make money trading","trading income","passive income trading","trading revenue"],
        "category": "Automation", "label": "Trading Business Models"
    },
    "trading_tools": {
        "terms": ["trading tools","trading tool","tools for trading","trading software","trading platform","charting tool",
                  "screener","scanner","tradingview","coingecko","coinmarketcap","binance tools","crypto tools",
                  "technical tools","analysis tools","trading resources","trading apps","trading utilities",
                  "best tools","useful tools","tools trader","tools use","what tools","give tools","some tools"],
        "category": "Trading Resources", "label": "Trading Tools"
    },
    # Candlestick Patterns
    "candlestick_patterns": {
        "terms": ["candlestick","candle","doji","hammer","shooting star","engulfing","pin bar","marubozu",
                  "spinning top","morning star","evening star","three white soldiers","three black crows",
                  "bullish engulfing","bearish engulfing","tweezer","read candle","candle pattern",
                  "candlestick chart","japanese candle","inverted hammer","hanging man"],
        "category": "Chart Patterns", "label": "Candlestick Patterns"
    },
    # Order Types
    "order_types": {
        "terms": ["order type","limit order","market order","stop order","stop limit","oco order",
                  "take profit order","trailing stop order","fill or kill","post only","conditional order",
                  "order types","how to place order","buy order","sell order","order execution"],
        "category": "Trading Basics", "label": "Order Types"
    },
    # Leverage & Margin
    "leverage_margin": {
        "terms": ["leverage","margin","margin trading","cross margin","isolated margin","funding rate",
                  "perpetual futures","futures contract","leverage risk","how much leverage",
                  "10x leverage","5x leverage","liquidation margin","margin call","spot vs futures"],
        "category": "Trading Basics", "label": "Leverage & Margin"
    },
    # Staking & Yield
    "staking_yield": {
        "terms": ["staking","stake","yield farming","apy","apr","staking rewards","liquid staking",
                  "passive income crypto","earn crypto","staking vs yield","lido","rocket pool",
                  "validator","delegator","proof of stake reward","impermanent loss"],
        "category": "Crypto Fundamentals", "label": "Staking & Yield"
    },
    # Trading Journal
    "trading_journal": {
        "terms": ["trading journal","journal trade","trade log","track trades","record trades",
                  "trading diary","trade review","performance tracking","trading mistakes",
                  "improve trading","trading template","weekly review","trade analysis","crypto tax"],
        "category": "Trading Skills", "label": "Trading Journal"
    },
    # Backtesting
    "backtesting": {
        "terms": ["backtesting","backtest","paper trading","paper trade","test strategy","historical test",
                  "strategy validation","forward test","trading edge","trading system","build system",
                  "strategy performance","sharpe ratio","profit factor","expectancy","win rate"],
        "category": "Trading Skills", "label": "Backtesting"
    },
    # On-Chain Analysis
    "on_chain_analysis": {
        "terms": ["on chain","on-chain","onchain","nvt ratio","mvrv","sopr","realized cap",
                  "exchange inflow","exchange outflow","glassnode","cryptoquant","nansen",
                  "whale watching","fundamental analysis","blockchain data","network metrics",
                  "active addresses","hash rate","long short ratio"],
        "category": "Market Analysis", "label": "On-Chain Analysis"
    },
    # Model Self-Info
    "model_info": {
        "terms": ["who are you","what are you","about yourself","introduce yourself","trademind",
                  "trademind ai","what can you do","your capabilities","topics you cover",
                  "are you ai","how do you work","your purpose","about you","about trademind"],
        "category": "About", "label": "About TradeMind AI"
    },
}

# ── Tokenizer ─────────────────────────────────────────────────────────────────

def _tokenize(text: str) -> List[str]:
    text = text.lower()
    # keep alphanumeric + & (for r&r, h&s etc)
    tokens = re.findall(r"[a-z0-9&]+", text)
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]


def _ngrams(tokens: List[str], n: int) -> List[str]:
    return [" ".join(tokens[i:i+n]) for i in range(len(tokens)-n+1)]


def _build_query_set(query: str) -> set:
    tokens = _tokenize(query)
    terms = set(tokens)
    terms.update(_ngrams(tokens, 2))
    terms.update(_ngrams(tokens, 3))
    return terms


def _build_topic_set(topic_key: str) -> set:
    entry = TOPIC_INDEX[topic_key]
    terms = set()
    for phrase in entry["terms"]:
        toks = _tokenize(phrase)
        terms.update(toks)
        terms.update(_ngrams(toks, 2))
        terms.update(_ngrams(toks, 3))
    return terms


# Pre-build topic sets once at import time
_TOPIC_SETS: Dict[str, set] = {k: _build_topic_set(k) for k in TOPIC_INDEX}


# ── Scorer ────────────────────────────────────────────────────────────────────

def _jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union


def _overlap_score(query_set: set, topic_set: set) -> float:
    """Overlap coefficient — better for short queries."""
    if not query_set or not topic_set:
        return 0.0
    return len(query_set & topic_set) / min(len(query_set), len(topic_set))


def score_query(query: str) -> List[Tuple[str, float]]:
    """
    Returns list of (topic_key, score) sorted descending.
    Score is max(jaccard, overlap_coefficient).
    """
    q_set = _build_query_set(query)
    scores = []
    for key, t_set in _TOPIC_SETS.items():
        j = _jaccard(q_set, t_set)
        o = _overlap_score(q_set, t_set)
        score = max(j, o)
        if score > 0:
            scores.append((key, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores


# ── Public API ────────────────────────────────────────────────────────────────

ANSWER_THRESHOLD = 0.10   # above this → give answer
SUGGEST_THRESHOLD = 0.04  # above this → include in suggestions
MAX_SUGGESTIONS = 6


def resolve(query: str) -> Dict:
    """
    Returns:
      { "matched": True,  "topic": key, "score": float }   — confident answer
      { "matched": False, "suggestions": [(key, label, category, score), ...] }
    """
    scores = score_query(query)

    if scores and scores[0][1] >= ANSWER_THRESHOLD:
        best_key, best_score = scores[0]
        return {
            "matched": True,
            "topic": best_key,
            "score": best_score,
            "label": TOPIC_INDEX[best_key]["label"],
            "category": TOPIC_INDEX[best_key]["category"],
        }

    # Build suggestions from top-N above suggest threshold
    suggestions = []
    seen_categories: Dict[str, int] = {}
    for key, score in scores:
        if score < SUGGEST_THRESHOLD:
            break
        cat = TOPIC_INDEX[key]["category"]
        seen_categories[cat] = seen_categories.get(cat, 0) + 1
        if seen_categories[cat] > 2:
            continue  # max 2 per category
        suggestions.append({
            "key": key,
            "label": TOPIC_INDEX[key]["label"],
            "category": cat,
            "score": round(score, 3),
            "question": _make_question(key),
        })
        if len(suggestions) >= MAX_SUGGESTIONS:
            break

    # If no suggestions at all, return diverse defaults
    if not suggestions:
        suggestions = _default_suggestions()

    return {"matched": False, "suggestions": suggestions}


def _make_question(topic_key: str) -> str:
    label = TOPIC_INDEX[topic_key]["label"]
    cat = TOPIC_INDEX[topic_key]["category"]
    if cat in ("Technical Indicators", "Chart Patterns", "Glossary"):
        return f"What is {label}?"
    if cat == "Trading Strategies":
        return f"Explain {label} strategy"
    if cat == "Risk Management":
        return f"How to use {label}?"
    if cat == "Trading Psychology":
        return f"How to deal with {label}?"
    if cat == "Market Conditions":
        return f"How to trade in a {label}?"
    if cat == "Crypto Fundamentals":
        return f"Tell me about {label}"
    if cat == "Automation":
        return f"How to set up {label}?"
    if cat == "Trading Basics":
        return f"What is {label}?"
    if cat == "Trading Skills":
        return f"How to use {label}?"
    if cat == "Market Analysis":
        return f"Explain {label}"
    if cat == "Trading Resources":
        return f"Show me {label}"
    if cat == "About":
        return f"Tell me about {label}"
    return f"Explain {label}"


def _default_suggestions() -> List[Dict]:
    defaults = [
        "rsi", "macd", "bitcoin", "risk_reward_ratio",
        "swing_trading", "stop_loss_professional"
    ]
    return [
        {
            "key": k,
            "label": TOPIC_INDEX[k]["label"],
            "category": TOPIC_INDEX[k]["category"],
            "score": 0.0,
            "question": _make_question(k),
        }
        for k in defaults
    ]
