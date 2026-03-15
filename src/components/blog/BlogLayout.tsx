import { Link, Outlet } from 'react-router-dom'
import styles from '../../styles/Blog.module.css'

export function BlogLayout() {
  return (
    <div className={styles.blogLayout}>
      <header className={styles.blogHeader}>
        <Link to="/" className={styles.blogLogo}>
          Fast Resume
        </Link>
        <nav className={styles.blogNav}>
          <Link to="/">Resume</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main className={styles.blogMain}>
        <Outlet />
      </main>
    </div>
  )
}
