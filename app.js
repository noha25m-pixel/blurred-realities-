// ============================================================
// تطبيق التجربة — لا تعدّل هذا الملف
// كل الإعدادات في config.js
// ============================================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzg-daYEvY3gDoPpancVJM2lX4bn22sGwoOMGxCfdRKFCnhJ81PRRq3ENQYTFHViNdg/exec";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TRIALS = STUDY_CONFIG.shuffleVideos ? shuffleArray(VIDEO_CONFIG) : VIDEO_CONFIG;

let state = {
  screen: 'welcome',
  consent: null,
  demographics: { platforms: [] },
  currentTrial: 0,
  trialAnswers: [],
  currentAnswer: { verdict: null, confidence: 50, cues: [], reasoning: '' },
  manipCheck: {},
  showFeedback: false,
  correctCount: 0,
  startTime: null
};

function go(screen)        { state.screen = screen; render(); }
function setState(o)       { Object.assign(state, o); render(); }
function setDemo(k, v)     { state.demographics[k] = v; }
function setManip(k, v)    { state.manipCheck[k] = v; }
function setAnswer(k, v)   { state.currentAnswer[k] = v; if (k !== 'reasoning') render(); }

function togglePlatform(p) {
  const list = state.demographics.platforms;
  const i = list.indexOf(p);
  if (i > -1) list.splice(i, 1); else list.push(p);
}

function toggleCue(c) {
  if (!state.currentAnswer.cues) state.currentAnswer.cues = [];
  const i = state.currentAnswer.cues.indexOf(c);
  if (i > -1) state.currentAnswer.cues.splice(i, 1); else state.currentAnswer.cues.push(c);
  render();
}

function handleConsent() {
  if (state.consent === true) {
    state.startTime = Date.now();
    go('demographics');
  } else if (state.consent === false) {
    document.getElementById('app').innerHTML = `
      <div class="screen"><div class="card" style="text-align:center">
        <div style="font-size:48px">🙏</div>
        <div class="card-title" style="margin-top:16px">شكراً لوقتك</div>
        <div class="card-sub">نحترم قرارك. يمكنك إغلاق هذه الصفحة.</div>
      </div></div>`;
  } else {
    alert('يرجى اختيار موافق أو رافض للمتابعة');
  }
}

function submitTrial() {
  if (!state.currentAnswer.verdict) return;
  const vid = TRIALS[state.currentTrial];
  const isCorrect = state.currentAnswer.verdict === vid.groundTruth;
  if (isCorrect) state.correctCount++;
  state.trialAnswers.push({
    videoId:     vid.id,
    category:    vid.category,
    groundTruth: vid.groundTruth,
    verdict:     state.currentAnswer.verdict,
    confidence:  state.currentAnswer.confidence,
    cues:        [...(state.currentAnswer.cues || [])],
    reasoning:   state.currentAnswer.reasoning || '',
    correct:     isCorrect,
    timestamp:   new Date().toISOString()
  });
  state.showFeedback = true;
  render();
}

function nextTrial() {
  if (state.currentTrial < TRIALS.length - 1) {
    state.currentTrial++;
    state.currentAnswer = { verdict: null, confidence: 50, cues: [], reasoning: '' };
    state.showFeedback = false;
    render();
  } else {
    go('manipcheck');
  }
}

function exportData() {
  const avgConf = state.trialAnswers.length
    ? Math.round(state.trialAnswers.reduce((a, b) => a + (+b.confidence), 0) / state.trialAnswers.length)
    : 0;

  const data = {
    studyTitle:       STUDY_CONFIG.studyTitle,
    completedAt:      new Date().toISOString(),
    durationSeconds:  state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : null,
    demographics:     state.demographics,
    manipulationCheck: state.manipCheck,
    trials:           state.trialAnswers,
    summary: {
      correct:       state.correctCount,
      total:         TRIALS.length,
      accuracy:      Math.round((state.correctCount / TRIALS.length) * 100) + '%',
      avgConfidence: avgConf
    }
  };

  // إرسال صامت إلى Google Sheets
  fetch(GOOGLE_SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data)
  }).catch(() => {});

  // رسالة شكر فقط — المشارك لا يرى أي تحميل أو إشارة للإرسال
  document.getElementById('app').innerHTML = `
    <div class="screen">
      <div class="card" style="text-align:center">
        <div style="font-size:64px;margin-bottom:20px">🙏</div>
        <div class="card-title" style="font-size:26px">تم تسجيل مشاركتك بنجاح</div>
        <div class="card-sub" style="font-size:15px;margin-top:16px;line-height:2.2">
          شكراً جزيلاً على وقتك ومشاركتك في هذه الدراسة الأكاديمية.<br/>
          إجاباتك ستُسهم في تطوير فهمنا للمحتوى المرئي المولّد بالذكاء الاصطناعي.<br/><br/>
          <strong style="color:#60a5fa">يمكنك الآن إغلاق هذه الصفحة.</strong>
        </div>
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #1f2937;font-size:13px;color:#6b7280">
          ${STUDY_CONFIG.researcherName} — ${STUDY_CONFIG.institution}<br/>
          📧 ${STUDY_CONFIG.researcherEmail}
        </div>
      </div>
    </div>`;
}

