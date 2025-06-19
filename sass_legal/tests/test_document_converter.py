import pytest
import os
import shutil
from sass_legal.core.document_converter import convert_to_markdown

# Define the directory for test files and ensure it exists
TEST_FILE_DIR = os.path.join(os.path.dirname(__file__), "test_files")
# Dummy file names
DUMMY_TXT = os.path.join(TEST_FILE_DIR, "dummy.txt")
DUMMY_DOCX = os.path.join(TEST_FILE_DIR, "dummy.docx")
DUMMY_PDF = os.path.join(TEST_FILE_DIR, "dummy.pdf")
UNSUPPORTED_FILE = os.path.join(TEST_FILE_DIR, "dummy.unsupported")

@pytest.fixture(scope="module", autouse=True)
def setup_test_files():
    """Create dummy files for testing."""
    os.makedirs(TEST_FILE_DIR, exist_ok=True)

    # Create dummy TXT (already created by previous step, but good to have here for clarity)
    with open(DUMMY_TXT, "w") as f:
        f.write("This is a dummy text file.\nIt contains multiple lines.\nFor testing purposes.")

    # Create dummy DOCX (already created, ensure content for consistency if needed)
    # from docx import Document
    # doc = Document()
    # doc.add_paragraph("This is a dummy DOCX file.")
    # doc.add_paragraph("Created for testing document conversion.")
    # doc.save(DUMMY_DOCX)

    # Create dummy PDF (already created, ensure content for consistency if needed)
    # from reportlab.pdfgen import canvas
    # from reportlab.lib.pagesizes import letter
    # c = canvas.Canvas(DUMMY_PDF, pagesize=letter)
    # c.drawString(100, 750, "This is a dummy PDF file.")
    # c.drawString(100, 730, "Generated for testing purposes.")
    # c.save()

    # Create a dummy unsupported file
    with open(UNSUPPORTED_FILE, "w") as f:
        f.write("This is an unsupported file type.")

    yield
    # Teardown: Remove the test_files directory after tests are done
    # Comment out for inspection if tests fail
    # shutil.rmtree(TEST_FILE_DIR)


def test_convert_txt_to_markdown():
    """Test conversion of a TXT file."""
    assert os.path.exists(DUMMY_TXT), "Dummy TXT file should exist"
    markdown_content = convert_to_markdown(DUMMY_TXT)
    assert isinstance(markdown_content, str)
    assert len(markdown_content) > 0
    assert "dummy text file" in markdown_content.lower()

def test_convert_docx_to_markdown():
    """Test conversion of a DOCX file."""
    assert os.path.exists(DUMMY_DOCX), "Dummy DOCX file should exist"
    markdown_content = convert_to_markdown(DUMMY_DOCX)
    assert isinstance(markdown_content, str)
    assert len(markdown_content) > 0
    # Basic check, actual markdown will have more formatting/spacing
    assert "dummy DOCX file" in markdown_content

def test_convert_pdf_to_markdown():
    """Test conversion of a PDF file."""
    assert os.path.exists(DUMMY_PDF), "Dummy PDF file should exist"
    markdown_content = convert_to_markdown(DUMMY_PDF)
    assert isinstance(markdown_content, str)
    assert len(markdown_content) > 0
    assert "dummy PDF file" in markdown_content

def test_convert_file_not_found():
    """Test conversion with a non-existent file."""
    with pytest.raises(FileNotFoundError):
        convert_to_markdown("non_existent_file.txt")

def test_convert_unsupported_format():
    """Test conversion with an unsupported file format."""
    assert os.path.exists(UNSUPPORTED_FILE), "Dummy unsupported file should exist"
    with pytest.raises(ValueError) as excinfo:
        convert_to_markdown(UNSUPPORTED_FILE)
    assert "Unsupported file format: .unsupported" in str(excinfo.value)

if __name__ == "__main__":
    # This allows running tests directly with `python test_document_converter.py`
    # but `pytest` is the recommended way.
    pytest.main([__file__])
