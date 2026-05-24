import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../store'
import type { Asset, TextBlock } from '../types'
import { UploadCloud, FileText, Sparkles, Plus } from 'lucide-react'

interface Props {
  assets: Asset[]
  textBlocks: TextBlock[]
  onUpload: (file: File) => void
  loading: boolean
}

export function Sidebar({ assets, textBlocks, onUpload, loading }: Props) {
  const addObject = useStore((s) => s.addObject)
  const [activeTab, setActiveTab] = useState<'svg' | 'text'>('svg')

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    disabled: loading
  })

  const handleAddSvg = (asset: Asset, index: number) => {
    addObject({
      id: uuidv4(),
      type: 'svg',
      x: 100 + (index % 5) * 30,
      y: 100 + Math.floor(index / 5) * 30,
      width: asset.width || 120,
      height: asset.height || 120,
      svg: asset.svg,
    })
  }

  const handleAddText = (block: TextBlock, index: number) => {
    addObject({
      id: uuidv4(),
      type: 'text',
      x: 120 + (index % 5) * 20,
      y: 150 + Math.floor(index / 5) * 20,
      width: 220,
      height: 48,
      text: block.text,
    })
  }

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-icon">🍳</div>
        <h2>svgCooker</h2>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p>Analyzing canvas...</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <UploadCloud className="upload-icon" />
            <p className="primary-text">
              {isDragActive ? 'Drop image here' : 'Drop an infographic'}
            </p>
            <p className="secondary-text">or click to browse</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'svg' ? 'active' : ''}`}
          onClick={() => setActiveTab('svg')}
        >
          <Sparkles className="tab-icon" />
          Vectors ({assets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FileText className="tab-icon" />
          Texts ({textBlocks.length})
        </button>
      </div>

      {/* Asset lists */}
      <div className="asset-list-container">
        {activeTab === 'svg' ? (
          assets.length === 0 ? (
            <div className="empty-state">
              <p>No vectors extracted yet.</p>
              <p className="sub">Upload an image to start cooking!</p>
            </div>
          ) : (
            <div className="svg-grid">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="asset-card"
                  onClick={() => handleAddSvg(asset, index)}
                  title={`Click to add ${asset.label}`}
                >
                  <div
                    className="asset-preview"
                    dangerouslySetInnerHTML={{ __html: asset.svg }}
                  />
                  <div className="asset-info">
                    <span className="asset-label">{asset.label}</span>
                    <button className="add-btn">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          textBlocks.length === 0 ? (
            <div className="empty-state">
              <p>No text extracted yet.</p>
              <p className="sub">Upload an image containing text.</p>
            </div>
          ) : (
            <div className="text-list">
              {textBlocks.map((block, index) => (
                <div
                  key={index}
                  className="text-card"
                  onClick={() => handleAddText(block, index)}
                  title="Click to add text box"
                >
                  <p className="text-snippet">{block.text}</p>
                  <button className="add-btn">
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
