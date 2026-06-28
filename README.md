#  Fake News Detection Using DistilBERT

A modern AI-powered Fake News Detection web application that classifies news headlines and articles as **Real News** or **Fake News** using a fine-tuned DistilBERT model. The application also provides a live news feed for real-time analysis.


##  Features

*  Analyze custom news headlines or articles
*  Live News Feed using NewsAPI
*  Fine-tuned DistilBERT model for fake news detection
*  Confidence score for each prediction
*  Modern React + Tailwind CSS user interface
*  Flask REST API backend
*  Responsive design



##  Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui

### Backend

* Python
* Flask
* Flask-CORS

### Machine Learning

* DistilBERT
* Hugging Face Transformers
* PyTorch

### API

* NewsAPI


##  Project Structure


Fake-News-Detection/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── model/
│
├── src/
├── public/
├── package.json
├── README.md
└── .gitignore
```


##  Installation

### Clone the repository

-bash
git clone https://github.com/deepprakashds5/Fake-News-Detection-Using-DistilBERT.git
-

### Frontend

-bash
npm install
npm run dev
-

### Backend

-bash
pip install -r requirements.txt
python app.py
-


##  Environment Variables

Create a '.env' file inside the backend folder.

-
NEWS_API_KEY=your_newsapi_key_here
-

Get your API key from:

https://newsapi.org


##  Model

This project uses a fine-tuned DistilBERT model for binary classification.

Classes:

* Fake News
* Real News

The model predicts the class and returns a confidence score.


##  Screenshots

# Home Page

Frontend FYP/screenshots/home.png


# Custom Analysis

Frontend FYP/screenshots/custom-analysis.png


# Real News Detection

Frontend FYP/screenshots/real-news.png

# Fake News Detection

Frontend FYP/screenshots/fake-news.png

# Live Feed

Frontend FYP/screenshots/live-feed.png


##  Future Improvements

* Multi-language fake news detection
* Source credibility scoring
* Explainable AI (XAI)
* User authentication
* Model deployment on Hugging Face or cloud



##  Author

Deep Prakash

Computer Science & Engineering Student - Data Science



##  License

This project is for educational purposes.
