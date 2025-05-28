import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // make sure this is set up

const BrandContext = createContext();

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/Brand');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async (newBrand) => {
    try {
      const response = await api.post('/Brand', [newBrand]); // expects a list
      setBrands([...brands, ...response.data]);
    } catch (error) {
      console.error('Error adding brand:', error);
    }
  };

  const deleteBrand = async (id) => {
    try {
      await api.delete(`/Brand/${id}`);
      setBrands(brands.filter(b => b.brandId !== id));
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  const updateBrand = async (id, updatedBrand) => {
    try {
      const response = await api.put(`/Brand/${id}`, updatedBrand);
      setBrands(brands.map(b => b.brandId === id ? response.data : b));
    } catch (error) {
      console.error('Error updating brand:', error);
    }
  };

  return (
    <BrandContext.Provider value={{ brands, addBrand, deleteBrand, updateBrand, loading }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrands must be used within BrandProvider');
  return context;
}
