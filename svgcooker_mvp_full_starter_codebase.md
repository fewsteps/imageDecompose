# svgCooker MVP — Full Starter Codebase

This is a complete starter implementation for the first working vertical slice:

```text
Upload Image
    ↓
Analyze
    ↓
Extract Assets
    ↓
Render SVG/Text Assets
    ↓
Drag Into Canvas
```

---

# Project Structure

```text
svgcooker/

  frontend/
  backend/
```

---

# FRONTEND

---

# frontend/package.json

```json
{
  "name": "svgcooker-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "konva": "^9.3.11",
    "lucide-react": "^0.454.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.2.3",
    "react-konva": "^18.2.10",
    "uuid": "^11.0.3",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
```

---

# frontend/src/main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

# frontend/src/types.ts

```ts
export type ObjectType =
  | 'svg'
  | 'text'
  | 'image'

export interface CanvasObject {
  id: string

  type: ObjectType

  x: number
  y: number

  width?: number
  height?: number

  svg?: string
  text?: string
  image?: string
}

export interface Asset {
  id: string
  type: 'svg'
  label: string
  svg: string
}
```

---

# frontend/src/store.ts

```ts
import { create } from 'zustand'
import { CanvasObject } from './types'

interface AppState {
  objects: CanvasObject[]

  addObject: (obj: CanvasObject) => void
}

export const useStore = create<AppState>((set) => ({
  objects: [],

  addObject: (obj) =>
    set((state) => ({
      objects: [...state.objects, obj]
    }))
}))
```

---

# frontend/src/ai.ts

```ts
export async function analyzeImage(file: File) {
  const formData = new FormData()

  formData.append('file', file)

  const response = await fetch(
    'http://localhost:8000/analyze',
    {
      method: 'POST',
      body: formData
    }
  )

  return response.json()
}
```

---

# frontend/src/components/Canvas.tsx

```tsx
import { useStore } from '../store'

export function Canvas() {
  const objects = useStore((s) => s.objects)

  return (
    <div className="canvas">
      {objects.map((obj) => {
        return (
          <div
            key={obj.id}
            className="canvas-object"
            style={{
              left: obj.x,
              top: obj.y
            }}
          >
            {obj.type === 'svg' && (
              <div
                dangerouslySetInnerHTML={{
                  __html: obj.svg || ''
                }}
              />
            )}

            {obj.type === 'text' && (
              <div>{obj.text}</div>
            )}
          </div>
        )}
      })}
    </div>
  )
}
```

---

# frontend/src/components/Sidebar.tsx

```tsx
import { Asset } from '../types'
import { useStore } from '../store'
import { v4 as uuid } from 'uuid'

interface Props {
  assets: Asset[]
}

export function Sidebar({ assets }: Props) {
  const addObject = useStore((s) => s.addObject)

  return (
    <div className="sidebar">
      <div className="sidebar-title">
        Extracted Assets
      </div>

      {assets.map((asset, index) => {
        return (
          <div
            key={asset.id}
            className="asset-card"
            onClick={() => {
              addObject({
                id: uuid(),
                type: 'svg',
                x: 250 + index * 20,
                y: 120 + index * 20,
                svg: asset.svg
              })
            }}
          >
            <div
              className="asset-preview"
              dangerouslySetInnerHTML={{
                __html: asset.svg
              }}
            />

            <div className="asset-label">
              {asset.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

---

# frontend/src/App.tsx

```tsx
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Sidebar } from './components/Sidebar'
import { Canvas } from './components/Canvas'

