from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from dotenv import load_dotenv

import os
import re
import requests
import torch
import trafilatura

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

app = Flask(__name__)
CORS(app)


MODEL_DIR = "distilbert_fakenews_final"

LABEL_NAMES = {
    1: "Real News",
    0: "Fake News"
}

print("=" * 60)
print("Loading DistilBERT Model...")
print("=" * 60)

device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

model.to(device)
model.eval()

print(f"Model Loaded Successfully on {device}")
print("=" * 60)

def is_url(text):

    return bool(
        re.match(
            r"^https?://",
            text.strip()
        )
    )


def extract_article_text(text):

    if not is_url(text):
        return text

    print("\nDownloading article...\n")

    try:

        downloaded = trafilatura.fetch_url(text)

        if downloaded is None:

            raise Exception("Unable to download webpage.")

        article = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            include_images=False,
            favor_precision=True
        )

        if article is None:

            raise Exception("No article text extracted.")

        article = article.strip()

        if len(article) < 150:

            raise Exception("Article too short.")

        print("Article extracted successfully.\n")

        return article

    except Exception as e:

        print("Extraction Error :", e)

        return None
  

def predict_text(text):

    inputs = tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=256,
        return_tensors="pt"
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    
    inputs.pop("token_type_ids", None)

    with torch.no_grad():

        outputs = model(**inputs)

        probabilities = torch.softmax(
            outputs.logits,
            dim=1
        )[0]

        prediction = torch.argmax(probabilities).item()

    confidence = {
        LABEL_NAMES[i]: round(
            probabilities[i].item(),
            6
        )
        for i in range(len(probabilities))
    }

    return LABEL_NAMES[prediction], confidence


@app.route("/")
def home():

    return jsonify({
        "status": "Running",
        "model": "DistilBERT Fake News Detector"
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No JSON received"
            }), 400

        if "text" not in data:

            return jsonify({
                "error": "Text field missing"
            }), 400

        text = data["text"].strip()

        if text == "":

            return jsonify({
                "error": "Empty input"
            }), 400


        if is_url(text):

            article = extract_article_text(text)

            if article is None:

                return jsonify({
                    "error":
                    "Could not extract article from URL."
                }), 400

            text = article

        label, confidence = predict_text(text)

        print("\n")
        print("=" * 80)
        print("Prediction Request")
        print("=" * 80)

        print("\nInput Preview:\n")

        print(text[:1000])

        print("\n")

        print("Prediction :", label)

        print("Confidence :", confidence)

        print("=" * 80)

        return jsonify({

            "prediction": label,

            "confidence": confidence,

            "text_length": len(text)

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

                "country": "uss",
                "pageSize": 25,
                "apiKey": NEWS_API_KEY
            },

            timeout=10

        )

        response.raise_for_status()

        return jsonify(response.json())

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500


if __name__ == "__main__":

    print("\nServer Running")
    print("http://127.0.0.1:5000\n")

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )