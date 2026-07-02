"""
Exchange Executor - Automated Trading via Binance, OKX, Bybit APIs
Handles: place orders, monitor P&L, auto stop-loss / take-profit
"""

import asyncio
import aiohttp
import hmac
import hashlib
import time
import json
from typing import Optional, Dict, Any
from urllib.parse import urlencode


# ── Binance Executor ──────────────────────────────────────────────────────────

class BinanceExecutor:
    BASE = "https://api.binance.com"
    TESTNET = "https://testnet.binance.vision"

    def __init__(self, api_key: str, api_secret: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = self.TESTNET if testnet else self.BASE

    def _sign(self, params: dict) -> str:
        query = urlencode(params)
        return hmac.new(self.api_secret.encode(), query.encode(), hashlib.sha256).hexdigest()

    def _headers(self) -> dict:
        return {"X-MBX-APIKEY": self.api_key}

    async def get_account(self) -> Dict:
        params = {"timestamp": int(time.time() * 1000)}
        params["signature"] = self._sign(params)
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{self.base_url}/api/v3/account", params=params, headers=self._headers()) as r:
                return await r.json()

    async def get_price(self, symbol: str) -> float:
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{self.base_url}/api/v3/ticker/price", params={"symbol": symbol}) as r:
                data = await r.json()
                return float(data["price"])

    async def place_order(self, symbol: str, side: str, order_type: str,
                          quantity: float, price: Optional[float] = None,
                          stop_loss: Optional[float] = None,
                          take_profit: Optional[float] = None) -> Dict:
        params: Dict[str, Any] = {
            "symbol": symbol.replace("/", "").upper(),
            "side": side.upper(),
            "type": order_type.upper(),
            "quantity": quantity,
            "timestamp": int(time.time() * 1000),
        }
        if order_type.upper() == "LIMIT" and price:
            params["price"] = price
            params["timeInForce"] = "GTC"

        params["signature"] = self._sign(params)
        async with aiohttp.ClientSession() as s:
            async with s.post(f"{self.base_url}/api/v3/order", params=params, headers=self._headers()) as r:
                result = await r.json()

        # Place OCO (stop-loss + take-profit) if provided
        if stop_loss and take_profit and result.get("orderId"):
            await self._place_oco(symbol, side, quantity, stop_loss, take_profit)

        return result

    async def _place_oco(self, symbol: str, side: str, quantity: float,
                         stop_loss: float, take_profit: float) -> Dict:
        close_side = "SELL" if side.upper() == "BUY" else "BUY"
        params: Dict[str, Any] = {
            "symbol": symbol.replace("/", "").upper(),
            "side": close_side,
            "quantity": quantity,
            "price": take_profit,
            "stopPrice": stop_loss,
            "stopLimitPrice": stop_loss * (0.999 if close_side == "SELL" else 1.001),
            "stopLimitTimeInForce": "GTC",
            "timestamp": int(time.time() * 1000),
        }
        params["signature"] = self._sign(params)
        async with aiohttp.ClientSession() as s:
            async with s.post(f"{self.base_url}/api/v3/order/oco", params=params, headers=self._headers()) as r:
                return await r.json()

    async def cancel_order(self, symbol: str, order_id: int) -> Dict:
        params = {
            "symbol": symbol.replace("/", "").upper(),
            "orderId": order_id,
            "timestamp": int(time.time() * 1000),
        }
        params["signature"] = self._sign(params)
        async with aiohttp.ClientSession() as s:
            async with s.delete(f"{self.base_url}/api/v3/order", params=params, headers=self._headers()) as r:
                return await r.json()

    async def get_open_orders(self, symbol: Optional[str] = None) -> list:
        params: Dict[str, Any] = {"timestamp": int(time.time() * 1000)}
        if symbol:
            params["symbol"] = symbol.replace("/", "").upper()
        params["signature"] = self._sign(params)
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{self.base_url}/api/v3/openOrders", params=params, headers=self._headers()) as r:
                return await r.json()


# ── OKX Executor ──────────────────────────────────────────────────────────────

class OKXExecutor:
    BASE = "https://www.okx.com"

    def __init__(self, api_key: str, api_secret: str, passphrase: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.passphrase = passphrase
        self.flag = "1" if testnet else "0"

    def _sign(self, timestamp: str, method: str, path: str, body: str = "") -> str:
        msg = timestamp + method.upper() + path + body
        return hmac.new(self.api_secret.encode(), msg.encode(), hashlib.sha256).digest().hex()

    def _headers(self, method: str, path: str, body: str = "") -> dict:
        ts = str(time.time())
        return {
            "OK-ACCESS-KEY": self.api_key,
            "OK-ACCESS-SIGN": self._sign(ts, method, path, body),
            "OK-ACCESS-TIMESTAMP": ts,
            "OK-ACCESS-PASSPHRASE": self.passphrase,
            "x-simulated-trading": self.flag,
            "Content-Type": "application/json",
        }

    async def get_price(self, inst_id: str) -> float:
        path = f"/api/v5/market/ticker?instId={inst_id}"
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{self.BASE}{path}") as r:
                data = await r.json()
                return float(data["data"][0]["last"])

    async def place_order(self, inst_id: str, side: str, order_type: str,
                          size: str, price: Optional[str] = None,
                          stop_loss: Optional[str] = None,
                          take_profit: Optional[str] = None) -> Dict:
        path = "/api/v5/trade/order"
        body_dict: Dict[str, Any] = {
            "instId": inst_id,
            "tdMode": "cash",
            "side": side.lower(),
            "ordType": "market" if order_type.lower() == "market" else "limit",
            "sz": size,
        }
        if price:
            body_dict["px"] = price
        if stop_loss:
            body_dict["slTriggerPx"] = stop_loss
            body_dict["slOrdPx"] = "-1"
        if take_profit:
            body_dict["tpTriggerPx"] = take_profit
            body_dict["tpOrdPx"] = "-1"

        body = json.dumps(body_dict)
        async with aiohttp.ClientSession() as s:
            async with s.post(f"{self.BASE}{path}", data=body, headers=self._headers("POST", path, body)) as r:
                return await r.json()

    async def get_positions(self) -> list:
        path = "/api/v5/account/positions"
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{self.BASE}{path}", headers=self._headers("GET", path)) as r:
                data = await r.json()
                return data.get("data", [])


# ── Bybit Executor ────────────────────────────────────────────────────────────

class BybitExecutor:
    BASE = "https://api.bybit.com"
    TESTNET = "https://api-testnet.bybit.com"

    def __init__(self, api_key: str, api_secret: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = self.TESTNET if testnet else self.BASE

    def _sign(self, params: dict) -> str:
        query = urlencode(sorted(params.items()))
        return hmac.new(self.api_secret.encode(), query.encode(), hashlib.sha256).hexdigest()

    async def get_price(self, symbol: str) -> float:
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{self.base_url}/v5/market/tickers", params={"category": "spot", "symbol": symbol}) as r:
                data = await r.json()
                return float(data["result"]["list"][0]["lastPrice"])

    async def place_order(self, symbol: str, side: str, order_type: str,
                          qty: str, price: Optional[str] = None,
                          stop_loss: Optional[str] = None,
                          take_profit: Optional[str] = None) -> Dict:
        params: Dict[str, Any] = {
            "category": "spot",
            "symbol": symbol.replace("/", "").upper(),
            "side": side.capitalize(),
            "orderType": order_type.capitalize(),
            "qty": qty,
            "timestamp": str(int(time.time() * 1000)),
            "api_key": self.api_key,
        }
        if price:
            params["price"] = price
        if stop_loss:
            params["stopLoss"] = stop_loss
        if take_profit:
            params["takeProfit"] = take_profit

        params["sign"] = self._sign(params)
        async with aiohttp.ClientSession() as s:
            async with s.post(f"{self.base_url}/v5/order/create", json=params) as r:
                return await r.json()


# ── Auto Trade Monitor ────────────────────────────────────────────────────────

class AutoTradeMonitor:
    """
    Background monitor: checks open positions every interval,
    auto-closes on stop-loss hit or take-profit hit.
    """

    def __init__(self, executor, interval_seconds: int = 30):
        self.executor = executor
        self.interval = interval_seconds
        self.watched: Dict[str, Dict] = {}  # symbol -> {qty, stop_loss, take_profit, side, order_id}
        self._running = False

    def watch(self, symbol: str, qty: float, stop_loss: float,
              take_profit: float, side: str, order_id: Optional[int] = None):
        self.watched[symbol] = {
            "qty": qty, "stop_loss": stop_loss,
            "take_profit": take_profit, "side": side, "order_id": order_id,
        }

    def unwatch(self, symbol: str):
        self.watched.pop(symbol, None)

    async def _check_once(self):
        for symbol, info in list(self.watched.items()):
            try:
                price = await self.executor.get_price(symbol)
                side = info["side"].upper()
                hit_sl = (side == "BUY" and price <= info["stop_loss"]) or \
                         (side == "SELL" and price >= info["stop_loss"])
                hit_tp = (side == "BUY" and price >= info["take_profit"]) or \
                         (side == "SELL" and price <= info["take_profit"])

                if hit_sl or hit_tp:
                    reason = "stop_loss" if hit_sl else "take_profit"
                    close_side = "SELL" if side == "BUY" else "BUY"
                    await self.executor.place_order(symbol, close_side, "MARKET", info["qty"])
                    self.unwatch(symbol)
                    print(f"[AutoMonitor] {symbol} closed at {price} — {reason}")
            except Exception as e:
                print(f"[AutoMonitor] Error checking {symbol}: {e}")

    async def run(self):
        self._running = True
        while self._running:
            await self._check_once()
            await asyncio.sleep(self.interval)

    def stop(self):
        self._running = False


# ── Factory ───────────────────────────────────────────────────────────────────

def create_executor(exchange: str, api_key: str, api_secret: str,
                    passphrase: str = "", testnet: bool = False):
    exchange = exchange.lower()
    if exchange == "binance":
        return BinanceExecutor(api_key, api_secret, testnet)
    elif exchange == "okx":
        return OKXExecutor(api_key, api_secret, passphrase, testnet)
    elif exchange == "bybit":
        return BybitExecutor(api_key, api_secret, testnet)
    else:
        raise ValueError(f"Unsupported exchange: {exchange}")
