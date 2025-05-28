import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/Category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (newCategory) => {
    try {
      const response = await api.post('/Category', [newCategory]);
      setCategories([...categories, ...response.data]);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/Category/${id}`);
      setCategories(categories.filter(category => category.categoryId !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const updateCategory = async (id, updatedCategory) => {
    try {
      const response = await api.put(`/Category/${id}`, updatedCategory);
      setCategories(categories.map(cat =>
  cat.categoryId === id ? response.data : cat
));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const value = {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    loading
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
