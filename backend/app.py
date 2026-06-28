from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import torch
import os
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForSequenceClassification

load_dotenv()

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

MODEL_DIR = "distilbert_fakenews_final"

LABEL_NAMES = {
    0: "Fake News",
    1: "Real News"
}


print("=" * 60)
print("Loading DistilBERT Model...")
print("=" * 60)

device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

model.to(device)
model.eval()

print(f"✅ Model loaded successfully on {device}")
print("=" * 60)


def predict_text(text):

    inputs = tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=256,
        return_tensors="pt"
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    # DistilBERT doesn't use token_type_ids
    inputs.pop("token_type_ids", None)

    with torch.no_grad():

        outputs = model(**inputs)

        probabilities = torch.softmax(outputs.logits, dim=1)[0]

        prediction = torch.argmax(probabilities).item()

    label = LABEL_NAMES[prediction]

    confidence = {
        LABEL_NAMES[i]: probabilities[i].item()
        for i in range(len(probabilities))
    }

    return label, confidence


@app.route("/")
def home():
    return "Fake News Detection API Running"


@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON received"}), 400

        if "text" not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data["text"].strip()

        if text == "":
            return jsonify({"error": "Text is empty"}), 400

        label, confidence = predict_text(text)

        print("\n" + "=" * 60)
        print("Prediction Request")
        print("=" * 60)
        print("Input:")
        print(text)
        print("-" * 60)
        print("Prediction :", label)
        print("Confidence :", confidence)
        print("=" * 60 + "\n")

        return jsonify({
            "prediction": label,
            "confidence": confidence
        })

    except Exception as e:

        print("Prediction Error:", e)

        return jsonify({
            "error": str(e)
        }), 500


@app.route("/live-feed", methods=["GET"])
def live_feed():

    try:

        response = requests.get(
            "https://newsapi.org/v2/top-headlines",
            params={
                "sources": ",".join([
                    "bbc-news",
                    "cnn",
                    "reuters",
                    "the-hindu",
                    "google-news-in",
                    "the-times-of-india"
                ]),
                "pageSize": 30,
                "apiKey": NEWS_API_KEY
            },
            timeout=10
        )

        response.raise_for_status()

        return jsonify(response.json())

    except Exception as e:

        print("News API Error:", e)

        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
