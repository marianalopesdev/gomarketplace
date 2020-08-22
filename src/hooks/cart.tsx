import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { ProductQuantity } from 'src/pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('@GoMarketPlace:products010');

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productExists = products.find(item => item.id === product.id);
    let updatedProducts;

    if (productExists) {
      updatedProducts = products.map(item => item.id === product.id ? { ...product, quantity: item.quantity + 1 } : item)
    }
    else {
      updatedProducts = [...products, { ...product, quantity: 1 }];
    }

    setProducts(updatedProducts);

    await AsyncStorage.setItem(
      '@GoMarketPlace:products010',
      JSON.stringify(updatedProducts))

  }, [products]);

  const increment = useCallback(async id => {

    const newProducts = products.map(product =>
      product.id === id
        ? { ...product, quantity: product.quantity + 1 }
        : product,
    );

    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketPlace:products010',
      JSON.stringify(newProducts));

  }, [products]);




  const decrement = useCallback(async id => {

    /*
    CONTINUA EXIBINDO PRODUTO COM 0 ITENS

    const newProducts2 = products.map(product =>
      product.id === id && product.quantity >= 1
        ? { ...product, quantity: product.quantity - 1 }
        : product,
    );
      setProducts(newProducts2);
 */

const updatedProductCart = products.find(product => product.id === id);
const restProducts = products.filter(product => product.id !== id);

if (updatedProductCart && updatedProductCart.quantity >= 1) {
  setProducts([
    ...restProducts,
    {
      ...updatedProductCart,
      quantity: updatedProductCart.quantity - 1,
    },
  ]);
  await AsyncStorage.setItem(
    '@GoMarketPlace:products010',
    JSON.stringify(products));
} else {
  setProducts(restProducts);
  await AsyncStorage.setItem(
    '@GoMarketPlace:products010',
    JSON.stringify(restProducts));
}
  }, [products]);



  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
