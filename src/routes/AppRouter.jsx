// src/routes/AppRouter.jsx
/**
 * @fileoverview Main Application Router.
 * Defines the complete route table for the application, mapping paths to page components
 * and wrapping authenticated paths in ProtectedRoute guards.
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import { FullscreenCenter } from "../components/Layout"; // Old Components
import Layout from "../components/Layout"; // New Responsive Layout
import ProtectedRoute from "../components/ProtectedRoute";
import { ROUTES } from "../constants/routes";

import LandingPage from "../pages/LandingPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import WellnessAssistantPage from "../pages/WellnessAssistantPage.jsx";
import HistoryPage from "../pages/HistoryPage.jsx";
import GoogleCallBackPage from "../pages/GoogleCallBackPage.jsx";
import ProfileSetupPage from "../pages/ProfileSetupPage.jsx";
import Navbar from "../components/Navbar.jsx";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route
        path={ROUTES.HOME}
        element={
          <FullscreenCenter>
            <LandingPage />
          </FullscreenCenter>
        }
      />
      <Route
        path={ROUTES.SIGNUP}
        element={
          <FullscreenCenter>
            <SignupPage />
          </FullscreenCenter>
        }
      />
      <Route
        path={ROUTES.LOGIN}
        element={
          <FullscreenCenter>
            <LoginPage />
          </FullscreenCenter>
        }
      />
      <Route
        path={ROUTES.GOOGLE_CALLBACK}
        element={
          <FullscreenCenter>
            <GoogleCallBackPage />
          </FullscreenCenter>
        }
      />

      {/* Protected pages */}

      {/* Profile setup: user must be logged in, but profile can be incomplete */}
      <Route
        path={ROUTES.PROFILE_SETUP}
        element={
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute requireProfileComplete>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ASSISTANT}
        element={
          <ProtectedRoute requireProfileComplete>
            <Layout>
              <WellnessAssistantPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.HISTORY}
        element={
          <ProtectedRoute requireProfileComplete>
            <Layout>
              <HistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* 404 Route */}
      <Route
        path="*"
        element={
          <FullscreenCenter>
            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                404 - Page Not Found
              </h1>
              <p>
                Return to{" "}
                <a href={ROUTES.HOME} style={{ color: "#60a5fa" }}>
                  homepage
                </a>
              </p>
            </div>
          </FullscreenCenter>
        }
      />
    </Routes>
  );
};

export default AppRouter;
