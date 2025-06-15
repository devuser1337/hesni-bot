
from fastapi import FastAPI, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
from datetime import datetime, timedelta
from typing import Dict, Any
import logging
from contextlib import asynccontextmanager

from config import Config
from utils.db import db
from utils.mexc_api import mexc
from strategies.strategy_manager import strategy_manager

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db.init_db()
    logger.info("Hesni Bot démarré")
    yield
    # Shutdown
    strategy_manager.stop_all_strategies()
    logger.info("Hesni Bot arrêté")

app = FastAPI(
    title="Hesni Bot", 
    description="Bot de Trading Automatisé",
    lifespan=lifespan
)

# Templates
templates = Jinja2Templates(directory="templates")

# Routes Web (Dashboard)
@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Dashboard principal"""
    strategies = db.get_strategies()
    active_count = sum(1 for s in strategies if s['status'] == 'running')
    
    # Calculs pour le dashboard
    trades = db.get_trades(limit=1000)
    total_pnl = sum(trade.get('pnl', 0) for trade in trades)
    
    today = datetime.now().date()
    daily_trades = len([t for t in trades if datetime.fromisoformat(t['timestamp']).date() == today])
    
    balance_data = mexc.get_balance()
    balance = balance_data.get('free', {}).get('USDT', 0) if 'error' not in balance_data else 0
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "strategies": strategies,
        "active_count": active_count,
        "total_pnl": f"{total_pnl:.2f}",
        "daily_trades": daily_trades,
        "balance": f"{balance:.2f}",
        "mexc_status": mexc.is_connected
    })

# API Routes
@app.get("/api/dashboard-data")
async def get_dashboard_data():
    """Données du dashboard pour actualisation"""
    strategies = db.get_strategies()
    active_count = sum(1 for s in strategies if s['status'] == 'running')
    
    trades = db.get_trades(limit=1000)
    total_pnl = sum(trade.get('pnl', 0) for trade in trades)
    
    today = datetime.now().date()
    daily_trades = len([t for t in trades if datetime.fromisoformat(t['timestamp']).date() == today])
    
    # Vérifier la connexion MEXC en temps réel
    balance_data = mexc.get_balance()
    balance = balance_data.get('free', {}).get('USDT', 0) if 'error' not in balance_data else 0
    mexc_connected = mexc.is_connected and 'error' not in balance_data
    
    return {
        "active_count": active_count,
        "total_pnl": f"{total_pnl:.2f}",
        "daily_trades": daily_trades,
        "balance": f"{balance:.2f}",
        "mexc_status": mexc_connected
    }

@app.get("/api/strategies")
async def get_strategies():
    """Liste des stratégies"""
    strategies = db.get_strategies()
    for strategy in strategies:
        strategy['actual_status'] = strategy_manager.get_strategy_status(strategy['id'])
    return {"strategies": strategies}

@app.post("/api/strategies")
async def create_strategy(data: Dict[str, Any]):
    """Créer une nouvelle stratégie"""
    try:
        strategy_id = strategy_manager.create_strategy(
            data['name'],
            data['type'],
            data['config']
        )
        return {"success": True, "strategy_id": strategy_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/strategies/{strategy_id}/start")
async def start_strategy(strategy_id: int):
    """Démarrer une stratégie"""
    success = strategy_manager.start_strategy(strategy_id)
    if success:
        return {"success": True}
    else:
        raise HTTPException(status_code=400, detail="Impossible de démarrer la stratégie")

@app.post("/api/strategies/{strategy_id}/stop")
async def stop_strategy(strategy_id: int):
    """Arrêter une stratégie"""
    success = strategy_manager.stop_strategy(strategy_id)
    return {"success": success}

@app.get("/api/trades")
async def get_trades(strategy_id: int = None, limit: int = 100):
    """Récupérer les trades"""
    trades = db.get_trades(strategy_id, limit)
    return {"trades": trades}

@app.get("/api/logs")
async def get_logs(strategy_id: int = None, limit: int = 100):
    """Récupérer les logs"""
    logs = db.get_logs(strategy_id, limit)
    return {"logs": logs}

@app.get("/api/balance")
async def get_balance():
    """Balance MEXC"""
    return mexc.get_balance()

@app.get("/api/mexc/test")
async def test_mexc_connection():
    """Tester la connexion MEXC"""
    if not mexc.is_connected:
        return {"connected": False, "message": "Non connecté - vérifiez vos clés API"}
    
    balance = mexc.get_balance()
    if "error" in balance:
        return {"connected": False, "message": f"Erreur: {balance['error']}"}
    
    return {
        "connected": True, 
        "message": "Connexion MEXC réussie (mode réel)",
        "balance_usdt": balance.get("free", {}).get("USDT", 0)
    }

@app.get("/api/mexc/debug")
async def debug_mexc_config():
    """Debug de la configuration MEXC"""
    return {
        "api_key_set": bool(Config.MEXC_API_KEY),
        "api_key_length": len(Config.MEXC_API_KEY) if Config.MEXC_API_KEY else 0,
        "secret_key_set": bool(Config.MEXC_SECRET_KEY),
        "secret_key_length": len(Config.MEXC_SECRET_KEY) if Config.MEXC_SECRET_KEY else 0,
        "mexc_connected": mexc.is_connected,
        "keys_valid": Config.validate_api_keys(),
        "mode": "production (pas de sandbox disponible)"
    }

@app.get("/api/ticker/{symbol}")
async def get_ticker(symbol: str):
    """Prix d'un symbole"""
    return mexc.get_ticker(symbol)

@app.get("/api/orders")
async def get_open_orders(symbol: str = None):
    """Ordres ouverts"""
    return {"orders": mexc.get_open_orders(symbol)}

# Routes pour la navigation
@app.get("/strategies", response_class=HTMLResponse)
async def strategies_page(request: Request):
    """Page des stratégies"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/logs", response_class=HTMLResponse)
async def logs_page(request: Request):
    """Page des logs"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/trades", response_class=HTMLResponse)
async def trades_page(request: Request):
    """Page des trades"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

# Route de test (legacy)
@app.get("/start-grid")
async def start_grid():
    """Route de test pour compatibilité"""
    return {"message": "Utilisez le dashboard pour gérer les stratégies"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=Config.HOST,
        port=Config.PORT
    )
