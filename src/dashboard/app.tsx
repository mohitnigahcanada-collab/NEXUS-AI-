import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/Dashboard";
import { AnalyticsPage } from "./pages/Analytics";
import { KeysPage } from "./pages/Keys";
import { SettingsPage } from "./pages/Settings";
import { useWebSocket } from "./hooks/useWebSocket";
import { useStats } from "./hooks/useStats";
import "./compiled.css";

type Page = "dashboard" | "analytics" | "keys" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { liveData } = useWebSocket();
  const { stats, refresh } = useStats();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage stats={stats} liveData={liveData} />;
      case "analytics":
        return <AnalyticsPage stats={stats} />;
      case "keys":
        return <KeysPage />;
      case "settings":
        return <SettingsPage onSave={refresh} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="app-main">
        <div className="app-content">{renderPage()}</div>
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
