// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ===== Opportunity filters =====
const filterBtns = document.querySelectorAll('.filter-btn');
const tickets = document.querySelectorAll('.ticket');
const emptyState = document.getElementById('emptyState');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const filter = btn.dataset.filter;

    let visibleCount = 0;
    tickets.forEach(ticket => {
      const match = filter === 'all' || ticket.dataset.cat === filter;
      ticket.classList.toggle('hide', !match);
      if (match) visibleCount++;
    });

    emptyState.hidden = visibleCount !== 0;
  });
});

// ===== Scroll-triggered stat counters =====
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// ===== Shared match-card fill/percentage animation =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateMatchCard(card) {
  const target = parseInt(card.dataset.target, 10);
  const fill = card.querySelector('.match-fill');
  const pct = card.querySelector('.match-pct');
  fill.style.width = target + '%';

  if (reduceMotion) {
    pct.textContent = target + '%';
    return;
  }

  const duration = 1300;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    pct.textContent = Math.floor(progress * target) + '%';
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Scroll-triggered AI match card fills (initial static demo cards) =====
const matchObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateMatchCard(entry.target);
      matchObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.match-card').forEach(card => matchObserver.observe(card));

// ===== Nav shadow on scroll =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 8 ? '0 6px 24px -18px rgba(0,0,0,0.4)' : 'none';
});

/* =========================================================================
   AI OPPORTUNITY MATCHER — data, scoring engine, matcher form, modal wizard,
   dashboard. All client-side demo logic, no backend required.
========================================================================= */

// ----- Vocabulary -----
const SKILLS = [
  { id: 'python', label: 'Python' },
  { id: 'js', label: 'JavaScript' },
  { id: 'react', label: 'React' },
  { id: 'figma', label: 'Figma / Design Tools' },
  { id: 'ml', label: 'Machine Learning' },
  { id: 'publicspeaking', label: 'Public Speaking / Pitching' },
  { id: 'git', label: 'Git & Open Source' },
  { id: 'data', label: 'Data Analysis' }
];

const INTERESTS = [
  { id: 'ai', label: 'Artificial Intelligence' },
  { id: 'webdev', label: 'Web Development' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'entrepreneurship', label: 'Entrepreneurship' },
  { id: 'opensource', label: 'Open Source' },
  { id: 'events', label: 'Events & Networking' }
];

const SKILL_LABELS = Object.fromEntries(SKILLS.map(s => [s.id, s.label]));
const INTEREST_LABELS = Object.fromEntries(INTERESTS.map(i => [i.id, i.label]));

