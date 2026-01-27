import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserDataPage from "./pages/UserDataPage";
import CapturePage from "./pages/CapturePage";
import ResultScreen from "./components/ResultScreen";
import AppLayout from "./components/AppLayout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<UserDataPage />} />
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/result" element={<ResultScreen />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;


