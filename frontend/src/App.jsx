import { useState, useEffect } from "react";
import Login from "./components/Login";
import PersonalData from "./components/PersonalData";
import "./App.css";
import secureStorage from "react-secure-storage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const accessToken = secureStorage.getItem("accessToken");
    if (accessToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    secureStorage.removeItem("accessToken");
    secureStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
  };

  return (
    <div className="app-container">
      <h1>Welcome to My React App</h1>
      {isLoggedIn ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <PersonalData />
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
