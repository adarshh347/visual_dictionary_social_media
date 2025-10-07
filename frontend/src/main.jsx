import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import PostDetailPage from './components/PostDetailPage.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App is the main layout
    children: [ // These routes render inside the App's <Outlet />
      {
        index: true, // This makes HomePage the default child route for "/"
        element: <HomePage />,
      },
      {
        path: "posts/:postId",
        element: <PostDetailPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);