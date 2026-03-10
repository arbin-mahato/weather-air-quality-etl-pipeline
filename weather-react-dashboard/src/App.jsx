import { Routes, Route } from "react-router-dom";
import { WeatherProvider } from "./contexts/WeatherContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import TemperaturePage from "./pages/TemperaturePage";
import PrecipitationPage from "./pages/PrecipitationPage";
import WindPage from "./pages/WindPage";
import DataExplorer from "./pages/DataExplorer";
import PipelinePage from "./pages/PipelinePage";

export default function App() {
  return (
    <ThemeProvider>
      <WeatherProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/temperature" element={<TemperaturePage />} />
            <Route path="/precipitation" element={<PrecipitationPage />} />
            <Route path="/wind" element={<WindPage />} />
            <Route path="/explorer" element={<DataExplorer />} />
            <Route path="/pipeline" element={<PipelinePage />} />
          </Routes>
        </Layout>
      </WeatherProvider>
    </ThemeProvider>
  );
}
