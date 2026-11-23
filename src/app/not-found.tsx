import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import '@/styles/sub.css';

export default function NotFound() {
  return (
    <div className="sub">
      <SiteHeader sheet="Sheet 404 - Not found" />
      <main>
        <div className="wrap">
          <p className="legend">404</p>
          <h1>This sheet is not<br /><span className="b">in the set.</span></h1>
          <p className="lede">The page you asked for does not exist. Go back to the module.</p>
          <div className="cta"><Link className="primary" href="/">Back to the module</Link></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
