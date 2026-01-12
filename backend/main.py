from fastapi import FastAPI
from cities import router

# No CORS needed - backend is private on Railway internal network.
# Frontend server proxies requests, so browser never hits backend directly.
app = FastAPI()

app.include_router(router.router)
