import os
import sys
import uuid
import logging
from fastapi import APIRouter, UploadFile, File

# Ensure proper path loading for services modules
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

from services.ocr import extract_text
from services.vectorize import generate_svg_assets

logger = logging.getLogger("SVGCooker.Analyze")
router = APIRouter()

UPLOAD_DIR = os.path.join(PARENT_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Saves the uploaded file to disk and runs OCR extraction
    and contour vectorization in parallel.
    """
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ".png"
    # Ensure it's treated as image extension
    if ext.lower() not in [".png", ".jpg", ".jpeg", ".webp"]:
        ext = ".png"
        
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    
    logger.info(f"Saving uploaded file {file.filename} to {temp_path}")
    
    # Save uploaded file
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())
        
    try:
        # Run OCR
        text_blocks = extract_text(temp_path)
        
        # Run Vectorizer
        svg_assets = generate_svg_assets(temp_path)
        
        logger.info(f"Analysis complete. Found {len(text_blocks)} text blocks, {len(svg_assets)} SVG vectors.")
        
        return {
            "textBlocks": text_blocks,
            "assets": svg_assets
        }
    finally:
        # Clean up the temp file to save disk space
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Error removing temporary file {temp_path}: {e}")