// ----- Opportunity pool (mirrors the ticket board) -----
const OPPORTUNITIES = [
  {
    id: 'hack-ai', title: 'AI Innovation Hackathon', category: 'Hackathon',
    closesLabel: 'Closes Sep 14', daysLeft: 26,
    skills: ['python', 'ml'], interests: ['ai'],
    goals: ['ai-researcher', 'software-engineer', 'founder'],
    levels: ['intermediate', 'advanced'],
    description: 'Teams of up to four get 36 hours to design, build and demo an AI tool that tackles a real problem on campus — think scheduling, accessibility, sustainability or student wellbeing. Mentors from three partner startups rotate through the floor for live feedback, and the top three teams pitch to a panel of founders and faculty on the final morning.',
    highlights: [
      'Kickoff Friday 6PM, demos Sunday 10AM',
      'Starter datasets and API credits provided',
      'Prizes for top 3 teams + startup interview fast-track'
    ],
    location: 'Bengaluru · Hybrid',
    tags: ['Python', 'AI/ML', 'Teams of 4']
  },
  {
    id: 'intern-frontend', title: 'Frontend Development Internship', category: 'Internship',
    closesLabel: 'Closes Sep 20', daysLeft: 32,
    skills: ['react', 'js'], interests: ['webdev'],
    goals: ['software-engineer'],
    levels: ['intermediate', 'advanced'],
    description: "An 8-week paid internship on the product team at a Series-A fintech, shipping features straight into the live customer dashboard. You'll pair with a senior engineer for the first two weeks, then own small features end-to-end — from ticket to production — with weekly demos to the wider team.",
    highlights: [
      'Fully remote, IST-friendly hours',
      'Paid stipend + letter of recommendation on completion',
      'Ships to real users — not a sandbox project'
    ],
    location: 'Remote · Paid',
    tags: ['React', 'CSS', 'Remote']
  },
  {
    id: 'event-startup', title: 'Startup & Entrepreneurship Summit', category: 'Event',
    closesLabel: 'Closes Oct 02', daysLeft: 44,
    skills: ['publicspeaking'], interests: ['entrepreneurship', 'events'],
    goals: ['founder', 'analyst'],
    levels: ['beginner', 'intermediate', 'advanced'],
    description: "A full day built around three things: hearing founders talk honestly about what actually happens after the funding round, running your own pitch through a rapid-feedback workshop, and a speed-networking round designed to get you real conversations with early-stage investors — not just a stack of business cards.",
    highlights: [
      '6 founder talks + 1 investor panel',
      'Optional 90-second pitch slot (sign up on arrival)',
      'Free for students, lunch included'
    ],
    location: 'Bengaluru · In-person',
    tags: ['Pitching', 'Networking', 'All majors']
  },
  {
    id: 'workshop-genai', title: 'Generative AI Workshop', category: 'Workshop',
    closesLabel: 'Closes Sep 08', daysLeft: 20,
    skills: ['python', 'ml'], interests: ['ai'],
    goals: ['ai-researcher', 'software-engineer'],
    levels: ['beginner', 'intermediate'],
    description: "A single hands-on session that takes you from zero to a working retrieval-augmented (RAG) app — covering prompting fundamentals, how embeddings actually work under the hood, and wiring a small vector store into a chat interface. Everyone leaves with runnable code, not just slides.",
    highlights: [
      '2.5 hours, fully online',
      'No prior ML experience required',
      'Take-home starter repo + recording'
    ],
    location: 'Online · Free',
    tags: ['LLMs', 'Python', 'Beginner OK']
  },
  {
    id: 'challenge-uiux', title: 'UI/UX Design Challenge', category: 'Challenge',
    closesLabel: 'Closes Sep 28', daysLeft: 40,
    skills: ['figma'], interests: ['design'],
    goals: ['product-designer'],
    levels: ['beginner', 'intermediate', 'advanced'],
    description: "Work solo, on your own schedule, to redesign a real onboarding or core product flow for a partner nonprofit — from user research through a polished, presentable Figma prototype. The top three submissions get reviewed live by a panel of working product designers, with notes you can actually use in your portfolio.",
    highlights: [
      'One week, solo, work at your own pace',
      'Real brief from a partner nonprofit',
      'Live portfolio review for top 3 submissions'
    ],
    location: 'Remote · Solo',
    tags: ['Figma', 'UX Research', 'Solo']
  },
  {
    id: 'community-oss', title: 'Open Source Community Program', category: 'Community',
    closesLabel: 'Rolling admission', daysLeft: null,
    skills: ['git', 'js'], interests: ['opensource', 'webdev'],
    goals: ['software-engineer'],
    levels: ['beginner', 'intermediate'],
    description: "A 6-week cohort that pairs you one-on-one with an active maintainer on a real open-source project. You'll start with small documentation and bug-fix issues to learn the codebase and workflow, then work up to a feature-sized pull request by week six — with code review from your maintainer at every step.",
    highlights: [
      'Rolling admission — start any week',
      '1:1 maintainer pairing, weekly check-ins',
      'Any language welcome; Git basics helpful'
    ],
    location: 'Remote · Cohort',
    tags: ['Git', 'Any language', 'Mentored']
  }
];

// ----- Scoring engine -----
function computeMatches(profile) {
  const results = OPPORTUNITIES.map(opp => {
    let score = 38;
    const matchedSkills = [];
    const matchedInterests = [];

    profile.skills.forEach(s => {
      if (opp.skills.includes(s)) { score += 9; matchedSkills.push(s); }
    });
    profile.interests.forEach(i => {
      if (opp.interests.includes(i)) { score += 8; matchedInterests.push(i); }
    });
    if (opp.goals.includes(profile.goal)) score += 11;
    if (opp.levels.includes(profile.level)) score += 7;

    score = Math.min(score, 99);
    score = Math.max(score, 34);

    return { opp, score, matchedSkills, matchedInterests };
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}

function reasonText(result) {
  const labels = [
    ...result.matchedSkills.map(id => SKILL_LABELS[id]),
    ...result.matchedInterests.map(id => INTEREST_LABELS[id])
  ];
  if (labels.length === 0) return 'Matched on: overall profile fit';
  return 'Matched on: ' + labels.slice(0, 3).join(', ');
}

// ----- Chip rendering helper (used by matcher form + modal) -----
function renderChips(container, items, selectedSet) {
  container.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.value = item.id;
    btn.textContent = item.label;
    btn.setAttribute('aria-pressed', selectedSet.has(item.id) ? 'true' : 'false');
    if (selectedSet.has(item.id)) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      if (selectedSet.has(item.id)) {
        selectedSet.delete(item.id);
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        selectedSet.add(item.id);
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      }
    });
    container.appendChild(btn);
  });
}

