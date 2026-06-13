const INITIAL_DATA = {
  "salary": 4240,
  "rate": 0.9192,
  "expenses": [
    {
      "date": "2026-06-06",
      "label": "Loyer",
      "chf": 1690,
      "eur": ""
    },
    {
      "date": "2026-06-19",
      "label": "Netflix",
      "chf": "",
      "eur": 21.99
    },
    {
      "date": "2026-06-12",
      "label": "Prime Vidéo",
      "chf": "",
      "eur": 6.99
    },
    {
      "date": "2026-06-10",
      "label": "Disney+",
      "chf": "",
      "eur": 15.99
    },
    {
      "date": "2026-06-24",
      "label": "PlayStation",
      "chf": "",
      "eur": 8.99
    },
    {
      "date": "2026-06-26",
      "label": "AllDebrid",
      "chf": "",
      "eur": 2.99
    },
    {
      "date": "2026-06-05",
      "label": "Floa",
      "chf": "",
      "eur": 127.25
    },
    {
      "date": "2026-06-05",
      "label": "YouTube",
      "chf": "",
      "eur": 16.99
    },
    {
      "date": "2026-06-29",
      "label": "One",
      "chf": "",
      "eur": 19.95
    },
    {
      "date": "2026-06-22",
      "label": "Cloud Apple",
      "chf": "",
      "eur": 0.99
    },
    {
      "date": "2026-06-23",
      "label": "Salt / Mobile+Fibre",
      "chf": 60.9,
      "eur": ""
    },
    {
      "date": "2026-06-08",
      "label": "Helsana",
      "chf": 391.5,
      "eur": ""
    },
    {
      "date": "2026-06-26",
      "label": "AXA Assurance",
      "chf": 77,
      "eur": ""
    },
    {
      "date": "2026-06-26",
      "label": "Plaque Voiture",
      "chf": 28,
      "eur": ""
    },
    {
      "date": "2026-06-26",
      "label": "La Mobilière RC/Ménage",
      "chf": 11.25,
      "eur": ""
    },
    {
      "date": "2026-06-06",
      "label": "ULTRA Revolut",
      "chf": 65,
      "eur": ""
    },
    {
      "date": "2026-06-26",
      "label": "AXA Caution",
      "chf": 14.5,
      "eur": ""
    },
    {
      "date": "2026-06-26",
      "label": "Redevance TV",
      "chf": 28,
      "eur": ""
    },
    {
      "date": "2026-06-20",
      "label": "Electricité",
      "chf": 80,
      "eur": ""
    },
    {
      "date": "2026-06-21",
      "label": "Essence",
      "chf": 200,
      "eur": ""
    },
    {
      "date": "2026-06-22",
      "label": "Course Piccard/Carrefour",
      "chf": "",
      "eur": 335.08
    },
    {
      "date": "2026-06-17",
      "label": "Course Suisse",
      "chf": 200,
      "eur": ""
    },
    {
      "date": "2026-06-05",
      "label": "Plaisir",
      "chf": 400,
      "eur": ""
    },
    {
      "date": "2026-06-06",
      "label": "Bourse",
      "chf": 100,
      "eur": ""
    },
    {
      "date": "2026-11-02",
      "label": "Sport",
      "chf": 80,
      "eur": ""
    }
  ]
};
const STORAGE_KEY = "mes-comptes-v11-ultime";

const STATUS_META = {
  "": {label:"Sans repère", help:"Aucun repère particulier."},
  todo: {label:"À définir", help:"Montant à confirmer"}
};

let state = loadState();
let editingIndex = null;

