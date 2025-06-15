import os
from typing import Dict, Any


class Config:
    # MEXC API Configuration
    MEXC_API_KEY = os.getenv("MEXC_API_KEY", "")
    MEXC_SECRET_KEY = os.getenv("MEXC_SECRET_KEY", "")
    MEXC_SANDBOX = False  # MEXC ne supporte pas le sandbox

    # Database
    DATABASE_URL = "hesni_bot.db"
    
    # Mode simulation pour les tests avec petits montants
    SIMULATION_MODE = os.getenv("SIMULATION_MODE", "true").lower() == "true"

    # App settings
    HOST = "0.0.0.0"
    PORT = 8000
    DEBUG = True

    # Trading settings
    DEFAULT_SYMBOL = "BTC/USDT"
    MIN_ORDER_SIZE = 0.001
    MAX_POSITION_SIZE = 1000

    @classmethod
    def validate_api_keys(cls) -> bool:
        return bool(cls.MEXC_API_KEY and cls.MEXC_SECRET_KEY)
