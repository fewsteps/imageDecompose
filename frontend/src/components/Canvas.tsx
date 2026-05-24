import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { Trash2, Edit3, Check } from 'lucide-react'

export function Canvas() {
  const objects = useStore((s) => s.objects)
  const selectedObjectId = useStore((s) => s.selectedObjectId)
  const selectObject = useStore((s) => s.selectObject)
  const updateObjectPosition = useStore((s) => s.updateObjectPosition)
  const removeObject = useStore((s) => s.removeObject)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // State for inline text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [tempTextValue, setTempTextValue] = useState('')

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking the canvas background
    if (e.target === canvasRef.current) {
      selectObject(null)
      setEditingTextId(null)
    }
  }

  const startEditText = (id: string, currentText: string) => {
    setEditingTextId(id)
    setTempTextValue(currentText)
  }

  const saveEditText = (id: string) => {
    if (tempTextValue.trim() !== '') {
      useStore.setState((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, text: tempTextValue } : obj
        )
      }))
    }
    setEditingTextId(null)
  }

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onClick={handleCanvasClick}
    >
      <div className="canvas-grid-overlay" />
      
      {objects.length === 0 && (
        <div className="canvas-placeholder">
          <div className="placeholder-icon">📐</div>
          <h3>Your Cooking Board</h3>
          <p>Extracted elements added from the sidebar will appear here.</p>
          <p className="sub">Select elements to drag, resize, edit text, or delete them.</p>
        </div>
      )}

      {objects.map((obj) => {
        const isSelected = selectedObjectId === obj.id
        const isEditingText = editingTextId === obj.id

        return (
          <motion.div
            key={obj.id}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={canvasRef}
            onDragStart={() => {
              selectObject(obj.id)
              setEditingTextId(null)
            }}
            onDragEnd={(_, info) => {
              // Update state with final offsets
              updateObjectPosition(
                obj.id,
                Math.max(0, Math.round(obj.x + info.offset.x)),
                Math.max(0, Math.round(obj.y + info.offset.y))
              )
            }}
            style={{
              position: 'absolute',
              left: obj.x,
              top: obj.y,
              width: obj.width,
              height: obj.height,
              zIndex: isSelected ? 100 : 10,
            }}
            className={`canvas-object ${isSelected ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              selectObject(obj.id)
            }}
          >
            {/* Action Bar (Delete & Edit buttons shown on selection) */}
            {isSelected && !isEditingText && (
              <div className="object-actions">
                {obj.type === 'text' && (
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditText(obj.id, obj.text || '')
                    }}
                    title="Edit Text"
                  >
                    <Edit3 size={12} />
                  </button>
                )}
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeObject(obj.id)
                  }}
                  title="Remove Object"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            {/* Element Rendering */}
            <div className="object-content-wrapper">
              {obj.type === 'svg' && obj.svg && (
                <div
                  className="svg-renderer"
                  dangerouslySetInnerHTML={{ __html: obj.svg }}
                />
              )}

              {obj.type === 'text' && (
                <div className="text-renderer">
                  {isEditingText ? (
                    <div className="inline-editor" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={tempTextValue}
                        onChange={(e) => setTempTextValue(e.target.value)}
                        onBlur={() => saveEditText(obj.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditText(obj.id)
                        }}
                        autoFocus
                      />
                      <button className="save-btn" onClick={() => saveEditText(obj.id)}>
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="text-display"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        startEditText(obj.id, obj.text || '')
                      }}
                      title="Double-click to edit text"
                    >
                      {obj.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtle Resize Indicator */}
            {isSelected && (
              <div className="resize-handle-mock" />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
