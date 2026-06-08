import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Routes.jsx';
import AuthProvider from './providers/AuthProvider.jsx';
import { ThemeProvider } from './providers/ThemeProvider.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router}/>
          <ToastContainer />  
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);


reportWebVitals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully!', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
