// context/ProductContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';


export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/Product/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.imageUrl; // e.g., /images/abc123.jpg
};
const ProductContext = createContext();
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
 
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
  setLoading(true);
  try {
    const [productsRes] = await Promise.all([
      api.get('/Product'),
    ]);
    setProducts(productsRes.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchProducts();
}, []);

  

 const addProduct = async (newProduct) => {
    try {
        const response = await api.post('/Product', [newProduct]);
        const addedProduct = response.data[0]; // Get the first product from the array
        
        // Include the category, brand, and barcode information from the original submission
        const completeProduct = {
            ...addedProduct,
            category: newProduct.category,
            brand: newProduct.brand,
            barcode: newProduct.barcode
        };
        
        setProducts(prev => [...prev, completeProduct]);
        return completeProduct;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/Product/${id}`);
      setProducts(products.filter(product => product.productId !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
const updateProduct = async (id, updatedProduct) => {
  try {
    setLoading(true);

    const response = await api.put(`/Product/${id}`, updatedProduct);
    const updated = response.data;
const productId = parseInt(id);
    // Directly update the product in local state
    setProducts(prev =>
      prev.map(product =>
        product.productId === productId
          ? {
              ...product,
              ...updated, 
             productName: updatedProduct.productName || product.productName,
              shortName: updatedProduct.shortName || product.shortName,
              sku: updatedProduct.sku || product.sku,
              quantityAlert: updatedProduct.quantityAlert || product.quantityAlert,
              category: updatedProduct.category || product.category,
              brand: updatedProduct.brand || product.brand,
              barcode: updatedProduct.barcode || product.barcode,
            }
          : product
      )
    );
    return updated;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};
  const value = {
    products,
    loading,
     setLoading,
    addProduct,
    deleteProduct,
    updateProduct,
     fetchProducts,
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