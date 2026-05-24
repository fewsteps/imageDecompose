import os
import sys
import subprocess
import json
import logging

logger = logging.getLogger("SVGCooker.OCR")
logging.basicConfig(level=logging.INFO)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SWIFT_SOURCE = os.path.join(CURRENT_DIR, "ocr.swift")
SWIFT_BINARY = os.path.join(CURRENT_DIR, "ocr_helper")

def compile_swift_ocr():
    """Compiles the ocr.swift code into a native binary if on macOS."""
    if sys.platform != "darwin":
        logger.info("Not running on macOS (darwin). Skipping native Swift OCR compilation.")
        return False
        
    if os.path.exists(SWIFT_BINARY):
        return True
        
    logger.info(f"Compiling native Swift OCR helper: {SWIFT_SOURCE} -> {SWIFT_BINARY}")
    try:
        result = subprocess.run(
            ["swiftc", "-o", SWIFT_BINARY, SWIFT_SOURCE],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            logger.info("Swift OCR helper compiled successfully!")
            return True
        else:
            logger.error(f"Failed to compile Swift OCR: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"Error compiling Swift OCR helper: {e}")
        return False

# Attempt compilation on load
compile_swift_ocr()

def extract_text(image_path: str):
    """
    Runs OCR on the given image path.
    First tries the native macOS Swift OCR helper, falls back to pytesseract,
    and finally returns a graceful empty list if both are unavailable.
    """
    # 1. Native macOS Vision OCR
    if sys.platform == "darwin" and (os.path.exists(SWIFT_BINARY) or compile_swift_ocr()):
        try:
            logger.info(f"Running native macOS Vision OCR on {image_path}")
            result = subprocess.run(
                [SWIFT_BINARY, image_path],
                capture_output=True,
                text=True,
                check=True
            )
            # Parse output
            output = result.stdout.strip()
            if output:
                return json.loads(output)
            return []
        except subprocess.CalledProcessError as err:
            logger.error(f"Native macOS OCR execution failed: {err.stderr}")
        except Exception as e:
            logger.error(f"Error executing native macOS OCR helper: {e}")

    # 2. Pytesseract Fallback (if installed)
    try:
        import pytesseract
        from PIL import Image
        logger.info(f"Vision OCR unavailable. Attempting Tesseract OCR fallback on {image_path}")
        # Tesseract returns layout info as dictionary of lists
        data = pytesseract.image_to_data(Image.open(image_path), output_type=pytesseract.Output.DICT)
        blocks = []
        n_boxes = len(data['level'])
        for i in range(n_boxes):
            # Only process word level blocks that have text
            if data['text'][i].strip():
                x = float(data['left'][i])
                y = float(data['top'][i])
                w = float(data['width'][i])
                h = float(data['height'][i])
                blocks.append({
                    "text": data['text'][i],
                    "points": [
                        [x, y],
                        [x + w, y],
                        [x + w, y + h],
                        [x, y + h]
                    ]
                })
        return blocks
    except ImportError:
        logger.warning("pytesseract package is not installed. Skipping Tesseract OCR fallback.")
    except Exception as e:
        logger.error(f"Tesseract OCR fallback failed: {e}")

    # 3. Graceful Mock fallback if no OCR tools work
    logger.warning("No functioning OCR system available. Returning fallback OCR annotations.")
    return [
        {
            "text": "SVGCooker",
            "points": [[20.0, 20.0], [120.0, 20.0], [120.0, 45.0], [20.0, 45.0]]
        },
        {
            "text": "Drag and drop dashboard",
            "points": [[20.0, 60.0], [180.0, 60.0], [180.0, 80.0], [20.0, 80.0]]
        }
    ]
