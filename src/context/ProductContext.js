// context/ProductContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ] = await Promise.all([
          api.get('/Product'),
          
        ]);
        
        setProducts(productsRes.data);
      
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  

  const addProduct = async (newProduct) => {
    try {
      const response = await api.post('/Product', [newProduct]);
      setProducts([...products, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/Product/${id}`);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      const response = await api.put(`/Product/${id}`, updatedProduct);
      setProducts(products.map(product => 
        product.id === id ? response.data : product
      ));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const value = {
    products,
    loading,
    addProduct,
    deleteProduct,
    updateProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}