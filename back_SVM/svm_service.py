from flask import Flask, request, jsonify
import joblib
import librosa
import numpy as np
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# List of genres used in the model (the order must match with the model's training data)
genres = ["rock", "jazz", "classical", "hiphop","pop", "blues", "reggae", "metal", "disco", "country"]

def extract_features(audio_path):
    # Load the audio file
    y, sr = librosa.load(audio_path, sr=None)
    
    # Extract MFCC features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    # We can combine multiple features (e.g., MFCC, chroma, spectral contrast)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    
    # Concatenate them into one long vector
    combined_features = np.concatenate([mfcc.flatten(), chroma.flatten(), spectral_contrast.flatten()])
    
    # Ensure the features are 1200-dimensional
    if len(combined_features) > 237:
        combined_features = combined_features[:237]  # Truncate to 237
    elif len(combined_features) < 237:
        # If there are fewer than 237 features, pad with zeros (this depends on your model)
        combined_features = np.pad(combined_features, (0, 237 - len(combined_features)), 'constant')
    
    return combined_features

# Load the model
model = './models/best_svm_music_genre_model.pkl'
try:
    with open(model, "rb") as model_file:
        model = joblib.load(model_file)  # or pickle.load(model_file) if using pickle
        print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the uploaded file
        UPLOAD_FOLDER = 'uploads'

        # Ensure the upload folder exists
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        # Save the file in the uploads folder
        file = request.files['file']
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Extract features from the audio file
        features = extract_features(file_path)
        features = features.reshape(1, -1)

        # Predict the genre using the model
        predicted_genre_output = model.predict(features)[0]

        # Check if the output is an index or a genre label
        if isinstance(predicted_genre_output, (np.integer, int)):
            # If the output is an integer index, map it to the genre list
            predicted_genre = genres[predicted_genre_output]
        else:
            # If the output is a genre label (string), use it directly
            predicted_genre = predicted_genre_output

        return jsonify({"genre": predicted_genre})
    
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)})

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True, host='0.0.0.0', port=5001)
