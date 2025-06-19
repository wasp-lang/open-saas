# Sass Legal

**Objective:** To develop a file manager ("Sass Legal") that transforms raw documents (like Open Sass) into a standardized structure analyzable by a legal GPT agent. This system aims to help users obtain personalized legal advice based on the analysis of legal texts, case law, and user documents.

**Current Features:**
*   Document conversion from PDF, DOCX, TXT to Markdown.
*   Extraction of metadata such as dates, names, organizations, and cited law articles.
*   A FastAPI backend to process uploaded documents.

**Project Structure:**
```
sass_legal/
├── api/
│   ├── __init__.py
│   └── main.py        # FastAPI application
├── core/
│   ├── __init__.py
│   ├── document_converter.py
│   ├── metadata_extractor.py
│   └── models.py      # Pydantic models
├── documents/         # (Intended for user uploaded documents - currently uses temp files)
│   └── __init__.py
├── tests/
│   ├── __init__.py
│   ├── test_document_converter.py
│   └── test_metadata_extractor.py
│   └── test_files/    # Dummy files for testing
├── requirements.txt   # Project dependencies
└── README.md
```

**Setup and Running:**

1.  **Clone the repository (assuming it's in a repo).**
2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Download the French spaCy model:**
    ```bash
    python -m spacy download fr_core_news_sm
    ```
5.  **Run the FastAPI application:**
    ```bash
    uvicorn sass_legal.api.main:app --reload --host 0.0.0.0 --port 8000
    ```
    The API will be accessible at `http://localhost:8000`.

**Example API Usage:**
Send a POST request to `http://localhost:8000/process_document/` with a file:
```bash
curl -X POST -F "file=@/path/to/your/document.pdf" http://localhost:8000/process_document/
```

This will return a JSON response with extracted information.

**Further Development:**
*   Integration with a fine-tuned legal GPT model.
*   Connection to legal databases (e.g., Legifrance).
*   Enhanced security and confidentiality features.
*   More sophisticated legal concept tagging.
