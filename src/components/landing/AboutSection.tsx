import React from 'react';
import { Volume2, FileText, Cpu, Network } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      icon: <Volume2 className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Speech & Audio Processing',
      description:
        'Capture voice notes and spoken announcements with browser microphone recording, audio waveform inspection, and phonetic transcription.',
    },
    {
      icon: <FileText className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Document Intelligence',
      description:
        'Upload administrative circulars, reports, and textbooks across PDF, DOCX, and TXT formats for rapid cross-script understanding.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Intelligent Summarization',
      description:
        'Condense dense regional texts into concise executive summaries or bullet points, with immediate translation into your preferred language.',
    },
    {
      icon: <Network className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Unified Language Access',
      description:
        'Bridge English, Kannada, Hindi, Telugu, Tamil, and Malayalam within one clean, cohesive interface without switching between disconnected tools.',
    },
  ];

  return (
    <section id="about" className="relative py-24 bg-transparent text-[#F4EFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono text-[#B68B4B] uppercase tracking-wider block mb-2">
            Platform Overview
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Simplifying Multilingual <span className="text-[#B68B4B]">Information</span>
          </h2>
          <p className="text-sm sm:text-base text-[#F4EFE6]/80 leading-relaxed">
            IndicLingo AI combines multilingual text translation, audio speech processing, document parsing, and summarization into a single accessible workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl clean-card hover:border-[#B68B4B]/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center mb-5">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-[#F4EFE6] mb-2">{pillar.title}</h3>
                <p className="text-xs text-[#F4EFE6]/70 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
