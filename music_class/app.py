import os
import librosa
import numpy as np
import tensorflow as tf
from tensorflow.image import resize
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
model = tf.keras.models.load_model('Trained_model.h5')

classes = ['blues', 'classical', 'country', 'disco', 'hiphop', 'jazz', 'metal', 'pop', 'reggae', 'rock']

UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'wav'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def load_and_preprocess_file(file_path, target_shape=(150, 150)):
    data = []
    audio_data, sample_rate = librosa.load(file_path, sr=None)
    chunk_duration = 4
    overlap_duration = 2
    chunk_samples = chunk_duration * sample_rate
    overlap_samples = overlap_duration * sample_rate
    
    num_chunks = int(np.ceil((len(audio_data) - chunk_samples) / (chunk_samples - overlap_samples))) + 1
    for i in range(num_chunks):
        start = i * (chunk_samples - overlap_samples)
        end = start + chunk_samples
        chunk = audio_data[start:end]

        mel_spectrogram = librosa.feature.melspectrogram(y=chunk, sr=sample_rate)
        
        mel_spectrogram = resize(np.expand_dims(mel_spectrogram, axis=-1), target_shape)
        
        data.append(mel_spectrogram)
    
    return np.array(data)

def model_prediction(X_test):
    Y_pred = model.predict(X_test)
    predicted_categories = np.argmax(Y_pred, axis=1)
    unique_elements, counts = np.unique(predicted_categories, return_counts=True)
    max_count = np.max(counts)
    max_elements = unique_elements[counts == max_count]
    return max_elements[0]

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        X_test = load_and_preprocess_file(filepath)

        class_index = model_prediction(X_test)

        return jsonify({'predicted_genre': classes[class_index]}), 200

    else:
        return jsonify({'error': 'File type not allowed. Only .wav files are allowed.'}), 400

if __name__ == '__main__':
    app.run(debug=True)
