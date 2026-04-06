import { useState, useCallback } from 'react';
import { HOLY_SITES } from '../services/data';

// Calculate distance between two coordinates in meters (Haversine formula)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function findCurrentSite(lat, lng) {
  for (const site of HOLY_SITES) {
    const distance = getDistanceMeters(lat, lng, site.lat, site.lng);
    if (distance <= site.radius) return site;
  }
  return null;
}

export function useLocation() {
  const [currentSite, setCurrentSite] = useState(null);
  const [isAtHolySite, setIsAtHolySite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const site = findCurrentSite(pos.coords.latitude, pos.coords.longitude);
        setCurrentSite(site);
        setIsAtHolySite(!!site);
        setLoading(false);
      },
      (err) => {
        setError('Location access denied. Enable location to make dua at holy sites.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Debug: simulate being at a site
  const simulateSite = useCallback((site) => {
    setCurrentSite(site);
    setIsAtHolySite(true);
    setError(null);
  }, []);

  const clearSimulation = useCallback(() => {
    setCurrentSite(null);
    setIsAtHolySite(false);
  }, []);

  return { currentSite, isAtHolySite, loading, error, checkLocation, simulateSite, clearSimulation };
}
