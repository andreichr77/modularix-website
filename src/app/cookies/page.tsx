import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import CookieSettingsButton from '@/components/consent/CookieSettingsButton';
import { LEGAL } from '@/data/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'The cookies and similar technologies used on the Modularix website, and how to control them.',
};

export default function CookiesPage() {
  return (
    <LegalPage sheet="Legal - Cookies" legend="Legal - Cookies" title="Cookie Policy">
      <p>This policy explains which cookies and similar technologies the Modularix site uses and how you can control them. It should be read together with our <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>1. What they are</h2>
      <p>Cookies are small files stored on your device when you visit a site. Similar technologies, such as local storage and tracking scripts, work in the same way. Under the ePrivacy rules we ask for your consent before we use any that are not strictly necessary.</p>

      <h2>2. What we use</h2>
      <h2 style={{ fontSize: 18, margin: '24px 0 10px' }}>Essential (always on)</h2>
      <div className="tblwrap"><table>
        <thead><tr><th>Name</th><th>Provider</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td>mx-consent (local storage)</td><td>Modularix</td><td>Stores your cookie choice so we do not ask again on every page</td><td>Up to 6 months</td></tr>
        </tbody>
      </table></div>

      <h2 style={{ fontSize: 18, margin: '24px 0 10px' }}>Advertising measurement (only with your consent)</h2>
      <p>If you accept, we load the LinkedIn Insight Tag (partner ID {LEGAL.linkedInPartnerId}), provided by LinkedIn Ireland Unlimited Company. It lets us measure conversions from LinkedIn ads, build audiences and see aggregated information about visitors. LinkedIn sets the cookies below. Names and durations are decided by LinkedIn and can change, see <a href="https://www.linkedin.com/legal/l/cookie-table" target="_blank" rel="noopener">LinkedIn's cookie table</a>.</p>
      <div className="tblwrap"><table>
        <thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td>bcookie, bscookie</td><td>Browser identifier</td><td>Up to 1 year</td></tr>
          <tr><td>lidc</td><td>Routing of requests</td><td>24 hours</td></tr>
          <tr><td>UserMatchHistory, AnalyticsSyncHistory</td><td>Matching visits to LinkedIn members for ad measurement</td><td>30 days</td></tr>
          <tr><td>li_sugr</td><td>Browser identifier for probabilistic matching</td><td>90 days</td></tr>
        </tbody>
      </table></div>
      <p>If you accept, we also load the Meta Pixel (ID {LEGAL.metaPixelId}), provided by Meta Platforms Ireland Limited. It lets us measure conversions from Facebook and Instagram ads and build audiences. See <a href="https://www.facebook.com/privacy/policies/cookies/" target="_blank" rel="noopener">Meta's cookie policy</a>. Names and durations are decided by Meta and can change.</p>
      <div className="tblwrap"><table>
        <thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td>_fbp</td><td>Identifies the browser for advertising measurement</td><td>Up to 3 months</td></tr>
          <tr><td>_fbc</td><td>Stores the click identifier when you arrive from a Meta ad</td><td>Up to 3 months</td></tr>
        </tbody>
      </table></div>
      <p>Nothing in this category loads until you press "Accept all" or switch it on under "Customize".</p>

      <h2>3. Third-party content</h2>
      <p>The site loads typefaces from Google Fonts. This sets no cookie, but your browser contacts Google servers and your IP address is visible to them. See the <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>4. Your choices</h2>
      <p>You can accept, refuse or customise optional cookies in the banner shown on your first visit. You can change your mind at any time:</p>
      <p><CookieSettingsButton /></p>
      <p>If you withdraw consent after the tag has loaded, the page reloads so the script stops. You can also delete cookies in your browser settings. LinkedIn members can manage ad preferences at <a href="https://www.linkedin.com/psettings/guest-controls" target="_blank" rel="noopener">linkedin.com/psettings/guest-controls</a>.</p>

      <h2>5. Contact</h2>
      <p>Questions about cookies: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.</p>
    </LegalPage>
  );
}
