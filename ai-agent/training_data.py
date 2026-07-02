"""
Training Data for TradeMind AI
================================
Labeled question-answer pairs used to train the ML classifier.
Each entry: (question/query text, intent_label, response_key)
"""

TRAINING_SAMPLES = [
    # ── Bitcoin ──────────────────────────────────────────────────────────────
    ("what is bitcoin", "crypto_bitcoin", "bitcoin"),
    ("tell me about bitcoin", "crypto_bitcoin", "bitcoin"),
    ("explain bitcoin", "crypto_bitcoin", "bitcoin"),
    ("what is btc", "crypto_bitcoin", "bitcoin"),
    ("how does bitcoin work", "crypto_bitcoin", "bitcoin"),
    ("who created bitcoin", "crypto_bitcoin", "bitcoin"),
    ("bitcoin supply limit", "crypto_bitcoin", "bitcoin"),
    ("what is satoshi nakamoto", "crypto_bitcoin", "bitcoin"),
    ("bitcoin halving explained", "crypto_bitcoin", "bitcoin"),
    ("is bitcoin a good investment", "crypto_bitcoin", "bitcoin"),
    ("bitcoin vs gold", "crypto_bitcoin", "bitcoin"),
    ("how many bitcoins exist", "crypto_bitcoin", "bitcoin"),

    # ── Ethereum ─────────────────────────────────────────────────────────────
    ("what is ethereum", "crypto_ethereum", "ethereum"),
    ("explain ethereum", "crypto_ethereum", "ethereum"),
    ("what is eth", "crypto_ethereum", "ethereum"),
    ("how does ethereum work", "crypto_ethereum", "ethereum"),
    ("what are smart contracts", "crypto_ethereum", "ethereum"),
    ("ethereum vs bitcoin", "crypto_ethereum", "ethereum"),
    ("what is ethereum 2.0", "crypto_ethereum", "ethereum"),
    ("what is the merge ethereum", "crypto_ethereum", "ethereum"),
    ("ethereum proof of stake", "crypto_ethereum", "ethereum"),
    ("what is gas fee ethereum", "crypto_ethereum", "ethereum"),

    # ── Blockchain ───────────────────────────────────────────────────────────
    ("what is blockchain", "crypto_blockchain", "blockchain"),
    ("explain blockchain technology", "crypto_blockchain", "blockchain"),
    ("how does blockchain work", "crypto_blockchain", "blockchain"),
    ("what is a distributed ledger", "crypto_blockchain", "blockchain"),
    ("blockchain use cases", "crypto_blockchain", "blockchain"),
    ("is blockchain secure", "crypto_blockchain", "blockchain"),
    ("what is immutability in blockchain", "crypto_blockchain", "blockchain"),

    # ── DeFi ─────────────────────────────────────────────────────────────────
    ("what is defi", "crypto_defi", "defi"),
    ("explain decentralized finance", "crypto_defi", "defi"),
    ("what is yield farming", "crypto_defi", "defi"),
    ("what is liquidity pool", "crypto_defi", "defi"),
    ("defi risks", "crypto_defi", "defi"),
    ("what is uniswap", "crypto_defi", "defi"),
    ("what is aave", "crypto_defi", "defi"),

    # ── NFT ──────────────────────────────────────────────────────────────────
    ("what is nft", "crypto_nft", "nft"),
    ("explain non fungible token", "crypto_nft", "nft"),
    ("how do nfts work", "crypto_nft", "nft"),
    ("nft use cases", "crypto_nft", "nft"),
    ("what is erc721", "crypto_nft", "nft"),

    # ── Mining ───────────────────────────────────────────────────────────────
    ("what is crypto mining", "crypto_mining", "mining"),
    ("how does bitcoin mining work", "crypto_mining", "mining"),
    ("what is proof of work", "crypto_mining", "mining"),
    ("what is proof of stake", "crypto_mining", "mining"),
    ("mining pool explained", "crypto_mining", "mining"),
    ("is mining profitable", "crypto_mining", "mining"),

    # ── Wallets ──────────────────────────────────────────────────────────────
    ("what is a crypto wallet", "crypto_wallets", "wallets"),
    ("hot wallet vs cold wallet", "crypto_wallets", "wallets"),
    ("what is metamask", "crypto_wallets", "wallets"),
    ("what is a hardware wallet", "crypto_wallets", "wallets"),
    ("how to secure crypto wallet", "crypto_wallets", "wallets"),
    ("what is a seed phrase", "crypto_wallets", "wallets"),
    ("what is private key", "crypto_wallets", "wallets"),

    # ── RSI ──────────────────────────────────────────────────────────────────
    ("what is rsi", "indicator_rsi", "rsi"),
    ("explain rsi indicator", "indicator_rsi", "rsi"),
    ("how to use rsi", "indicator_rsi", "rsi"),
    ("rsi overbought oversold", "indicator_rsi", "rsi"),
    ("rsi below 30 meaning", "indicator_rsi", "rsi"),
    ("rsi above 70 meaning", "indicator_rsi", "rsi"),
    ("relative strength index explained", "indicator_rsi", "rsi"),
    ("rsi divergence", "indicator_rsi", "rsi"),
    ("best rsi settings", "indicator_rsi", "rsi"),

    # ── MACD ─────────────────────────────────────────────────────────────────
    ("what is macd", "indicator_macd", "macd"),
    ("explain macd indicator", "indicator_macd", "macd"),
    ("how to use macd", "indicator_macd", "macd"),
    ("macd crossover signal", "indicator_macd", "macd"),
    ("macd histogram explained", "indicator_macd", "macd"),
    ("macd bullish signal", "indicator_macd", "macd"),
    ("macd bearish signal", "indicator_macd", "macd"),
    ("moving average convergence divergence", "indicator_macd", "macd"),

    # ── Moving Averages ──────────────────────────────────────────────────────
    ("what is moving average", "indicator_moving_averages", "moving_averages"),
    ("ema vs sma", "indicator_moving_averages", "moving_averages"),
    ("what is golden cross", "indicator_moving_averages", "moving_averages"),
    ("what is death cross", "indicator_moving_averages", "moving_averages"),
    ("200 ema explained", "indicator_moving_averages", "moving_averages"),
    ("exponential moving average", "indicator_moving_averages", "moving_averages"),
    ("how to use moving averages", "indicator_moving_averages", "moving_averages"),

    # ── Bollinger Bands ──────────────────────────────────────────────────────
    ("what are bollinger bands", "indicator_bollinger_bands", "bollinger_bands"),
    ("explain bollinger bands", "indicator_bollinger_bands", "bollinger_bands"),
    ("bollinger band squeeze", "indicator_bollinger_bands", "bollinger_bands"),
    ("how to trade bollinger bands", "indicator_bollinger_bands", "bollinger_bands"),
    ("bollinger bands strategy", "indicator_bollinger_bands", "bollinger_bands"),

    # ── Fibonacci ────────────────────────────────────────────────────────────
    ("what is fibonacci retracement", "indicator_fibonacci", "fibonacci"),
    ("fibonacci levels explained", "indicator_fibonacci", "fibonacci"),
    ("how to use fibonacci in trading", "indicator_fibonacci", "fibonacci"),
    ("fibonacci 61.8 level", "indicator_fibonacci", "fibonacci"),
    ("golden ratio trading", "indicator_fibonacci", "fibonacci"),

    # ── Volume ───────────────────────────────────────────────────────────────
    ("what is trading volume", "indicator_volume", "volume"),
    ("volume analysis trading", "indicator_volume", "volume"),
    ("what is obv indicator", "indicator_volume", "volume"),
    ("what is vwap", "indicator_volume", "volume"),
    ("high volume breakout", "indicator_volume", "volume"),

    # ── ATR ──────────────────────────────────────────────────────────────────
    ("what is atr", "indicator_atr", "atr"),
    ("average true range explained", "indicator_atr", "atr"),
    ("how to use atr for stop loss", "indicator_atr", "atr"),
    ("atr volatility indicator", "indicator_atr", "atr"),

    # ── Stochastic ───────────────────────────────────────────────────────────
    ("what is stochastic oscillator", "indicator_stochastic", "stochastic"),
    ("stochastic indicator explained", "indicator_stochastic", "stochastic"),
    ("stochastic overbought oversold", "indicator_stochastic", "stochastic"),

    # ── Position Sizing ──────────────────────────────────────────────────────
    ("what is position sizing", "formula_position_sizing", "position_sizing"),
    ("how to calculate position size", "formula_position_sizing", "position_sizing"),
    ("position size formula", "formula_position_sizing", "position_sizing"),
    ("how much to risk per trade", "formula_position_sizing", "position_sizing"),
    ("1 percent risk rule trading", "formula_position_sizing", "position_sizing"),

    # ── Risk Reward ──────────────────────────────────────────────────────────
    ("what is risk reward ratio", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("risk reward explained", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("1 to 2 risk reward", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("how to calculate risk reward", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("minimum risk reward ratio", "formula_risk_reward_ratio", "risk_reward_ratio"),

    # ── Profit Calculation ───────────────────────────────────────────────────
    ("how to calculate profit in trading", "formula_profit_calculation", "profit_calculation"),
    ("leverage profit calculation", "formula_profit_calculation", "profit_calculation"),
    ("how does leverage work", "formula_profit_calculation", "profit_calculation"),
    ("trading profit formula", "formula_profit_calculation", "profit_calculation"),

    # ── Liquidation ──────────────────────────────────────────────────────────
    ("what is liquidation in crypto", "formula_liquidation_price", "liquidation_price"),
    ("how to calculate liquidation price", "formula_liquidation_price", "liquidation_price"),
    ("avoid liquidation trading", "formula_liquidation_price", "liquidation_price"),
    ("margin call explained", "formula_liquidation_price", "liquidation_price"),

    # ── Fear and Greed ───────────────────────────────────────────────────────
    ("what is fear and greed index", "psychology_fear_and_greed", "fear_and_greed"),
    ("fear greed in trading", "psychology_fear_and_greed", "fear_and_greed"),
    ("how emotions affect trading", "psychology_fear_and_greed", "fear_and_greed"),
    ("trading psychology fear", "psychology_fear_and_greed", "fear_and_greed"),

    # ── FOMO ─────────────────────────────────────────────────────────────────
    ("what is fomo in trading", "psychology_fomo", "fomo"),
    ("how to avoid fomo", "psychology_fomo", "fomo"),
    ("fear of missing out crypto", "psychology_fomo", "fomo"),
    ("fomo trading mistakes", "psychology_fomo", "fomo"),

    # ── Revenge Trading ──────────────────────────────────────────────────────
    ("what is revenge trading", "psychology_revenge_trading", "revenge_trading"),
    ("how to stop revenge trading", "psychology_revenge_trading", "revenge_trading"),
    ("trading after a loss", "psychology_revenge_trading", "revenge_trading"),
    ("emotional trading mistakes", "psychology_revenge_trading", "revenge_trading"),

    # ── Discipline ───────────────────────────────────────────────────────────
    ("trading discipline tips", "psychology_discipline", "discipline"),
    ("how to be disciplined in trading", "psychology_discipline", "discipline"),
    ("stick to trading plan", "psychology_discipline", "discipline"),
    ("trading rules to follow", "psychology_discipline", "discipline"),

    # ── Chart Patterns ───────────────────────────────────────────────────────
    ("what is head and shoulders pattern", "pattern_head_and_shoulders", "head_and_shoulders"),
    ("head and shoulders trading", "pattern_head_and_shoulders", "head_and_shoulders"),
    ("bearish reversal pattern", "pattern_head_and_shoulders", "head_and_shoulders"),

    ("what is double top pattern", "pattern_double_top", "double_top"),
    ("double top trading signal", "pattern_double_top", "double_top"),

    ("what is double bottom pattern", "pattern_double_bottom", "double_bottom"),
    ("double bottom bullish signal", "pattern_double_bottom", "double_bottom"),

    ("what is cup and handle pattern", "pattern_cup_and_handle", "cup_and_handle"),
    ("cup and handle breakout", "pattern_cup_and_handle", "cup_and_handle"),

    ("ascending triangle pattern", "pattern_triangle_ascending", "triangle_ascending"),
    ("descending triangle pattern", "pattern_triangle_descending", "triangle_descending"),

    ("what is rising wedge", "pattern_wedge_rising", "wedge_rising"),
    ("what is falling wedge", "pattern_wedge_falling", "wedge_falling"),

    ("what is flag pattern", "pattern_flag", "flag"),
    ("bull flag trading", "pattern_flag", "flag"),

    # ── Strategies ───────────────────────────────────────────────────────────
    ("what is scalping", "strategy_scalping", "scalping"),
    ("scalping strategy crypto", "strategy_scalping", "scalping"),
    ("how to scalp trade", "strategy_scalping", "scalping"),

    ("what is swing trading", "strategy_swing_trading", "swing_trading"),
    ("swing trading explained", "strategy_swing_trading", "swing_trading"),
    ("swing trading vs day trading", "strategy_swing_trading", "swing_trading"),

    ("what is breakout trading", "strategy_breakout_trading", "breakout_trading"),
    ("how to trade breakouts", "strategy_breakout_trading", "breakout_trading"),
    ("false breakout explained", "strategy_breakout_trading", "breakout_trading"),

    ("what is trend following", "strategy_trend_following", "trend_following"),
    ("trend following strategy", "strategy_trend_following", "trend_following"),
    ("how to trade with the trend", "strategy_trend_following", "trend_following"),

    ("what is mean reversion", "strategy_mean_reversion", "mean_reversion"),
    ("mean reversion strategy", "strategy_mean_reversion", "mean_reversion"),

    ("what is pullback strategy", "strategy_pullback_strategy", "pullback_strategy"),
    ("buy the dip strategy", "strategy_pullback_strategy", "pullback_strategy"),
    ("retracement entry strategy", "strategy_pullback_strategy", "pullback_strategy"),

    # ── Market Conditions ────────────────────────────────────────────────────
    ("what is bull market", "market_bull_market", "bull_market"),
    ("bull market strategy", "market_bull_market", "bull_market"),

    ("what is bear market", "market_bear_market", "bear_market"),
    ("bear market strategy", "market_bear_market", "bear_market"),
    ("how to trade bear market", "market_bear_market", "bear_market"),

    ("what is sideways market", "market_sideways_choppy", "sideways_choppy"),
    ("ranging market strategy", "market_sideways_choppy", "sideways_choppy"),
    ("choppy market trading", "market_sideways_choppy", "sideways_choppy"),

    ("high volatility trading", "market_high_volatility", "high_volatility"),
    ("how to trade volatile market", "market_high_volatility", "high_volatility"),

    # ── Portfolio Management ─────────────────────────────────────────────────
    ("what is portfolio diversification", "portfolio_diversification", "diversification"),
    ("how to diversify crypto portfolio", "portfolio_diversification", "diversification"),
    ("crypto portfolio allocation", "portfolio_diversification", "diversification"),

    ("what is kelly criterion", "portfolio_kelly_criterion", "kelly_criterion"),
    ("kelly criterion formula", "portfolio_kelly_criterion", "kelly_criterion"),
    ("optimal position sizing formula", "portfolio_kelly_criterion", "kelly_criterion"),

    # ── Professional Strategies ──────────────────────────────────────────────
    ("what is market making", "pro_market_making", "market_making"),
    ("market making strategy crypto", "pro_market_making", "market_making"),
    ("how to profit from spread", "pro_market_making", "market_making"),

    ("what is grid trading", "pro_grid_trading", "grid_trading"),
    ("grid trading strategy", "pro_grid_trading", "grid_trading"),
    ("grid bot explained", "pro_grid_trading", "grid_trading"),

    ("what is dca strategy", "pro_dca_smart", "dca_smart"),
    ("dollar cost averaging explained", "pro_dca_smart", "dca_smart"),
    ("smart dca strategy", "pro_dca_smart", "dca_smart"),

    ("what is statistical arbitrage", "pro_statistical_arbitrage", "statistical_arbitrage"),
    ("pairs trading explained", "pro_statistical_arbitrage", "statistical_arbitrage"),
    ("arbitrage crypto strategy", "pro_statistical_arbitrage", "statistical_arbitrage"),

    ("what is momentum trading", "pro_momentum_following", "momentum_following"),
    ("momentum strategy crypto", "pro_momentum_following", "momentum_following"),

    # ── Automation / Business ────────────────────────────────────────────────
    ("how to automate trading", "automation_setup", "automated_trading_setup"),
    ("trading bot setup", "automation_setup", "automated_trading_setup"),
    ("how to build trading bot", "automation_setup", "automated_trading_setup"),
    ("automated trading business", "automation_setup", "automated_trading_setup"),
    ("how to make money with trading bots", "automation_business", "business_models"),
    ("trading business models", "automation_business", "business_models"),
    ("how to scale trading business", "automation_business", "scaling_business"),

    # ── Risk Management ──────────────────────────────────────────────────────
    ("what is stop loss", "risk_stop_loss", "stop_loss_professional"),
    ("how to set stop loss", "risk_stop_loss", "stop_loss_professional"),
    ("stop loss strategies", "risk_stop_loss", "stop_loss_professional"),
    ("trailing stop loss explained", "risk_stop_loss", "stop_loss_professional"),

    ("what is drawdown", "risk_drawdown", "drawdown_management"),
    ("how to manage drawdown", "risk_drawdown", "drawdown_management"),
    ("max drawdown trading", "risk_drawdown", "drawdown_management"),

    ("how to manage trading risk", "risk_portfolio", "portfolio_risk"),
    ("risk management rules", "risk_portfolio", "portfolio_risk"),
    ("leverage risk management", "risk_portfolio", "portfolio_risk"),

    # ── Market Analysis ──────────────────────────────────────────────────────
    ("what is support and resistance", "analysis_support_resistance", "support_resistance"),
    ("how to find support resistance", "analysis_support_resistance", "support_resistance"),
    ("support resistance trading", "analysis_support_resistance", "support_resistance"),

    ("what is market structure", "analysis_market_structure", "market_structure"),
    ("uptrend downtrend explained", "analysis_market_structure", "market_structure"),
    ("how to identify trend", "analysis_market_structure", "market_structure"),

    ("what is market cycle", "analysis_market_cycles", "market_cycles"),
    ("accumulation distribution phase", "analysis_market_cycles", "market_cycles"),
    ("wyckoff market cycle", "analysis_market_cycles", "market_cycles"),

    ("volume analysis trading", "analysis_volume", "volume_analysis"),
    ("how to read volume", "analysis_volume", "volume_analysis"),
    ("what is accumulation in trading", "analysis_volume", "volume_analysis"),

    # ── Glossary ─────────────────────────────────────────────────────────────
    ("what is slippage", "glossary_slippage", "slippage"),
    ("what is spread in trading", "glossary_spread", "spread"),
    ("what is liquidity", "glossary_liquidity", "liquidity"),
    ("what is order book", "glossary_order_book", "order_book"),
    ("market order vs limit order", "glossary_limit_order", "limit_order"),
    ("what is a whale in crypto", "glossary_whale", "whale"),
    ("what is pump and dump", "glossary_pump_and_dump", "pump_and_dump"),
    ("what is hodl", "glossary_hodl", "hodl"),
    ("what is fud in crypto", "glossary_fud", "fud"),
    ("what is ath in crypto", "glossary_ath", "ath"),
    ("what is altcoin", "crypto_altcoins", "altcoins"),
    ("types of cryptocurrency", "crypto_altcoins", "altcoins"),

    # ── Candlestick Patterns ─────────────────────────────────────────────────
    ("what is a doji candle", "pattern_candlestick", "candlestick_patterns"),
    ("what is a hammer candlestick", "pattern_candlestick", "candlestick_patterns"),
    ("what is a shooting star candle", "pattern_candlestick", "candlestick_patterns"),
    ("what is engulfing candle", "pattern_candlestick", "candlestick_patterns"),
    ("bullish engulfing pattern", "pattern_candlestick", "candlestick_patterns"),
    ("bearish engulfing pattern", "pattern_candlestick", "candlestick_patterns"),
    ("what is a spinning top candle", "pattern_candlestick", "candlestick_patterns"),
    ("three white soldiers pattern", "pattern_candlestick", "candlestick_patterns"),
    ("three black crows pattern", "pattern_candlestick", "candlestick_patterns"),
    ("morning star candlestick", "pattern_candlestick", "candlestick_patterns"),
    ("evening star candlestick", "pattern_candlestick", "candlestick_patterns"),
    ("how to read candlestick charts", "pattern_candlestick", "candlestick_patterns"),
    ("candlestick patterns explained", "pattern_candlestick", "candlestick_patterns"),
    ("what is a pin bar", "pattern_candlestick", "candlestick_patterns"),
    ("what is a marubozu candle", "pattern_candlestick", "candlestick_patterns"),

    # ── Order Types ──────────────────────────────────────────────────────────
    ("what is a limit order", "trading_order_types", "order_types"),
    ("what is a market order", "trading_order_types", "order_types"),
    ("what is a stop order", "trading_order_types", "order_types"),
    ("what is a stop limit order", "trading_order_types", "order_types"),
    ("what is an oco order", "trading_order_types", "order_types"),
    ("types of trading orders", "trading_order_types", "order_types"),
    ("how to place a limit order", "trading_order_types", "order_types"),
    ("difference between market and limit order", "trading_order_types", "order_types"),
    ("what is a take profit order", "trading_order_types", "order_types"),
    ("what is a conditional order", "trading_order_types", "order_types"),

    # ── Leverage & Margin ────────────────────────────────────────────────────
    ("what is leverage in trading", "trading_leverage_margin", "leverage_margin"),
    ("what is margin trading", "trading_leverage_margin", "leverage_margin"),
    ("how does leverage work", "trading_leverage_margin", "leverage_margin"),
    ("what is cross margin", "trading_leverage_margin", "leverage_margin"),
    ("what is isolated margin", "trading_leverage_margin", "leverage_margin"),
    ("leverage risks explained", "trading_leverage_margin", "leverage_margin"),
    ("how much leverage should i use", "trading_leverage_margin", "leverage_margin"),
    ("what is funding rate", "trading_leverage_margin", "leverage_margin"),
    ("perpetual futures explained", "trading_leverage_margin", "leverage_margin"),

    # ── Staking & Yield ──────────────────────────────────────────────────────
    ("what is staking crypto", "crypto_staking_yield", "staking_yield"),
    ("how does staking work", "crypto_staking_yield", "staking_yield"),
    ("what is apy in crypto", "crypto_staking_yield", "staking_yield"),
    ("staking rewards explained", "crypto_staking_yield", "staking_yield"),
    ("what is liquid staking", "crypto_staking_yield", "staking_yield"),
    ("best coins to stake", "crypto_staking_yield", "staking_yield"),
    ("staking vs yield farming", "crypto_staking_yield", "staking_yield"),
    ("what is passive income crypto", "crypto_staking_yield", "staking_yield"),

    # ── Trading Journal ──────────────────────────────────────────────────────
    ("what is a trading journal", "skill_trading_journal", "trading_journal"),
    ("how to keep a trading journal", "skill_trading_journal", "trading_journal"),
    ("why journal trades", "skill_trading_journal", "trading_journal"),
    ("trading journal template", "skill_trading_journal", "trading_journal"),
    ("how to improve trading performance", "skill_trading_journal", "trading_journal"),
    ("track trading mistakes", "skill_trading_journal", "trading_journal"),

    # ── Backtesting ──────────────────────────────────────────────────────────
    ("what is backtesting", "skill_backtesting", "backtesting"),
    ("how to backtest a strategy", "skill_backtesting", "backtesting"),
    ("backtesting explained", "skill_backtesting", "backtesting"),
    ("what is paper trading", "skill_backtesting", "backtesting"),
    ("how to test trading strategy", "skill_backtesting", "backtesting"),
    ("backtesting tools crypto", "skill_backtesting", "backtesting"),
    ("forward testing vs backtesting", "skill_backtesting", "backtesting"),

    # ── On-Chain Analysis ────────────────────────────────────────────────────
    ("what is on chain analysis", "analysis_on_chain", "on_chain_analysis"),
    ("what is nvt ratio", "analysis_on_chain", "on_chain_analysis"),
    ("what is mvrv ratio", "analysis_on_chain", "on_chain_analysis"),
    ("on chain metrics explained", "analysis_on_chain", "on_chain_analysis"),
    ("what is exchange inflow outflow", "analysis_on_chain", "on_chain_analysis"),
    ("what is realized cap", "analysis_on_chain", "on_chain_analysis"),
    ("glassnode metrics explained", "analysis_on_chain", "on_chain_analysis"),
    ("what is sopr", "analysis_on_chain", "on_chain_analysis"),

    # ── Model Self-Info ──────────────────────────────────────────────────────
    ("who are you", "model_self_info", "model_info"),
    ("what are you", "model_self_info", "model_info"),
    ("tell me about yourself", "model_self_info", "model_info"),
    ("what can you do", "model_self_info", "model_info"),
    ("what is trademind", "model_self_info", "model_info"),
    ("what is trademind ai", "model_self_info", "model_info"),
    ("how do you work", "model_self_info", "model_info"),
    ("what are your capabilities", "model_self_info", "model_info"),
    ("what topics do you cover", "model_self_info", "model_info"),
    ("are you an ai", "model_self_info", "model_info"),
    ("what kind of ai are you", "model_self_info", "model_info"),
    ("introduce yourself", "model_self_info", "model_info"),
    ("what is your purpose", "model_self_info", "model_info"),
    ("what do you know about trading", "model_self_info", "model_info"),
    ("help me understand what you can do", "model_self_info", "model_info"),

    # ── Broader / Natural Phrasings ──────────────────────────────────────────
    ("how to start trading crypto", "skill_trading_journal", "trading_journal"),
    ("best trading strategy for beginners", "strategy_swing_trading", "swing_trading"),
    ("how to read charts", "pattern_candlestick", "candlestick_patterns"),
    ("what indicators should i use", "indicator_rsi", "rsi"),
    ("how to make money in crypto", "pro_dca_smart", "dca_smart"),
    ("is crypto trading profitable", "pro_momentum_following", "momentum_following"),
    ("how to avoid losing money in trading", "risk_portfolio", "portfolio_risk"),
    ("what is the best crypto to trade", "crypto_bitcoin", "bitcoin"),
    ("how to analyze crypto market", "analysis_market_structure", "market_structure"),
    ("what is technical analysis", "analysis_market_structure", "market_structure"),
    ("what is fundamental analysis", "analysis_on_chain", "on_chain_analysis"),
    ("how to trade bitcoin", "strategy_trend_following", "trend_following"),
    ("crypto trading for beginners", "skill_backtesting", "backtesting"),
    ("how to use stop loss and take profit", "risk_stop_loss", "stop_loss_professional"),
    ("what is the best time to buy crypto", "analysis_market_cycles", "market_cycles"),
    ("how to identify trend reversal", "pattern_head_and_shoulders", "head_and_shoulders"),
    ("what is short selling", "market_bear_market", "bear_market"),
    ("how to short crypto", "market_bear_market", "bear_market"),
    ("what is a trading plan", "psychology_discipline", "discipline"),
    ("how to control emotions in trading", "psychology_fear_and_greed", "fear_and_greed"),
    ("what is overtrading", "psychology_fomo", "fomo"),
    ("how to be consistent in trading", "psychology_discipline", "discipline"),
    ("what is a good win rate", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("how to calculate win rate", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("what is expectancy in trading", "formula_risk_reward_ratio", "risk_reward_ratio"),
    ("how to use fibonacci retracement", "indicator_fibonacci", "fibonacci"),
    ("what is adx indicator", "indicator_atr", "atr"),
    ("what is ichimoku cloud", "indicator_moving_averages", "moving_averages"),
    ("what is parabolic sar", "indicator_moving_averages", "moving_averages"),
    ("what is cci indicator", "indicator_stochastic", "stochastic"),
    ("what is williams percent r", "indicator_stochastic", "stochastic"),
    ("what is the difference between futures and spot", "trading_leverage_margin", "leverage_margin"),
    ("what is a futures contract", "trading_leverage_margin", "leverage_margin"),
    ("what is an options contract", "trading_leverage_margin", "leverage_margin"),
    ("how to hedge in crypto", "risk_portfolio", "portfolio_risk"),
    ("what is correlation in trading", "pro_statistical_arbitrage", "statistical_arbitrage"),
    ("how to trade news events", "market_high_volatility", "high_volatility"),
    ("what is a trading signal", "strategy_breakout_trading", "breakout_trading"),
    ("how to use trading signals", "strategy_breakout_trading", "breakout_trading"),
    ("what is copy trading", "automation_setup", "automated_trading_setup"),
    ("what is social trading", "automation_setup", "automated_trading_setup"),
    ("what is a trading bot", "automation_setup", "automated_trading_setup"),
    ("how to choose a crypto exchange", "crypto_wallets", "wallets"),
    ("what is binance", "crypto_wallets", "wallets"),
    ("what is coinbase", "crypto_wallets", "wallets"),
    ("what is kraken exchange", "crypto_wallets", "wallets"),
    ("what is a decentralized exchange", "crypto_defi", "defi"),
    ("what is impermanent loss", "crypto_defi", "defi"),
    ("what is a rug pull", "glossary_pump_and_dump", "pump_and_dump"),
    ("what is crypto tax", "skill_trading_journal", "trading_journal"),
    ("how to report crypto taxes", "skill_trading_journal", "trading_journal"),
    ("what is a satoshi", "crypto_bitcoin", "bitcoin"),
    ("what is bitcoin dominance", "crypto_bitcoin", "bitcoin"),
    ("what is market cap", "crypto_altcoins", "altcoins"),
    ("what is circulating supply", "crypto_altcoins", "altcoins"),
    ("what is total value locked", "crypto_defi", "defi"),
    ("what is a smart contract audit", "crypto_ethereum", "ethereum"),
    ("what is layer 2 scaling", "crypto_altcoins", "altcoins"),
    ("what is polygon", "crypto_altcoins", "altcoins"),
    ("what is solana", "crypto_altcoins", "altcoins"),
    ("what is cardano", "crypto_altcoins", "altcoins"),
    ("what is ripple xrp", "crypto_altcoins", "altcoins"),
    ("what is avalanche avax", "crypto_altcoins", "altcoins"),
    ("what is polkadot", "crypto_altcoins", "altcoins"),
    ("what is chainlink", "crypto_altcoins", "altcoins"),
    ("what is a memecoin", "crypto_altcoins", "altcoins"),
    ("what is dogecoin", "crypto_altcoins", "altcoins"),
    ("what is shiba inu", "crypto_altcoins", "altcoins"),
    ("what is a stablecoin", "crypto_altcoins", "altcoins"),
    ("what is usdt tether", "crypto_altcoins", "altcoins"),
    ("what is usdc", "crypto_altcoins", "altcoins"),
    ("what is dai stablecoin", "crypto_altcoins", "altcoins"),
    ("what is crypto winter", "market_bear_market", "bear_market"),
    ("what is a crypto bull run", "market_bull_market", "bull_market"),
    ("what is bitcoin halving", "crypto_bitcoin", "bitcoin"),
    ("when is next bitcoin halving", "crypto_bitcoin", "bitcoin"),
    ("what is a crypto airdrop", "crypto_defi", "defi"),
    ("what is ico in crypto", "crypto_altcoins", "altcoins"),
    ("what is ieo in crypto", "crypto_altcoins", "altcoins"),
    ("what is dao", "crypto_defi", "defi"),
    ("what is web3", "crypto_blockchain", "blockchain"),
    ("what is metaverse crypto", "crypto_nft", "nft"),
    ("what is play to earn", "crypto_nft", "nft"),
    ("what is crypto regulation", "market_high_volatility", "high_volatility"),
    ("is crypto legal", "market_high_volatility", "high_volatility"),
    ("what is sec crypto", "market_high_volatility", "high_volatility"),
    ("what is a bitcoin etf", "market_bull_market", "bull_market"),
    ("what is institutional trading", "pro_market_making", "market_making"),
    ("how do institutions trade crypto", "pro_market_making", "market_making"),
    ("what is order flow", "analysis_volume", "volume_analysis"),
    ("what is market depth", "analysis_volume", "volume_analysis"),
    ("what is tape reading", "analysis_volume", "volume_analysis"),
    ("what is price action trading", "strategy_pullback_strategy", "pullback_strategy"),
    ("price action vs indicators", "strategy_pullback_strategy", "pullback_strategy"),
    ("what is naked trading", "strategy_pullback_strategy", "pullback_strategy"),
    ("what is wyckoff method", "analysis_market_cycles", "market_cycles"),
    ("what is smart money concept", "analysis_market_structure", "market_structure"),
    ("what is order block", "analysis_market_structure", "market_structure"),
    ("what is fair value gap", "analysis_market_structure", "market_structure"),
    ("what is liquidity sweep", "analysis_market_structure", "market_structure"),
    ("what is change of character", "analysis_market_structure", "market_structure"),
    ("what is break of structure", "analysis_market_structure", "market_structure"),
    ("smc trading explained", "analysis_market_structure", "market_structure"),
    ("what is ict trading", "analysis_market_structure", "market_structure"),
    ("what is a trading edge", "skill_backtesting", "backtesting"),
    ("how to find trading edge", "skill_backtesting", "backtesting"),
    ("what is sharpe ratio", "risk_drawdown", "drawdown_management"),
    ("what is sortino ratio", "risk_drawdown", "drawdown_management"),
    ("what is calmar ratio", "risk_drawdown", "drawdown_management"),
    ("how to measure trading performance", "risk_drawdown", "drawdown_management"),
    ("what is a trading system", "skill_backtesting", "backtesting"),
    ("how to build a trading system", "skill_backtesting", "backtesting"),
    ("what is quantitative trading", "pro_statistical_arbitrage", "statistical_arbitrage"),
    ("what is high frequency trading", "pro_market_making", "market_making"),
    ("what is algorithmic trading", "automation_setup", "automated_trading_setup"),
    ("what is a trading strategy", "strategy_trend_following", "trend_following"),
    ("how to develop a trading strategy", "skill_backtesting", "backtesting"),
    ("what is risk of ruin", "risk_portfolio", "portfolio_risk"),
    ("what is maximum adverse excursion", "risk_drawdown", "drawdown_management"),
    ("what is a trading setup", "strategy_breakout_trading", "breakout_trading"),
    ("what is confluence in trading", "strategy_breakout_trading", "breakout_trading"),
    ("what is multi timeframe analysis", "strategy_trend_following", "trend_following"),
    ("how to use multiple timeframes", "strategy_trend_following", "trend_following"),
    ("what is the best timeframe to trade", "strategy_swing_trading", "swing_trading"),
    ("what is a trading checklist", "psychology_discipline", "discipline"),
    ("how to create a trading plan", "psychology_discipline", "discipline"),
    ("what is a trading routine", "psychology_discipline", "discipline"),
    ("how to deal with trading losses", "psychology_revenge_trading", "revenge_trading"),
    ("how to recover from trading loss", "psychology_revenge_trading", "revenge_trading"),
    ("trading mindset tips", "psychology_discipline", "discipline"),
    ("how to be a profitable trader", "psychology_discipline", "discipline"),
    ("what separates winning traders from losing traders", "psychology_discipline", "discipline"),
    ("give me some trading tools", "trading_tools_info", "trading_tools"),
    ("what trading tools should i use", "trading_tools_info", "trading_tools"),
    ("best trading platforms", "trading_tools_info", "trading_tools"),
    ("what is tradingview", "trading_tools_info", "trading_tools"),
    ("trading software recommendations", "trading_tools_info", "trading_tools"),
    ("what tools do traders use", "trading_tools_info", "trading_tools"),
    ("best charting tools for crypto", "trading_tools_info", "trading_tools"),
    ("what is coingecko", "trading_tools_info", "trading_tools"),
    ("what is coinmarketcap", "trading_tools_info", "trading_tools"),
]

# All unique intent labels
INTENT_LABELS = sorted(set(label for _, label, _ in TRAINING_SAMPLES))

# Map: response_key -> which knowledge base dict to look in
RESPONSE_KEY_MAP = {
    # crypto fundamentals
    "bitcoin": ("CRYPTO_FUNDAMENTALS", "bitcoin"),
    "ethereum": ("CRYPTO_FUNDAMENTALS", "ethereum"),
    "blockchain": ("CRYPTO_FUNDAMENTALS", "blockchain"),
    "altcoins": ("CRYPTO_FUNDAMENTALS", "altcoins"),
    "defi": ("CRYPTO_FUNDAMENTALS", "defi"),
    "nft": ("CRYPTO_FUNDAMENTALS", "nft"),
    "mining": ("CRYPTO_FUNDAMENTALS", "mining"),
    "wallets": ("CRYPTO_FUNDAMENTALS", "wallets"),
    # technical indicators
    "rsi": ("TECHNICAL_INDICATORS", "rsi"),
    "macd": ("TECHNICAL_INDICATORS", "macd"),
    "moving_averages": ("TECHNICAL_INDICATORS", "moving_averages"),
    "bollinger_bands": ("TECHNICAL_INDICATORS", "bollinger_bands"),
    "volume": ("TECHNICAL_INDICATORS", "volume"),
    "fibonacci": ("TECHNICAL_INDICATORS", "fibonacci"),
    "atr": ("TECHNICAL_INDICATORS", "atr"),
    "stochastic": ("TECHNICAL_INDICATORS", "stochastic"),
    # formulas
    "position_sizing": ("EXACT_FORMULAS", "position_sizing"),
    "risk_reward_ratio": ("EXACT_FORMULAS", "risk_reward_ratio"),
    "profit_calculation": ("EXACT_FORMULAS", "profit_calculation"),
    "liquidation_price": ("EXACT_FORMULAS", "liquidation_price"),
    # psychology
    "fear_and_greed": ("TRADING_PSYCHOLOGY", "fear_and_greed"),
    "fomo": ("TRADING_PSYCHOLOGY", "fomo"),
    "revenge_trading": ("TRADING_PSYCHOLOGY", "revenge_trading"),
    "discipline": ("TRADING_PSYCHOLOGY", "discipline"),
    # chart patterns
    "head_and_shoulders": ("CHART_PATTERNS", "head_and_shoulders"),
    "inverse_head_shoulders": ("CHART_PATTERNS", "inverse_head_shoulders"),
    "double_top": ("CHART_PATTERNS", "double_top"),
    "double_bottom": ("CHART_PATTERNS", "double_bottom"),
    "cup_and_handle": ("CHART_PATTERNS", "cup_and_handle"),
    "triangle_ascending": ("CHART_PATTERNS", "triangle_ascending"),
    "triangle_descending": ("CHART_PATTERNS", "triangle_descending"),
    "wedge_rising": ("CHART_PATTERNS", "wedge_rising"),
    "wedge_falling": ("CHART_PATTERNS", "wedge_falling"),
    "flag": ("CHART_PATTERNS", "flag"),
    # strategies
    "scalping": ("TRADING_STRATEGIES", "scalping"),
    "swing_trading": ("TRADING_STRATEGIES", "swing_trading"),
    "breakout_trading": ("TRADING_STRATEGIES", "breakout_trading"),
    "trend_following": ("TRADING_STRATEGIES", "trend_following"),
    "mean_reversion": ("TRADING_STRATEGIES", "mean_reversion"),
    "pullback_strategy": ("TRADING_STRATEGIES", "pullback_strategy"),
    # market conditions
    "bull_market": ("MARKET_CONDITIONS", "bull_market"),
    "bear_market": ("MARKET_CONDITIONS", "bear_market"),
    "sideways_choppy": ("MARKET_CONDITIONS", "sideways_choppy"),
    "high_volatility": ("MARKET_CONDITIONS", "high_volatility"),
    # portfolio
    "diversification": ("PORTFOLIO_MANAGEMENT", "diversification"),
    "kelly_criterion": ("PORTFOLIO_MANAGEMENT", "kelly_criterion"),
    "risk_reward_ratio_pm": ("PORTFOLIO_MANAGEMENT", "risk_reward_ratio"),
    # professional strategies
    "market_making": ("PROFESSIONAL_STRATEGIES", "market_making"),
    "grid_trading": ("PROFESSIONAL_STRATEGIES", "grid_trading"),
    "dca_smart": ("PROFESSIONAL_STRATEGIES", "dca_smart"),
    "statistical_arbitrage": ("PROFESSIONAL_STRATEGIES", "statistical_arbitrage"),
    "momentum_following": ("PROFESSIONAL_STRATEGIES", "momentum_following"),
    # automation
    "automated_trading_setup": ("AUTOMATION_BUSINESS", "automated_trading_setup"),
    "business_models": ("AUTOMATION_BUSINESS", "business_models"),
    "scaling_business": ("AUTOMATION_BUSINESS", "scaling_business"),
    # professional risk
    "stop_loss_professional": ("PROFESSIONAL_RISK", "stop_loss_professional"),
    "drawdown_management": ("PROFESSIONAL_RISK", "drawdown_management"),
    "portfolio_risk": ("PROFESSIONAL_RISK", "portfolio_risk"),
    # professional analysis
    "support_resistance": ("PROFESSIONAL_ANALYSIS", "support_resistance"),
    "market_structure": ("PROFESSIONAL_ANALYSIS", "market_structure"),
    "market_cycles": ("PROFESSIONAL_ANALYSIS", "market_cycles"),
    "volume_analysis": ("PROFESSIONAL_ANALYSIS", "volume_analysis"),
    # glossary (inline)
    "slippage": ("GLOSSARY", "slippage"),
    "spread": ("GLOSSARY", "spread"),
    "liquidity": ("GLOSSARY", "liquidity"),
    "order_book": ("GLOSSARY", "order_book"),
    "limit_order": ("GLOSSARY", "limit_order"),
    "whale": ("GLOSSARY", "whale"),
    "pump_and_dump": ("GLOSSARY", "pump_and_dump"),
    "hodl": ("GLOSSARY", "hodl"),
    "fud": ("GLOSSARY", "fud"),
    "ath": ("GLOSSARY", "ath"),
    # new categories
    "candlestick_patterns": ("ENHANCED_KB_EXTRA", "candlestick_patterns"),
    "order_types": ("ENHANCED_KB_EXTRA", "order_types"),
    "leverage_margin": ("ENHANCED_KB_EXTRA", "leverage_margin"),
    "staking_yield": ("ENHANCED_KB_EXTRA", "staking_yield"),
    "trading_journal": ("ENHANCED_KB_EXTRA", "trading_journal"),
    "backtesting": ("ENHANCED_KB_EXTRA", "backtesting"),
    "on_chain_analysis": ("ENHANCED_KB_EXTRA", "on_chain_analysis"),
    "model_info": ("ENHANCED_KB_EXTRA", "model_info"),
    "trading_tools": ("ENHANCED_KB_EXTRA", "trading_tools"),
}
