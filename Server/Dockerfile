FROM python:3.9-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY server_main.py .

ENV CERTFILE="/app/ssl/${CERT_FILENAME}"
ENV KEYFILE="/app/ssl/${KEY_FILENAME}"


CMD ["python", "server_main.py"]
