import React from 'react';
import { Languages, Mic, FileCheck2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesSection: React.FC = () => {
  const capabilities = [
    {
      icon: <Languages className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Multilingual Text Translation',
      description:
        'Translate accurately between English, Kannada, Hindi, Telugu, Tamil, and Malayalam with character counts and clipboard tools.',
    },
    {
      icon: <Mic className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Speech & Audio Translation',
      description:
        'Record directly from your microphone with live waveform diagnostics, review transcripts, and listen to spoken translations.',
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Document Translation',
      description:
        'Upload PDF, DOCX, and TXT files for structured text extraction, cross-lingual translation, and export.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#B68B4B]" />,
      title: 'Intelligent Summarization',
      description:
        'Condense articles and lengthy documents into short, medium, or detailed formats with paragraph or bullet point layouts.',
    },
  ];

  return (
    <section id="features" className="relative py-24 bg-transparent border-t border-white/[0.06] text-[#F4EFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono text-[#B68B4B] uppercase tracking-wider block mb-2">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 text-[#F4EFE6]">
            Core Translation <span className="text-[#B68B4B]">Features</span>
          </h2>
          <p className="text-sm text-[#F4EFE6]/70">
            Four cohesive multimodal tools tailored for Indian language workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] hover:border-[#B68B4B]/50 hover:bg-white/[0.055] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-[#F4EFE6] mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#F4EFE6]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <Link
                  to="/workspace"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B68B4B] hover:text-[#F4EFE6] transition-colors"
                >
                  Open in Workspace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
