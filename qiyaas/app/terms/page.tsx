import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qiyaas - Terms of Service",
};

const sections = [

   {
    title: "Purpose of the site",
    body: `Qiyaas is a daily word game provided for entertainment purposes. Users agree not to attempt to disrupt or interfere with the operation of the website.`,
  },

  {
    title: "Intellectual Property",
    body: `All game design, content, and branding associated with Qiyaas are the property of the website owner unless otherwise stated.`,
  },
  
  {
    title: "No Warranty",
    body: `Qiyaas is provided “as is” without warranties of any kind. We do not guarantee that the website will always be available or error-free.`,
  },
  
  {
    title: "Limitation of Liability",
    body: `To the fullest extent permitted by law, Qiyaas and its maintainers will not be liable for any damages arising from your use of the site, including but not limited to direct, indirect, incidental, or consequential damages.`,
  },
  
  {
    title: "Changes to These Terms",
    body: `We reserve the right to modify or discontinue any part of the website at any time without notice. Continued use of the site after changes are posted constitutes your acceptance of the revised terms.`,
  },
  {
    title: "Questions?",
    body: `For questions about these Terms of Service, please email`,
    email: "info@qiyaasgame.com"
  }
];

export default function TermsPage() {
  const effectiveDate = "June 11, 2026";

  return (
  <main className="flex-1 bg-black text-gray-100 px-6 py-24 flex flex-col items-center">
      <div className="w-full max-w-xl">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#74A8DC', boxShadow: '0 0 6px 2px rgba(116,168,220,0.7)' }} />
          <span className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#6AA84F', boxShadow: '0 0 6px 2px rgba(106,168,79,0.7)' }} />
          <span className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#E06666', boxShadow: '0 0 6px 2px rgba(224,102,102,0.7)' }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-white page-body">Effective {effectiveDate}</p>
        </div>

        <div className="space-y-8">
          {sections.map(({ title, body, email}) => (
            <section key={title} className="border-l-2 border-yellow-500 pl-5">
              <h1 className="page-heading font-semibold text-gray-200 mb-2">{title}</h1>
              <p className="text-white page-body leading-relaxed">{body}</p>
              {email && (
              <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300 transition-colors page-body">
                {email}
              </a>
              )}
            </section>
          ))}
        </div>

      </div>
    </main>
  );
}