import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomeFeed from "./pages/HomeFeed";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import CVAnalysis from "./pages/CVAnalysis";
import Jobs from "./pages/Jobs";
import AppliedJobs from "./pages/AppliedJobs";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import Search from "./pages/Search";
import News from "./pages/News";
import Games from "./pages/Games";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { SignalRProvider } from "./context/SignalRContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <SignalRProvider>
        <Router>
          <Routes>
            {/* Auth Rotaları */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Dashboard Rotaları (DashboardLayout şablonu içinde çalışır - Korumalı) */}
            <Route 
              path="/" 
              element = {
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomeFeed />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="discover" element={<Discover />} />
              <Route path="cv-analysis" element={<CVAnalysis />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="applied-jobs" element={<AppliedJobs />} />
              <Route path="messages" element={<Messages />} />
              <Route path="chat" element={<Chat />} />
              <Route path="search" element={<Search />} />
              <Route path="news" element={<News />} />
              <Route path="games" element={<Games />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </SignalRProvider>
    </AuthProvider>
  );
}

export default App;