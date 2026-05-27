import React from "react"
import { createBrowserRouter } from "react-router-dom"
import RootLayout from "../app/layout"
import { HomePage } from "../app/page"
import { ProductList } from "../app/products/page"
import { ProductDetail } from "../app/products/product/page"
import { Cart } from "../app/cart/page"
import type { TAppContextType } from "../types"

export const APPContext = React.createContext<TAppContextType>({})

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/products", element: <ProductList /> },
      { path: "/product/:id", element: <ProductDetail /> },
      { path: "/cart", element: <Cart /> },
    ],
  },
])

export { router }