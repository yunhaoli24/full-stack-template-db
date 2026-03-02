"""Chat API v1 package."""

from fastapi import APIRouter

from backend.app.admin.api.v1.chat.completions import router as completions_router


router: APIRouter = APIRouter(prefix="/chat")

router.include_router(completions_router, tags=["GPT Chat"])
