// frontend/src/hooks/useAnalyses.js
import { useState, useEffect } from 'react';

// frontend/src/hooks/useAnalyses.js
export const useAnalyses = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchAnalyses = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/analyses`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setAnalyses(data.analyses || []);
        } catch (err) {
          console.error('Error fetching analyses:', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAnalyses();
      const interval = setInterval(fetchAnalyses, 30000);
      return () => clearInterval(interval);
    }, []);
  
    return { analyses, loading, error };
  };