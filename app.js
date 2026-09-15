const fileInput = document.querySelector("#fileInput");
const fileList = document.querySelector("#fileList");
const notice = document.querySelector("#notice");
const notebook = document.querySelector("#notebook");
const addCellButton = document.querySelector("#addCell");
const runCellButton = document.querySelector("#runCell");
const saveButton = document.querySelector("#saveNotebook");
const newNotebookButton = document.querySelector("#newNotebook");
const refreshButton = document.querySelector("#refreshFiles");
const addTabButton = document.querySelector("#addTab");
const cellCount = document.querySelector("#cellCount");

let files = [
  { name: "penguins-raw.csv", modified: "14 days ago", active: false },
  { name: "penguins.csv", modified: "14 days ago", active: false },
  { name: "PinguinoData.ipynb", modified: "14 days ago", active: true },
];

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    notice.hidden = true;
  }, 2800);
}

function renderFiles() {
  fileList.innerHTML = "";

  files.forEach((file) => {
    const kind = file.name.endsWith(".ipynb") ? "ipynb-kind" : "csv-kind";
    const row = document.createElement("button");
    row.className = `file-row ${file.active ? "active" : ""}`;
    row.type = "button";
    row.innerHTML = `
      <span class="file-name">
        <span class="file-kind ${kind}" aria-hidden="true"></span>
        <span>${file.name}</span>
      </span>
      <span>${file.modified}</span>
    `;
    row.addEventListener("click", () => {
      files = files.map((item) => ({ ...item, active: item.name === file.name }));
      renderFiles();
      showNotice(`Archivo seleccionado: ${file.name}`);
    });
    fileList.appendChild(row);
  });
}

function selectCell(cell) {
  document.querySelectorAll(".cell").forEach((item) => item.classList.remove("selected"));
  cell.classList.add("selected");
  updateCellCounter();
}

function selectedCell() {
  return document.querySelector(".cell.selected") || document.querySelector(".cell");
}

function updateCellCounter() {
  const cells = [...document.querySelectorAll(".cell")];
  const selected = selectedCell();
  const index = Math.max(1, cells.indexOf(selected) + 1);
  cellCount.textContent = `Cell ${index}/${cells.length}`;
}

function wireCell(cell) {
  cell.addEventListener("click", () => selectCell(cell));
  cell.querySelectorAll(".cell-tools button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const action = button.textContent.trim();
      if (action === "Upload") {
        fileInput.click();
      }
      if (action === "Run") {
        runCell(cell);
      }
      if (action === "Delete") {
        cell.remove();
        updateCellCounter();
        showNotice("Celda eliminada.");
      }
    });
  });
}

function runCell(cell = selectedCell()) {
  selectCell(cell);
  const code = cell.querySelector("textarea")?.value.trim() || "";
  if (!code) {
    showNotice("La celda esta vacia.");
    return;
  }
  showNotice("Celda ejecutada en modo demo.");
}

function addCell() {
  const currentCells = document.querySelectorAll(".cell").length;
  const cell = document.createElement("section");
  cell.className = "cell compact selected";
  cell.dataset.cell = String(153 + currentCells);
  cell.innerHTML = `
    <div class="prompt">[ ]:</div>
    <textarea spellcheck="false"># Nueva celda</textarea>
    <div class="cell-tools">
      <button title="Subir archivo a esta celda">Upload</button>
      <button title="Ejecutar">Run</button>
      <button title="Eliminar">Delete</button>
    </div>
  `;

  document.querySelectorAll(".cell").forEach((item) => item.classList.remove("selected"));
  notebook.appendChild(cell);
  wireCell(cell);
  cell.scrollIntoView({ behavior: "smooth", block: "center" });
  updateCellCounter();
  showNotice("Nueva celda agregada.");
}

fileInput.addEventListener("change", (event) => {
  const incoming = [...event.target.files].map((file) => ({
    name: file.name,
    modified: "just now",
    active: false,
  }));

  if (incoming.length === 0) return;

  files = [...incoming, ...files.map((file) => ({ ...file, active: false }))];
  files[0].active = true;
  renderFiles();
  showNotice(`${incoming.length} archivo(s) listo(s) en el panel.`);
  fileInput.value = "";
});

addCellButton.addEventListener("click", addCell);
runCellButton.addEventListener("click", () => runCell());
saveButton.addEventListener("click", () => showNotice("Notebook guardado en modo demo."));
newNotebookButton.addEventListener("click", () => showNotice("Nuevo notebook creado en modo demo."));
refreshButton.addEventListener("click", () => showNotice("Lista de archivos actualizada."));
addTabButton.addEventListener("click", () => showNotice("Nueva pestana abierta en modo demo."));

document.querySelectorAll(".cell").forEach(wireCell);
renderFiles();
updateCellCounter();
