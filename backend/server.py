from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Galia Club Ain Sefra Management System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class PaymentType(str, Enum):
    MONTHLY = "monthly"
    YEARLY_LICENSE = "yearly_license"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

# Models
class Athlete(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Gender
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None
    belt_level: str = "White"
    join_date: datetime = Field(default_factory=datetime.utcnow)
    group_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AthleteCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Gender
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None
    belt_level: str = "White"

class Coach(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: str
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    belt_level: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CoachCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    belt_level: str

class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    coach_id: str
    max_capacity: int = 20
    current_count: int = 0
    schedule: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GroupCreate(BaseModel):
    name: str
    coach_id: str
    max_capacity: int = 20
    schedule: Optional[str] = None

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    payment_type: PaymentType
    amount: float
    currency: str = "DZD"
    due_date: datetime
    paid_date: Optional[datetime] = None
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentCreate(BaseModel):
    athlete_id: str
    payment_type: PaymentType
    due_date: Optional[datetime] = None

class DashboardStats(BaseModel):
    total_athletes: int
    active_athletes: int
    total_coaches: int
    total_groups: int
    pending_payments: int
    overdue_payments: int
    monthly_revenue: float
    yearly_license_revenue: float

# Utility functions
def get_payment_amount(payment_type: PaymentType) -> float:
    """Get payment amount based on type"""
    if payment_type == PaymentType.MONTHLY:
        return 500.0
    elif payment_type == PaymentType.YEARLY_LICENSE:
        return 300.0
    return 0.0

def calculate_due_date(payment_type: PaymentType) -> datetime:
    """Calculate due date based on payment type"""
    now = datetime.utcnow()
    if payment_type == PaymentType.MONTHLY:
        # Due in 1 month
        return now + timedelta(days=30)
    elif payment_type == PaymentType.YEARLY_LICENSE:
        # Due in 1 year
        return now + timedelta(days=365)
    return now

# Routes

# Dashboard
@api_router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    total_athletes = await db.athletes.count_documents({})
    active_athletes = await db.athletes.count_documents({"is_active": True})
    total_coaches = await db.coaches.count_documents({})
    total_groups = await db.groups.count_documents({})
    
    pending_payments = await db.payments.count_documents({"status": PaymentStatus.PENDING})
    overdue_payments = await db.payments.count_documents({
        "status": PaymentStatus.PENDING,
        "due_date": {"$lt": datetime.utcnow()}
    })
    
    # Calculate revenue
    monthly_payments = await db.payments.find({
        "payment_type": PaymentType.MONTHLY,
        "status": PaymentStatus.PAID
    }).to_list(1000)
    monthly_revenue = sum(p.get("amount", 0) for p in monthly_payments)
    
    yearly_payments = await db.payments.find({
        "payment_type": PaymentType.YEARLY_LICENSE,
        "status": PaymentStatus.PAID
    }).to_list(1000)
    yearly_license_revenue = sum(p.get("amount", 0) for p in yearly_payments)
    
    return DashboardStats(
        total_athletes=total_athletes,
        active_athletes=active_athletes,
        total_coaches=total_coaches,
        total_groups=total_groups,
        pending_payments=pending_payments,
        overdue_payments=overdue_payments,
        monthly_revenue=monthly_revenue,
        yearly_license_revenue=yearly_license_revenue
    )

# Athletes
@api_router.post("/athletes", response_model=Athlete)
async def create_athlete(athlete_data: AthleteCreate):
    athlete = Athlete(**athlete_data.dict())
    result = await db.athletes.insert_one(athlete.dict())
    
    # Create initial monthly payment
    monthly_payment = Payment(
        athlete_id=athlete.id,
        payment_type=PaymentType.MONTHLY,
        amount=get_payment_amount(PaymentType.MONTHLY),
        due_date=calculate_due_date(PaymentType.MONTHLY)
    )
    await db.payments.insert_one(monthly_payment.dict())
    
    # Create yearly license payment
    yearly_payment = Payment(
        athlete_id=athlete.id,
        payment_type=PaymentType.YEARLY_LICENSE,
        amount=get_payment_amount(PaymentType.YEARLY_LICENSE),
        due_date=calculate_due_date(PaymentType.YEARLY_LICENSE)
    )
    await db.payments.insert_one(yearly_payment.dict())
    
    return athlete

@api_router.get("/athletes", response_model=List[Athlete])
async def get_athletes(active_only: bool = Query(False)):
    query = {"is_active": True} if active_only else {}
    athletes = await db.athletes.find(query).sort("created_at", -1).to_list(1000)
    return [Athlete(**athlete) for athlete in athletes]

@api_router.get("/athletes/{athlete_id}", response_model=Athlete)
async def get_athlete(athlete_id: str):
    athlete = await db.athletes.find_one({"id": athlete_id})
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return Athlete(**athlete)

@api_router.put("/athletes/{athlete_id}", response_model=Athlete)
async def update_athlete(athlete_id: str, updates: dict):
    result = await db.athletes.update_one({"id": athlete_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    updated_athlete = await db.athletes.find_one({"id": athlete_id})
    return Athlete(**updated_athlete)

@api_router.delete("/athletes/{athlete_id}")
async def deactivate_athlete(athlete_id: str):
    result = await db.athletes.update_one({"id": athlete_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return {"message": "Athlete deactivated successfully"}

# Coaches
@api_router.post("/coaches", response_model=Coach)
async def create_coach(coach_data: CoachCreate):
    coach = Coach(**coach_data.dict())
    await db.coaches.insert_one(coach.dict())
    return coach

@api_router.get("/coaches", response_model=List[Coach])
async def get_coaches(active_only: bool = Query(False)):
    query = {"is_active": True} if active_only else {}
    coaches = await db.coaches.find(query).sort("created_at", -1).to_list(1000)
    return [Coach(**coach) for coach in coaches]

# Groups
@api_router.post("/groups", response_model=Group)
async def create_group(group_data: GroupCreate):
    # Verify coach exists
    coach = await db.coaches.find_one({"id": group_data.coach_id})
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    group = Group(**group_data.dict())
    await db.groups.insert_one(group.dict())
    return group

@api_router.get("/groups", response_model=List[Group])
async def get_groups(active_only: bool = Query(False)):
    query = {"is_active": True} if active_only else {}
    groups = await db.groups.find(query).sort("created_at", -1).to_list(1000)
    return [Group(**group) for group in groups]

@api_router.post("/groups/{group_id}/add-athlete/{athlete_id}")
async def add_athlete_to_group(group_id: str, athlete_id: str):
    # Check group exists and has capacity
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if group["current_count"] >= group["max_capacity"]:
        raise HTTPException(status_code=400, detail="Group is at maximum capacity")
    
    # Check athlete exists
    athlete = await db.athletes.find_one({"id": athlete_id})
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    # Update athlete's group
    await db.athletes.update_one({"id": athlete_id}, {"$set": {"group_id": group_id}})
    
    # Update group's current count
    await db.groups.update_one({"id": group_id}, {"$inc": {"current_count": 1}})
    
    return {"message": "Athlete added to group successfully"}

# Payments
@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate):
    # Verify athlete exists
    athlete = await db.athletes.find_one({"id": payment_data.athlete_id})
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    due_date = payment_data.due_date or calculate_due_date(payment_data.payment_type)
    
    payment = Payment(
        athlete_id=payment_data.athlete_id,
        payment_type=payment_data.payment_type,
        amount=get_payment_amount(payment_data.payment_type),
        due_date=due_date
    )
    await db.payments.insert_one(payment.dict())
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(status: Optional[PaymentStatus] = None, athlete_id: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if athlete_id:
        query["athlete_id"] = athlete_id
    
    payments = await db.payments.find(query).sort("due_date", 1).to_list(1000)
    return [Payment(**payment) for payment in payments]

@api_router.put("/payments/{payment_id}/pay")
async def mark_payment_as_paid(payment_id: str):
    result = await db.payments.update_one(
        {"id": payment_id}, 
        {"$set": {"status": PaymentStatus.PAID, "paid_date": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment marked as paid successfully"}

@api_router.get("/payments/overdue", response_model=List[Payment])
async def get_overdue_payments():
    payments = await db.payments.find({
        "status": PaymentStatus.PENDING,
        "due_date": {"$lt": datetime.utcnow()}
    }).sort("due_date", 1).to_list(1000)
    return [Payment(**payment) for payment in payments]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
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