// ============================================================
// ===========  ملف الإعدادات — عدّل هنا فقط  ===================
// ============================================================
// هذا هو الملف الوحيد الذي تحتاج لتعديله.
// لكل فيديو نوعان من المصدر:
//   type: "youtube"  → استخدم youtubeId فقط
//   type: "local"    → استخدم file (اسم الملف داخل مجلد videos/)
//
// إذا كان الفيديو من تيك توك أو Kling أو فيسبوك:
//   حمّل الفيديو كملف mp4 وضعه في مجلد videos/
//   ثم غيّر type إلى "local" وضع اسم الملف في file
// ============================================================

const VIDEO_CONFIG = [

  // ---------------- فئة الأخبار ----------------
  {
    id: 1,
    category: "أخبار / وثائقي",
    categoryClass: "cat-news",
    title: "تقرير إخباري",
    description: "مقطع إخباري",
    type: "youtube",
    youtubeId: "yBVIZ-GQPb8",     // https://www.youtube.com/shorts/yBVIZ-GQPb8
    file: "",
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو "
  },
  {
    id: 2,
    category: "أخبار / وثائقي",
    categoryClass: "cat-news",
    title: "خبر",
    description: "مقطع إخباري",
    type: "local",                 // غيّرها بعد رفع الملف
    youtubeId: "",
    file: "news_fake.mp4",         // ضع هنا اسم الملف بعد تحميله من Kling
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الفيديو"
  },

  // ---------------- فئة المشاعر / القصص الشخصية ----------------
  {
    id: 3,
    category: "قصة شخصية / مشاعر",
    categoryClass: "cat-human",
    title: "قصة شخصية",
    description: "مقطع عن قصة عاطفية",
    type: "youtube",
    youtubeId: "ctvAcd3uLu8",      // https://www.youtube.com/shorts/ctvAcd3uLu8
    file: "",
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو"
  },
  {
    id: 4,
    category: "قصة شخصية / مشاعر",
    categoryClass: "cat-human",
    title: "قصة عاطفية من تيك توك",
    description: "مقطع تيك توك",
    type: "local",
    youtubeId: "",
    file: "emotional_fake.mp4",    // ضع هنا اسم الملف بعد تحميله من تيك توك
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الفيديو"
  },

  // ---------------- فئة الترفيه ----------------
  {
    id: 5,
    category: "ترفيه / فيروسي",
    categoryClass: "cat-entertainment",
    title: "مقطع ترفيهي من تيك توك",
    description: "مقطع ترفيهي ",
    type: "local",
    youtubeId: "",
    file: "entertainment_real.mp4", // من: tiktok.com/@rydabil/video/7632421993236679943
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو"
  },
  {
    id: 6,
    category: "ترفيه / فيروسي",
    categoryClass: "cat-entertainment",
    title: "مقطع ترفيهي آخر من تيك توك",
    description: "مقطع ترفيهي",
    type: "local",
    youtubeId: "",
    file: "entertainment_fake.mp4", // من: tiktok.com/@mohamed.kamal139/video/7623489200775499028
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ  عناصر الفيديو"
  },

  // ---------------- فئة الشخصيات العامة ----------------
  {
    id: 7,
    category: "شخصيات عامة",
    categoryClass: "cat-celeb",
    title: "شخصية عامة",
    description: "مقطع من يوتيوب",
    type: "local",
    youtubeId: "J2Rajefa25U",
    file: "celebrity_real.mp4",    // من: https://www.youtube.com/shorts/J2Rajefa25U
    groundTruth: "حقيقي",
    hint: "انتبه لعناصر الفيديو"
  },
  {
    id: 8,
    category: "شخصيات عامة",
    categoryClass: "cat-celeb",
    title: "شخصية عامة",
    description: "",
    type: "local",
    youtubeId: "",
    file: "celebrity_fake.mp4",    // من: https://www.youtube.com/shorts/P0qSeE5zj7E?feature=share
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الفيديو"
  },

  // ---------------- فئة الطبيعة ----------------
  {
    id: 9,
    category: "طبيعة / حياة برية",
    categoryClass: "cat-nature",
    title: "مشهد من الطبيعة",
    description: "مقطع من يوتيوب",
    type: "youtube",
    youtubeId: "W2HiWTHVum4",      // https://www.youtube.com/shorts/W2HiWTHVum4
    file: "",
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو"
  },
  {
    id: 10,
    category: "طبيعة / حياة برية",
    categoryClass: "cat-nature",
    title: "مشهد للطبيعة الساحرة",
    description: "",
    type: "local",
    youtubeId: "",
    file: "nature_fake.mp4",       // من: Kling AI - waterfall meadow
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الصورة "
  },

  // ---------------- فئة الإعلانات ----------------
  {
    id: 11,
    category: "إعلان / محتوى تجاري",
    categoryClass: "cat-ad",
    title: "إعلان تجاري",
    description: "مقطع من فيسبوك",
    type: "local",
    youtubeId: "",
    file: "advertising_real.mp4",  // من: facebook.com/reel/861745953659528
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو"
  },
  {
    id: 12,
    category: "إعلان / محتوى تجاري",
    categoryClass: "cat-ad",
    title: "إعلان لمحتوى تجاري",
    description: "",
    type: "local",
    youtubeId: "",
    file: "advertising_fake.mp4",  // من: Kling AI - lip gloss splash
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الفيديو"
},

  // ---------------- فئة السياحة ----------------
 {
    id: 13,
    category: "سياحة / محتوى تجاري",
    categoryClass: "cat-tourism",
    title: "مقطع سياحي",
    description: "مقطع من يوتيوب",
    type: "local",
    youtubeId: "",
    file: "tourism_real.mp4",  // من: https://www.youtube.com/shorts/Euk2UbehrUo
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو"
  },
  {
    id: 14,
    category: "سياحة / محتوى تجاري",
    categoryClass: "cat-tourism",
    title: "مقطع سياحي",
    description: "",
    type: "local",
    youtubeId: "",
    file: "tourism_fake.mp4",  // من: https://kling.ai/app/ai-video/nha-trang-bay-sunrise-coastline/315286865504255
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الفيديو"
},

  // ---------------- فئة الطبخ ----------------
 {
    id: 15,
    category: "طبخ / محتوى منزلي",
    categoryClass: "cat-cooking",
    title: "مقطع طبخ",
    description: "مقطع من فيسبوك",
    type: "local",
    youtubeId: "",
    file: "cook_real.mp4",  // من: https://www.facebook.com/watch/?ref=saved&v=2006830159870524
    groundTruth: "حقيقي",
    hint: "لاحظ عناصر الفيديو"
  },
  {
    id: 16,
    category: "طبخ / محتوى منزلي",
    categoryClass: "cat-cooking",
    title: "مقطع طبخ",
    description: "",
    type: "local",
    youtubeId: "",
    file: "cook_fake.mp4",  // من: https://kling.ai/app/ai-video/cooking-before-babe-arrives/310831053616390
    groundTruth: "مولّد بالذكاء الاصطناعي",
    hint: "لاحظ عناصر الفيديو"
  }

];

// ============================================================
// إعدادات عامة للتجربة — يمكنك تعديلها أيضاً
// ============================================================
const STUDY_CONFIG = {
  studyTitle: "الواقع المُضبَّب",
  studySubtitle: "هل تستطيع التمييز بين الحقيقي والمزيّف؟",
  researcherName: "د. نهى عادل",
  researcherEmail: "noha.adel@ecu.edu.eg",
  institution: "الجامعة المصرية الصينية - جامعة المنوفية",
  orcid: "0000-0003-2245-0793",
  estimatedMinutes: "15-20 دقيقة",
  shuffleVideos: true,          // اجعلها false لو تريد ترتيب ثابت
  enableAIFeedback: false       // اجعلها true لتفعيل تعليق الذكاء الاصطناعي (يحتاج إعداد إضافي)
};
