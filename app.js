let currentField = 'a';
let selectedOp   = '';
const history    = [];

const inA      = document.getElementById('a');
const inB      = document.getElementById('b');
const opDisp   = document.getElementById('op-display');
const exprEl   = document.getElementById('expr');
const resultEl = document.getElementById('result-val');

function activeInput() {
  return currentField === 'a' ? inA : inB;
}

/* ── Saisie clavier virtuel ── */
function typeDigit(d) {
  const el = activeInput();
  el.value = (el.value === '' || el.value === '0') ? d : el.value + d;
  clearResult();
}

function typeDot() {
  const el = activeInput();
  if (el.value === '' || el.value === '-') el.value += '0.';
  else if (!el.value.includes('.'))        el.value += '.';
  clearResult();
}

function typeBackspace() {
  const el = activeInput();
  el.value = el.value.slice(0, -1);
  clearResult();
}

function inputSign() {
  const el = activeInput();
  if (!el.value || el.value === '0') return;
  el.value = el.value.startsWith('-') ? el.value.slice(1) : '-' + el.value;
  clearResult();
}

function inputPercent() {
  const el = activeInput();
  const v = parseFloat(el.value);
  if (!isNaN(v)) el.value = String(v / 100);
  clearResult();
}

/* ── Opérateur ── */
function setOp(op) {
  document.querySelectorAll('.key.op').forEach(b => b.classList.remove('active'));
  selectedOp = op;
  opDisp.textContent = op;
  document.getElementById('op-' + op).classList.add('active');
  currentField = 'b';
  inB.focus();
  clearResult();
}

/* ── Calcul ── */
function compute() {
  const a = parseFloat(inA.value);
  const b = parseFloat(inB.value);

  if (isNaN(a) || isNaN(b) || selectedOp === '') return;
  if (selectedOp === '÷' && b === 0) {
    resultEl.textContent = 'Erreur';
    exprEl.textContent   = 'Division par 0';
    return;
  }

  let res;
  switch (selectedOp) {
    case '+': res = a + b; break;
    case '−': res = a - b; break;
    case '×': res = a * b; break;
    case '÷': res = a / b; break;
  }

  res = Math.round(res * 1e10) / 1e10;

  exprEl.textContent   = `${a} ${selectedOp} ${b} =`;
  resultEl.textContent = res;

  addToHistory(a, selectedOp, b, res);
  document.querySelectorAll('.key.op').forEach(b => b.classList.remove('active'));

  inA.value  = '';
  inB.value  = '';
  opDisp.textContent = '';
  selectedOp   = '';
  currentField = 'a';
  inA.focus();
}

function clearAll() {
  inA.value = '';
  inB.value = '';
  opDisp.textContent   = '';
  exprEl.textContent   = '';
  resultEl.textContent = '';
  selectedOp   = '';
  currentField = 'a';
  inA.focus();
}

function clearResult() {
  exprEl.textContent   = '';
  resultEl.textContent = '';
}

/* ── Historique ── */
function addToHistory(a, op, b, res) {
  history.unshift({ expr: `${a} ${op} ${b}`, res });
  if (history.length > 20) history.pop();
  renderHistory();
}

function renderHistory() {
  const list  = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  list.querySelectorAll('.history-item').forEach(el => el.remove());

  if (history.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  history.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span class="h-expr">${entry.expr} =</span><span class="h-res">${entry.res}</span>`;
    item.addEventListener('click', () => {
      inA.value = String(entry.res);
      inB.value = '';
      opDisp.textContent   = '';
      exprEl.textContent   = '';
      resultEl.textContent = '';
      selectedOp   = '';
      currentField = 'b';
      document.querySelectorAll('.key.op').forEach(b => b.classList.remove('active'));
      inB.focus();
    });
    list.appendChild(item);
  });
}

function removeLastHistory() {
  if (history.length > 0) { history.shift(); renderHistory(); }
}

function clearHistory() {
  history.length = 0;
  renderHistory();
}

/* ── Clavier physique ── */
document.addEventListener('keydown', e => {
  const active  = document.activeElement;
  const inField = active === inA || active === inB;

  if (inField) {
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); compute(); }
    else if (e.key === 'Escape') clearAll();
    else if (e.key === '+') { e.preventDefault(); setOp('+'); }
    else if (e.key === '-' && active.value === '') { e.preventDefault(); inputSign(); }
    else if (e.key === '*') { e.preventDefault(); setOp('×'); }
    else if (e.key === '/') { e.preventDefault(); setOp('÷'); }
    return;
  }

  if (e.key >= '0' && e.key <= '9') typeDigit(e.key);
  else if (e.key === '.' || e.key === ',') typeDot();
  else if (e.key === 'Backspace') typeBackspace();
  else if (e.key === '+')  setOp('+');
  else if (e.key === '-')  setOp('−');
  else if (e.key === '*')  setOp('×');
  else if (e.key === '/') { e.preventDefault(); setOp('÷'); }
  else if (e.key === 'Enter' || e.key === '=') compute();
  else if (e.key === 'Escape') clearAll();
});

inA.addEventListener('focus', () => currentField = 'a');
inB.addEventListener('focus', () => currentField = 'b');

/* ── Validation saisie directe ── */
[inA, inB].forEach(el => {
  el.addEventListener('input', () => {
    el.value = el.value
      .replace(/[^0-9.\-]/g, '')
      .replace(/(?!^)-/g, '')
      .replace(/(\..*)\./g, '$1');
    clearResult();
  });
});
