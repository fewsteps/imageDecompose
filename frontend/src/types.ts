export type ObjectType = 'svg' | 'text' | 'image'

export interface CanvasObject {
  id: string
  type: ObjectType
  x: number
  y: number
  width: number
  height: number
  svg?: string
  text?: string
  image?: string
}

export interface Asset {
  id: string
  type: 'svg'
  label: string
  svg: string
  width: number
  height: number
}

export interface TextBlock {
  text: string
  points: number[][]
}

export interface AnalysisResponse {
  textBlocks: TextBlock[]
  assets: Asset[]
}
