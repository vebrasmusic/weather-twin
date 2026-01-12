from fastapi import FastAPI
from cities import router
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint that also tests egress connectivity"""
    egress_test = {"status": "unknown", "error": None}
    try:
        response = requests.get("https://bulk.meteostat.net/", timeout=5)
        egress_test["status"] = "success" if response.status_code < 500 else "degraded"
        egress_test["status_code"] = response.status_code
    except Exception as exception:
        egress_test["status"] = "failed"
        egress_test["error"] = f"{type(exception).__name__}: {str(exception)}"

    return {
        "status": "healthy",
        "egress_to_meteostat": egress_test
    }
