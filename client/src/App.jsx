import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Dashboard from "@/pages/dashboard";
import DashboardHome from "@/components/blocks/Dashboard/dashboard-home";
import DashboardHistory from "@/components/blocks/Dashboard/dashboard-history";
import Analytics from "@/components/blocks/Dashboard/analytics";
import SentimentDashboard from "@/pages/sentiment-dashboard";
import NotFoundPage from "@/pages/not-found-page";
import Login from "@/pages/login";
import SignUp from "@/pages/sign-up";
import ProtectedRoute from "@/components/protected-route";
import ChatReal from "@/components/blocks/Chat/real-avatar";
import ChatAzure from "@/components/blocks/Dashboard/chat-azure";
import OfflineChat from "@/pages/offline-chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chat-real" element={<ChatReal />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<NotFoundPage />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat-azure" element={<ChatAzure />} />
          <Route path="history" element={<DashboardHistory />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="sentiment" element={<SentimentDashboard />} />
          <Route path="offline-chat" element={<OfflineChat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
