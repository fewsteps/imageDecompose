import type { AnalysisResponse } from './types'

export async function analyzeImage(file: File): Promise<AnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to analyze image: ${response.statusText}`)
  }

  return response.json()
}
