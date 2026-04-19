import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'

import Layout from './components/layout/Layout'
import IngredientsPage from './pages/ingredients/IngredientsPage'
import CategoriesPage from './pages/categories/CategoriesPage'
import ProductsPage from './pages/products/ProductsPage'
import SalesPage from './pages/sales/SalesPage'
import HistoryPage from './pages/sales/HistoryPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/ingredients" replace /> },
      { path: 'ingredients', element: <IngredientsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'history', element: <HistoryPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)