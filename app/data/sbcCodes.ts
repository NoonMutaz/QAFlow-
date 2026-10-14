/**
 * The Saudi Building Code system (2024 edition): the 28 code documents, from the
 * official public index published by the Saudi Building Code National Center.
 * Used for the code picker in the SBC Library and as the only list the AI may
 * name a code document from.
 */
export interface SbcCode {
  /** e.g. "SBC 801" */
  code: string;
  nameAr: string;
  nameEn: string;
}

export const SBC_EDITION = '2024';

export const SBC_CODES: SbcCode[] = [
  { code: 'SBC 201', nameAr: 'كود البناء السعودي العام', nameEn: 'Saudi General Building Code' },
  { code: 'SBC 301', nameAr: 'الكود السعودي لأحمال التصميم الإنشائي والزلازل والرياح', nameEn: 'Structural Design Loads, Earthquakes and Wind' },
  { code: 'SBC 302', nameAr: 'الكود السعودي للتشييد', nameEn: 'Construction' },
  { code: 'SBC 303', nameAr: 'الكود السعودي للتربة والأساسات', nameEn: 'Soils and Foundations' },
  { code: 'SBC 304', nameAr: 'الكود السعودي للمنشآت الخرسانية', nameEn: 'Concrete Structures' },
  { code: 'SBC 305', nameAr: 'الكود السعودي للمنشآت الطوبية', nameEn: 'Masonry Structures' },
  { code: 'SBC 306', nameAr: 'الكود السعودي للمنشآت الفولاذية', nameEn: 'Steel Structures' },
  { code: 'SBC 307', nameAr: 'الكود السعودي للتصميم الزلزالي للفولاذ', nameEn: 'Seismic Design of Steel' },
  { code: 'SBC 308', nameAr: 'الكود السعودي لتصميم العناصر الإنشائية من الفولاذ المشكل على البارد', nameEn: 'Cold-Formed Steel Structural Members' },
  { code: 'SBC 309', nameAr: 'الكود السعودي لتشييد الهياكل الخفيفة من الفولاذ المشكل على البارد', nameEn: 'Light-Frame Cold-Formed Steel Construction' },
  { code: 'SBC 310', nameAr: 'الكود السعودي لإصلاح وتأهيل ومعالجة المنشآت الخرسانية للمباني القائمة', nameEn: 'Repair and Rehabilitation of Existing Concrete Structures' },
  { code: 'SBC 311', nameAr: 'الكود السعودي للخرسانة الإنشائية المسلحة بقضبان البوليمر المقوى بالألياف الزجاجية', nameEn: 'GFRP-Reinforced Structural Concrete' },
  { code: 'SBC 312', nameAr: 'الكود السعودي للخرسانة مسبقة الصب', nameEn: 'Precast Concrete' },
  { code: 'SBC 313', nameAr: 'دليل تصميم وبناء الأنظمة الإنشائية المبتكرة', nameEn: 'Innovative Structural Systems Design and Construction Guide' },
  { code: 'SBC 401', nameAr: 'الكود السعودي الكهربائي', nameEn: 'Electrical' },
  { code: 'SBC 501', nameAr: 'الكود السعودي الميكانيكي', nameEn: 'Mechanical' },
  { code: 'SBC 601', nameAr: 'الكود السعودي لترشيد الطاقة للمباني غير السكنية', nameEn: 'Energy Conservation, Non-Residential Buildings' },
  { code: 'SBC 602', nameAr: 'الكود السعودي لترشيد الطاقة للمباني السكنية', nameEn: 'Energy Conservation, Residential Buildings' },
  { code: 'SBC 701', nameAr: 'الكود السعودي للتمديدات الصحية', nameEn: 'Sanitary Plumbing' },
  { code: 'SBC 702', nameAr: 'الكود السعودي للصرف الصحي الخاص', nameEn: 'Private Sewage' },
  { code: 'SBC 801', nameAr: 'الكود السعودي للحماية من الحرائق', nameEn: 'Fire Protection' },
  { code: 'SBC 901', nameAr: 'الكود السعودي للمباني القائمة', nameEn: 'Existing Buildings' },
  { code: 'SBC 902', nameAr: 'الكود السعودي للمباني التاريخية', nameEn: 'Historic Buildings' },
  { code: 'SBC 1001', nameAr: 'الكود السعودي للمباني الخضراء', nameEn: 'Green Buildings' },
  { code: 'SBC 1101', nameAr: 'الكود السعودي للمباني السكنية – الجزء الأول', nameEn: 'Residential Buildings, Part 1' },
  { code: 'SBC 1102', nameAr: 'الكود السعودي للمباني السكنية – الجزء الثاني', nameEn: 'Residential Buildings, Part 2' },
  { code: 'SBC 1201', nameAr: 'الكود السعودي لغاز الوقود', nameEn: 'Fuel Gas' },
  { code: 'SBC 1401', nameAr: 'الكود السعودي لأحواض السباحة والمنتجعات الصحية', nameEn: 'Swimming Pools and Spas' },
];

const normalize = (code: string) => code.replace(/\s+/g, '').toUpperCase();

/** Finds a code by "SBC 801", "sbc801" or "801". */
export function findSbcCode(code: string | null | undefined): SbcCode | undefined {
  if (!code) return undefined;
  const key = normalize(code.startsWith('SBC') || code.startsWith('sbc') ? code : `SBC${code}`);
  return SBC_CODES.find((c) => normalize(c.code) === key);
}
