import React from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import LocationListSection from '../../components/LocationListSection';
import './ListLocation.css';

export default function ListLocation() {
  return (
    <div className="page-container">
      <Topbar />
      <Sidebar />
      <div className="content-container">
        <LocationListSection />
      </div>
    </div>
  );
} 