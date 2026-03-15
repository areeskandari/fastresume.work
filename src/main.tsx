import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApplyApp } from './ApplyApp'
import { BlogLayout } from './components/blog/BlogLayout'
import { BlogList } from './pages/BlogList'
import { BlogPost } from './pages/BlogPost'
import { AboutProduct } from './pages/AboutProduct'
import { CmsApp } from './pages/CmsApp'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplyApp />} />
        <Route path="/blog" element={<BlogLayout />}>
          <Route index element={<BlogList />} />
          <Route path=":slug" element={<BlogPost />} />
        </Route>
        <Route path="/about" element={<AboutProduct />} />
        <Route path="/admin" element={<CmsApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
