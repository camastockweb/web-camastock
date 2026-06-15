import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext({});
const CART_STORAGE_KEY = 'camastock-cart-v1';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return [];

    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.warn('No se pudo recuperar el carrito guardado:', error);
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // <-- Control del lateral

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('No se pudo guardar el carrito:', error);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        if (typeof existingProduct.stock === 'number' && existingProduct.quantity >= existingProduct.stock) {
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: typeof item.stock === 'number' && item.quantity >= item.stock ? item.quantity : item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsDrawerOpen(true); // <-- ¡Truco Pro! Al añadir un producto, abrimos el lateral automáticamente
  };

  // Cambiar cantidad (+1 o -1)
  const updateQuantity = (productId, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + amount;
        if (newQty <= 0) return item;
        if (typeof item.stock === 'number' && newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  const clearCart = () => {
    setCart([]);
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.warn('No se pudo vaciar el carrito guardado:', error);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart,
      cartCount, 
      cartTotal,
      isDrawerOpen,
      setIsDrawerOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
