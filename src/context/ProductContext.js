import { createContext, useState, useContext, useEffect } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    // Initialize from localStorage or use default products
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [
      {
        id: 1,
        name: 'iPhone 13 Pro',
        shortName: 'IP13P',
        sku: 'APP-IP13P-256',
        brand: 'Apple',
        quantity: 50,
        quantityAlert: 10,
        image: 'https://example.com/iphone13pro.jpg',
        date: '2024-03-20',
        location: 'Warehouse A',
        purchasePrice: 899.99,
        markedPrice: 1099.99,
        sellingPrice: 999.99,
        discountCode: 'SPRING20'
      },
      {
        id: 2,
        name: 'Samsung Galaxy S21',
        shortName: 'SGS21',
        sku: 'SAM-SGS21-128',
        brand: 'Samsung',
        quantity: 35,
        quantityAlert: 15,
        image: 'https://example.com/galaxys21.jpg',
        date: '2024-03-19',
        location: 'Store 1',
        purchasePrice: 699.99,
        markedPrice: 899.99,
        sellingPrice: 799.99,
        discountCode: 'SUMMER15'
      }
    ];
  });

  // Persist to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: Date.now() // Use timestamp for unique ID
    };
    setProducts([...products, product]);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, ...updatedProduct } : product
    ));
  };

  const addDiscount = (productId, discount) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        const newDiscount = {
          ...discount,
          id: product.discounts.length + 1
        };
        return {
          ...product,
          discounts: [...product.discounts, newDiscount]
        };
      }
      return product;
    }));
  };

  const deleteDiscount = (productId, discountId) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          discounts: product.discounts.filter(d => d.id !== discountId)
        };
      }
      return product;
    }));
  };

  const value = {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    addDiscount,
    deleteDiscount
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