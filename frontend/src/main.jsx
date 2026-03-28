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
    <Toaster />
    <Provider store={store}>
      <LoaderProvider>
        <App />
      </LoaderProvider>
    </Provider>
  </>
)
