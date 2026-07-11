import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast"
import { Provider } from "react-redux"
import { store } from './redux/store.js'
import { LoaderProvider } from './context/LoaderContext'

createRoot(document.getElementById('root')).render(
  <>
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      containerClassName="!top-20"
      toastOptions={{
        duration: 3500,
        className: "!text-sm !font-medium",
      }}
    />
    <Provider store={store}>
      <LoaderProvider>
        <App />
      </LoaderProvider>
    </Provider>
  </>
)
