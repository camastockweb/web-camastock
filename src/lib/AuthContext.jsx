import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase'; // Importamos la conexión que creamos antes
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // Mantenemos estas variables para compatibilidad con tu App.jsx actual
  const [authError, setAuthError] = useState(null); 
  const isLoadingPublicSettings = false; 
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Revisar si hay una sesión guardada cuando el usuario entra a la web
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    // 2. Quedarse escuchando: si alguien hace login o logout, actualizamos el estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    // Limpieza al desmontar el componente
    return () => subscription.unsubscribe();
  }, []);

  const navigateToLogin = () => navigate('/login');

  // --- FUNCIONES MAESTRAS DE SUPABASE ---
  
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingAuth, 
      isLoadingPublicSettings, 
      authError, 
      navigateToLogin,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);