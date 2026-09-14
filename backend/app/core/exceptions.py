from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger

class BaseDomainException(Exception):
    """Base domain exception for SmartHireAI."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)

class EntityNotFoundException(BaseDomainException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with identifier {entity_id} was not found.",
            code="ENTITY_NOT_FOUND",
            details={"entity": entity_name, "id": str(entity_id)}
        )

class UnauthorizedException(BaseDomainException):
    def __init__(self, message: str = "Invalid credentials or token expired."):
        super().__init__(message=message, code="UNAUTHORIZED")

class ForbiddenException(BaseDomainException):
    def __init__(self, message: str = "Insufficient permissions to perform this action."):
        super().__init__(message=message, code="FORBIDDEN")

class ValidationException(BaseDomainException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, code="VALIDATION_ERROR", details=details)

async def domain_exception_handler(request: Request, exc: BaseDomainException) -> JSONResponse:
    status_map = {
        "ENTITY_NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "UNAUTHORIZED": status.HTTP_401_UNAUTHORIZED,
        "FORBIDDEN": status.HTTP_403_FORBIDDEN,
        "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
    }
    http_status = status_map.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    logger.error(f"Domain exception [{exc.code}]: {exc.message}", extra={"details": exc.details})
    
    return JSONResponse(
        status_code=http_status,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        }
    )

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred. Please contact support.",
                "details": {}
            }
        }
    )
