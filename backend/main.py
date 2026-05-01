import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import explorer
import test_store

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TestRequest(BaseModel):
    title: str
    screen: str
    steps: list[str]
    expected: str
    priority: str


@app.post("/api/scan")
async def scan():
    app_name = os.getenv("APP_NAME", "bug-bazaar")

    async def event_stream():
        async for item in explorer.explore_app(app_name):
            if "error" in item:
                yield f"event: error\ndata: {json.dumps(item)}\n\n"
            else:
                yield f"data: {json.dumps(item)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/tests")
async def save_test(test: TestRequest):
    return test_store.add_test(test.model_dump())


@app.get("/api/tests")
async def get_tests():
    return test_store.get_tests()
