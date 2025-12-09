# 🧠 ML Helpline Recommendation Engine

This module implements an intelligent recommendation engine for the Saathi Helpline app. It uses Natural Language Processing (NLP) techniques to understand user queries and recommend the most relevant helplines.

## 📂 Structure

- `ml_engine/`
  - `recommendation_engine.py`: The core Python script containing the logic.
  - `helplines.json`: The dataset of helplines with descriptions and keywords.
  - `requirements.txt`: List of Python dependencies for the full ML version.

## 🚀 How to Run

1.  **Prerequisites**: Ensure you have Python installed.
2.  **Install Dependencies** (Optional for Lite Mode):
    ```bash
    pip install -r ml_engine/requirements.txt
    ```
3.  **Run the Engine**:
    ```bash
    python ml_engine/recommendation_engine.py
    ```

## 🛠️ Implementation Details

### 1. Hybrid Matching Algorithm
The engine uses a two-step approach:
-   **Semantic Similarity**: Calculates the cosine similarity between the user's message and the helpline descriptions. (Uses `sentence-transformers` in the full version, and a Jaccard-like token overlap in the Lite version).
-   **Context Boosting**: Increases the score based on:
    -   **Emergency Type Match**: If the user specifies "Fire", fire helplines get a boost.
    -   **Keyword Matching**: Direct hits on critical keywords (e.g., "suicide", "rape").
    -   **History**: Previously used helplines get a slight preference.

### 2. Input/Output
-   **Input**:
    -   `user_message`: "I feel unsafe walking home alone."
    -   `location`: "Delhi" (Used for filtering, currently all India).
    -   `emergency_type`: "Women Safety"
-   **Output**: JSON array of top 3 recommendations with reasons.

## 🔄 Integration Plan
To integrate this with the React frontend:
1.  **Backend API**: Wrap this script in a simple Flask/FastAPI server.
2.  **Frontend Call**: The React app sends a POST request to the API with the user's input.
3.  **Display**: The app renders the returned JSON recommendations.
