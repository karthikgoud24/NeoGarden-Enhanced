from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Garden Models
class PlantData(BaseModel):
    id: int
    name: str
    icon: str
    modelType: str
    category: str
    height: float
    spread: float
    position: dict  # {x, y, z}
    rotation: dict  # {x, y, z}
    color: str
    foliageColor: str

class AreaConfig(BaseModel):
    area: float  # in square meters
    unit: str  # 'm' or 'ft'

class Garden(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    areaConfig: AreaConfig
    landShape: list  # List of points (polygons)
    plants: List[PlantData]

class GardenCreate(BaseModel):
    name: str
    areaConfig: AreaConfig
    landShape: list
    plants: List[PlantData]

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Garden Endpoints
@api_router.post("/gardens", response_model=Garden)
async def create_garden(garden: GardenCreate):
    """Save a garden design"""
    garden_obj = Garden(**garden.model_dump())
    
    doc = garden_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    doc['areaConfig'] = garden.areaConfig.model_dump()
    
    result = await db.gardens.insert_one(doc)
    garden_obj.id = str(result.inserted_id) if hasattr(result, 'inserted_id') else garden_obj.id
    
    return garden_obj

@api_router.get("/gardens", response_model=List[Garden])
async def get_gardens():
    """Get all saved gardens"""
    gardens = await db.gardens.find({}, {"_id": 0}).to_list(1000)
    
    for garden in gardens:
        if isinstance(garden.get('timestamp'), str):
            garden['timestamp'] = datetime.fromisoformat(garden['timestamp'])
    
    return gardens

@api_router.get("/gardens/{garden_id}", response_model=Garden)
async def get_garden(garden_id: str):
    """Get a specific garden by ID"""
    garden = await db.gardens.find_one({"id": garden_id}, {"_id": 0})
    
    if not garden:
        return {"error": "Garden not found"}
    
    if isinstance(garden.get('timestamp'), str):
        garden['timestamp'] = datetime.fromisoformat(garden['timestamp'])
    
    return garden

@api_router.delete("/gardens/{garden_id}")
async def delete_garden(garden_id: str):
    """Delete a garden"""
    result = await db.gardens.delete_one({"id": garden_id})
    
    if result.deleted_count == 0:
        return {"error": "Garden not found"}
    
    return {"message": "Garden deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()