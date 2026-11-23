import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import '@/styles/sub.css';
import '@/styles/projects.css';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Four Modularix data center projects, shown in 3D. Client details are confidential.',
};

export default function ProjectsPage() {
  return (
    <div className="sub">
      <SiteHeader active="projects" sheet="Sheet C - Projects" />
      <main>
        <div className="wrap">
          <p className="legend">Projects - Delivered and in design</p>
          <h1>Four modules.<br /><span className="b">Walk through</span> them.</h1>
          <p className="lede">Each project is shown as a 3D model you can fly through with the keyboard. Client names and locations are confidential, so projects are numbered.</p>
          <ProjectsGrid />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
