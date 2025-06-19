import os
from PyPDF2 import PdfReader
import docx

def convert_to_markdown(file_path):
    """
    Converts a document to Markdown format.

    Args:
        file_path (str): The path to the document file.

    Returns:
        str: The Markdown content of the document.

    Raises:
        FileNotFoundError: If the file is not found.
        ValueError: If the file format is not supported.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    file_ext = os.path.splitext(file_path)[1].lower()

    if file_ext == ".pdf":
        return _convert_pdf_to_markdown(file_path)
    elif file_ext == ".docx":
        return _convert_docx_to_markdown(file_path)
    elif file_ext == ".txt":
        return _convert_txt_to_markdown(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")

def _convert_pdf_to_markdown(file_path):
    """Converts a PDF file to Markdown."""
    try:
        reader = PdfReader(file_path)
        markdown_content = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            markdown_content += page.extract_text()
            markdown_content += "\n\n"  # Add a separator between pages
        return markdown_content
    except Exception as e:
        raise RuntimeError(f"Error converting PDF: {e}")

def _convert_docx_to_markdown(file_path):
    """Converts a DOCX file to Markdown."""
    try:
        doc = docx.Document(file_path)
        markdown_content = ""
        for para in doc.paragraphs:
            markdown_content += para.text
            markdown_content += "\n\n"  # Add a separator between paragraphs
        return markdown_content
    except Exception as e:
        raise RuntimeError(f"Error converting DOCX: {e}")

def _convert_txt_to_markdown(file_path):
    """Converts a TXT file to Markdown."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        raise RuntimeError(f"Error converting TXT: {e}")
