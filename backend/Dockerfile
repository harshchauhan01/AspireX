# =============================================================
# Stage 1 – dependency builder
# =============================================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Compile-time OS deps (psycopg2 native, cryptography, etc.)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Isolated virtualenv keeps the runtime stage clean
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    # daphne: official Django Channels ASGI server (HTTP + WebSocket)
    && pip install --no-cache-dir daphne

# =============================================================
# Stage 2 – lean runtime image
# =============================================================
FROM python:3.12-slim AS runtime

# Only runtime OS dep needed by psycopg2
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Pull in the complete virtualenv from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Deterministic Python behaviour in containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Non-root user – principle of least privilege
RUN useradd --create-home --uid 1000 appuser

COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

ENTRYPOINT ["sh", "entrypoint.sh"]
