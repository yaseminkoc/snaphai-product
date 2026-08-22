import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter: rotalar hash içinde tutulur (snaphai.com/app/#/connect).
// Böylece herhangi bir statik sunucuda derin bağlantılar (yenileme/direkt açma)
// sunucu tarafı rewrite'a ihtiyaç duymadan çalışır. base yine /app/ (varlıklar için).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
