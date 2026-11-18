import React, { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/glassData';

interface QuizViewProps {
  bestScore: number | null;
  onFinishQuiz: (score: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ bestScore, onFinishQuiz }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === q.correctIndex;

  const handleSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optIdx);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const nextAnswers = [...answers, selectedOption];
    setAnswers(nextAnswers);

    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
    } else {
      const score = nextAnswers.reduce(
        (acc, ans, idx) => acc + (ans === QUIZ_QUESTIONS[idx].correctIndex ? 1 : 0),
        0
      );
      setFinished(true);
      onFinishQuiz(score);
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const score = answers.reduce(
      (acc, ans, idx) => acc + (ans === QUIZ_QUESTIONS[idx].correctIndex ? 1 : 0),
      0
    );
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const passed = pct >= 80;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-slate-700 mx-auto">
            <Award className={`w-7 h-7 ${passed ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono text-slate-400">
              ผลการประเมินความเข้าใจวิศวกรรมกระบวนการผลิตแก้ว
            </p>
            <h1 className="text-2xl font-bold text-white">
              คุณทำคะแนนได้ {score} / {QUIZ_QUESTIONS.length} ({pct}%)
            </h1>
            <p className={`text-sm font-medium ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {passed
                ? 'ผ่านเกณฑ์มาตรฐานวิศวกรประจำสายการผลิต (≥ 80%)'
                : 'แนะนำให้ทบทวนบทเรียน 7 สถานีและทดลองปรับค่าในห้องจำลองเพิ่มเติม'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
              ทำแบบทดสอบใหม่อีกครั้ง
            </button>
          </div>
        </div>

        {/* Review Summary */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">สรุปคำตอบรายข้อ</h2>
          <div className="divide-y divide-slate-800">
            {QUIZ_QUESTIONS.map((item, idx) => {
              const userAns = answers[idx];
              const ok = userAns === item.correctIndex;
              return (
                <div key={item.id} className="py-3.5 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-slate-200">
                      {idx + 1}. {item.question}
                    </div>
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    คำตอบที่ถูกต้อง:{' '}
                    <span className="text-emerald-300">{item.options[item.correctIndex]}</span>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <p className="text-xs font-mono text-cyan-400">
            แบบทดสอบวัดความเข้าใจ · 10 ข้อ
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            ประเมินความรู้สายการผลิตแก้วอุตสาหกรรม
          </h1>
        </div>
        {bestScore !== null && (
          <div className="text-right">
            <div className="text-xs text-slate-400">คะแนนสูงสุดที่ทำได้</div>
            <div className="text-base font-mono font-bold text-emerald-400 tabular-nums">
              {bestScore} / {QUIZ_QUESTIONS.length}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-mono tabular-nums">
          <span>
            ข้อที่ {currentIdx + 1} จาก {QUIZ_QUESTIONS.length} · {q.stationName}
          </span>
          <span>{Math.round(((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-6 space-y-5">
        <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {q.question}
        </h2>

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            let styleClass =
              'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700';
            if (isAnswered) {
              if (idx === q.correctIndex) {
                styleClass = 'bg-emerald-950/60 border-emerald-500/70 text-emerald-100';
              } else if (idx === selectedOption) {
                styleClass = 'bg-rose-950/60 border-rose-500/70 text-rose-100';
              } else {
                styleClass = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
              }
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border text-left text-sm transition ${styleClass}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-slate-400 pt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>{opt}</span>
                </div>
                {isAnswered && idx === q.correctIndex && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== q.correctIndex && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Next Button */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="space-y-1">
              <div
                className={`text-xs font-semibold ${
                  isCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isCorrect ? 'ถูกต้อง — คำอธิบายทางวิศวกรรม' : 'ยังไม่ถูกต้อง — คำอธิบายทางวิศวกรรม'}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white transition"
              >
                {currentIdx + 1 < QUIZ_QUESTIONS.length ? 'ข้อถัดไป →' : 'ดูสรุปผลคะแนน'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