const els = {
  salary: document.querySelector("#salary"),
  rate: document.querySelector("#rate"),
  rows: document.querySelector("#rows"),
  salaryCard: document.querySelector("#salaryCard"),
  spentCard: document.querySelector("#spentCard"),
  savingCard: document.querySelector("#savingCard"),
  countCard: document.querySelector("#countCard"),
  lineCount: document.querySelector("#lineCount"),
  rateCard: document.querySelector("#rateCard"),
  ratePreview: document.querySelector("#ratePreview"),
  budgetPercent: document.querySelector("#budgetPercent"),
  progressFill: document.querySelector("#progressFill"),
  search: document.querySelector("#search"),
  currencyFilter: document.querySelector("#currencyFilter"),
  sortBy: document.querySelector("#sortBy"),
  addExpense: document.querySelector("#addExpense"),
  exportCsv: document.querySelector("#exportCsv"),
  resetData: document.querySelector("#resetData"),
  themeToggle: document.querySelector("#themeToggle"),
  dialog: document.querySelector("#expenseDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  modalDate: document.querySelector("#modalDate"),
  modalLabel: document.querySelector("#modalLabel"),
  modalChf: document.querySelector("#modalChf"),
  modalEur: document.querySelector("#modalEur"),
  modalStatus: document.querySelector("#modalStatus"),
  saveExpense: document.querySelector("#saveExpense")
};

function loadState(){
  try {
    const savedV4 = localStorage.getItem(STORAGE_KEY);
    if (savedV4) return migrateState(JSON.parse(savedV4));

    const savedV10 = localStorage.getItem("mes-comptes-v10-echeance");
    if (savedV10) return migrateState(JSON.parse(savedV10));

    const savedV3 = localStorage.getItem("mes-comptes-v3-statuts");
    if (savedV3) return migrateState(JSON.parse(savedV3));

    // Migration automatique depuis l’ancienne version moderne/couleurs.
    const savedV1 = localStorage.getItem("mes-comptes-modern-v1");
    if (savedV1) return migrateState(JSON.parse(savedV1));
  } catch(e) {}
  return migrateState(structuredClone(INITIAL_DATA));
}

function migrateState(data){
  data.expenses = (data.expenses || []).map(e => normalizeExpense(e));
  return data;
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value){
  const n = Number(value || 0);
  return new Intl.NumberFormat("fr-CH", {minimumFractionDigits:2, maximumFractionDigits:2}).format(n) + " CHF";
}

function moneyRound(value){
  const n = Math.round(Number(value || 0));
  return new Intl.NumberFormat("fr-CH", {minimumFractionDigits:0, maximumFractionDigits:0}).format(n) + " CHF";
}

function moneyPlainCHF(value){
  if (value === "" || value == null) return "";
  return new Intl.NumberFormat("fr-CH", {minimumFractionDigits:2, maximumFractionDigits:2}).format(Number(value || 0)) + " CHF";
}

function moneyPlainEUR(value){
  if (value === "" || value == null) return "";
  return new Intl.NumberFormat("fr-CH", {minimumFractionDigits:2, maximumFractionDigits:2}).format(Number(value || 0)) + " EUR";
}


function formatNumber(value){
  return new Intl.NumberFormat("fr-CH", {minimumFractionDigits:2, maximumFractionDigits:2}).format(Number(value || 0));
}

function extractDay(value){
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  const iso = text.match(/^\d{4}-\d{2}-(\d{2})$/);
  if (iso) return iso[1];
  const numeric = text.match(/^(?:Le\s*)?(\d{1,2})$/i);
  if (numeric) {
    const n = Math.max(1, Math.min(31, Number(numeric[1])));
    return String(n).padStart(2, "0");
  }
  return "";
}

function formatEcheance(value){
  const day = extractDay(value);
  return day ? `Le ${day}` : "";
}

function amountCHF(expense){
  return Number(expense.chf || 0) + Number(expense.eur || 0) * Number(state.rate || 0);
}

function normalizeExpense(expense){
  const e = {...expense};
  e.date = extractDay(e.date || "");
  if (!Object.prototype.hasOwnProperty.call(e, "status")) {
    const map = {green:"todo", yellow:"todo", orange:"todo", red:"todo", blue:"todo", purple:"todo"};
    e.status = map[e.color] || "";
  }
  if (["confirmed","estimated","check","pending"].includes(e.status)) e.status = "todo";
  delete e.note;
  delete e.color;
  return e;
}

function safeStatus(status){
  return status === "todo" ? "todo" : "";
}

function statusLabel(status){
  return STATUS_META[safeStatus(status)].label;
}

function statusTooltip(expense){
  return "À définir";
}

function getVisibleExpenses(){
  const q = els.search.value.trim().toLowerCase();
  const currency = els.currencyFilter.value;
  let items = state.expenses.map((expense, index) => ({...normalizeExpense(expense), index}));

  if (q) {
    items = items.filter(e => [e.date, e.label, e.chf, e.eur, statusLabel(e.status), amountCHF(e).toFixed(2)]
      .join(" ").toLowerCase().includes(q));
  }
  if (currency === "chf") items = items.filter(e => Number(e.chf || 0) > 0 && !Number(e.eur || 0));
  if (currency === "eur") items = items.filter(e => Number(e.eur || 0) > 0 && !Number(e.chf || 0));

  if (els.sortBy.value === "date") items.sort((a,b) => Number(extractDay(a.date) || 99) - Number(extractDay(b.date) || 99));
  if (els.sortBy.value === "amountDesc") items.sort((a,b) => amountCHF(b) - amountCHF(a));
  if (els.sortBy.value === "amountAsc") items.sort((a,b) => amountCHF(a) - amountCHF(b));
  return items;
}

function render(){
  state.expenses = state.expenses.map(normalizeExpense);
  els.salary.value = state.salary;
  els.rate.value = state.rate;
  if (els.rateCard) els.rateCard.textContent = Number(state.rate || 0).toFixed(4);
  if (els.ratePreview) els.ratePreview.textContent = Number(state.rate || 0).toFixed(4);

  const total = state.expenses.reduce((sum, e) => sum + amountCHF(e), 0);
  const saving = Number(state.salary || 0) - total;
  const percent = Number(state.salary || 0) ? Math.min(100, Math.max(0, total / Number(state.salary) * 100)) : 0;

  els.salaryCard.textContent = moneyRound(state.salary);
  els.spentCard.textContent = moneyRound(total);
  els.savingCard.textContent = moneyRound(saving);
  const realLineCount = state.expenses.filter(e => e.label || e.chf || e.eur || e.date).length;
  if (els.countCard) els.countCard.textContent = String(realLineCount);
  if (els.lineCount) els.lineCount.textContent = realLineCount + (realLineCount > 1 ? " lignes" : " ligne");
  els.budgetPercent.textContent = percent.toFixed(1) + "%";
  els.progressFill.style.width = percent + "%";

  const visible = getVisibleExpenses();
  let running = Number(state.salary || 0);
  els.rows.innerHTML = "";

  visible.forEach((e, visibleIndex) => {
    const converted = Number(e.eur || 0) * Number(state.rate || 0);
    running -= amountCHF(e);
    const st = safeStatus(e.status || "");
    const tip = escapeAttr(statusTooltip(e));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="statusCell">
        <button class="cornerMarker ${st === "todo" ? "active" : ""}" data-action="cycleStatus" data-index="${e.index}" title="${tip}" aria-label="${tip}">
          ${st === "todo" ? '<span class="simpleTip">À définir</span>' : ""}
        </button>
      </td>
      <td><span class="readCell">${escapeHtml(formatEcheance(e.date || ""))}</span></td>
      <td><span class="readCell">${escapeHtml(e.label || "")}</span></td>
      <td><span class="readCell amount">${e.chf === "" || e.chf == null ? "" : escapeHtml(moneyPlainCHF(e.chf))}</span></td>
      <td><span class="readCell amount">${e.eur === "" || e.eur == null ? "" : escapeHtml(moneyPlainEUR(e.eur))}</span></td>
      <td class="amount">${(e.eur === "" || e.eur == null || Number(e.eur) === 0) ? "" : money(converted)}</td>
      <td class="amount remaining ${running < 0 ? "negative" : "positive"}">${money(running)}</td>
      <td>
        <div class="rowActions">
          <button class="iconBtn" data-action="edit" data-index="${e.index}" title="Modifier">✎</button>
          <button class="iconBtn" data-action="delete" data-index="${e.index}" title="Supprimer">×</button>
        </div>
      </td>`;
    els.rows.appendChild(tr);
  });

  if (!visible.length) {
    els.rows.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:32px">Aucune ligne trouvée.</td></tr>`;
  }
}

function escapeAttr(value){
  return String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function escapeHtml(value){ return escapeAttr(value); }

function openModal(index = null){
  editingIndex = index;
  const e = index === null
    ? {date:"", label:"", chf:"", eur:"", status:""}
    : normalizeExpense(state.expenses[index]);

  els.dialogTitle.textContent = index === null ? "Ajouter une dépense" : "Modifier la dépense";
  els.modalDate.value = extractDay(e.date || "");
  els.modalLabel.value = e.label || "";
  els.modalChf.value = e.chf || "";
  els.modalEur.value = e.eur || "";
  els.modalStatus.checked = safeStatus(e.status || "") === "todo";
  els.dialog.showModal();
}

function saveModal(){
  const item = {
    date: extractDay(els.modalDate.value),
    label: els.modalLabel.value.trim(),
    chf: els.modalChf.value === "" ? "" : Number(els.modalChf.value),
    eur: els.modalEur.value === "" ? "" : Number(els.modalEur.value),
    status: els.modalStatus.checked ? "todo" : ""
  };
  if (editingIndex === null) state.expenses.push(item);
  else state.expenses[editingIndex] = item;
  saveState();
  render();
}

function cycleStatus(index){
  const current = safeStatus(state.expenses[index].status || "");
  state.expenses[index].status = current === "todo" ? "" : "todo";
  saveState();
  render();
}

els.salary.addEventListener("input", () => { state.salary = Number(els.salary.value || 0); saveState(); render(); });
els.rate.addEventListener("input", () => { state.rate = Number(els.rate.value || 0); saveState(); render(); });
[els.search, els.currencyFilter, els.sortBy].filter(Boolean).forEach(el => el.addEventListener("input", render));
els.addExpense.addEventListener("click", () => openModal());
els.saveExpense.addEventListener("click", saveModal);

els.rows.addEventListener("click", event => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const index = Number(btn.dataset.index);
  if (btn.dataset.action === "cycleStatus") cycleStatus(index);
  if (btn.dataset.action === "edit") openModal(index);
  if (btn.dataset.action === "delete") {
    state.expenses.splice(index, 1);
    saveState();
    render();
  }
});

els.exportCsv.addEventListener("click", () => {
  const header = ["Échéance","Libellé","Montant CHF","Montant EUR","Conversion CHF","Total CHF","À définir"];
  const lines = [header];
  state.expenses.forEach((e, i) => {
    e = normalizeExpense(e);
    lines.push([formatEcheance(e.date || ""), e.label || "", e.chf || "", e.eur || "", ((e.eur === "" || e.eur == null || Number(e.eur) === 0) ? "" : (Number(e.eur||0)*Number(state.rate||0)).toFixed(2)), amountCHF(e).toFixed(2), safeStatus(e.status || "") === "todo" ? "Oui" : ""]);
  });
  const csv = lines.map(row => row.map(cell => `"${String(cell).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "mes-comptes.csv"; a.click();
  URL.revokeObjectURL(url);
});

if (els.resetData) els.resetData.addEventListener("click", () => {
  if (confirm("Réinitialiser avec les données du fichier d'origine ?")) {
    state = migrateState(structuredClone(INITIAL_DATA));
    saveState();
    render();
  }
});

els.themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("mes-comptes-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  els.themeToggle.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
});


if (localStorage.getItem("mes-comptes-theme") === "dark") {
  document.documentElement.classList.add("dark");
  els.themeToggle.textContent = "☀️";
}

render();
