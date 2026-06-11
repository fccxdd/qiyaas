import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qiyaas - Contact Us",
};

const sections = [
  {
    title: "General Inquiries",
    body: "Questions, feedback, or anything else — we'd love to hear from you.",
    email: "info@qiyaasgame.com",
  },
  {
    title: "Report an issue",
    body: "Found something broken or inaccurate? Email us with as much detail as possible — screenshots help."
  },
];

export default function ContactPage() {
  return (
    <main className="flex-1 bg-black text-gray-100 px-6 pt-16 pb-24 flex flex-col items-center">
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
          <h1 className="text-3xl font-bold tracking-tight mb-3">Get in touch</h1>
        </div>

        <div className="space-y-8">
          {sections.map(({ title, body, email }) => (
            <section key={title} className="border-l-2 border-yellow-500 pl-5">
              <h1 className="page-heading font-semibold text-gray-200 mb-2">{title}</h1>
              <p className="text-white page-body leading-relaxed">{body}</p>
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