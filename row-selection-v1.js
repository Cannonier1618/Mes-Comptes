document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("button, a, input, select, textarea, [role=\"button\"], [contenteditable=\"true\"]")) return;

  const row = target.closest(".tablePanel tbody tr");
  if (!row) return;

  const table = row.closest("table");
  if (!table) return;

  table.querySelectorAll("tbody tr.is-selected").forEach((selectedRow) => {
    selectedRow.classList.remove("is-selected");
  });
  row.classList.add("is-selected");
});
