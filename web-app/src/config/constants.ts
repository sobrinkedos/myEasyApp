// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper function to get full image URL
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, prepend the base URL (without /api/v1)
  return `${API_BASE_URL}${imageUrl}`;
};

// Placeholder image
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/256?text=Sem+Imagem';
