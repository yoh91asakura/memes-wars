import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './shared/styles/ThemeProvider';
// import { checkBrowserExtensions, createLockdownErrorHandler } from './utils/browserCheck';
import './index.css';

// Check for browser extensions that may cause lockdown errors
// checkBrowserExtensions();

// Set up development error handler for lockdown issues
// if (import.meta.env.DEV) {
//   createLockdownErrorHandler();
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
