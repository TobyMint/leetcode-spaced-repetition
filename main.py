"""FastAPI 后端入口。"""

from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

import database


@asynccontextmanager
async def lifespan(app):
    database.init_db()
    yield


app = FastAPI(title="LeetCode Spaced Repetition", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件
STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ---------- Pydantic Models ----------

class ReviewRequest(BaseModel):
    quality: int  # 0-5

class AddProblemRequest(BaseModel):
    title: str
    difficulty: str
    category: str = ""
    url: str = ""

class SettingsRequest(BaseModel):
    new_per_day: int | None = None
    max_review_per_day: int | None = None
    mastered_consecutive: int | None = None
    mastered_interval: int | None = None


# ---------- Routes ----------

@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))


@app.get("/api/problems")
def list_problems():
    return database.get_all_problems()


@app.get("/api/problems/{problem_id}")
def get_problem(problem_id: int):
    p = database.get_problem(problem_id)
    if not p:
        raise HTTPException(404, "Problem not found")
    return p


@app.get("/api/today")
def today_problems():
    settings = database.get_settings()
    new_per_day = int(settings.get("new_per_day", 3))
    max_review = int(settings.get("max_review_per_day", 10))
    return database.get_today_problems(new_per_day, max_review)


@app.post("/api/review/{problem_id}")
def review_problem(problem_id: int, req: ReviewRequest):
    if not (0 <= req.quality <= 5):
        raise HTTPException(400, "Quality must be 0-5")
    try:
        return database.submit_review(problem_id, req.quality)
    except ValueError as e:
        raise HTTPException(404, str(e))


@app.post("/api/problems")
def add_problem(req: AddProblemRequest):
    return database.add_problem(req.title, req.difficulty, req.category, req.url)


@app.delete("/api/problems/{problem_id}")
def delete_problem(problem_id: int):
    if not database.delete_problem(problem_id):
        raise HTTPException(400, "Cannot delete preset problem or not found")
    return {"ok": True}


@app.post("/api/problems/{problem_id}/reset")
def reset_problem(problem_id: int):
    if not database.reset_progress(problem_id):
        raise HTTPException(404, "Problem not found")
    return {"ok": True}


@app.get("/api/stats")
def stats():
    return database.get_stats()


@app.get("/api/calendar")
def calendar():
    return database.get_calendar_data()


@app.get("/api/settings")
def get_settings():
    return database.get_settings()


@app.put("/api/settings")
def update_settings(req: SettingsRequest):
    data = {k: v for k, v in req.model_dump().items() if v is not None}
    return database.update_settings(data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=19999)
