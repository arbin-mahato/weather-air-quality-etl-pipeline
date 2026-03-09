import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration for the Visual Crossing API
class Config:
    VISUALCROSSING_API_KEY = os.getenv("VISUALCROSSING_API_KEY")
    AIRVISUAL_API_KEY = os.getenv("AIRVISUAL_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")

    # Date range for all cities
    DEFAULT_START_DATE = os.getenv("DEFAULT_START_DATE", "2024-06-03")
    DEFAULT_END_DATE   = os.getenv("DEFAULT_END_DATE",   "2024-09-03")

    # Cities list parsed from .env
    # Format: name|location|name|location|...  (pipe-delimited, pairs)
    # Returns list of dicts: [{"name": ..., "location": ...}, ...]
    @staticmethod
    def get_cities():
        raw = os.getenv("CITIES", "Ioannina|Ioannina,Greece")
        tokens = [t.strip() for t in raw.split("|") if t.strip()]
        return [
            {"name": tokens[i], "location": tokens[i + 1]}
            for i in range(0, len(tokens) - 1, 2)
        ]

