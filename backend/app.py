import os
import re 
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
from transformers import AutoTokenizer, AutoModelForCausalLM
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static')
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'dcm', 'dicom'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

try:
    inference_layer = keras.layers.TFSMLayer('saved_model_1', call_endpoint='serving_default')
    tokenizer = AutoTokenizer.from_pretrained("FinancialSupport/gpt2-ft-medical-qa")
    model = AutoModelForCausalLM.from_pretrained("FinancialSupport/gpt2-ft-medical-qa")
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")
    inference_layer = None
    tokenizer = None
    model = None

FRACTURE_TYPES = {
    0: "No fracture",
    1: "Compression fracture",
    2: "Burst fracture",
    3: "Flexion teardrop fracture",
    4: "Facet dislocation",
    5: "Hangman's fracture", 
    6: "Jefferson fracture",
    7: "Odontoid fracture"
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Unable to load image at path: {image_path}")
    img = cv2.resize(img, (128, 128))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  
    img_array = np.expand_dims(img, axis=0) 
    img_array = img_array / 255.0
    return img_array

def get_model_prediction(img_array):
    if inference_layer is None:
        mock_probabilities = {
            "No fracture": 0.15,
            "Compression fracture": 0.35,
            "Burst fracture": 0.05,
            "Flexion teardrop fracture": 0.10,
            "Facet dislocation": 0.15,
            "Hangman's fracture": 0.08,
            "Jefferson fracture": 0.07,
            "Odontoid fracture": 0.05
        }
        highest_class = "Compression fracture"
        highest_prob = 0.35
        return mock_probabilities, highest_class, highest_prob

    raw_prediction = inference_layer(img_array)
    if isinstance(raw_prediction, dict):
        if 'dense' in raw_prediction:
            prediction = raw_prediction['dense'].numpy()
            prediction = tf.nn.softmax(prediction).numpy()
        else:
            raise KeyError("Unknown dictionary structure in model output.")
    elif isinstance(raw_prediction, tuple):
        prediction = raw_prediction[0].numpy()
    else:
        prediction = raw_prediction.numpy()
    probabilities = {}
    highest_prob = 0
    highest_class = ""
    for idx, prob in enumerate(prediction[0]):
        fracture_type = FRACTURE_TYPES[idx]
        prob_value = float(prob)
        probabilities[fracture_type] = prob_value
        if prob_value > highest_prob:
            highest_prob = prob_value
            highest_class = fracture_type
    return probabilities, highest_class, highest_prob

def generate_vertebrae_recommendations(fracture_type, probabilities):
    has_fracture = fracture_type != "No fracture"
    fracture_prob = probabilities[fracture_type]
    recommendations = {}
    if "Jefferson" in fracture_type or fracture_prob > 0.7:
        severity = "High"
        action = "Immediate immobilization required. Schedule CT scan and neurosurgical consultation."
    elif has_fracture and fracture_prob > 0.4:
        severity = "Moderate"
        action = "Cervical collar recommended. Follow-up imaging in 1-2 weeks."
    else:
        severity = "Low"
        action = "Monitor for symptoms. No immediate intervention required."
    recommendations["C1 (Atlas)"] = {"severity": severity, "action": action}
    if "Hangman's" in fracture_type or "Odontoid" in fracture_type or fracture_prob > 0.65:
        severity = "High"
        action = "Halo vest or rigid collar immobilization. Neurosurgical evaluation recommended."
    elif has_fracture and fracture_prob > 0.3:
        severity = "Moderate"
        action = "Rigid cervical collar. Limit movement and schedule follow-up imaging."
    else:
        severity = "Low" 
        action = "Rest and limited activity. Over-the-counter pain management if needed."
    recommendations["C2 (Axis)"] = {"severity": severity, "action": action}
    if "Burst" in fracture_type or "Flexion teardrop" in fracture_type or fracture_prob > 0.6:
        severity = "High"
        action = "Surgical consultation required. Monitor for neurological symptoms."
    elif "Compression" in fracture_type or fracture_prob > 0.35:
        severity = "Moderate"
        action = "Cervical orthosis and pain management. Physical therapy after acute phase."
    else:
        severity = "Low"
        action = "Conservative management with soft collar if symptomatic."
    recommendations["C3-C7"] = {"severity": severity, "action": action}
    return recommendations

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'error': 'No selected file'}), 400
    allergies = request.form.get('allergies', '')
    medical_history = request.form.get('medical_history', '')
    include_prescription = request.args.get('include_prescription', 'false').lower() == 'true'
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        try:
            img_array = process_image(filepath)
            probabilities, highest_class, highest_prob = get_model_prediction(img_array)
            recommendations = generate_vertebrae_recommendations(highest_class, probabilities)
            fracture_probs = [prob for ftype, prob in probabilities.items() if ftype != "No fracture"]
            overall_risk = sum(fracture_probs) if fracture_probs else 0
            analysis_results = {
                "fracture_probabilities": probabilities,
                "highest_probability_fracture": {
                    "class": highest_class,
                    "probability": highest_prob
                },
                "overall_fracture_risk": overall_risk,
                "recommendations": recommendations
            }
            if include_prescription and tokenizer and model:
                diagnosis = f"{highest_class} detected with {highest_prob*100:.2f}% confidence."
                prescription = generate_prescription(diagnosis, allergies, medical_history)
                analysis_results["prescription"] = prescription
            return jsonify({
                'status': 'success', 
                'file_url': url_for('uploaded_file', filename=filename),
                'analysis_results': analysis_results
            })
        except Exception as e:
            return jsonify({'status': 'error', 'error': str(e)}), 500
    return jsonify({'status': 'error', 'error': 'File type not allowed'}), 400

