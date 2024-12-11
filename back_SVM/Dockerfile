FROM python:3.12.2-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y gcc libc-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p models
COPY ./models/best_svm_music_genre_model.pkl ./models/

COPY svm_service.py .

EXPOSE 5001

CMD ["python", "svm_service.py"]