function setChipSelection(container, selectedSet) {
  container.querySelectorAll('.chip').forEach(chip => {
    const on = selectedSet.has(chip.dataset.value);
    chip.classList.toggle('selected', on);
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

// ----- State -----
const matcherSkillSet = new Set();
const matcherInterestSet = new Set();
const modalSkillSet = new Set();
const modalInterestSet = new Set();
const savedIds = new Set();

let lastMatchResults = null;
let lastProfile = null;

// ----- DOM refs -----
const skillChips = document.getElementById('skillChips');
const interestChips = document.getElementById('interestChips');
const goalSelect = document.getElementById('goalSelect');
const levelSelect = document.getElementById('levelSelect');
const matcherForm = document.getElementById('matcherForm');
const findMatchesBtn = document.getElementById('findMatchesBtn');
const matcherHint = document.getElementById('matcherHint');
const aiVisualPanel = document.getElementById('aiVisualPanel');

const modalSkillChips = document.getElementById('modalSkillChips');
const modalInterestChips = document.getElementById('modalInterestChips');
const modalGoalSelect = document.getElementById('modalGoalSelect');
const modalLevelSelect = document.getElementById('modalLevelSelect');

renderChips(skillChips, SKILLS, matcherSkillSet);
renderChips(interestChips, INTERESTS, matcherInterestSet);
renderChips(modalSkillChips, SKILLS, modalSkillSet);
renderChips(modalInterestChips, INTERESTS, modalInterestSet);

/* =========================================================================
   TOAST NOTIFICATIONS
========================================================================= */
const toastContainer = document.getElementById('toastContainer');

function showToast(message) {
  if (!toastContainer || !message) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Force layout before adding the show class so the transition runs
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  const lifespan = 3200;
  const fadeTime = reduceMotion ? 0 : 260;
  window.setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    window.setTimeout(() => toast.remove(), fadeTime);
  }, lifespan);
}

/* =========================================================================
   LOCAL STORAGE PERSISTENCE
   Wrapped so the app keeps working fine if localStorage is unavailable
   (private browsing, disabled storage, etc.) — it just won't persist.
========================================================================= */
const STORAGE_KEYS = {
  saved: 'campusconnect_saved_ids',
  profile: 'campusconnect_profile'
};

function detectStorageAvailable() {
  try {
    const testKey = '__campusconnect_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
const hasStorage = detectStorageAvailable();

function persistSavedIds() {
  if (!hasStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(Array.from(savedIds)));
  } catch (e) { /* storage full or blocked — fail silently */ }
}

function readSavedIdsFromStorage() {
  if (!hasStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.saved);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(id => OPPORTUNITIES.some(o => o.id === id));
  } catch (e) {
    return [];
  }
}

function persistProfile(profile) {
  if (!hasStorage || !profile) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  } catch (e) { /* fail silently */ }
}

function readProfileFromStorage() {
  if (!hasStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter(id => SKILL_LABELS[id]) : [],
      interests: Array.isArray(parsed.interests) ? parsed.interests.filter(id => INTEREST_LABELS[id]) : [],
      goal: typeof parsed.goal === 'string' && parsed.goal ? parsed.goal : 'software-engineer',
      level: typeof parsed.level === 'string' && parsed.level ? parsed.level : 'intermediate'
    };
  } catch (e) {
    return null;
  }
}

function clearPersistedData() {
  if (!hasStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.saved);
    window.localStorage.removeItem(STORAGE_KEYS.profile);
  } catch (e) { /* fail silently */ }
}

// ===== Build a match-card element for rendering into the ai-visual panel =====
function buildMatchCardEl(result) {
  const card = document.createElement('div');
  card.className = 'match-card';
  card.dataset.target = result.score;
  card.innerHTML = `
    <div class="match-card-head">
      <p>${result.opp.title}</p>
      <b class="match-pct">0%</b>
    </div>
    <div class="match-track"><i class="match-fill"></i></div>
    <p class="match-why">${reasonText(result)}</p>
  `;
  return card;
}

function renderMatchesIntoPanel(container, results) {
  container.innerHTML = '';
  results.forEach(result => {
    const card = buildMatchCardEl(result);
    container.appendChild(card);
    animateMatchCard(card);
  });
}

function showAnalyzingIn(container) {
  container.innerHTML = `
    <div class="analyzing-panel">
      <div class="analyzing-spinner"></div>
      <p class="analyzing-text">Analyzing your profile...</p>
      <p class="analyzing-sub">Analyzing opportunities based on your profile using our demo matching logic.</p>
    </div>
  `;
}

