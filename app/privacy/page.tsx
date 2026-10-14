'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageProvider';

type Section = { id: string; title: string; points: string[] };

/** Privacy policy, in English and Arabic. Describes what Imtithal actually stores and sends. */
const CONTENT: Record<'en' | 'ar', { title: string; intro: string; updated: string; contact: string; sections: Section[] }> = {
  en: {
    title: 'Privacy Policy',
    intro: 'We collect only what Imtithal needs to run site inspections, and we tell you where your data goes.',
    updated: 'Last updated: 14 October 2026',
    contact: 'Questions or requests about your data? Contact us',
    sections: [
      {
        id: '1',
        title: 'Information we collect',
        points: [
          'Account: your name, email address and password.',
          'Projects: project names and descriptions, members and their roles, invitations, phases and dates.',
          'Inspection records: findings, their location, risk level, SBC clauses, comments, deadlines, and who reported, fixed and approved them.',
          'Files you upload: site photos, photos of fixes, and project drawings (PDF or images).',
          'Activity log: actions taken in a project (created, assigned, updated, approved), shown to the project owner.',
        ],
      },
      {
        id: '2',
        title: 'How we use it',
        points: [
          'To run the service: show your projects, findings, timeline, reports and dashboards to the right people.',
          'To give AI suggestions: describe photos, read drawings, and suggest the matching SBC clause.',
          'We do not sell your data and we do not use it for advertising.',
        ],
      },
      {
        id: '3',
        title: 'AI processing',
        points: [
          'When you use an AI feature, the finding text, the photo you analyse, the project drawings and the project’s SBC clauses are sent to our AI provider (Google Gemini) to produce the suggestion.',
          'Drawings are read once when uploaded; the short design summary is stored with the project.',
          'On the provider’s free tier, the provider may use submitted content to improve its models. Do not upload drawings or photos you are not allowed to share with a third party.',
          'AI output is a suggestion only. An engineer confirms every clause, and fixes are closed only after the project owner approves the evidence.',
        ],
      },
      {
        id: '4',
        title: 'Who can see your data',
        points: [
          'Project data is visible only to accepted members of that project, according to their role (owner, member or viewer).',
          'Only owners can approve fixes, close phases and view the activity log.',
          'The shared SBC Library contains code clauses, not project data.',
        ],
      },
      {
        id: '5',
        title: 'Keeping and deleting data',
        points: [
          'Data is kept while your account and projects exist.',
          'Owners and members can delete findings, clauses, drawings and phases; deleting a drawing also deletes its file.',
          'To delete your account and its data, contact us and we will process the request.',
        ],
      },
      {
        id: '6',
        title: 'Your rights',
        points: [
          'You can ask to see, correct or delete the personal data we hold about you.',
          'You can stop using AI features at any time by not using the AI buttons; the rest of the platform works without them.',
        ],
      },
      {
        id: '7',
        title: 'Changes to this policy',
        points: ['If this policy changes, we will update the date below and show the change in the app.'],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    intro: 'نجمع فقط ما يحتاجه امتثال لإدارة التفتيش الميداني، ونوضح لك أين تذهب بياناتك.',
    updated: 'آخر تحديث: 14 أكتوبر 2026',
    contact: 'أسئلة أو طلبات بخصوص بياناتك؟ تواصل معنا',
    sections: [
      {
        id: '1',
        title: 'المعلومات التي نجمعها',
        points: [
          'الحساب: الاسم والبريد الإلكتروني وكلمة المرور.',
          'المشاريع: أسماء المشاريع ووصفها، والأعضاء وأدوارهم، والدعوات، والمراحل وتواريخها.',
          'سجلات التفتيش: الملاحظات وموقعها ومستوى خطورتها وبنود الكود والتعليقات والمواعيد، ومن سجّلها ومن أصلحها ومن اعتمدها.',
          'الملفات التي ترفعها: صور الموقع، وصور الإصلاح، ومخططات المشروع (PDF أو صور).',
          'سجل النشاط: الإجراءات التي تتم في المشروع (إنشاء، إسناد، تعديل، اعتماد)، ويظهر لمالك المشروع.',
        ],
      },
      {
        id: '2',
        title: 'كيف نستخدمها',
        points: [
          'لتشغيل الخدمة: عرض المشاريع والملاحظات والخطة الزمنية والتقارير ولوحات المتابعة للأشخاص المخوّلين.',
          'لتقديم اقتراحات الذكاء الاصطناعي: وصف الصور وقراءة المخططات واقتراح بند الكود المطابق.',
          'لا نبيع بياناتك ولا نستخدمها للإعلانات.',
        ],
      },
      {
        id: '3',
        title: 'المعالجة بالذكاء الاصطناعي',
        points: [
          'عند استخدام ميزة ذكاء اصطناعي، تُرسَل نصوص الملاحظة والصورة المراد تحليلها ومخططات المشروع وبنود الكود الخاصة به إلى مزوّد الذكاء الاصطناعي (Google Gemini) لإنتاج الاقتراح.',
          'تُقرأ المخططات مرة واحدة عند رفعها، ويُحفظ ملخص التصميم المختصر مع المشروع.',
          'في الخطة المجانية للمزوّد، قد يستخدم المزوّد المحتوى المرسل لتحسين نماذجه. لا ترفع مخططات أو صورًا لا يحق لك مشاركتها مع طرف ثالث.',
          'مخرجات الذكاء الاصطناعي اقتراحات فقط: المهندس يؤكد كل بند، ولا تُغلق الإصلاحات إلا بعد اعتماد مالك المشروع للدليل.',
        ],
      },
      {
        id: '4',
        title: 'من يرى بياناتك',
        points: [
          'بيانات المشروع يراها فقط أعضاء المشروع المقبولون، حسب دور كل منهم (مالك، عضو، مشاهد).',
          'المالك وحده يعتمد الإصلاحات ويغلق المراحل ويطّلع على سجل النشاط.',
          'مكتبة الكود المشتركة تحتوي بنود الكود فقط، ولا تحتوي بيانات المشاريع.',
        ],
      },
      {
        id: '5',
        title: 'حفظ البيانات وحذفها',
        points: [
          'تُحفظ البيانات ما دام حسابك ومشاريعك موجودة.',
          'يمكن للمالك والأعضاء حذف الملاحظات والبنود والمخططات والمراحل، وحذف المخطط يحذف ملفه أيضًا.',
          'لحذف حسابك وبياناته، تواصل معنا وسنعالج الطلب.',
        ],
      },
      {
        id: '6',
        title: 'حقوقك',
        points: [
          'يحق لك طلب الاطلاع على بياناتك الشخصية لدينا أو تصحيحها أو حذفها.',
          'يمكنك التوقف عن استخدام ميزات الذكاء الاصطناعي في أي وقت بعدم استخدام أزرارها، وباقي المنصة يعمل بدونها.',
        ],
      },
      {
        id: '7',
        title: 'التغييرات على هذه السياسة',
        points: ['إذا تغيّرت هذه السياسة، سنحدّث التاريخ أدناه ونُظهر التغيير داخل التطبيق.'],
      },
    ],
  },
};

export default function PrivacyPolicy() {
  const { lang } = useLanguage();
  const c = CONTENT[lang];
  const [activeSection, setActiveSection] = useState('1');

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{c.title}</h1>
          <p className="mt-3 text-lg text-gray-600">{c.intro}</p>
        </div>

        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {c.sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(isActive ? '' : section.id)}
                  className="flex w-full items-center justify-between px-6 py-5 text-start transition hover:bg-gray-50"
                  aria-expanded={isActive}
                >
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  <span className={`transform text-gray-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-2.5 px-6 pb-6 pt-1">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p>{c.updated}</p>
          <p className="mt-2">
            {c.contact}{' '}
            <Link href="/contactus" className="font-semibold text-brand-700 hover:underline">
              →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
