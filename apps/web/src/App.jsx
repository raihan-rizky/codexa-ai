import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ChatInterface from "./components/ChatInterface";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<ChatInterface />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
