import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { LEGAL } from '@/data/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Modularix collects and uses personal data, and the rights you have under the GDPR.',
};

export default function PrivacyPage() {
  return (
    <LegalPage sheet="Legal - Privacy" legend="Legal - Privacy" title="Privacy Policy">
      <p>This policy explains what personal data we collect when you visit this site or contact us, why we use it, how long we keep it and what rights you have. We process personal data in line with Regulation (EU) 2016/679 (GDPR) and Romanian law.</p>

      <h2>1. Who is responsible</h2>
      <p>The controller of your personal data is <strong>{LEGAL.entity}</strong>, operating the Modularix brand ("Modularix", "we", "us").</p>
      <ul>
        <li>Registered office: {LEGAL.address}</li>
        <li>Trade register: {LEGAL.regNo}</li>
        <li>Tax ID: {LEGAL.vat}</li>
        <li>Privacy contact: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></li>
      </ul>

      <h2>2. What we collect and why</h2>
      <div className="tblwrap"><table>
        <thead><tr><th>Situation</th><th>Data</th><th>Purpose</th><th>Legal basis</th></tr></thead>
        <tbody>
          <tr><td>Visiting the site</td><td>IP address, browser and device type, pages requested, date and time (server logs kept by our hosting provider)</td><td>Delivering the site, security, fixing faults</td><td>Legitimate interest (Art. 6(1)(f))</td></tr>
          <tr><td>Writing to us by email</td><td>Name, email address, company and whatever you tell us</td><td>Answering your enquiry and following up</td><td>Steps at your request before a contract, or legitimate interest (Art. 6(1)(b), (f))</td></tr>
          <tr><td>Requesting a quote in the configurator</td><td>Name, company, email, phone (optional), project name, message and the configuration you built</td><td>Preparing a response and a quotation</td><td>Your consent and steps at your request (Art. 6(1)(a), (b))</td></tr>
          <tr><td>Optional advertising measurement</td><td>Cookie and device identifiers, page visits, IP address, browser data sent to LinkedIn and Meta</td><td>Measuring and improving our LinkedIn, Facebook and Instagram advertising</td><td>Your consent (Art. 6(1)(a)), only if you accept</td></tr>
          <tr><td>Remembering your cookie choice</td><td>Your choice and its date, stored on your device</td><td>Respecting your consent decision</td><td>Legal obligation and legitimate interest (Art. 6(1)(c), (f))</td></tr>
        </tbody>
      </table></div>
      <p>We do not use your data for automated decisions that have legal effects on you. We do not sell personal data.</p>

      <h2>3. Who receives your data</h2>
      <ul>
        <li><strong>Hosting and delivery provider.</strong> The site is hosted by Netlify, Inc., which processes technical request data on our behalf.</li>
        <li><strong>Email and office tools.</strong> Enquiries are received and stored in our company email system.</li>
        <li><strong>LinkedIn Ireland Unlimited Company</strong>, only if you accept advertising cookies. LinkedIn processes the data it collects through its Insight Tag as described in its own privacy policy, and gives us aggregated reports.</li>
        <li><strong>Meta Platforms Ireland Limited</strong>, only if you accept advertising cookies. Meta processes the data it collects through the Meta Pixel as described in its own privacy policy, and gives us aggregated reports and audiences for Facebook and Instagram advertising.</li>
        <li><strong>Google Fonts.</strong> The site loads its typefaces from Google. Your browser requests them from Google servers, which receive your IP address.</li>
        <li><strong>Group companies and advisers.</strong> Other companies of the Synotech group, and professional advisers or authorities where the law requires it or where we need to handle a project enquiry.</li>
      </ul>
      <p>Some of these providers may process data outside the European Economic Area, including in the United States. Where that happens we rely on an adequacy decision, such as the EU-US Data Privacy Framework, or on standard contractual clauses.</p>

      <h2>4. How long we keep it</h2>
      <ul>
        <li>Server logs: kept by the hosting provider for a short period, normally no more than 30 days.</li>
        <li>Enquiries and quote requests: for as long as needed to answer and follow up, and normally no more than 3 years after the last contact unless we start a business relationship.</li>
        <li>Cookie choice: up to 6 months, after which we ask you again.</li>
        <li>Advertising cookies set by LinkedIn: for the periods listed in our <Link href="/cookies">Cookie Policy</Link>.</li>
        <li>Records we must keep by law, such as accounting documents, for the legal period.</li>
      </ul>

      <h2>5. Your rights</h2>
      <p>You can ask us to give you access to your data, correct it, erase it, restrict its use or send it to you in a portable format. You can object to processing based on legitimate interest. Where we rely on consent, you can withdraw it at any time, without affecting what we did before. You can change your cookie choice with "Cookie settings" in the footer.</p>
      <p>To use any of these rights, write to <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. We answer within one month. You also have the right to complain to the Romanian data protection authority, ANSPDCP (<a href="https://www.dataprotection.ro" target="_blank" rel="noopener">dataprotection.ro</a>), or to the authority in your own country.</p>

      <h2>6. Providing data is your choice</h2>
      <p>You are not required to give us personal data. If you do not, we may not be able to answer a request or prepare a quotation. Refusing optional cookies does not limit how you can use the site.</p>

      <h2>7. Security</h2>
      <p>We use technical and organisational measures that fit the risk, including encrypted connections (HTTPS) and limited access to enquiry data.</p>

      <h2>8. Children</h2>
      <p>This site is for business visitors. It is not directed at children and we do not knowingly collect their data.</p>

      <h2>9. Changes</h2>
      <p>We may update this policy. The date at the top shows the latest version. We will make material changes visible on the site.</p>
    </LegalPage>
  );
}
