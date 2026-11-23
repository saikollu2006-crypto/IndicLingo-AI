import React from 'react';
import { FileUp, Languages, Cpu, Volume2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Input Information',
      desc: 'Type text, record spoken voice with your microphone, or upload documents (PDF, DOCX, TXT).',
      icon: <FileUp className="w-5 h-5 text-[#B68B4B]" />,
    },
    {
      step: '02',
      title: 'Script Detection',
      desc: 'Automatic identification across Kannada, Hindi, Telugu, Tamil, Malayalam, and English.',
      icon: <Languages className="w-5 h-5 text-[#B68B4B]" />,
    },
    {
      step: '03',
      title: 'AI Translation & Summary',
      desc: 'Accurate cross-lingual translation and executive summarization in your chosen format.',
      icon: <Cpu className="w-5 h-5 text-[#B68B4B]" />,
    },
    {
      step: '04',
      title: 'Audio Speech Output',
      desc: 'Listen to the natural voice output using speech synthesis or export your translated results.',
      icon: <Volume2 className="w-5 h-5 text-[#B68B4B]" />,
    },
  ];

  return (
    <section id="workflow" className="relative py-24 bg-transparent border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono text-[#B68B4B] uppercase tracking-wider block mb-2">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F4EFE6] tracking-tight mb-3">
            How IndicLingo <span className="text-[#B68B4B]">Works</span>
          </h2>
          <p className="text-sm text-[#F4EFE6]/70">
            A simple, four-step pipeline transforming multimodal inputs into accessible information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] hover:border-[#B68B4B]/50 hover:bg-white/[0.055] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-lg font-black font-mono text-[#B68B4B]">
                    {item.step}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#F4EFE6] mb-2">{item.title}</h4>
                <p className="text-xs text-[#F4EFE6]/70 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
