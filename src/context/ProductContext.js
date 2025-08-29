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
 const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [discountCodes, setDiscountCodes] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);

  const fetchDiscountCodes = async () => {
    try {
      const res = await api.get('/Discount');
      setDiscountCodes(res.data);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    }
  };

  const fetchDiscountTypes = async () => {
    try {
      const res = await api.get('/ProductDiscount/discountType');
      setDiscountTypes(res.data);
    } catch (error) {
      console.error('Error fetching discount types:', error);
    }
  };


  const fetchProducts = async () => {
  setLoading(true);
  try {
    const [productsRes, stocksRes] = await Promise.all([
      api.get('/Product'),
       api.get('/Stock') 
    ]);
    setProducts(productsRes.data);
    setStocks(stocksRes.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchProducts();
   fetchDiscountCodes();
    fetchDiscountTypes();
}, []);
const addProductDiscount = async (productId, discounts) => {
  try {
    // Map frontend discount objects to backend payload
    const payload = discounts.map(d => ({
      productId,
      discountId: discountCodes.find(dc => dc.discountCode === d.code)?.discountId || 0,
      discountType: d.discountType,
      discountAmount: Number(d.discountAmount) || 0,
      discountPercentage: Number(d.discountPercentage) || 0,
    }));

    const response = await api.post('/ProductDiscount', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding product discounts:', error);
    throw error;
  }
};

  const applyProductDiscount = async (productId, newDiscount) => {
  try {
    const payload = {
      productId,
      discountId: discountCodes.find(dc => dc.discountCode === newDiscount.code)?.discountId || newDiscount.discountId || 0,
      discountType: newDiscount.discountType,
      discountAmount: Number(newDiscount.discountAmount) || 0,
      discountPercentage: Number(newDiscount.discountPercentage) || 0,
    };

    const response = await api.post('/ProductDiscount', [payload]); // backend expects array
    return response.data;
  } catch (error) {
    console.error('Error applying product discount:', error);
    throw error;
  }
};

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
   const payload = { ...updatedProduct };
    if (!updatedProduct.imageUrl) {
      delete payload.imageUrl; 
    }

    const response = await api.put(`/Product/${id}`, payload);
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
             imageUrl: payload.imageUrl ? payload.imageUrl : product.imageUrl, // ✅ al
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
const deleteProductDiscount = async (productDiscountId) => {
  try {
    await api.delete(`/ProductDiscount/${productDiscountId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting product discount ${productDiscountId}:`, error);
    throw error;
  }
};

const getProductDiscounts = async (productId) => {
  try {
    const res = await api.get(`/ProductDiscount/byProduct/${productId}`);
    return res.data.map(d => ({
       productDiscountId: d.productDiscountId, 
      discountId: d.discountId,
      code: d.discountCode || d.discount?.discountCode || '',
      discountType: d.discountType,
      discountAmount: d.discountAmount,
      discountPercentage: d.discountPercentage
    }));
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`No discounts found for product ${productId}`);
      return [];  // 👈 return empty instead of error
    }
    console.error(`Error fetching discounts for product ${productId}:`, error);
    return [];
  }
};
  const value = {
    products,
     stocks,
    loading,
     setLoading,
    addProduct,
    deleteProduct,
    updateProduct,
     fetchProducts,
      discountCodes,       // ✅ expose to context
    discountTypes ,
    addProductDiscount,
      getProductDiscounts ,
      applyProductDiscount,
      deleteProductDiscount,
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