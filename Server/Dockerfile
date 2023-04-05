FROM python:3.9-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY server_main.py .

ENV CERTFILE="/app/ssl/"
ENV KEYFILE="/app/ssl/"


CMD ["python", "server_main.py", "> /app/log.txt"]
