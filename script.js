'use strict';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { grammar: [], vocabulary: [], questions: [], wordIndex: 0, wordFlipped: false, quizList: [], quizIndex: 0, quizSelected: null, quizSubmitted: false, quizCorrect: 0, quizAnswers: [] };
const storageKey = 'nihongo-buddy-progress-v1';
const initialProgress = () => ({ quizzes: 0, best: 0, answered: 0, correct: 0, mistakes: {} });
function getProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved && typeof saved === 'object' ? { ...initialProgress(), ...saved, mistakes: saved.mistakes || {} } : initialProgress();
  } catch { return initialProgress(); }
}
function saveProgress(progress) { try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* Storage blocked: website remains usable. */ } }
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function renderError(container, message) { container.replaceChildren(el('p', 'muted', message)); }
function showPage(name) {
  if (!$('#' + name)) return;
  $$('.page').forEach(page => { const active = page.id === name; page.hidden = !active; page.classList.toggle('active', active); });
  $$('.nav-link').forEach(btn => { const active = btn.dataset.page === name; btn.classList.toggle('is-active', active); if (active) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current'); });
  if (name === 'progress') renderProgress();
  history.replaceState(null, '', '#' + name);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function renderGrammar() {
  const container = $('#grammar-list');
  const level = $('#grammar-level').value;
  const items = state.grammar.filter(g => level === 'all' || g.level === level);
  container.replaceChildren();
  if (!items.length) return renderError(container, '目前沒有這個程度的文法資料。');
  items.forEach(g => {
    const card = el('article', 'grammar-card');
    const pill = el('span', 'pill ' + (g.level === 'N4' ? 'n4' : ''), g.level);
    card.append(pill, el('h2', '', g.title), el('p', '', g.meaning), el('div', 'usage', g.usage));
    g.examples.forEach(ex => { const exbox = el('div', 'example'); exbox.append(el('strong', '', ex.jp), el('small', '', ex.zh)); card.append(exbox); });
    card.append(el('div', 'tip', '✦ 小提醒：' + g.tip));
    container.append(card);
  });
}
function currentWords() { const level = $('#word-level').value; return state.vocabulary.filter(word => level === 'all' || word.level === level); }
function renderWord() {
  const words = currentWords();
  const word = words[state.wordIndex];
  $('#word-count').textContent = words.length ? `${state.wordIndex + 1} / ${words.length} 張` : '0 張';
  $('#flash-card').classList.toggle('revealed', state.wordFlipped);
  $('#flash-word').textContent = word ? (state.wordFlipped ? word.meaning : word.word) : '沒有單字';
  $('#flash-reading').textContent = word ? (state.wordFlipped ? word.word + ' · ' + word.reading : word.reading) : '';
  $('#flash-example').textContent = word ? (state.wordFlipped ? `例句：${word.example}` : '你知道這個單字的意思嗎？') : '';
  $('#flash-card').disabled = !word;
  $('#flash-flip').disabled = !word;
  $('#flash-prev').disabled = !word;
  $('#flash-next').disabled = !word;
}
function moveWord(delta) { const n = currentWords().length; if (!n) return; state.wordIndex = (state.wordIndex + delta + n) % n; state.wordFlipped = false; renderWord(); }
function beginQuiz() {
  const level = $('#quiz-level').value;
  state.quizList = state.questions.filter(q => level === 'all' || q.level === level);
  state.quizIndex = 0;
  state.quizSelected = null;
  state.quizSubmitted = false;
  state.quizCorrect = 0;
  state.quizAnswers = [];
  renderQuiz();
}
function renderQuiz() {
  const area = $('#quiz-container'); area.replaceChildren();
  if (!state.quizList.length) return renderError(area, '目前沒有這個程度的題目。');
  if (state.quizIndex >= state.quizList.length) return finishQuiz(area);
  const q = state.quizList[state.quizIndex];
  const top = el('div', 'quiz-top'); top.append(el('span', '', `第 ${state.quizIndex + 1} / ${state.quizList.length} 題`), el('span', 'pill ' + (q.level === 'N4' ? 'n4' : ''), q.level)); area.append(top);
  const track = el('div', 'quiz-track'); track.setAttribute('role', 'progressbar'); track.setAttribute('aria-label', '測驗進度'); track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', String(state.quizList.length)); track.setAttribute('aria-valuenow', String(state.quizIndex)); const fill = el('div', 'quiz-fill'); fill.style.width = `${100 * state.quizIndex / state.quizList.length}%`; track.append(fill); area.append(track);
  area.append(el('div', 'quiz-question', q.question));
  const options = el('div', 'options');
  q.options.forEach((answer, index) => {
    const btn = el('button', 'option', `${String.fromCharCode(65 + index)}　${answer}`);
    const chosen = index === state.quizSelected;
    if (chosen) btn.classList.add('selected');
    if (state.quizSubmitted && index === q.answer) btn.classList.add('correct');
    if (state.quizSubmitted && chosen && index !== q.answer) btn.classList.add('wrong');
    btn.disabled = state.quizSubmitted;
    btn.setAttribute('aria-pressed', chosen ? 'true' : 'false');
    btn.addEventListener('click', () => { state.quizSelected = index; renderQuiz(); });
    options.append(btn);
  });
  area.append(options);
  if (state.quizSubmitted) {
    const feedback = el('div', 'quiz-feedback');
    feedback.append(el('strong', '', state.quizSelected === q.answer ? '✓ 答對了！做得很好！' : `✦ 再記住一次！正確答案：${q.options[q.answer]}`), el('p', '', q.explanation));
    area.append(feedback);
  }
  const bottom = el('div', 'quiz-bottom');
  const action = el('button', 'btn primary', state.quizSubmitted ? (state.quizIndex === state.quizList.length - 1 ? '查看成績 →' : '下一題 →') : '提交答案');
  action.disabled = !state.quizSubmitted && state.quizSelected === null;
  action.addEventListener('click', () => {
    if (!state.quizSubmitted) {
      state.quizSubmitted = true;
      const correct = state.quizSelected === q.answer;
      if (correct) state.quizCorrect++;
      state.quizAnswers.push({ id: q.id, correct });
    } else { state.quizIndex++; state.quizSelected = null; state.quizSubmitted = false; }
    renderQuiz();
  });
  bottom.append(action); area.append(bottom);
}
function finishQuiz(area) {
  const p = getProgress();
  p.quizzes++;
  p.answered += state.quizList.length;
  p.correct += state.quizCorrect;
  const score = Math.round(state.quizCorrect / state.quizList.length * 100);
  p.best = Math.max(p.best, score);
  state.quizAnswers.forEach(result => {
    if (!result.correct) p.mistakes[result.id] = (p.mistakes[result.id] || 0) + 1;
    else delete p.mistakes[result.id];
  });
  saveProgress(p);
  const end = el('div', 'quiz-result');
  end.append(el('span', 'eyebrow', 'おつかれさま！'), el('h2', '', '這次練習完成啦！'), el('div', 'big-score', `${score}%`), el('p', 'muted', `答對 ${state.quizCorrect} / ${state.quizList.length} 題。每一次練習都很棒！`));
  const repeat = el('button', 'btn primary', '再挑戰一次'); repeat.addEventListener('click', beginQuiz);
  const progress = el('button', 'btn secondary', '查看學習進度'); progress.style.marginLeft = '10px'; progress.addEventListener('click', () => showPage('progress'));
  end.append(repeat, progress); area.append(end);
  // Prevent recording the same completed quiz repeatedly when the DOM re-renders.
  state.quizIndex = state.quizList.length + 1;
}
function renderProgress() {
  const p = getProgress(); const stats = $('#progress-stats'); stats.replaceChildren();
  [["完成測驗", `${p.quizzes} 次`], ["最佳正確率", `${p.best}%`], ["累計答題", `${p.answered} 題`], ["累計答對", `${p.correct} 題`]].forEach(([title, value]) => { const card = el('div', 'stat'); card.append(el('span', '', title), el('strong', '', value)); stats.append(card); });
  const list = $('#mistake-list'); list.replaceChildren();
  const ids = Object.keys(p.mistakes).sort((a, b) => p.mistakes[b] - p.mistakes[a]);
  if (!ids.length) { list.append(el('p', 'muted', '目前沒有待複習的錯題，繼續保持！')); return; }
  ids.forEach(id => { const q = state.questions.find(item => item.id === id); if (!q) return; const grammar = state.grammar.find(g => g.id === q.grammarId); const row = el('div', 'mistake-item'); row.append(el('strong', '', grammar ? grammar.title : q.level), document.createTextNode(q.question + `（答錯 ${p.mistakes[id]} 次）`)); list.append(row); });
}
async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`${path} 格式錯誤`);
  return data;
}
async function start() {
  $$('[data-page]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));
  $$('[data-go]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.go)));
  $$('[data-nav]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); showPage(link.dataset.nav); }));
  $('#grammar-level').addEventListener('change', renderGrammar);
  $('#word-level').addEventListener('change', () => { state.wordIndex = 0; state.wordFlipped = false; renderWord(); });
  $('#flash-card').addEventListener('click', () => { state.wordFlipped = !state.wordFlipped; renderWord(); });
  $('#flash-flip').addEventListener('click', () => { state.wordFlipped = !state.wordFlipped; renderWord(); });
  $('#flash-prev').addEventListener('click', () => moveWord(-1));
  $('#flash-next').addEventListener('click', () => moveWord(1));
  $('#quiz-level').addEventListener('change', beginQuiz);
  $('#quiz-restart').addEventListener('click', beginQuiz);
  try {
    [state.grammar, state.vocabulary, state.questions] = await Promise.all([loadJson('./data/grammar.json'), loadJson('./data/vocabulary.json'), loadJson('./data/questions.json')]);
    renderGrammar(); renderWord(); beginQuiz(); renderProgress();
  } catch (error) {
    console.error('載入教材失敗：', error);
    const message = '教材無法載入。請透過 GitHub Pages 或本機 HTTP 伺服器開啟網站，並確認 data 資料夾已完整上傳。';
    renderError($('#grammar-list'), message); $('#flash-word').textContent = '教材載入失敗'; renderError($('#quiz-container'), message); renderError($('#progress-stats'), message);
  }
  const hash = window.location.hash.slice(1);
  if (['home','grammar','words','quiz','progress'].includes(hash)) showPage(hash);
}
start();
