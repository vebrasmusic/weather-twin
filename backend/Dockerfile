FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y gdal-bin libgdal-dev
# Install uv (used for dependency + app running)
RUN pip install uv

# Copy pyproject and lock file first for caching
COPY pyproject.toml uv.lock ./

# Install deps via uv
RUN uv pip install -r pyproject.toml --system

# Copy the rest of your app
COPY . .

# Expose FastAPI default port
EXPOSE 8000
#
CMD ["fastapi", "run", "main.py", "--port", "8000", "--proxy-headers"]

