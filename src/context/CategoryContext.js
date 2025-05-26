import { createContext, useState, useContext } from 'react';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Books' },
    { id: 4, name: 'Home & Kitchen' },
    { id: 5, name: 'Sports' }
  ]);

  const addCategory = (newCategory) => {
    const category = {
      ...newCategory,
      id: categories.length + 1
    };
    setCategories([...categories, category]);
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, ...updatedCategory } : category
    ));
  };

  const value = {
    categories,
    addCategory,
    deleteCategory,
    updateCategory
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