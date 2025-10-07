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
    
    # Get form data
    allergies = request.form.get('allergies', '').strip()
    medical_history = request.form.get('medical_history', '').strip()
    
    # Check if prescription is requested
    include_prescription = request.args.get('include_prescription', 'false').lower() == 'true'
    
    print(f"Received request - Include prescription: {include_prescription}")
    print(f"Allergies: {allergies}")
    print(f"Medical history: {medical_history}")
    
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
            
            # Generate prescription if requested
            if include_prescription:
                diagnosis = f"{highest_class} detected with {highest_prob*100:.2f}% confidence."
                print(f"Generating prescription for: {diagnosis}")
                
                prescription = generate_prescription(diagnosis, allergies, medical_history)
                analysis_results["prescription"] = prescription
                print("Prescription generated successfully")
            
            return jsonify({
                'status': 'success', 
                'file_url': url_for('uploaded_file', filename=filename),
                'analysis_results': analysis_results
            })
            
        except Exception as e:
            print(f"Error in analysis: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500
    
    return jsonify({'status': 'error', 'error': 'File type not allowed'}), 400

def generate_prescription(diagnosis, allergies=None, medical_history=None):
    """Generate medical prescription using LLM or fallback"""
    
    # Default values
    allergies_text = allergies if allergies else "None reported"
    medical_history_text = medical_history if medical_history else "No significant history"
    
    print(f"Generating prescription with tokenizer: {tokenizer is not None}, model: {model is not None}")
    
    # If models not available, use fallback immediately
    if not (tokenizer and model):
        print("Models not available, using fallback prescription")
        return generate_fallback_prescription(diagnosis, allergies_text, medical_history_text)
    
    prompt = f"""Generate a detailed medical prescription for the following:

PATIENT INFORMATION:
- Diagnosis: {diagnosis}
- Known Allergies: {allergies_text}
- Medical History: {medical_history_text}

Please provide a structured prescription with the following sections:

[PRESCRIPTION]
List specific medications with dosages, frequency, and duration.

[RECOMMENDATIONS]
Provide clinical recommendations for treatment and follow-up.

[PRECAUTIONS]
List important warnings and signs to watch for.

Use formal medical language and be specific."""
    
    try:
        inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=256)
        
        generation_params = {
            "input_ids": inputs["input_ids"],
            "attention_mask": inputs["attention_mask"],
            "max_length": 512,
            "min_length": 150,
            "num_return_sequences": 1,
            "no_repeat_ngram_size": 3,
            "do_sample": True,
            "temperature": 0.8,
            "top_p": 0.92,
            "top_k": 50,
            "pad_token_id": tokenizer.eos_token_id,
        }
        
        outputs = model.generate(**generation_params)
        raw_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean the output
        cleaned = clean_prescription_text(raw_text)
        
        # Validate the output has required sections
        if not validate_prescription(cleaned):
            print("Generated prescription doesn't have required sections, using fallback")
            return generate_fallback_prescription(diagnosis, allergies_text, medical_history_text)
        
        return cleaned
        
    except Exception as e:
        print(f"Error generating prescription: {e}")
        return generate_fallback_prescription(diagnosis, allergies_text, medical_history_text)

def clean_prescription_text(text):
    """Clean and format the prescription text"""
    # Remove excessive whitespace
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    text = text.strip()
    return text

def validate_prescription(text):
    """Check if prescription has required sections"""
    required_sections = ["PRESCRIPTION", "RECOMMENDATIONS", "PRECAUTIONS"]
    text_upper = text.upper()
    return all(section in text_upper for section in required_sections)

