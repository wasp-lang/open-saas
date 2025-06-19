import os
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List # Dict, Any are no longer needed directly for response typing

# Core services
from sass_legal.core.document_converter import convert_to_markdown
from sass_legal.core.metadata_extractor import extract_metadata_from_text
# Pydantic Models
from sass_legal.core.models import DocumentProcessResponse, ProcessedExtractItem

app = FastAPI()

# Example usage: uvicorn sass_legal.api.main:app --reload

@app.get("/")
async def root():
    """
    Root endpoint for the Sass Legal API.
    Returns a welcome message.
    """
    return {"message": "Welcome to Sass Legal API"}

@app.post("/process_document/", response_model=DocumentProcessResponse)
async def process_document(file: UploadFile = File(...)):
    """
    Processes an uploaded document (PDF, DOCX, TXT).
    Converts the document to Markdown, extracts metadata, and returns a structured JSON response.
    """
    filename = file.filename
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}. Please upload a PDF, DOCX, or TXT file.")

    try:
        # Save UploadFile to a temporary file to pass its path to converters
        # This is because our converters currently expect file paths.
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        markdown_text = ""
        try:
            markdown_text = convert_to_markdown(tmp_file_path)
        except FileNotFoundError: # Should not happen with NamedTemporaryFile
             os.unlink(tmp_file_path) # Clean up temp file
             raise HTTPException(status_code=500, detail="Temporary file error.")
        except ValueError as ve: # Handles unsupported format from converter, though checked above
            os.unlink(tmp_file_path)
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e: # Catch other conversion errors
            os.unlink(tmp_file_path)
            raise HTTPException(status_code=500, detail=f"Error during document conversion: {str(e)}")

        # Extract metadata from the markdown text
        metadata = extract_metadata_from_text(markdown_text)

        # Placeholder for tags - can be derived from metadata['persons'], metadata['organizations'] etc.
        tags = list(set(metadata.get("persons", []) + metadata.get("organizations", [])))[:5] # Example: top 5 unique persons/orgs

        # For simplicity, we'll make one "extract" which is the whole document's relevant info
        # Snippet of text for the extract - first 200 chars or less
        text_snippet = markdown_text[:200] + "..." if len(markdown_text) > 200 else markdown_text

        extract_item = ProcessedExtractItem(
            text=text_snippet,
            lois_citées=metadata.get("law_articles", []),
            conseil="Placeholder conseil - Ce conseil est généré automatiquement et nécessite une validation humaine."
        )

        # Clean up the temporary file
        os.unlink(tmp_file_path)

        return DocumentProcessResponse(
            document=filename,
            tags=tags,
            extracts=[extract_item]
        )

    except HTTPException as http_exc:
        # Re-raise HTTPException to let FastAPI handle it
        raise http_exc
    except Exception as e:
        # Clean up temp file if it exists and an error occurred before normal cleanup
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    # This block is for local debugging if you run `python main.py`
    # However, FastAPI apps are typically run with Uvicorn as per the comment above.
    import uvicorn
    print("Running FastAPI app with Uvicorn. Access at http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