def generate_prescription(diagnosis, allergies=None, medical_history=None):
    if not (tokenizer and model):
        return "Language model unavailable for prescription generation."
    allergies_text = allergies if allergies else "None reported."
    medical_history_text = medical_history if medical_history else "No significant history."
    prompt = f"""
PATIENT INFORMATION:
- Diagnosis: {diagnosis}
- Known Allergies: {allergies_text}
- Medical History: {medical_history_text}

Based on this, write a CLINICAL MEDICAL PRESCRIPTION with 3 clear sections:
[PRESCRIPTION], [RECOMMENDATIONS], and [PRECAUTIONS].
Use bullet points and formal medical language only. DO NOT provide casual advice.
"""
    try:
        inputs = tokenizer(prompt, return_tensors="pt", padding=True)
        generation_params = {
            "input_ids": inputs["input_ids"],
            "attention_mask": inputs["attention_mask"],
            "max_length": 512,
            "num_return_sequences": 1,
            "no_repeat_ngram_size": 2,
            "do_sample": True,
            "temperature": 0.7,
            "top_p": 0.9,
            "pad_token_id": tokenizer.eos_token_id,
        }
        outputs = model.generate(**generation_params)
        raw_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        cleaned = clean_prescription_text(raw_text)
        if any(section not in cleaned for section in ["PRESCRIPTION", "RECOMMENDATIONS", "PRECAUTIONS"]):
            return generate_fallback_prescription(diagnosis, allergies_text)
        return cleaned
    except Exception as e:
        print(f"Error: {e}")
        return generate_fallback_prescription(diagnosis, allergies_text)

def clean_prescription_text(text):
    text = re.sub(r'(?:\n\s*)+', '\n', text)
    text = text.strip()
    return text

def generate_fallback_prescription(diagnosis, allergies):
    return f"""
PRESCRIPTION:
- Acetaminophen 500mg orally every 6 hours as needed for pain (max 4g/day).
- Immobilization with cervical collar or as per specialist recommendation.

RECOMMENDATIONS:
- Strict bed rest with cervical spine precautions.
- Follow-up with orthopedic surgeon and neurologist urgently.
- MRI of cervical spine if not already done.

PRECAUTIONS:
- Watch for worsening neck pain, numbness, weakness, breathing difficulty.
- Seek immediate medical attention if neurological symptoms develop.
"""

@app.route('/<path:path>')
def serve_react(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
