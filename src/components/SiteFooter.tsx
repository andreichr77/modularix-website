import Link from 'next/link';

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
      </nav>
      <span>Built indoors - Shipped anywhere - Set down once</span>
    </footer>
  );
}
