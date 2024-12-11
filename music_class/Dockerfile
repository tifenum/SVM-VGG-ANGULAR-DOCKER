FROM python:3.12-slim

WORKDIR /app

RUN python -m pip install --upgrade pip

COPY requirements.txt /app/

RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir --timeout=120 -r requirements.txt
RUN pip install gunicorn

COPY Trained_model.h5 /app/

COPY app.py /app/

EXPOSE 5000 

CMD ["python", "app.py"]
