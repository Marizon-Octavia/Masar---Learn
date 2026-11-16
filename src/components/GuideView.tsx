import { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import type { AudioSpeed } from '../types/learning';
import { AudioListenBar } from './AudioListenBar';

interface GuideViewProps {
  audioSpeed: AudioSpeed;
  onToggleSpeed: () => void;
  onResetProgress: () => void;
}

const BRIDGE_RULES = [
  {
    id: 'rule-1',
    titleEn: '01. The Missing Glue in Arabic (am / is / are)',
    titleAr: '٠١. رابط الجملة في الإنجليزية (am / is / are)',
    arabicHabit: 'في العربية نقول: "أنا سعيد" (كلمتان بدون فعل).',
    englishRule: 'In English, descriptions need a linking word between the person and the word.',
    englishRuleAr: 'في الإنجليزية لا نترك الجملة بدون رابط بين الضمير والصفة أو المكان:',
    pairings: [
      { left: 'I', mid: 'am', right: 'happy', ar: 'أنا سعيد' },
      { left: 'He / She / It', mid: 'is', right: 'kind', ar: 'هو / هي لطيف' },
      { left: 'You / We / They', mid: 'are', right: 'ready', ar: 'أنت / نحن / هم جاهزون' },
    ],
    audioSample: 'I am happy. He is kind. We are ready.',
  },
  {
    id: 'rule-2',
    titleEn: '02. Everyday Actions Don’t Use "am / is / are"',
    titleAr: '٠٢. الأفعال اليومية القوية لا تحتاج am / is / are',
    arabicHabit: 'خطأ شائع: قول "I am work" أو "I am study".',
    englishRule: 'Put action verbs directly after the subject. Only add "-s" for He, She, It.',
    englishRuleAr: 'ضع الفعل مباشرة بعد الضمير، وأضف حرف s فقط مع He / She / It:',
    pairings: [
      { left: 'I / You / We', mid: 'work', right: 'every day', ar: 'أعمل كل يوم' },
      { left: 'He / She', mid: 'works', right: 'at a hospital', ar: 'يعمل في مستشفى' },
      { left: 'Question:', mid: 'Do you', right: 'speak Arabic?', ar: 'هل تتحدث العربية؟' },
    ],
    audioSample: 'I work every day. He works at a hospital. Do you speak Arabic?',
  },
  {
    id: 'rule-3',
    titleEn: '03. Talking About Yesterday (Past Simple)',
    titleAr: '٠٣. الانتقال إلى الماضي البسيط (أمس)',
    arabicHabit: 'للحديث عن الأمس نستخدم 3 مفاتيح سهلة تكفي للبداية.',
    englishRule: 'Swap am/is → was, are → were, or add "-ed" to regular actions (same for everyone!).',
    englishRuleAr: 'نحوّل am/is إلى was، و are إلى were، ونضيف ed للأفعال المنتظمة لجميع الضمائر:',
    pairings: [
      { left: 'Yesterday, I', mid: 'was', right: 'at home', ar: 'أمس كنتُ في البيت' },
      { left: 'I / He / We', mid: 'called', right: 'my friend', ar: 'اتصلتُ / اتصل بصديقي' },
      { left: 'Common irregular:', mid: 'went / saw', right: 'last night', ar: 'ذهبتُ / رأيتُ الليلة الماضية' },
    ],
    audioSample: 'Yesterday I was at home. I called my friend. We went to the market.',
  },
  {
    id: 'rule-4',
    titleEn: '04. Polite Requests & Future Plans (Can / Would like / Will)',
    titleAr: '٠٤. الطلبات المهذبة والمستقبل (Can / Would like / Will)',
    arabicHabit: 'للطلب اللطيف والحديث عن الغد بدون تصريفات معقدة.',
    englishRule: 'Start requests with "Can you...?" or "I would like...", and use "will" for tomorrow.',
    englishRuleAr: 'استخدم Can you للطلب، و I would like عند الشراء أو المطعم، و will للمستقبل:',
    pairings: [
      { left: 'Can you', mid: 'help', right: 'me, please?', ar: 'هل يمكنك مساعدتي من فضلك؟' },
      { left: 'I would like', mid: 'water,', right: 'please', ar: 'أودّ ماءً، من فضلك' },
      { left: 'Tomorrow, I', mid: 'will', right: 'see you', ar: 'غداً سأراك' },
    ],
    audioSample: 'Can you help me, please? I would like water, please. I will see you tomorrow.',
  },
];

export function GuideView({
  audioSpeed,
  onToggleSpeed,
  onResetProgress,
}: GuideViewProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12 space-y-8">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-2">
        <p className="text-xs font-bold text-emerald-700">
          Arabic-to-English Grammar Bridge · <span className="font-arabic">جسر القواعد المبسط</span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Simple A1 Study Guide · <span className="font-arabic font-bold">دليل الفهم السريع</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-arabic leading-relaxed" dir="rtl">
          هذا الدليل يلخّص الفروق الأربعة الأساسية بين العربية والإنجليزية بدون مصطلحات معقدة. يمكنك الاستماع لكل قاعدة بالسرعة البطيئة أو العادية.
        </p>
      </section>

      {/* 4 Bridge Rules */}
      <div className="space-y-6">
        {BRIDGE_RULES.map((rule) => (
          <article
            key={rule.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4"
          >
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {rule.titleEn}
              </h2>
              <h3 className="text-base font-bold text-emerald-800 font-arabic" dir="rtl">
                {rule.titleAr}
              </h3>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1" dir="rtl">
              <div className="text-sm font-bold text-amber-950 font-arabic">
                {rule.arabicHabit}
              </div>
              <div className="text-sm text-amber-900 font-arabic">
                {rule.englishRuleAr}
              </div>
            </div>

            <p className="text-sm text-slate-600">{rule.englishRule}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {rule.pairings.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5"
                >
                  <div className="text-sm font-bold text-slate-900" dir="ltr">
                    {p.left}{' '}
                    <span className="text-emerald-700 underline decoration-2 underline-offset-4">
                      {p.mid}
                    </span>{' '}
                    {p.right}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 font-arabic" dir="rtl">
                    {p.ar}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <AudioListenBar
                text={rule.audioSample}
                speed={audioSpeed}
                onToggleSpeed={onToggleSpeed}
                size="sm"
                labelEn="Listen to Examples"
                labelAr="استمع للأمثلة"
              />
            </div>
          </article>
        ))}
      </div>

      {/* Device Progress Reset Box */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            Device Storage · <span className="font-arabic">بيانات التعلّم على هذا الجهاز</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            All XP, streaks, and completed levels are stored locally in this browser.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            Reset Progress · <span className="font-arabic">إعادة ضبط التقدم</span>
          </span>
        </button>
      </section>

      {/* Clean In-App Confirmation Modal */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-lg font-extrabold text-slate-900">
                Reset all progress? · <span className="font-arabic">تأكيد إعادة الضبط</span>
              </h4>
            </div>
            <p className="text-sm text-slate-600 font-arabic leading-relaxed" dir="rtl">
              سيؤدي هذا إلى مسح نقاط الخبرة (XP) والدروس المكتملة والعودة إلى المستوى الأول من البداية.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel · <span className="font-arabic">إلغاء</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmOpen(false);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
              >
                Reset · <span className="font-arabic">نعم، امسح التقدم</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
