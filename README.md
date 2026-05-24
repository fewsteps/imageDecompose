# svgCooker 🍳

An interactive dashboard that converts static images, mockups, or infographics into modular, reusable web assets. Using macOS native Vision OCR and OpenCV, `svgCooker` extracts layout contours into SVGs and retrieves text layers, letting you recompose them on an interactive design board.

```text
Upload Image ──> Analyze (OCR + Contours) ──> Extract Vectors & Texts ──> Recompose on Interactive Canvas
```

---

## Key Features

- 📤 **Drag & Drop Upload**: Easily drop any image to run instant background analysis.
- 👁️ **Native macOS Vision OCR**: High-speed, high-accuracy text extraction utilizing native macOS Swift APIs.
- 📐 **Vector Extraction**: Automatically identifies shapes and contours in images, producing clean, normalized SVG path strings.
- 🎨 **Interactive Composer Canvas**:
  - Smooth, hardware-accelerated drag mechanics (via Framer Motion).
  - Select elements, reposition them, or delete them.
  - Double-click any text element to **edit it inline**.
- 🖤 **Premium Developer UI**: Built with a sleek dark-themed workspace layout.

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Swift Compiler** (standard on macOS with Xcode Command Line Tools)

---

## Getting Started

### 1. Run the Backend Service

The backend is built with FastAPI and runs on port `8000`.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server (with auto-reload enabled):
   ```bash
   PYTHONPATH=app uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

*Note: On startup, the backend automatically compiles the native Swift OCR helper (`ocr.swift`) if you are running on macOS.*

### 2. Run the Frontend App

The frontend is built with React, Vite, and Zustand.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to Use

1. **Upload an Infographic**: Drag any image containing shapes/text into the upload box on the sidebar.
2. **Inspect Extracted Items**:
   - The **Vectors** tab displays the isolated contour shapes.
   - The **Texts** tab displays the recognized textual elements.
3. **Compose on Canvas**: Click any vector card or text snippet to add it to the canvas.
4. **Manipulate Elements**:
   - **Move**: Click and drag elements anywhere on the board.
   - **Edit Text**: Double-click any text box on the canvas to edit the wording inline, then press **Enter** or click the checkmark to save.
   - **Delete**: Click an element to select it, then click the trash icon (or use the header "Delete Selected" button) to remove it.
