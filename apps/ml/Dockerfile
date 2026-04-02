FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY apps/ml/requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

COPY packages/ /app/packages/
COPY apps/api/ /app/apps/api/
COPY apps/ml/ /app/apps/ml/

ENV PYTHONPATH=/app

EXPOSE 8001

CMD ["uvicorn", "apps.ml.serve:app", "--host", "0.0.0.0", "--port", "8001"]
