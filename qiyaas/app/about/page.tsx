import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qiyaas - About Us",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-black text-gray-100 px-6 pt-16 pb-24 flex flex-col items-center">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full"
              style={{ background: '#74A8DC', boxShadow: '0 0 6px 2px rgba(116,168,220,0.7)' }} />
            <span className="w-2.5 h-2.5 rounded-full"
              style={{ background: '#6AA84F', boxShadow: '0 0 6px 2px rgba(106,168,79,0.7)' }} />
            <span className="w-2.5 h-2.5 rounded-full"
              style={{ background: '#E06666', boxShadow: '0 0 6px 2px rgba(224,102,102,0.7)' }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">About Qiyaas</h1>
          <p className="text-white page-body text-base leading-relaxed">
            Qiyaas is a daily word game similar in concept to Hangman, with a touch of logic based deduction to assist players as they solve.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-10 space-y-4">
          <h2 className="page-heading font-semibold text-white uppercase tracking-widest">How it works</h2>
          <p className="text-gray-300 page-body leading-relaxed">
            Each puzzle begins with 3 numbers that represent three distinct clues.
            Your objective is to deduce those clues and correctly guess 3 words: a <span className="text-[#74A8DC]">noun</span>, a <span className="text-[#6AA84F]">verb</span>, and an <span className="text-[#E06666]">adjective</span>.
          </p>

          <div className="flex justify-center gap-12 my-8">
            {[
              { color: '#74A8DC', glow: 'rgba(116,168,220,0.8)', label: 'Noun', sub: 'a person, place, or thing', animation: 'blue-neon-glow' },
              { color: '#6AA84F', glow: 'rgba(106,168,79,0.8)', label: 'Verb', sub: 'an action or state', animation: 'green-neon-glow' },
              { color: '#E06666', glow: 'rgba(224,102,102,0.8)', label: 'Adjective', sub: 'describes an attribute', animation: 'pink-neon-glow' },
            ].map(({ color, glow, label, sub, animation }, index) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: color,
                    boxShadow: `0 0 30px 12px ${glow}, 0 0 60px 20px ${glow}40`,
                    animation: `${animation} 8s ease-in-out infinite`,
                    animationDelay: `${index * 0.4}s`,
                    transform: 'translateZ(0)',
                    willChange: 'filter, opacity',
                  }}
                />
                <span
                  className="page-body tracking-wide"
                  style={{ color, fontFamily: "'Inknut Antiqua', serif" }}
                >
                  {label}
                </span>
                <span
                  className="page-body text-center leading-relaxed"
                  style={{ color: color + '80', fontFamily: "'Indie Flower', cursive" }}
                >
                  {sub}
                </span>
              </div>
            ))}
          </div>

          <p className="text-gray-300 leading-relaxed page-body">
            It combines all the classic elements of other logic and word games with a built in hint system as you progress.
            <br /><br />
            The goal is to identify the correct words within a limited number of attempts using the clues provided.
            <br /><br />
            Unlike traditional word games, Qiyaas focuses on structured reasoning rather than random guessing, making each puzzle a focused mental exercise.
            A new puzzle is released every day.
          </p>
        </section>

        {/* FAQ */}
        <section className="space-y-8">
          <h1 className="page-heading font-semibold text-white uppercase tracking-widest">FAQ</h1>
          {[
            { q: "Is Qiyaas free?", a: "Yes. Qiyaas is completely free and can be played directly in your browser." },
            { q: "How often are new puzzles released?", a: "One new puzzle is released every day at Midnight EST." },
            { q: "Can I play on my phone?", a: "Yes. The game works on both mobile and desktop browsers." },
            { q: "Do I need an account?", a: "No account is required to play." },
          ].map(({ q, a }) => (
            <section key={q} className="border-l-2 border-yellow-500 pl-5">
              <h1 className="page-heading font-semibold text-gray-200 mb-2">{q}</h1>
              <p className="text-white page-body leading-relaxed">{a}</p>
            </section>
          ))}
        </section>

      </div>
    </main>
  );
}