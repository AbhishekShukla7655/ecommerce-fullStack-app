export const getImageUrl = (filename) => {
  if (!filename) return null
  
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  const base = import.meta.env.VITE_API_URL?.replace('/api', '')
               || 'http://localhost:8080'
  return `${base}/images/${filename}`
}