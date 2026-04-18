import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, STORAGE_KEYS, getAuthHeaders } from '../config';

// localStorage Explanation:
// localStorage is a browser API that allows you to store data persistently 
// across browser sessions. We use it to remember the user's login state
// and role even after they refresh the page. It's like a small database
// that lives in the user's browser.

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Returns true if a JWT token string is expired (checks the exp claim)
  const isTokenExpired = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Check localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE);

    if (storedToken && storedUser) {
      // Clear stale session if token is expired
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        return;
      }
      try {
        const userData = JSON.parse(storedUser);
        const effectiveRole = userData.role ?? storedRole;
        setUser(userData);
        setRole(effectiveRole ?? null);
        if (effectiveRole) {
          localStorage.setItem(STORAGE_KEYS.ROLE, effectiveRole);
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.success) {
        // Store JWT token and user info
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.ROLE, data.user.role);

        setUser(data.user);
        setRole(data.user.role);
        setIsAuthenticated(true);

        return { 
          success: true, 
          role: data.user.role, 
          isProfileComplete: data.user.isProfileComplete 
        };
      } else {
        return { success: false, error: data.error || data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, role) => {
    setLoading(true);
    try {
      // Send role as query parameter since backend expects it as @RequestParam
      const url = role ? `${API_ENDPOINTS.REGISTER}?role=${role}` : API_ENDPOINTS.REGISTER;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          user: data.user,
          adminReviewUrl: data.adminReviewUrl,
          message: data.message,
          status: response.status,
        };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Registration failed', status: response.status };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfileStatus = (status) => {
    if (user) {
      const updatedUser = { ...user, isProfileComplete: status };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state and localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };


  const googleLogin = async (credentialResponse, role) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential, role }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.ROLE, data.user.role);
        setUser(data.user);
        setRole(data.user.role);
        setIsAuthenticated(true);
        return { success: true, role: data.user.role, isProfileComplete: data.user.isProfileComplete };
      } else {
        return { success: false, error: data.error || 'Google login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage and state
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ROLE);

    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    role,
    isAuthenticated,
    isInitialized,
    loading,
    login,
    googleLogin,
    register,
    logout,
    updateProfileStatus,
    updateProfile
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
