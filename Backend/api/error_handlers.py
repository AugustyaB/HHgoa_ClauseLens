import logging
from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from models.exceptions import (
    ClauseLensError,
    InputError,
    EmptyContractError,
    ContractTooShortError,
    ContractTooLongError,
    GeminiAPIError,
    SampleNotFoundError,
)
from api.schemas import ErrorResponse

logger = logging.getLogger("clauselens.error_handlers")

def register_error_handlers(app: FastAPI) -> None:
    """Register custom exception handlers with FastAPI application."""

    @app.exception_handler(EmptyContractError)
    async def empty_contract_handler(request: Request, exc: EmptyContractError):
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message
            ).model_dump()
        )

    @app.exception_handler(ContractTooShortError)
    async def contract_too_short_handler(request: Request, exc: ContractTooShortError):
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message
            ).model_dump()
        )

    @app.exception_handler(ContractTooLongError)
    async def contract_too_long_handler(request: Request, exc: ContractTooLongError):
        return JSONResponse(
            status_code=413,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message
            ).model_dump()
        )

    @app.exception_handler(SampleNotFoundError)
    async def sample_not_found_handler(request: Request, exc: SampleNotFoundError):
        return JSONResponse(
            status_code=404,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message
            ).model_dump()
        )

    @app.exception_handler(GeminiAPIError)
    async def gemini_api_error_handler(request: Request, exc: GeminiAPIError):
        status_code = 503
        if exc.rate_limited:
            status_code = 429
        elif exc.auth_failed:
            status_code = 401

        return JSONResponse(
            status_code=status_code,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message
            ).model_dump()
        )

    @app.exception_handler(ClauseLensError)
    async def general_domain_error_handler(request: Request, exc: ClauseLensError):
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message
            ).model_dump()
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled system error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error_code="INTERNAL_ERROR",
                message="An unexpected server error occurred."
            ).model_dump()
        )
