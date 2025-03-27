from fastapi import FastAPI
from cities import router

app = FastAPI()

app.include_router(router.router)