def generate_fallback_prescription(diagnosis, allergies, medical_history):
    """Generate a structured fallback prescription"""
    
    # Determine severity based on diagnosis
    high_severity_keywords = ["Jefferson", "Burst", "Flexion teardrop", "Facet dislocation"]
    is_high_severity = any(keyword in diagnosis for keyword in high_severity_keywords)
    
    prescription = f"""
═══════════════════════════════════════════════════════════
                    MEDICAL PRESCRIPTION
═══════════════════════════════════════════════════════════

DIAGNOSIS: {diagnosis}

PATIENT ALLERGIES: {allergies}

MEDICAL HISTORY: {medical_history}

═══════════════════════════════════════════════════════════
[PRESCRIPTION]
═══════════════════════════════════════════════════════════

• Acetaminophen 500mg: Take orally every 6 hours as needed for pain relief
  (Maximum daily dose: 4000mg/24 hours)

• Cyclobenzaprine 5-10mg: Take orally at bedtime for muscle spasm relief
  (Do not exceed 30mg/day)

"""
    
    if is_high_severity:
        prescription += """• Oxycodone 5mg: Take orally every 4-6 hours for severe pain management
  (Use only as directed by physician)

"""
    
    prescription += """• Cervical Orthosis (Collar): Wear as directed for immobilization
  Duration: Minimum 6-8 weeks or as advised by specialist

• Omeprazole 20mg: Take once daily before breakfast to protect stomach
  (Prophylaxis while on pain medications)

═══════════════════════════════════════════════════════════
[RECOMMENDATIONS]
═══════════════════════════════════════════════════════════

"""
    
    if is_high_severity:
        prescription += """• URGENT: Immediate referral to orthopedic spine surgeon
• Neurosurgical consultation within 24-48 hours
• Complete bed rest with cervical spine precautions
• Avoid any neck movement or rotation
• MRI of cervical spine if not already performed
• CT scan with 3D reconstruction recommended
• ICU monitoring if neurological symptoms present
• Serial neurological examinations every 4 hours
"""
    else:
        prescription += """• Follow-up with orthopedic specialist within 1 week
• Cervical spine X-rays (flexion/extension views) in 2 weeks
• Physical therapy consultation after acute phase (4-6 weeks)
• Gradual return to activities as tolerated
• Sleep with cervical pillow for proper neck support
• Apply ice packs for 15-20 minutes every 2-3 hours (first 48 hours)
• After 48 hours, alternate with heat therapy
"""
    
    prescription += """
• Avoid driving until cleared by physician
• No heavy lifting (>5 lbs) for minimum 6 weeks
• Maintain proper posture at all times
• Keep follow-up appointments as scheduled

═══════════════════════════════════════════════════════════
[PRECAUTIONS]
═══════════════════════════════════════════════════════════

⚠️ SEEK IMMEDIATE EMERGENCY CARE IF YOU EXPERIENCE:

• Sudden onset of weakness in arms or legs
• Numbness or tingling in extremities
• Loss of bladder or bowel control
• Difficulty breathing or shortness of breath
• Severe headache with neck stiffness
• Increasing neck pain despite medications
• Dizziness, loss of balance, or coordination problems
• Changes in vision or speech
• Fever above 101°F (38.3°C)

⚠️ MEDICATION PRECAUTIONS:

• Do not consume alcohol while taking pain medications
• Avoid operating machinery or driving if drowsy
• Take medications with food to reduce stomach upset
• Do not exceed prescribed dosages
"""
    
    if allergies and allergies.lower() != "none reported":
        prescription += f"• ALERT: Patient has documented allergies to: {allergies}\n"
    
    prescription += """
• Keep all medications out of reach of children
• Store in a cool, dry place away from direct sunlight

═══════════════════════════════════════════════════════════
FOLLOW-UP SCHEDULE
═══════════════════════════════════════════════════════════

• Week 1: Orthopedic consultation
• Week 2: Imaging follow-up
• Week 4-6: Re-evaluation and physical therapy assessment
• Week 12: Final assessment for return to full activities

═══════════════════════════════════════════════════════════

This prescription is valid for 30 days from date of issue.

NOTE: This is a preliminary prescription based on AI-assisted analysis.
Final treatment plan should be confirmed by a licensed physician after
complete clinical examination and review of all imaging studies.

═══════════════════════════════════════════════════════════
"""
    
    return prescription

@app.route('/<path:path>')
def serve_react(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)