// src/context/LocationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [locationList, setLocationList] = useState([]);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/Location');
      setLocationList(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const addLocation = async (name) => {
    try {
    await api.post('/Location', [{ locationName: name }]);
      fetchLocations(); // Refresh list
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const updateLocation = async (id, name) => {
    try {
      await api.put(`/Location/${id}`, [{ locationName: name }]);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const deleteLocation = async (id) => {
  try {
    console.log("Deleting location with ID:", id); 
    await api.delete(`/Location/${id}`);
    fetchLocations();
  } catch (error) {
    console.error('Error deleting location:', error);
  }
};

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <LocationContext.Provider
      value={{ locationList, addLocation, updateLocation, deleteLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};
