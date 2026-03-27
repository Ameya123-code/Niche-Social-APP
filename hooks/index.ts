import { useCallback, useState } from 'react';

export const useCardStack = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [likedCards, setLikedCards] = useState<string[]>([]);

  const swipeRight = useCallback((cardId: string) => {
    setLikedCards([...likedCards, cardId]);
    setCurrentCardIndex(prev => prev + 1);
  }, [likedCards]);

  const swipeLeft = useCallback(() => {
    setCurrentCardIndex(prev => prev + 1);
  }, []);

  return {
    currentCardIndex,
    likedCards,
    swipeRight,
    swipeLeft,
  };
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // API call will go here
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }  
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchEvents = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      // API call will go here
      // const response = await fetch('/api/events?lat=${latitude}&lng=${longitude}');
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    filter,
    setFilter,
    fetchEvents,
  };
};
