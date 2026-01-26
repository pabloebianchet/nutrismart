import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserDataPage from "./pages/UserDataPage";
import CapturePage from "./pages/CapturePage";
import ResultScreen from "./components/ResultScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserDataPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result" element={<ResultScreen />} /> 
      </Routes>
    </Router>
  );
};

export default App;



