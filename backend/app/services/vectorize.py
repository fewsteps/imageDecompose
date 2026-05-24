import cv2
import numpy as np

def contour_to_svg(contour):
    """
    Converts an OpenCV contour into a normalized, cropped SVG asset.
    We compute the bounding box of the contour, offset all coordinates 
    so the SVG starts at (0,0), and set the viewBox to (0 0 width height).
    """
    points = contour.squeeze()
    
    # Handle contours with single point or line
    if len(points.shape) < 2 or len(points) < 3:
        return None, 0, 0

    # Calculate bounding rect to normalize and crop the asset
    x_offset, y_offset, w, h = cv2.boundingRect(contour)
    if w <= 0 or h <= 0:
        return None, 0, 0

    path = "M "
    for point in points:
        px, py = point
        # Shift coordinates relative to top-left of the bounding box
        sx = px - x_offset
        sy = py - y_offset
        path += f"{sx} {sy} "
    path += "Z"

    # Generate SVGs with dynamic viewBox and sizing matching the bounding box
    svg = f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <path d="{path}" fill="currentColor" />
</svg>'''

    return svg, w, h

def generate_svg_assets(path: str):
    """
    Reads image, thresholds, detects external contours, 
    and vectorizes large ones into SVG files.
    """
    image = cv2.imread(path)
    if image is None:
        return []

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Binary threshold (invert since we look for foreground items)
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
    
    # Find outer contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    assets = []
    idx = 0
    # Process up to 30 contours to avoid overwhelming
    for i, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        
        # Filter out noise (too small) or the full background (too huge)
        if area < 150 or area > (image.shape[0] * image.shape[1] * 0.95):
            continue
            
        svg_info = contour_to_svg(contour)
        if svg_info[0]:
            svg, w, h = svg_info
            assets.append({
                "id": f"svg-{idx}",
                "type": "svg",
                "label": f"Vector {idx + 1}",
                "svg": svg,
                "width": w,
                "height": h
            })
            idx += 1
            if idx >= 30:  # Cap at 30 items
                break

    return assets
