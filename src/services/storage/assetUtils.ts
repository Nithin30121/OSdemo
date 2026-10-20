export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]

export const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']

export function isSupportedImageFile(file: File): boolean {
  if (file.type && SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return true
  }
  const name = file.name.toLowerCase()
  return SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function sanitizeSvg(svgText: string): string {
  // Strip <script>...</script>
  let clean = svgText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // Strip inline event handler attributes: onload=, onclick=, onerror=, etc.
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  // Strip javascript: pseudo-protocol URIs
  clean = clean.replace(/(?:href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"')
  return clean
}

export interface ProcessedAsset {
  dataUrl: string
  width: number
  height: number
  name: string
  type: string
  size: number
}

export async function processImageFile(file: File): Promise<ProcessedAsset> {
  if (!isSupportedImageFile(file)) {
    throw new Error(
      `Unsupported file type: "${file.name}". Supported formats: PNG, JPEG, WebP, GIF, SVG, and AVIF.`
    )
  }

  // Handle SVG specifically with sanitization
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    const text = await file.text()
    const sanitized = sanitizeSvg(text)
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sanitized)}`

    // Extract SVG width/height if available
    let width = 300
    let height = 200
    const viewBoxMatch = sanitized.match(/viewBox=["']\s*(\d+[.\d]*)\s+(\d+[.\d]*)\s+(\d+[.\d]*)\s+(\d+[.\d]*)\s*["']/i)
    if (viewBoxMatch && viewBoxMatch[3] && viewBoxMatch[4]) {
      width = parseFloat(viewBoxMatch[3]) || 300
      height = parseFloat(viewBoxMatch[4]) || 200
    } else {
      const wMatch = sanitized.match(/width=["'](\d+[.\d]*)(?:px)?["']/i)
      const hMatch = sanitized.match(/height=["'](\d+[.\d]*)(?:px)?["']/i)
      if (wMatch && wMatch[1]) width = parseFloat(wMatch[1]) || 300
      if (hMatch && hMatch[1]) height = parseFloat(hMatch[1]) || 200
    }

    return {
      dataUrl: encoded,
      width: Math.round(width),
      height: Math.round(height),
      name: file.name,
      type: 'image/svg+xml',
      size: file.size,
    }
  }

  // Handle standard raster formats: PNG, JPG, WebP, GIF, AVIF
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onerror = () => {
        // Fallback dimensions if decoding fails
        resolve({
          dataUrl,
          width: 320,
          height: 240,
          name: file.name,
          type: file.type || 'image/png',
          size: file.size,
        })
      }
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth || 320,
          height: img.naturalHeight || 240,
          name: file.name,
          type: file.type || 'image/png',
          size: file.size,
        })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}
