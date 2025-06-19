from pydantic import BaseModel
from typing import List, Optional

class ProcessedExtractItem(BaseModel):
    """
    Represents a single processed extract from a document.
    """
    text: str
    lois_citées: List[str] = [] # Default to empty list
    conseil: str

class DocumentProcessResponse(BaseModel):
    """
    Response model for the document processing endpoint.
    """
    document: str
    tags: List[str] = [] # Default to empty list
    extracts: List[ProcessedExtractItem]
