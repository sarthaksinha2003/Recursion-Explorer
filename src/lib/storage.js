// Local storage utilities for guest mode and user preferences

const STORAGE_KEYS = {
  SAVED_ALGORITHMS: 'recursion_explorer_saved_algorithms',
  BOOKMARKED_EXAMPLES: 'recursion_explorer_bookmarked_examples',
  CURRENT_SESSION: 'recursion_explorer_current_session',
  USER_PREFERENCES: 'recursion_explorer_user_preferences'
};

// Get saved algorithms from localStorage
export const getSavedAlgorithms = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED_ALGORITHMS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get saved algorithms:', error);
    return [];
  }
};

// Save algorithm to localStorage
export const saveAlgorithm = (algorithm) => {
  try {
    const algorithms = getSavedAlgorithms();
    const existingIndex = algorithms.findIndex(alg => alg.id === algorithm.id);
    
    if (existingIndex >= 0) {
      algorithms[existingIndex] = algorithm;
    } else {
      algorithms.push(algorithm);
    }
    
    localStorage.setItem(STORAGE_KEYS.SAVED_ALGORITHMS, JSON.stringify(algorithms));
    return true;
  } catch (error) {
    console.error('Failed to save algorithm:', error);
    return false;
  }
};

// Delete algorithm from localStorage
export const deleteAlgorithm = (algorithmId) => {
  try {
    const algorithms = getSavedAlgorithms();
    const filtered = algorithms.filter(alg => alg.id !== algorithmId);
    localStorage.setItem(STORAGE_KEYS.SAVED_ALGORITHMS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete algorithm:', error);
    return false;
  }
};

// Get bookmarked examples
export const getBookmarkedExamples = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_EXAMPLES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get bookmarked examples:', error);
    return [];
  }
};

// Toggle bookmark for an example
export const toggleBookmark = (exampleId) => {
  try {
    const bookmarks = getBookmarkedExamples();
    const index = bookmarks.indexOf(exampleId);
    
    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(exampleId);
    }
    
    localStorage.setItem(STORAGE_KEYS.BOOKMARKED_EXAMPLES, JSON.stringify(bookmarks));
    return bookmarks;
  } catch (error) {
    console.error('Failed to toggle bookmark:', error);
    return [];
  }
};

// Save current session (for guest mode)
export const saveCurrentSession = (sessionData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify({
      ...sessionData,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Failed to save session:', error);
    return false;
  }
};

// Get current session
export const getCurrentSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (Date.now() - session.timestamp > maxAge) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

// Clear current session
export const clearCurrentSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    return true;
  } catch (error) {
    console.error('Failed to clear session:', error);
    return false;
  }
};

// Save user preferences
export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
};

// Get user preferences
export const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return stored ? JSON.parse(stored) : {
      theme: 'system',
      executionSpeed: 'medium',
      viewMode: 'tree',
      autoPlay: false
    };
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return {
      theme: 'system',
      executionSpeed: 'medium',
      viewMode: 'tree',
      autoPlay: false
    };
  }
};

// Generate shareable link
export const generateShareableLink = (data) => {
  try {
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}/playground?shared=${encoded}`;
  } catch (error) {
    console.error('Failed to generate shareable link:', error);
    return null;
  }
};

// Parse shared link data
export const parseSharedLink = (sharedData) => {
  try {
    return JSON.parse(atob(sharedData));
  } catch (error) {
    console.error('Failed to parse shared data:', error);
    return null;
  }
};

// Clear all data (for logout or reset)
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear all data:', error);
    return false;
  }
}; 