function renderVideoPlayer(vid) {
  if (vid.type === 'youtube' && vid.youtubeId) {
    return `
      <div class="video-container wide">
        <iframe src="https://www.youtube.com/embed/${vid.youtubeId}?rel=0&modestbranding=1"
                allowfullscreen allow="autoplay; encrypted-media"></iframe>
        <div class="video-num-badge">فيديو ${state.currentTrial + 1}</div>
      </div>`;
  }
  if (vid.type === 'local' && vid.file) {
    return `
      <div class="video-container">
        <video controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:contain;background:#000">
          <source src="videos/${vid.file}" type="video/mp4"/>
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
        <div class="video-num-badge">فيديو ${state.currentTrial + 1}</div>
      </div>`;
  }
  return `
    <div class="video-container">
      <div class="video-missing">
        <div style="font-size:40px">📁</div>
        <div style="font-size:15px;color:#9ca3af">الفيديو غير متوفر بعد.</div>
        <div style="font-size:12px;margin-top:6px">
          ضع الملف <strong style="color:#60a5fa">${vid.file || '...'}</strong> داخل مجلد videos/
        </div>
      </div>
    </div>`;
}

// ============================================================
// دالة العرض الرئيسية
// ============================================================
function render() {
  const app   = document.getElementById('app');
  const s     = state.screen;
  const total = TRIALS.length;
  const vid   = TRIALS[state.currentTrial] || TRIALS[0];

  let progressPct = 0;
  if      (s === 'consent')      progressPct = 8;
  else if (s === 'demographics') progressPct = 16;
  else if (s === 'instructions') progressPct = 24;
  else if (s === 'trial')        progressPct = 28 + (state.currentTrial / total) * 60;
  else if (s === 'manipcheck')   progressPct = 92;
  else if (s === 'debrief')      progressPct = 100;

  app.innerHTML = `
<div class="header">
  <div>
    <div class="header-title">${STUDY_CONFIG.studyTitle} 🔬</div>
    <div class="header-sub">${STUDY_CONFIG.studySubtitle} | ${STUDY_CONFIG.researcherName}</div>
  </div>
  <div style="font-size:13px;color:#90caf9">
    ${s === 'trial' ? `الفيديو ${state.currentTrial + 1} من ${total}` : ''}
  </div>
</div>
<div class="progress-bar">
  <div class="progress-fill" style="width:${progressPct}%"></div>
</div>

${s === 'welcome' ? `
<div class="screen">
<div class="card" style="text-align:center">
  <div style="font-size:56px;margin-bottom:16px">🎬</div>
  <div class="card-title" style="font-size:28px">${STUDY_CONFIG.studyTitle}</div>
  <div style="font-size:16px;color:#7c3aed;font-weight:600;margin:8px 0 16px">
    ${STUDY_CONFIG.studySubtitle}
  </div>
  <div class="card-sub" style="font-size:15px">
    دراسة أكاديمية تبحث في كيفية إدراك مستخدمي وسائل التواصل الاجتماعي<br/>
    للمحتوى المرئي المولّد بالذكاء الاصطناعي مقارنةً بالمحتوى الحقيقي.<br/><br/>
    <strong style="color:#60a5fa">المدة التقديرية: ${STUDY_CONFIG.estimatedMinutes}</strong>
  </div>
  <div style="display:flex;gap:24px;justify-content:center;margin:20px 0;flex-wrap:wrap">
    <div style="text-align:center">
      <div style="font-size:28px;font-weight:700;color:#60a5fa">${total}</div>
      <div style="font-size:12px;color:#6b7280">فيديو للتقييم</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:28px;font-weight:700;color:#a78bfa">
        ${VIDEO_CONFIG.filter(v => v.groundTruth === 'حقيقي').length}
      </div>
      <div style="font-size:12px;color:#6b7280">حقيقي</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:28px;font-weight:700;color:#f472b6">
        ${VIDEO_CONFIG.filter(v => v.groundTruth !== 'حقيقي').length}
      </div>
      <div style="font-size:12px;color:#6b7280">مولّد بالذكاء الاصطناعي</div>
    </div>
  </div>
  <button class="btn btn-primary" style="font-size:16px;padding:14px 40px" onclick="go('consent')">
    ابدأ التجربة ←
  </button>
  <div style="font-size:12px;color:#4b5563;margin-top:16px">${STUDY_CONFIG.institution}</div>
</div>
</div>` : ''}

${s === 'consent' ? `
<div class="screen">
<div class="card">
  <div class="card-title">نموذج الموافقة المستنيرة</div>
  <div class="consent-text">
    <p><strong>عنوان الدراسة:</strong> ${STUDY_CONFIG.studyTitle} — مدى قدرة مستخدمي وسائل التواصل الاجتماعي على التمييز بين الفيديوهات الحقيقية والمولّدة بالذكاء الاصطناعي.</p><br/>
    <p><strong>الباحثة الرئيسية:</strong> ${STUDY_CONFIG.researcherName}، ${STUDY_CONFIG.institution}.</p><br/>
    <p><strong>الغرض من الدراسة:</strong> فهم كيفية إدراك المستخدمين للمحتوى المرئي المولّد بالذكاء الاصطناعي، ومؤشرات التمييز التي يعتمدون عليها.</p><br/>
    <p><strong>الإجراءات:</strong> ستشاهد سلسلة من مقاطع الفيديو القصيرة وتُقيّم صحتها. لا توجد إجابات صحيحة أو خاطئة.</p><br/>
    <p><strong>المخاطر:</strong> لا توجد مخاطر متوقعة. المشاركة طوعية تماماً.</p><br/>
    <p><strong>السرية:</strong> لن يتم جمع أي بيانات تعريفية شخصية. جميع الردود مجهولة المصدر.</p><br/>
    <p><strong>الانسحاب:</strong> يمكنك إنهاء مشاركتك في أي وقت دون أي تبعات.</p>
  </div>
  <div class="section-label">هل توافق على المشاركة؟</div>
  <div class="radio-group">
    <label class="radio-option ${state.consent === true ? 'selected' : ''}">
      <input type="radio" name="consent" onchange="setState({consent:true})"/>
      نعم، أوافق على المشاركة
    </label>
    <label class="radio-option ${state.consent === false ? 'selected' : ''}">
      <input type="radio" name="consent" onchange="setState({consent:false})"/>
      لا، أرفض المشاركة
    </label>
  </div>
  <div class="nav-row">
    <button class="btn btn-secondary" onclick="go('welcome')">← رجوع</button>
    <button class="btn btn-primary" onclick="handleConsent()">التالي ←</button>
  </div>
</div>
</div>` : ''}

${s === 'demographics' ? `
<div class="screen">
<div class="card">
  <div class="card-title">معلومات أساسية</div>
  <div class="card-sub">أجب على الأسئلة التالية قبل البدء في التجربة</div>
  <div class="form-group">
    <label class="form-label">الفئة العمرية</label>
    <select class="form-select" onchange="setDemo('age',this.value)">
      <option value="">-- اختر --</option>
      <option>18-24</option><option>25-34</option><option>35-44</option><option>45+</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">الجنس</label>
    <select class="form-select" onchange="setDemo('gender',this.value)">
      <option value="">-- اختر --</option>
      <option>ذكر</option><option>أنثى</option><option>أفضل عدم الإفصاح</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">المستوى التعليمي</label>
    <select class="form-select" onchange="setDemo('edu',this.value)">
      <option value="">-- اختر --</option>
      <option>ثانوي</option><option>بكالوريوس</option><option>ماجستير</option>
      <option>دكتوراه</option><option>أخرى</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">المنصات التي تستخدمها يومياً</label>
    <div class="checkbox-group">
      ${['فيسبوك','إنستغرام','تيك توك','يوتيوب','تويتر/إكس','سناب شات'].map(p => `
      <label class="checkbox-option">
        <input type="checkbox" onchange="togglePlatform('${p}')"/> ${p}
      </label>`).join('')}
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">كم ساعة تقضي على وسائل التواصل يومياً؟</label>
    <select class="form-select" onchange="setDemo('hours',this.value)">
      <option value="">-- اختر --</option>
      <option>أقل من ساعة</option><option>1-3 ساعات</option>
      <option>3-5 ساعات</option><option>أكثر من 5 ساعات</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">هل سمعت من قبل عن "Deepfakes" أو الفيديوهات المولّدة بالذكاء الاصطناعي؟</label>
    <select class="form-select" onchange="setDemo('awareness',this.value)">
      <option value="">-- اختر --</option>
      <option>نعم، أعرفها جيداً</option>
      <option>سمعت عنها لكن لا أعرف الكثير</option>
      <option>لم أسمع عنها من قبل</option>
    </select>
  </div>
  <div class="nav-row">
    <button class="btn btn-secondary" onclick="go('consent')">← رجوع</button>
    <button class="btn btn-primary" onclick="go('instructions')">التالي ←</button>
  </div>
</div>
</div>` : ''}

${s === 'instructions' ? `
<div class="screen">
<div class="card">
  <div class="card-title">📋 تعليمات التجربة</div>
  <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:24px">
    ${[
      ['🎬','شاهد كل فيديو',`ستُعرض عليك ${total} مقطعاً فيديو من فئات متنوعة. شاهد كل مقطع بالكامل.`],
      ['🤔','قيّم الفيديو','بعد كل مقطع، حدد ما إذا كنت تعتقد أنه حقيقي أم مولّد بالذكاء الاصطناعي.'],
      ['📊','اذكر ثقتك','حدد مستوى ثقتك في إجابتك على مقياس من 0 إلى 100.'],
      ['✍️','برّر إجابتك','اذكر المؤشرات البصرية التي اعتمدت عليها في حكمك.'],
      ['🚫','لا تبحث','يُرجى عدم البحث عن الفيديوهات أثناء التجربة. نريد انطباعك الأول.']
    ].map(([icon,title,desc]) => `
    <div style="display:flex;gap:14px;align-items:flex-start;background:#0f172a;border-radius:10px;padding:14px">
      <div style="font-size:24px;flex-shrink:0">${icon}</div>
      <div>
        <div style="font-weight:600;color:#e5e7eb;margin-bottom:4px">${title}</div>
        <div style="font-size:13px;color:#9ca3af;line-height:1.6">${desc}</div>
      </div>
    </div>`).join('')}
  </div>
  <div style="background:#1e3a5f;border:1px solid #2563eb;border-radius:10px;padding:14px;font-size:13px;color:#93c5fd;line-height:1.7;margin-bottom:20px">
    <strong>ملاحظة مهمة:</strong> لا توجد إجابات صحيحة أو خاطئة.
    هذه تجربة أكاديمية تهدف إلى فهم كيف يُدرك الإنسان المحتوى المرئي.
  </div>
  <div class="nav-row">
    <button class="btn btn-secondary" onclick="go('demographics')">← رجوع</button>
    <button class="btn btn-primary" style="font-size:16px" onclick="go('trial')">ابدأ التجربة الآن ←</button>
  </div>
</div>
</div>` : ''}

${s === 'trial' ? `
<div class="screen" style="padding:16px">
<div class="card" style="max-width:820px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span class="category-badge ${vid.categoryClass}">${vid.category}</span>
    <span style="font-size:13px;color:#6b7280">${state.currentTrial + 1} / ${total}</span>
  </div>
  <div style="font-size:16px;font-weight:600;color:#e5e7eb;margin-bottom:6px">${vid.title}</div>
  <div style="font-size:13px;color:#6b7280;margin-bottom:14px">${vid.description}</div>

  ${renderVideoPlayer(vid)}

  <div style="background:#1a1a2e;border:1px solid #2d2d5e;border-radius:8px;padding:10px 14px;font-size:13px;color:#8b8bc4;margin-bottom:16px">
    💡 ${vid.hint}
  </div>

  ${state.showFeedback ? `
  <div style="text-align:center;margin-bottom:16px">
    <div class="result-badge ${state.currentAnswer.verdict === vid.groundTruth ? 'badge-correct' : 'badge-wrong'}">
      ${state.currentAnswer.verdict === vid.groundTruth ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة'}
    </div>
    <div style="font-size:14px;color:#94a3b8;margin-top:6px">
      هذا الفيديو <strong style="color:#60a5fa">${vid.groundTruth}</strong>
    </div>
  </div>
  <div class="nav-row">
    <button class="btn btn-primary" onclick="nextTrial()">
      ${state.currentTrial < total - 1 ? 'الفيديو التالي ←' : 'إنهاء المقاطع ←'}
    </button>
  </div>
  ` : `
  <div class="divider"></div>
  <div class="section-label">حكمك على هذا الفيديو</div>
  <div class="radio-group" style="margin-bottom:16px">
    <label class="radio-option ${state.currentAnswer.verdict === 'حقيقي' ? 'selected' : ''}">
      <input type="radio" name="verdict"
        ${state.currentAnswer.verdict === 'حقيقي' ? 'checked' : ''}
        onchange="setAnswer('verdict','حقيقي')"/>
      📹 حقيقي — مصوَّر بكاميرا حقيقية
    </label>
    <label class="radio-option ${state.currentAnswer.verdict === 'مولّد بالذكاء الاصطناعي' ? 'selected' : ''}">
      <input type="radio" name="verdict"
        ${state.currentAnswer.verdict === 'مولّد بالذكاء الاصطناعي' ? 'checked' : ''}
        onchange="setAnswer('verdict','مولّد بالذكاء الاصطناعي')"/>
      🤖 مولّد بالذكاء الاصطناعي
    </label>
    <label class="radio-option ${state.currentAnswer.verdict === 'غير متأكد' ? 'selected' : ''}">
      <input type="radio" name="verdict"
        ${state.currentAnswer.verdict === 'غير متأكد' ? 'checked' : ''}
        onchange="setAnswer('verdict','غير متأكد')"/>
      🤷 غير متأكد
    </label>
  </div>

  <div class="section-label">مستوى الثقة في إجابتك</div>
  <div class="slider-container" style="margin-bottom:16px">
    <input type="range" class="slider" min="0" max="100"
      value="${state.currentAnswer.confidence}"
      style="--val:${state.currentAnswer.confidence}%"
      oninput="setAnswer('confidence',+this.value);this.style.setProperty('--val',this.value+'%')"/>
    <div class="slider-labels">
      <span>غير متأكد إطلاقاً</span>
      <span style="color:#60a5fa;font-weight:600">${state.currentAnswer.confidence}%</span>
      <span>متأكد تماماً</span>
    </div>
  </div>

  <div class="section-label">المؤشرات التي اعتمدت عليها (اختر كل ما ينطبق)</div>
  <div class="checkbox-group" style="margin-bottom:16px">
    ${['جودة الصورة','طبيعية الحركة','تعبيرات الوجه','الخلفية والبيئة',
       'جودة الصوت','موضوع الفيديو ومدى معقوليته','إحساسي الداخلي','نعومة البشرة'].map(c => `
    <label class="checkbox-option">
      <input type="checkbox"
        ${(state.currentAnswer.cues || []).includes(c) ? 'checked' : ''}
        onchange="toggleCue('${c}')"/> ${c}
    </label>`).join('')}
  </div>

  <div class="section-label">برّر إجابتك (بجملة أو جملتين)</div>
  <textarea class="form-textarea"
    placeholder="اذكر ما لاحظته في هذا الفيديو..."
    oninput="setAnswer('reasoning',this.value)">${state.currentAnswer.reasoning || ''}</textarea>

  <div class="nav-row">
    <button class="btn btn-primary"
      onclick="submitTrial()"
      ${!state.currentAnswer.verdict ? 'disabled' : ''}>
      تأكيد الإجابة ←
    </button>
  </div>
  `}
</div>
</div>` : ''}

${s === 'manipcheck' ? `
<div class="screen">
<div class="card">
  <div class="card-title">أسئلة ختامية</div>
  <div class="card-sub">قبل الانتهاء، نودّ معرفة بعض المعلومات الإضافية</div>
  <div class="form-group">
    <label class="form-label">هل شككت في أي لحظة أن هذه الدراسة تتعلق تحديداً باكتشاف محتوى الذكاء الاصطناعي؟</label>
    <select class="form-select" onchange="setManip('suspected',this.value)">
      <option value="">-- اختر --</option>
      <option>نعم، من البداية</option>
      <option>شككت في المنتصف</option>
      <option>لا، لم أدرك ذلك</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">هل سبق لك استخدام أداة لتوليد فيديوهات بالذكاء الاصطناعي (مثل Kling أو Runway أو Sora)؟</label>
    <select class="form-select" onchange="setManip('usedAI',this.value)">
      <option value="">-- اختر --</option>
      <option>نعم، بشكل منتظم</option>
      <option>نعم، مرة أو مرتين</option>
      <option>لا</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">هل تلقيت أي تدريب في مجال التحقق الرقمي أو محو الأمية الإعلامية؟</label>
    <select class="form-select" onchange="setManip('training',this.value)">
      <option value="">-- اختر --</option>
      <option>نعم، تدريب رسمي</option>
      <option>بعض الاطلاع الذاتي</option>
      <option>لا</option>
    </select>
  </div>
  <div class="nav-row">
    <button class="btn btn-primary" onclick="go('debrief')">التالي ←</button>
  </div>
</div>
</div>` : ''}

${s === 'debrief' ? `
<div class="screen">
<div class="card">
  <div class="card-title">📊 ملخص أدائك</div>
  <div class="card-sub">شاهد نتائجك قبل إنهاء التجربة</div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-num">${state.correctCount}</div>
      <div class="stat-label">إجابة صحيحة من ${total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${Math.round(state.correctCount / total * 100)}%</div>
      <div class="stat-label">نسبة الدقة</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">
        ${state.trialAnswers.length
          ? Math.round(state.trialAnswers.reduce((a,b) => a + (+b.confidence), 0) / state.trialAnswers.length)
          : 0}%
      </div>
      <div class="stat-label">متوسط الثقة</div>
    </div>
  </div>
  <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:16px;margin-bottom:20px;font-size:14px;color:#94a3b8;line-height:1.8">
    <strong style="color:#60a5fa">ماذا يعني أداؤك؟</strong><br/>
    أثبتت الأبحاث أن البشر يُصيبون في كشف Deepfakes بنسبة تتراوح بين 55%-70% فقط.
    جودة الإنتاج العالية في محتوى الذكاء الاصطناعي تجعل التمييز أمراً صعباً حتى على الخبراء.
  </div>
  <div class="divider"></div>
  <div class="section-label">إطار VISOR للتقييم النقدي</div>
  <div class="visor-grid">
    <div class="visor-card visor-v">
      <div class="visor-letter" style="color:#3b82f6">V</div>
      <div class="visor-title">التحقق (Verification)</div>
      <div class="visor-desc">تقييم المصدر الرقمي للمحتوى وبيانات الإنتاج</div>
    </div>
    <div class="visor-card visor-i">
      <div class="visor-letter" style="color:#8b5cf6">I</div>
      <div class="visor-title">التفسير (Interpretation)</div>
      <div class="visor-desc">فهم السياق والسردية ومدى منطقية القصة</div>
    </div>
    <div class="visor-card visor-s">
      <div class="visor-letter" style="color:#06b6d4">S</div>
      <div class="visor-title">تقييم المصدر (Source)</div>
      <div class="visor-desc">مصداقية الجهة الناشرة وسجلها في نشر معلومات دقيقة</div>
    </div>
    <div class="visor-card visor-o">
      <div class="visor-letter" style="color:#f59e0b">O</div>
      <div class="visor-title">الرقابة والأخلاق (Oversight)</div>
      <div class="visor-desc">الاعتبارات الأخلاقية في إنتاج ونشر المحتوى</div>
    </div>
    <div class="visor-card visor-r" style="grid-column:1/-1">
      <div class="visor-letter" style="color:#10b981">R</div>
      <div class="visor-title">التأمل والتعليم (Reflection)</div>
      <div class="visor-desc">بناء الوعي النقدي والمهارات اللازمة للتعامل مع المحتوى الرقمي</div>
    </div>
  </div>
  <div class="divider"></div>
  <div style="font-size:13px;color:#6b7280;line-height:1.8;margin-bottom:24px">
    للاستفسار أو للاطلاع على نتائج الدراسة عند نشرها:<br/>
    📧 <strong style="color:#93c5fd">${STUDY_CONFIG.researcherEmail}</strong><br/>
    🔗 ORCID: ${STUDY_CONFIG.orcid}
  </div>
  <div style="text-align:center">
    <button class="btn btn-primary" style="font-size:16px;padding:14px 44px" onclick="exportData()">
      إنهاء وإرسال مشاركتي ←
    </button>
  </div>
</div>
</div>` : ''}
  `;
}

render();
