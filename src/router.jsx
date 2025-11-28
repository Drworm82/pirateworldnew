// ============================
// router.jsx — PirateWorld Router (HASH MODE)
// ============================

import React from "react";
import { createHashRouter } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";

import Splash from "./Splash.jsx";
import ExplorePage from "./pages/Explore.jsx";

const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Splash />,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
    ],
  },
]);

export default router;
