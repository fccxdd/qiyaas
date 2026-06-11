import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qiyaas - Privacy Policy"
};

const sections = [
  {
    title: "Information we collect",
    body: "When you visit this website, certain non-personal information may be collected automatically. This may include:",
    list: ["Browser type", "Device type", "Pages visited", "Time spent on the website", "Approximate location based on IP address"],
    body2: "This information is used to improve the performance and usability of the website.",
  },
  {
    title: "Google Analytics",
    body: `This website uses Google Analytics, a web analytics service provided by Google. Google Analytics uses cookies and similar technologies to collect information about how visitors use the site. This data helps us understand usage patterns and improve the website.`,
  },
  {
    title: "Advertising",
    body: `This website may display advertisements through Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings.`,
  },
  {
    title: "Cookies",
    body: `Cookies are small data files stored on your device. This site may use them to improve functionality, analyze traffic, and support advertising. You can disable cookies through your browser settings.`,
  },
  {
    title: "Third-Party Services",
    body: `This website may use third-party services that collect and process data according to their own privacy policies.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Updates will be posted on this page.`,
  },
  {
    title: "Questions?",
    body: `For questions about this Privacy Policy, please email`,
    email: "info@qiyaasgame.com",
  },
];

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <br />
          <h2 className="text-white text-xl">Qiyaas Game respects your privacy. This policy explains what information may be collected when you use qiyaasgame.com and how it is used.</h2>
          <br />
          <p className="text-white page-body">Effective {effectiveDate}</p>
        </div>

        <div className="space-y-8">
          {sections.map(({ title, body, body2, list, email }) => (
            <section key={title} className="border-l-2 border-yellow-500 pl-5">
              <h1 className="page-heading font-semibold text-gray-200 mb-2">{title}</h1>
              {body && <p className="text-white page-body leading-relaxed">{body}</p>}
              {list && (
                <ul className="mt-2 mb-2 space-y-1">
                  {list.map((item) => (
                    <li key={item} className="text-white page-body flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {body2 && <p className="text-white page-body leading-relaxed mt-2">{body2}</p>}
              {email && (
                <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300 transition-colors page-body mt-2 inline-block">
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