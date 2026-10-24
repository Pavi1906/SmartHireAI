from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict

class HealthCheckDTO(BaseModel):
    service: str = Field(..., example="SmartHireAI Placement Intelligence Platform")
    version: str = Field(..., example="1.0.0")
    status: str = Field(..., example="healthy")
    timestamp: datetime
    dependencies: Dict[str, bool] = Field(..., example={"postgres": True, "redis": True})
