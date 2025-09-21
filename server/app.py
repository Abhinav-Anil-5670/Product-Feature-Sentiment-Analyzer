import os
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from datetime import datetime
from analyze import *

app = Flask(__name__)

# this is where we store our stuff
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# For the single review
@app.route("/work/single", methods=['POST'])
def work_single():
    try:
        review_text = request.form['review']
        if not review_text.strip():
            return jsonify({"error": "Review text cannot be empty."}), 400
            
        result = process_single(review_text)
        return jsonify(result)
        
    except KeyError:
        return jsonify({"error": "Missing 'review' field in form data."}), 400
    except Exception as e:
        print(f"An error occurred in /work/single: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

# for the csv upload
@app.route("/work/csv", methods=['POST'])
def work_csv():
    if 'input_csv' not in request.files:
        return "No file part in the request. Please select a CSV file.", 400
    
    uploaded_file = request.files['input_csv']
    
    if uploaded_file.filename == '':
        return "No file selected. Please select a CSV file.", 400

    if uploaded_file and uploaded_file.filename.endswith('.csv'):
        original_filename = secure_filename(uploaded_file.filename)
        name, ext = os.path.splitext(original_filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}{ext}"
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        uploaded_file.save(input_path)
        
        output_filename = f"processed_{name}_{timestamp}{ext}"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        review_column = request.form.get('review_column', 'review')
    
        try:
            process_dataset(input_path, output_path, review_column_name=review_column)
            return send_file(output_path, as_attachment=True, download_name=output_filename)
            
        except Exception as e:
            print(f"An error occurred during CSV processing: {e}")
            return f"An error occurred during processing: {e}", 500
    else:
        return "Invalid file type. Please upload a .csv file.", 400

if __name__ == '__main__':
    app.run(debug=True)