// ===== Profile strength + dashboard =====
const strengthRing = document.getElementById('strengthRing');
const strengthValue = document.getElementById('strengthValue');
const statMatched = document.getElementById('statMatched');
const statSaved = document.getElementById('statSaved');
const statDeadlines = document.getElementById('statDeadlines');
const dashContent = document.getElementById('dashContent');
const dashTabs = document.querySelectorAll('.dash-tab');

let activeDashTab = 'recommended';

function computeProfileStrength(profile) {
  let strength = 10;
  strength += profile.skills.length * 6;
  strength += profile.interests.length * 5;
  if (profile.goal) strength += 15;
  if (profile.level) strength += 10;
  return Math.min(strength, 100);
}

function updateStrengthRing(pct) {
  strengthRing.style.setProperty('--pct', pct);
  strengthValue.textContent = pct + '%';
}

function updateStatDeadlines() {
  const count = OPPORTUNITIES.filter(o => o.daysLeft !== null && o.daysLeft <= 30).length;
  statDeadlines.textContent = count;
}

function updateStatSaved() {
  statSaved.textContent = savedIds.size;
}

function updateStatMatched(results) {
  const count = results ? results.filter(r => r.score >= 70).length : 0;
  statMatched.textContent = count;
}

function renderDashTab(tab) {
  activeDashTab = tab;
  dashContent.innerHTML = '';

  if (tab === 'recommended') {
    if (!lastMatchResults) {
      dashContent.innerHTML = `
        <div class="dash-empty">
          <p>Run the matcher above to see personalized recommendations here.</p>
          <a href="#ai-matching" class="btn btn-ghost btn-sm">Go to matcher ↑</a>
        </div>`;
      return;
    }
    lastMatchResults.slice(0, 5).forEach(result => {
      const row = document.createElement('div');
      row.className = 'dash-item';
      row.innerHTML = `
        <div class="dash-item-main">
          <p>${result.opp.title}</p>
          <span>${result.opp.category} · ${reasonText(result)}</span>
        </div>
        <div class="dash-item-side">
          <span class="dash-score">${result.score}%</span>
          <button class="dash-view" data-view-id="${result.opp.id}" aria-label="View details for ${result.opp.title}">View</button>
        </div>
      `;
      dashContent.appendChild(row);
    });
    return;
  }

  if (tab === 'saved') {
    if (savedIds.size === 0) {
      dashContent.innerHTML = `
        <div class="dash-empty">
          <p>You haven't saved anything yet — tap the ☆ on any opportunity card on the board to save it here.</p>
          <a href="#opportunities" class="btn btn-ghost btn-sm">Browse the board ↑</a>
        </div>`;
      return;
    }
    Array.from(savedIds).forEach(id => {
      const opp = OPPORTUNITIES.find(o => o.id === id);
      if (!opp) return;
      const row = document.createElement('div');
      row.className = 'dash-item';
      row.innerHTML = `
        <div class="dash-item-main">
          <p>${opp.title}</p>
          <span>${opp.category} · ${opp.closesLabel}</span>
        </div>
        <div class="dash-item-side">
          <button class="dash-view" data-view-id="${opp.id}" aria-label="View details for ${opp.title}">View</button>
          <button class="dash-remove" data-remove-id="${opp.id}" aria-label="Remove ${opp.title} from saved">✕</button>
        </div>
      `;
      dashContent.appendChild(row);
    });
    dashContent.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', () => toggleSave(btn.dataset.removeId, false));
    });
    return;
  }

  if (tab === 'deadlines') {
    const sorted = [...OPPORTUNITIES].sort((a, b) => {
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    });
    sorted.forEach(opp => {
      const row = document.createElement('div');
      row.className = 'dash-item';
      const urgent = opp.daysLeft !== null && opp.daysLeft <= 21;
      const daysText = opp.daysLeft === null ? 'Rolling' : `${opp.daysLeft}d left`;
      row.innerHTML = `
        <div class="dash-item-main">
          <p>${opp.title}</p>
          <span>${opp.category} · ${opp.closesLabel}</span>
        </div>
        <div class="dash-item-side">
          <span class="dash-days${urgent ? ' urgent' : ''}">${daysText}</span>
        </div>
      `;
      dashContent.appendChild(row);
    });
  }
}

dashTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    dashTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    renderDashTab(tab.dataset.tab);
  });
});

