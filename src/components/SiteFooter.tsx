import Link from 'next/link';
import CookieSettingsButton from '@/components/consent/CookieSettingsButton';

export default function SiteFooter() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} Modularix - A Synotech company</span>
      <nav aria-label="Footer">
        <Link href="/">Module</Link>
        <Link href="/journey">Journey</Link>
        <Link href="/configure">Configure</Link>
        <Link href="/company">Company</Link>
        <Link href="/#contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/terms">Terms</Link>
        <CookieSettingsButton />
      </nav>
      <span>Built indoors - Shipped anywhere - Set down once</span>
    </footer>
  );
}