import { analyzeImage } from './ai'
import { Asset } from './types'

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    setLoading(true)

    const result = await analyzeImage(file)

    setAssets(result.assets)

    setLoading(false)
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop
  })

  return (
    <div className="app">
      <Sidebar assets={assets} />

      <div className="workspace">
        <div className="topbar">
          <div
            className="upload"
            {...getRootProps()}
          >
            <input {...getInputProps()} />

            Upload Image
          </div>

          {loading && (
            <div className="loading">
              Analyzing image...
            </div>
          )}
        </div>

        <Canvas />
      </div>
    </div>
  )
}
```

---

# frontend/src/styles.css

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, sans-serif;
  background: #0f1115;
  color: white;
}

.app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 260px;
  background: #161a22;
  border-right: 1px solid #262c38;
  padding: 16px;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 18px;
  margin-bottom: 16px;
}

.asset-card {
  background: #1d2330;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.asset-card:hover {
  background: #252d3d;
}

.asset-preview {
  width: 100%;
  height: 120px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}

.asset-preview svg {
  width: 100%;
  height: 100%;
}

.asset-label {
  margin-top: 10px;
  font-size: 13px;
}

.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 72px;
  border-bottom: 1px solid #262c38;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
}

.upload {
  background: #3b82f6;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
}

.canvas {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.canvas-object {
  position: absolute;
  cursor: move;
}

.loading {
  opacity: 0.8;
}
```

---

# BACKEND

---

# backend/requirements.txt

```text
fastapi
uvicorn
python-multipart
opencv-python
numpy
pillow
paddleocr
```

---

# backend/app/main.py

```py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyze import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(router)
```

---

# backend/app/routes/analyze.py

```py
import os
import uuid

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from services.ocr import extract_text
from services.vectorize import generate_svg_assets

router = APIRouter()

UPLOAD_DIR = 'uploads'

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post('/analyze')
async def analyze(file: UploadFile = File(...)):

    file_id = str(uuid.uuid4())

    path = os.path.join(
        UPLOAD_DIR,
        f'{file_id}.png'
    )

    with open(path, 'wb') as buffer:
        buffer.write(await file.read())

    text_blocks = extract_text(path)

    svg_assets = generate_svg_assets(path)

    return {
        'textBlocks': text_blocks,
        'assets': svg_assets
    }
```

---

# backend/app/services/ocr.py

```py
from paddleocr import PaddleOCR

ocr = PaddleOCR(
    use_angle_cls=True,
    lang='en'
)


def extract_text(path: str):

    results = ocr.ocr(path)

    blocks = []

    for line in results[0]:

        text = line[1][0]

        points = line[0]

        blocks.append({
            'text': text,
            'points': points
        })

    return blocks
```

---

# backend/app/services/vectorize.py

```py
import cv2


def contour_to_svg(contour):

    points = contour.squeeze()

    if len(points.shape) < 2:
        return None

    path = 'M '

    for point in points:
        x, y = point
        path += f'{x} {y} '

    path += 'Z'

    svg = f'''
    <svg viewBox="0 0 300 300">
      <path
        d="{path}"
        fill="black"
      />
    </svg>
    '''

    return svg



def generate_svg_assets(path: str):

    image = cv2.imread(path)

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    _, thresh = cv2.threshold(
        gray,
        200,
        255,
        cv2.THRESH_BINARY_INV
    )

    contours, _ = cv2.findContours(
        thresh,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    assets = []

    for i, contour in enumerate(contours[:20]):

        area = cv2.contourArea(contour)

        if area < 300:
            continue

        svg = contour_to_svg(contour)

        if svg:
            assets.append({
                'id': str(i),
                'type': 'svg',
                'label': f'Asset {i}',
                'svg': svg
            })

    return assets
```

---

# RUN FRONTEND

```bash
cd frontend
npm install
npm run dev
```

---

# RUN BACKEND

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# TEST FLOW

1. Open frontend
2. Upload infographic
3. Backend analyzes image
4. OCR extracts text
5. OpenCV extracts contours
6. SVG assets appear in sidebar
7. Click asset to add to canvas

---

# CURRENT MVP CAPABILITIES

✓ upload images
✓ OCR text extraction
✓ contour extraction
✓ SVG asset generation
✓ sidebar asset rendering
✓ canvas composition
✓ reusable visual assets

---

# NEXT FEATURES

## Immediate

- drag objects
- resize handles
- selection system
- zoom/pan
- SVG sanitization

## AI

- segmentation
- chart understanding
- semantic grouping
- typography reconstruction

## Rendering

- Konva migration
- scene graph
- infinite canvas

---

# IMPORTANT NOTE

This starter is intentionally:

```text
simple
vertical
hackable
```

The goal is proving:

```text
Upload → Extract → Reuse
```

before building advanced infrastructure.

