let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 1.5;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

document.getElementById('file-input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const fileReader = new FileReader();

    fileReader.onload = function () {
      const typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
        pdfDoc = pdf;
        pageNum = 1;
        document.getElementById('page-info').textContent = `Página ${pageNum} de ${pdfDoc.numPages}`;
        renderPage(pageNum);
      });
    };

    fileReader.readAsArrayBuffer(file);
  }
});

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(function (page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function () {
      pageRendering = false;

      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }

      document.getElementById('page-info').textContent = `Página ${pageNum} de ${pdfDoc.numPages}`;
    });
  });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

document.getElementById('prev').addEventListener('click', function () {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.getElementById('next').addEventListener('click', function () {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});

// Sistema de Anotações
document.getElementById('save-note').addEventListener('click', function () {
  const noteText = document.getElementById('note-input').value.trim();
  if (noteText) {
    const li = document.createElement('li');
    li.textContent = noteText;
    document.getElementById('note-list').appendChild(li);
    document.getElementById('note-input').value = '';
  }
});

// Botões de cor (sem funcionalidade visual ainda)
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color');
    alert(`Cor de destaque selecionada: ${color}`);
  });
});
