import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, View, Image } from '@aws-amplify/ui-react';
import App from './App.tsx';
import './index.css'
import '@aws-amplify/ui-react/styles.css';
import logo from './assets/MemoryCellar.png';


import {MemoryUpload} from './components/MemoryUpload';
import {MemoryGallery} from './components/MemoryGallery';
//import {MemoryItem} from './components/MemoryItem';
import {MemorySearch} from './components/MemorySearch';
//import EditMemoryPage from './components/EditMemory.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authenticator
      components={{
        Header() {
          return (
            <View textAlign="center" padding="large">
              <Image src={logo} alt="MemoryCellar Logo" className="logo" />
            </View>
          );
        }
      }}
    >
      
      <Router>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/create" replace />} />
            <Route path="/create" element={<MemoryUpload />} />
            <Route path="/gallery" element={<MemoryGallery />} />
            <Route path="/search" element={<MemorySearch />} />
          </Route>
        </Routes>
      </Router>
    </Authenticator>
  </React.StrictMode>
);