import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import '@/styles/sub.css';
import '@/styles/configurator.css';

export const metadata: Metadata = {
  title: 'Configurator',
  description: 'Configure a Modularix Legacy container data center: capacity, racks, cooling and UPS, with a live floor plan and 3D view, then request a quote.',
};

export default function ConfiguratorPage() {
  return (
    <div className="sub cfgpage">
      <SiteHeader active="configure" sheet="Sheet C - Configurator" />
      <iframe className="cfgframe" src="/configurator-app/index.html" title="Modularix Legacy container configurator" allow="fullscreen" />
    </div>
  );
}
