// Returns a full URL for images stored under /uploads so the frontend requests the backend origin in dev
export default function getImageUrl(p) {
  if (!p) return p;
  // If already an absolute URL, return as-is
  if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) return p;

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  if (typeof p === 'string' && p.startsWith('/uploads')) {
    return `${backend}${p}`;
  }
  return p;
}
