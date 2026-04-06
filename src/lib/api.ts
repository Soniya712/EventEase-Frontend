// lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const api = {
  // Home page
  getHeroSlides: () => apiClient.get('/venues/hero-slides').then(res => res.data),
  getPopularLocations: () => apiClient.get('/venues/popular-locations').then(res => res.data),
  getStatsSummary: () => apiClient.get('/venues/stats-summary').then(res => res.data),
  
  // Search
  searchVenues: (params: Record<string, any>) => 
    apiClient.get('/venues/search', { params }).then(res => res.data),
  
  // Single venue
  getVenue: (id: number) => apiClient.get(`/venues/${id}`).then(res => res.data),
};