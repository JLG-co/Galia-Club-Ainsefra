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
import asyncio
import uvicorn

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'galia_club')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI(title="Galia Club Ain Sefra Management System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class BeltLevel(str, Enum):
    WHITE = "white"
    YELLOW = "yellow"
    ORANGE = "orange"
    GREEN = "green"
    BLUE = "blue"
    BROWN = "brown"
    BLACK_1ST = "black_1st"
    BLACK_2ND = "black_2nd"
    BLACK_3RD = "black_3rd"
    BLACK_4TH = "black_4th"
    BLACK_5TH = "black_5th"

class TestStatus(str, Enum):
    SCHEDULED = "scheduled"
    PASSED = "passed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Models
class Athlete(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Gender
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_notes: Optional[str] = None
    current_belt: BeltLevel = BeltLevel.WHITE
    join_date: datetime = Field(default_factory=datetime.now)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Coach(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    specialization: Optional[str] = None
    belt_level: BeltLevel = BeltLevel.BLACK_1ST
    years_experience: Optional[int] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    coach_id: str
    schedule: Optional[str] = None
    capacity: int
    current_count: int = 0
    age_group: Optional[str] = None
    belt_level_range: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    amount: float
    payment_type: PaymentType
    due_date: datetime
    payment_date: Optional[datetime] = None
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class BeltTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    current_belt: BeltLevel
    target_belt: BeltLevel
    test_date: datetime
    examiner_id: str  # Coach ID
    status: TestStatus = TestStatus.SCHEDULED
    score: Optional[float] = None
    notes: Optional[str] = None
    requirements_met: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class BeltProgression(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    from_belt: BeltLevel
    to_belt: BeltLevel
    test_id: str
    promotion_date: datetime
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

# API Routes

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Galia Club Management System"
    }

# Dashboard
@api_router.get("/dashboard")
async def get_dashboard():
    try:
        # Get counts
        total_athletes = await db.athletes.count_documents({"is_active": True})
        active_athletes = await db.athletes.count_documents({"is_active": True})
        total_coaches = await db.coaches.count_documents({"is_active": True})
        total_groups = await db.groups.count_documents({"is_active": True})
        
        # Payment stats
        pending_payments = await db.payments.count_documents({"status": PaymentStatus.PENDING})
        overdue_payments = await db.payments.count_documents({
            "status": PaymentStatus.PENDING,
            "due_date": {"$lt": datetime.now()}
        })
        
        # Revenue calculations
        current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_year_start = datetime.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_revenue = await db.payments.aggregate([
            {"$match": {
                "status": PaymentStatus.PAID,
                "payment_date": {"$gte": current_month_start}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(length=1)
        
        yearly_license_revenue = await db.payments.aggregate([
            {"$match": {
                "status": PaymentStatus.PAID,
                "payment_type": PaymentType.YEARLY_LICENSE,
                "payment_date": {"$gte": current_year_start}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(length=1)
        
        # Belt distribution
        belt_distribution = await db.athletes.aggregate([
            {"$match": {"is_active": True}},
            {"$group": {"_id": "$current_belt", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]).to_list(length=None)
        
        # Upcoming belt tests
        upcoming_tests = await db.belt_tests.count_documents({
            "status": TestStatus.SCHEDULED,
            "test_date": {"$gte": datetime.now()}
        })
        
        return {
            "total_athletes": total_athletes,
            "active_athletes": active_athletes,
            "total_coaches": total_coaches,
            "total_groups": total_groups,
            "pending_payments": pending_payments,
            "overdue_payments": overdue_payments,
            "monthly_revenue": monthly_revenue[0]["total"] if monthly_revenue else 0,
            "yearly_license_revenue": yearly_license_revenue[0]["total"] if yearly_license_revenue else 0,
            "belt_distribution": belt_distribution,
            "upcoming_tests": upcoming_tests
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Athletes
@api_router.get("/athletes")
async def get_athletes():
    try:
        athletes = await db.athletes.find({"is_active": True}).to_list(length=None)
        return athletes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/athletes/{athlete_id}")
async def get_athlete(athlete_id: str):
    try:
        athlete = await db.athletes.find_one({"id": athlete_id, "is_active": True})
        if not athlete:
            raise HTTPException(status_code=404, detail="Athlete not found")
        return athlete
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/athletes")
async def create_athlete(athlete: Athlete):
    try:
        athlete_dict = athlete.dict()
        athlete_dict["updated_at"] = datetime.now()
        
        # Insert athlete
        await db.athletes.insert_one(athlete_dict)
        
        # Create automatic payments for new athlete
        monthly_payment = Payment(
            athlete_id=athlete.id,
            amount=500.0,
            payment_type=PaymentType.MONTHLY,
            due_date=datetime.now() + timedelta(days=30)
        )
        
        yearly_payment = Payment(
            athlete_id=athlete.id,
            amount=300.0,
            payment_type=PaymentType.YEARLY_LICENSE,
            due_date=datetime.now() + timedelta(days=365)
        )
        
        await db.payments.insert_one(monthly_payment.dict())
        await db.payments.insert_one(yearly_payment.dict())
        
        return {"message": "Athlete created successfully", "id": athlete.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/athletes/{athlete_id}")
async def update_athlete(athlete_id: str, athlete: Athlete):
    try:
        athlete_dict = athlete.dict()
        athlete_dict["updated_at"] = datetime.now()
        
        result = await db.athletes.update_one(
            {"id": athlete_id},
            {"$set": athlete_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Athlete not found")
        
        return {"message": "Athlete updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/athletes/{athlete_id}")
async def delete_athlete(athlete_id: str):
    try:
        result = await db.athletes.update_one(
            {"id": athlete_id},
            {"$set": {"is_active": False, "updated_at": datetime.now()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Athlete not found")
        
        return {"message": "Athlete deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Coaches
@api_router.get("/coaches")
async def get_coaches():
    try:
        coaches = await db.coaches.find({"is_active": True}).to_list(length=None)
        return coaches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/coaches")
async def create_coach(coach: Coach):
    try:
        coach_dict = coach.dict()
        coach_dict["updated_at"] = datetime.now()
        
        await db.coaches.insert_one(coach_dict)
        return {"message": "Coach created successfully", "id": coach.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Groups
@api_router.get("/groups")
async def get_groups():
    try:
        groups = await db.groups.find({"is_active": True}).to_list(length=None)
        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/groups")
async def create_group(group: Group):
    try:
        # Verify coach exists
        coach = await db.coaches.find_one({"id": group.coach_id, "is_active": True})
        if not coach:
            raise HTTPException(status_code=400, detail="Coach not found")
        
        group_dict = group.dict()
        group_dict["updated_at"] = datetime.now()
        
        await db.groups.insert_one(group_dict)
        return {"message": "Group created successfully", "id": group.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/groups/{group_id}/add-athlete")
async def add_athlete_to_group(group_id: str, athlete_id: str):
    try:
        # Check if group exists and has capacity
        group = await db.groups.find_one({"id": group_id, "is_active": True})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if group["current_count"] >= group["capacity"]:
            raise HTTPException(status_code=400, detail="Group is at full capacity")
        
        # Check if athlete exists
        athlete = await db.athletes.find_one({"id": athlete_id, "is_active": True})
        if not athlete:
            raise HTTPException(status_code=404, detail="Athlete not found")
        
        # Update group current count
        await db.groups.update_one(
            {"id": group_id},
            {"$inc": {"current_count": 1}, "$set": {"updated_at": datetime.now()}}
        )
        
        return {"message": "Athlete added to group successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Payments
@api_router.get("/payments")
async def get_payments(status: Optional[PaymentStatus] = None, athlete_id: Optional[str] = None):
    try:
        filter_query = {}
        if status:
            filter_query["status"] = status
        if athlete_id:
            filter_query["athlete_id"] = athlete_id
        
        payments = await db.payments.find(filter_query).to_list(length=None)
        return payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments/overdue")
async def get_overdue_payments():
    try:
        overdue_payments = await db.payments.find({
            "status": PaymentStatus.PENDING,
            "due_date": {"$lt": datetime.now()}
        }).to_list(length=None)
        return overdue_payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments")
async def create_payment(payment: Payment):
    try:
        # Verify athlete exists
        athlete = await db.athletes.find_one({"id": payment.athlete_id, "is_active": True})
        if not athlete:
            raise HTTPException(status_code=400, detail="Athlete not found")
        
        payment_dict = payment.dict()
        payment_dict["updated_at"] = datetime.now()
        
        await db.payments.insert_one(payment_dict)
        return {"message": "Payment created successfully", "id": payment.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/payments/{payment_id}/mark-paid")
async def mark_payment_paid(payment_id: str):
    try:
        result = await db.payments.update_one(
            {"id": payment_id},
            {"$set": {
                "status": PaymentStatus.PAID,
                "payment_date": datetime.now(),
                "updated_at": datetime.now()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return {"message": "Payment marked as paid"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Belt Tests
@api_router.get("/belt-tests")
async def get_belt_tests(status: Optional[TestStatus] = None):
    try:
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        tests = await db.belt_tests.find(filter_query).to_list(length=None)
        return tests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/belt-tests")
async def create_belt_test(belt_test: BeltTest):
    try:
        # Verify athlete exists
        athlete = await db.athletes.find_one({"id": belt_test.athlete_id, "is_active": True})
        if not athlete:
            raise HTTPException(status_code=400, detail="Athlete not found")
        
        # Verify examiner (coach) exists
        coach = await db.coaches.find_one({"id": belt_test.examiner_id, "is_active": True})
        if not coach:
            raise HTTPException(status_code=400, detail="Examiner not found")
        
        belt_test_dict = belt_test.dict()
        belt_test_dict["updated_at"] = datetime.now()
        
        await db.belt_tests.insert_one(belt_test_dict)
        return {"message": "Belt test scheduled successfully", "id": belt_test.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/belt-tests/{test_id}/result")
async def update_belt_test_result(test_id: str, status: TestStatus, score: Optional[float] = None, notes: Optional[str] = None):
    try:
        update_data = {
            "status": status,
            "updated_at": datetime.now()
        }
        
        if score is not None:
            update_data["score"] = score
        if notes is not None:
            update_data["notes"] = notes
        
        result = await db.belt_tests.update_one(
            {"id": test_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Belt test not found")
        
        # If test passed, update athlete's belt and create progression record
        if status == TestStatus.PASSED:
            test = await db.belt_tests.find_one({"id": test_id})
            if test:
                # Update athlete's belt
                await db.athletes.update_one(
                    {"id": test["athlete_id"]},
                    {"$set": {
                        "current_belt": test["target_belt"],
                        "updated_at": datetime.now()
                    }}
                )
                
                # Create progression record
                progression = BeltProgression(
                    athlete_id=test["athlete_id"],
                    from_belt=test["current_belt"],
                    to_belt=test["target_belt"],
                    test_id=test_id,
                    promotion_date=datetime.now()
                )
                
                await db.belt_progressions.insert_one(progression.dict())
        
        return {"message": "Belt test result updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Belt Progressions
@api_router.get("/belt-progressions")
async def get_belt_progressions(athlete_id: Optional[str] = None):
    try:
        filter_query = {}
        if athlete_id:
            filter_query["athlete_id"] = athlete_id
        
        progressions = await db.belt_progressions.find(filter_query).sort("promotion_date", -1).to_list(length=None)
        return progressions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/belt-progressions/{athlete_id}")
async def get_athlete_belt_history(athlete_id: str):
    try:
        progressions = await db.belt_progressions.find({"athlete_id": athlete_id}).sort("promotion_date", 1).to_list(length=None)
        return progressions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the API router
app.include_router(api_router)

# Health check at root
@app.get("/")
async def root():
    return {"message": "Galia Club Management System API", "status": "running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)