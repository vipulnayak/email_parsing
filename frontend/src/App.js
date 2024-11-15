// src/App.js
import React, { useState } from 'react';
import EmailList from './components/EmailList';
import Auth from './components/Auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <EmailList />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;