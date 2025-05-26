import { createContext, useState, useContext } from 'react';

const BrandContext = createContext();

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Samsung' },
    { id: 3, name: 'Nike' },
    { id: 4, name: 'Adidas' },
    { id: 5, name: 'Sony' }
  ]);

  const addBrand = (newBrand) => {
    const brand = {
      ...newBrand,
      id: brands.length + 1
    };
    setBrands([...brands, brand]);
  };

  const deleteBrand = (id) => {
    setBrands(brands.filter(brand => brand.id !== id));
  };

  const updateBrand = (id, updatedBrand) => {
    setBrands(brands.map(brand => 
      brand.id === id ? { ...brand, ...updatedBrand } : brand
    ));
  };

  const value = {
    brands,
    addBrand,
    deleteBrand,
    updateBrand
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
} 