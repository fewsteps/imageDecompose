import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Canvas } from './components/Canvas'
import { analyzeImage } from './ai'
import type { Asset, TextBlock } from './types'
import { useStore } from './store'
import { Trash2, HelpCircle } from 'lucide-react'

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const objects = useStore((s) => s.objects)
  const clearCanvas = useStore((s) => s.clearCanvas)
  const selectedObjectId = useStore((s) => s.selectedObjectId)
  const removeObject = useStore((s) => s.removeObject)

  const handleUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeImage(file)
      
      // Map and set assets
      setAssets(result.assets || [])
      setTextBlocks(result.textBlocks || [])
    } catch (err: any) {
      console.error(err)
      setError('Failed to analyze image. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedObjectId) {
      removeObject(selectedObjectId)
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <Sidebar
        assets={assets}
        textBlocks={textBlocks}
        onUpload={handleUpload}
        loading={loading}
      />

      {/* Main Workspace Stage */}
      <div className="workspace">
        <header className="workspace-header">
          <div className="header-status">
            {error ? (
              <div className="header-error">{error}</div>
            ) : (
              <div className="header-breadcrumbs">
                <span className="crumb">Workspace</span>
                <span className="crumb-separator">/</span>
                <span className="crumb active">Cooker Board</span>
              </div>
            )}
          </div>

          <div className="header-actions">
            {selectedObjectId && (
              <button
                className="btn btn-danger"
                onClick={handleDeleteSelected}
                title="Delete Selected"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            )}

            {objects.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={clearCanvas}
                title="Clear Board"
              >
                Clear Board ({objects.length})
              </button>
            )}

            <div className="help-indicator" title="How to use: Double click text to edit inline. Drag elements around canvas.">
              <HelpCircle size={18} className="help-icon" />
            </div>
          </div>
        </header>

        {/* Board Component */}
        <Canvas />
      </div>
    </div>
  )
}
