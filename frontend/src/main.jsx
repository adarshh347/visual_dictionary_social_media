import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import LandingPage from './pages/LandingPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import PostDetailPage from './components/PostDetailPage.jsx'; // Only one import
import HighlightsPage from './pages/HighlightsPage.jsx'; // <-- Import the new page
import './index.css';
import TextFeedPage from './pages/TextFeedPage.jsx'; // <-- Import

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "highlights", element: <HighlightsPage /> }, // <-- Add this route
      { path: "posts/:postId", element: <PostDetailPage /> },
      { path: "feed", element: <TextFeedPage /> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
);