function cellText(row, index) {
  const cell = row.children[index];
  return cell ? cell.textContent.trim() : '';
}

function sortTable(button) {
  const table = button.closest('table');
  if (!table) return;
  const headers = [...table.querySelectorAll('thead th')];
  const index = headers.findIndex((th) => th.contains(button));
  if (index < 0) return;
  const body = table.querySelector('tbody');
  const details = new Map();
  const rows = [];
  [...body.children].forEach((row) => {
    if (row.classList.contains('data-detail')) {
      const prev = rows[rows.length - 1];
      if (prev) details.set(prev, row);
      return;
    }
    rows.push(row);
  });
  const next = button.dataset.dir === 'asc' ? 'desc' : 'asc';
  button.dataset.dir = next;
  rows.sort((a, b) => {
    const compared = cellText(a, index).localeCompare(cellText(b, index), undefined, { numeric: true });
    return next === 'asc' ? compared : -compared;
  });
  rows.forEach((row) => {
    body.append(row);
    const detail = details.get(row);
    if (detail) body.append(detail);
  });
}

function toggleRow(row) {
  const detail = row.nextElementSibling;
  if (!detail || !detail.classList.contains('data-detail')) return;
  const open = row.getAttribute('data-open') === 'true';
  row.setAttribute('data-open', open ? 'false' : 'true');
  detail.hidden = open;
}

document.addEventListener('click', (event) => {
  const sort = event.target.closest('[data-sort]');
  if (sort) {
    sortTable(sort);
    return;
  }
  const row = event.target.closest('.data-row');
  if (row) toggleRow(row);
});
