from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict

@dataclass
class ServiceHealthStatus:
    service_name: str
    version: str
    status: str
    timestamp: datetime
    dependencies: Dict[str, bool]

    @property
    def is_healthy(self) -> bool:
        return self.status == "healthy" and all(self.dependencies.values())