// ===== Ticket save buttons =====
function toggleSave(id, forceState, options) {
  const opts = options || {};
  const wasSaved = savedIds.has(id);
  const shouldSave = forceState !== undefined ? forceState : !wasSaved;
  if (shouldSave) savedIds.add(id); else savedIds.delete(id);

  document.querySelectorAll(`.ticket-save[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('saved', shouldSave);
    btn.setAttribute('aria-pressed', shouldSave ? 'true' : 'false');
    btn.querySelector('span').textContent = shouldSave ? '★' : '☆';
  });

  updateStatSaved();
  if (activeDashTab === 'saved') renderDashTab('saved');
  persistSavedIds();
  syncDetailsModalSaveState(id);

  if (!opts.silent && wasSaved !== shouldSave) {
    showToast(shouldSave ? 'Opportunity saved' : 'Removed from saved opportunities');
  }
}

document.querySelectorAll('.ticket-save').forEach(btn => {
  btn.addEventListener('click', () => toggleSave(btn.dataset.id));
});

// ===== Run a full match (updates matcher panel + dashboard together) =====
function runMatch(profile, { skipAnalyzing, toast, silent } = {}) {
  lastProfile = profile;
  const results = computeMatches(profile);
  lastMatchResults = results;

  const strength = computeProfileStrength(profile);
  updateStrengthRing(strength);
  updateStatMatched(results);
  updateStatDeadlines();
  updateStatSaved();
  if (activeDashTab === 'recommended') renderDashTab('recommended');

  persistProfile(profile);
  if (!silent && toast) showToast('Your matches have been updated');
  refreshOpenDetailsModal();

  return results;
}

function collectMatcherProfile() {
  return {
    skills: Array.from(matcherSkillSet),
    interests: Array.from(matcherInterestSet),
    goal: goalSelect.value,
    level: levelSelect.value
  };
}

matcherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = collectMatcherProfile();

  if (profile.skills.length === 0 && profile.interests.length === 0) {
    matcherHint.hidden = false;
  } else {
    matcherHint.hidden = true;
  }

  findMatchesBtn.disabled = true;
  findMatchesBtn.textContent = 'Analyzing...';
  showAnalyzingIn(aiVisualPanel);

  const delay = reduceMotion ? 150 : 1100;
  setTimeout(() => {
    const results = runMatch(profile, { toast: true });
    renderMatchesIntoPanel(aiVisualPanel, results.slice(0, 4));
    findMatchesBtn.disabled = false;
    findMatchesBtn.textContent = 'Find My Matches';
  }, delay);
});

// Initialize dashboard baseline stats on load
updateStatDeadlines();
updateStatSaved();
updateStrengthRing(10);
renderDashTab('recommended');

/* =========================================================================
   MULTI-STEP ONBOARDING MODAL
========================================================================= */
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('onboardingModal');
const modalClose = document.getElementById('modalClose');
const modalBack = document.getElementById('modalBack');
const modalNext = document.getElementById('modalNext');
const modalFooter = document.getElementById('modalFooter');
const modalProgress = document.getElementById('modalProgress');
const modalResults = document.getElementById('modalResults');
const heroAIBtn = document.getElementById('heroAIBtn');
const guidedSetupBtn = document.getElementById('guidedSetupBtn');

const STEP_ORDER = ['1', '2', '3', 'analyzing', 'results'];
let modalStepIndex = 0;
let lastFocusedEl = null;

function currentStepKey() {
  return STEP_ORDER[modalStepIndex];
}

function showModalStep(key) {
  document.querySelectorAll('.modal-step').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.stepPanel === key);
  });

  document.querySelectorAll('.modal-step-dot').forEach(dot => {
    const dotStep = dot.dataset.dot;
    const stepIsNumeric = ['1', '2', '3'].includes(key);
    dot.classList.remove('active', 'done');
    if (stepIsNumeric) {
      if (dotStep === key) dot.classList.add('active');
      else if (Number(dotStep) < Number(key)) dot.classList.add('done');
    } else {
      dot.classList.add('done');
    }
  });

  updateModalFooter(key);
}

function stepIsValid(key) {
  if (key === '1') return modalInterestSet.size > 0;
  if (key === '2') return modalSkillSet.size > 0;
  if (key === '3') return !!modalGoalSelect.value && !!modalLevelSelect.value;
  return true;
}

function updateModalFooter(key) {
  if (key === 'analyzing') {
    modalFooter.hidden = true;
    return;
  }
  modalFooter.hidden = false;

  if (key === 'results') {
    modalFooter.dataset.mode = 'results';
    modalBack.hidden = true;
    modalNext.hidden = false;
    modalNext.textContent = 'View Full Results ↓';
    modalNext.disabled = false;
    return;
  }

  modalFooter.dataset.mode = 'form';
  modalBack.hidden = false;
  modalNext.hidden = false;
  modalBack.disabled = key === '1';
  modalNext.textContent = key === '3' ? 'Find My Matches' : 'Next';
  modalNext.disabled = !stepIsValid(key);
}

// Keep Next/Find button enabled state responsive to chip/select changes
modalInterestChips.addEventListener('click', () => {
  if (currentStepKey() === '1') modalNext.disabled = !stepIsValid('1');
});
modalSkillChips.addEventListener('click', () => {
  if (currentStepKey() === '2') modalNext.disabled = !stepIsValid('2');
});
modalGoalSelect.addEventListener('change', () => {
  if (currentStepKey() === '3') modalNext.disabled = !stepIsValid('3');
});
modalLevelSelect.addEventListener('change', () => {
  if (currentStepKey() === '3') modalNext.disabled = !stepIsValid('3');
});

function collectModalProfile() {
  return {
    skills: Array.from(modalSkillSet),
    interests: Array.from(modalInterestSet),
    goal: modalGoalSelect.value,
    level: modalLevelSelect.value
  };
}

function runModalAnalysis() {
  showModalStep('analyzing');
  const delay = reduceMotion ? 200 : 1400;

  setTimeout(() => {
    const profile = collectModalProfile();
    const results = runMatch(profile, { silent: true });

    modalResults.innerHTML = '';
    results.slice(0, 3).forEach(result => {
      const item = document.createElement('div');
      item.className = 'modal-result-item';
      item.innerHTML = `
        <div class="modal-result-main">
          <p>${result.opp.title}</p>
          <span>${reasonText(result)}</span>
        </div>
        <b class="modal-result-score">${result.score}%</b>
      `;
      modalResults.appendChild(item);
    });

    // Sync the inline matcher form so the whole page reflects the same profile
    setChipSelection(skillChips, modalSkillSet);
    setChipSelection(interestChips, modalInterestSet);
    matcherSkillSet.clear();
    modalSkillSet.forEach(v => matcherSkillSet.add(v));
    matcherInterestSet.clear();
    modalInterestSet.forEach(v => matcherInterestSet.add(v));
    goalSelect.value = profile.goal;
    levelSelect.value = profile.level;

    renderMatchesIntoPanel(aiVisualPanel, results.slice(0, 4));

    modalStepIndex = STEP_ORDER.indexOf('results');
    showModalStep('results');
  }, delay);
}

modalNext.addEventListener('click', () => {
  const key = currentStepKey();
  if (key === 'results') {
    closeModal();
    document.getElementById('ai-matching').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
  }
  if (!stepIsValid(key)) return;

  if (key === '3') {
    runModalAnalysis();
    return;
  }

  modalStepIndex = Math.min(modalStepIndex + 1, STEP_ORDER.length - 1);
  showModalStep(currentStepKey());
});

modalBack.addEventListener('click', () => {
  const key = currentStepKey();
  if (key === '1' || key === 'analyzing') return;
  modalStepIndex = Math.max(modalStepIndex - 1, 0);
  showModalStep(currentStepKey());
});

function openModal(triggerEl) {
  lastFocusedEl = triggerEl || document.activeElement;
  modalStepIndex = 0;
  showModalStep('1');
  modalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  const firstChip = modalInterestChips.querySelector('.chip');
  (firstChip || modalClose).focus();
  document.addEventListener('keydown', handleModalKeydown);
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleModalKeydown);
  if (lastFocusedEl) lastFocusedEl.focus();
}

function handleModalKeydown(e) {
  if (e.key === 'Escape') {
    closeModal();
    return;
  }
  if (e.key === 'Tab') {
    const focusable = modal.querySelectorAll('button, select, [tabindex]:not([tabindex="-1"])');
    const visible = Array.from(focusable).filter(el => el.offsetParent !== null && !el.disabled);
    if (visible.length === 0) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

heroAIBtn.addEventListener('click', () => openModal(heroAIBtn));
guidedSetupBtn.addEventListener('click', () => openModal(guidedSetupBtn));
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* =========================================================================
   OPPORTUNITY DETAILS MODAL
========================================================================= */
const detailsModalOverlay = document.getElementById('detailsModalOverlay');
const detailsModal = document.getElementById('detailsModal');
const detailsModalClose = document.getElementById('detailsModalClose');
const detailsModalCloseBtn = document.getElementById('detailsModalCloseBtn');
const detailsModalCat = document.getElementById('detailsModalCat');
const detailsModalTitle = document.getElementById('detailsModalTitle');
const detailsModalLoc = document.getElementById('detailsModalLoc');
const detailsModalDeadline = document.getElementById('detailsModalDeadline');
const detailsModalDesc = document.getElementById('detailsModalDesc');
const detailsModalHighlights = document.getElementById('detailsModalHighlights');
const detailsModalTags = document.getElementById('detailsModalTags');
const detailsModalMatch = document.getElementById('detailsModalMatch');
const detailsModalScore = document.getElementById('detailsModalScore');
const detailsModalWhy = document.getElementById('detailsModalWhy');
const detailsModalSaveBtn = document.getElementById('detailsModalSaveBtn');
const detailsModalSaveLabel = document.getElementById('detailsModalSaveLabel');

let detailsLastFocusedEl = null;
let currentDetailsOppId = null;

function findMatchForOpp(id) {
  if (!lastMatchResults) return null;
  return lastMatchResults.find(r => r.opp.id === id) || null;
}

function syncDetailsModalSaveState(id) {
  if (detailsModalOverlay.hidden || currentDetailsOppId !== id) return;
  const saved = savedIds.has(id);
  detailsModalSaveBtn.classList.toggle('saved', saved);
  detailsModalSaveBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
  detailsModalSaveLabel.textContent = saved ? 'Remove from saved' : 'Save opportunity';
}

// Re-renders the currently open details modal's match info if the profile
// changes (e.g. the user re-runs the matcher) while it's still open.
function refreshOpenDetailsModal() {
  if (detailsModalOverlay.hidden || !currentDetailsOppId) return;
  const match = findMatchForOpp(currentDetailsOppId);
  if (match) {
    detailsModalMatch.hidden = false;
    detailsModalScore.textContent = match.score + '%';
    detailsModalWhy.textContent = reasonText(match);
  } else {
    detailsModalMatch.hidden = true;
  }
}

function openDetailsModal(id, triggerEl) {
  const opp = OPPORTUNITIES.find(o => o.id === id);
  if (!opp) return;

  detailsLastFocusedEl = triggerEl || document.activeElement;
  currentDetailsOppId = id;

  detailsModalCat.textContent = opp.category;
  detailsModalTitle.textContent = opp.title;
  detailsModalLoc.textContent = opp.location;
  detailsModalDeadline.textContent = opp.closesLabel;
  detailsModalDesc.textContent = opp.description;

  detailsModalHighlights.innerHTML = '';
  if (Array.isArray(opp.highlights) && opp.highlights.length) {
    const list = document.createElement('ul');
    list.className = 'details-modal-highlights-list';
    opp.highlights.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      list.appendChild(li);
    });
    detailsModalHighlights.appendChild(list);
  }

  detailsModalTags.innerHTML = '';
  opp.tags.forEach(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    detailsModalTags.appendChild(span);
  });

  const match = findMatchForOpp(id);
  if (match) {
    detailsModalMatch.hidden = false;
    detailsModalScore.textContent = match.score + '%';
    detailsModalWhy.textContent = reasonText(match);
  } else {
    detailsModalMatch.hidden = true;
  }

  syncDetailsModalSaveState(id);

  detailsModalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  detailsModalClose.focus();
  document.addEventListener('keydown', handleDetailsModalKeydown);
}

function closeDetailsModal() {
  detailsModalOverlay.hidden = true;
  document.body.style.overflow = '';
  currentDetailsOppId = null;
  document.removeEventListener('keydown', handleDetailsModalKeydown);
  if (detailsLastFocusedEl) detailsLastFocusedEl.focus();
}

function handleDetailsModalKeydown(e) {
  if (e.key === 'Escape') {
    closeDetailsModal();
    return;
  }
  if (e.key === 'Tab') {
    const focusable = detailsModal.querySelectorAll('button, a[href], select, [tabindex]:not([tabindex="-1"])');
    const visible = Array.from(focusable).filter(el => el.offsetParent !== null && !el.disabled);
    if (visible.length === 0) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// "View details" buttons on ticket cards (event delegation covers the full grid)
document.getElementById('ticketGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.ticket-cta');
  if (!btn) return;
  openDetailsModal(btn.dataset.id, btn);
});

// "View details" from within the dashboard's Recommended / Saved lists
dashContent.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-view-id]');
  if (!btn) return;
  openDetailsModal(btn.dataset.viewId, btn);
});

detailsModalClose.addEventListener('click', closeDetailsModal);
detailsModalCloseBtn.addEventListener('click', closeDetailsModal);
detailsModalSaveBtn.addEventListener('click', () => {
  if (!currentDetailsOppId) return;
  toggleSave(currentDetailsOppId);
});
detailsModalOverlay.addEventListener('click', (e) => {
  if (e.target === detailsModalOverlay) closeDetailsModal();
});

/* =========================================================================
   RESET DEMO / CLEAR SAVED DATA
========================================================================= */
const resetDemoBtn = document.getElementById('resetDemoBtn');

resetDemoBtn.addEventListener('click', () => {
  // Clear saved opportunities
  savedIds.clear();
  document.querySelectorAll('.ticket-save').forEach(btn => {
    btn.classList.remove('saved');
    btn.setAttribute('aria-pressed', 'false');
    btn.querySelector('span').textContent = '☆';
  });

  // Reset matcher profile state (both the inline form and the modal wizard)
  matcherSkillSet.clear();
  matcherInterestSet.clear();
  modalSkillSet.clear();
  modalInterestSet.clear();
  setChipSelection(skillChips, matcherSkillSet);
  setChipSelection(interestChips, matcherInterestSet);
  setChipSelection(modalSkillChips, modalSkillSet);
  setChipSelection(modalInterestChips, modalInterestSet);
  goalSelect.value = 'software-engineer';
  levelSelect.value = 'intermediate';
  modalGoalSelect.value = 'software-engineer';
  modalLevelSelect.value = 'intermediate';

  lastMatchResults = null;
  lastProfile = null;
  matcherHint.hidden = true;
  aiVisualPanel.innerHTML = '';
  [
    { target: 98, title: 'AI Hackathon', why: 'Matched on: Python, AI/ML' },
    { target: 94, title: 'Machine Learning Internship', why: 'Matched on: Python, AI/ML, Web Dev' },
    { target: 89, title: 'Startup Bootcamp', why: 'Matched on: Entrepreneurship, UI/UX' }
  ].forEach(seed => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.dataset.target = seed.target;
    card.innerHTML = `
      <div class="match-card-head"><p>${seed.title}</p><b class="match-pct">0%</b></div>
      <div class="match-track"><i class="match-fill"></i></div>
      <p class="match-why">${seed.why}</p>
    `;
    aiVisualPanel.appendChild(card);
    animateMatchCard(card);
  });

  updateStrengthRing(10);
  updateStatMatched(null);
  updateStatDeadlines();
  updateStatSaved();
  renderDashTab('recommended');

  clearPersistedData();
  showToast('Saved data cleared — demo reset');
});

/* =========================================================================
   FINAL CTA → open the guided onboarding modal
========================================================================= */
const finalCtaBtn = document.getElementById('finalCtaBtn');
if (finalCtaBtn) {
  finalCtaBtn.addEventListener('click', () => openModal(finalCtaBtn));
}

// Decorative footer social icons have no real destinations in this demo —
// stop them from jumping the page to the top instead of leaving them as
// live-looking dead links.
document.querySelectorAll('.footer-social a[href="#"]').forEach(a => {
  a.addEventListener('click', (e) => e.preventDefault());
});

/* =========================================================================
   RESTORE PERSISTED STATE ON LOAD
========================================================================= */
(function restoreFromStorage() {
  let restoredSomething = false;

  const storedSavedIds = readSavedIdsFromStorage();
  storedSavedIds.forEach(id => toggleSave(id, true, { silent: true }));
  if (storedSavedIds.length) restoredSomething = true;

  const storedProfile = readProfileFromStorage();
  const hasProfileData = storedProfile && (
    storedProfile.skills.length > 0 ||
    storedProfile.interests.length > 0 ||
    storedProfile.goal !== 'software-engineer' ||
    storedProfile.level !== 'intermediate'
  );

  if (hasProfileData) {
    storedProfile.skills.forEach(s => { matcherSkillSet.add(s); modalSkillSet.add(s); });
    storedProfile.interests.forEach(i => { matcherInterestSet.add(i); modalInterestSet.add(i); });
    setChipSelection(skillChips, matcherSkillSet);
    setChipSelection(interestChips, matcherInterestSet);
    setChipSelection(modalSkillChips, modalSkillSet);
    setChipSelection(modalInterestChips, modalInterestSet);
    goalSelect.value = storedProfile.goal;
    levelSelect.value = storedProfile.level;
    modalGoalSelect.value = storedProfile.goal;
    modalLevelSelect.value = storedProfile.level;

    const results = runMatch(storedProfile, { silent: true });
    renderMatchesIntoPanel(aiVisualPanel, results.slice(0, 4));
    restoredSomething = true;
  }

  if (restoredSomething) showToast('Profile preferences restored');
})();
