// links das abas (os seus mesmos)
const abas = {
  lista:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLs-DQkKOVGs2daPxrhRb_1a1u8a-X2AAgk0lQjqlKxOfxi58Gfqft1jsLL-taCTmr_DaFVz1o6EBz/pub?gid=0&single=true&output=csv",
  lista1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLs-DQkKOVGs2daPxrhRb_1a1u8a-X2AAgk0lQjqlKxOfxi58Gfqft1jsLL-taCTmr_DaFVz1o6EBz/pub?gid=76847642&single=true&output=csv",
  lista2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLs-DQkKOVGs2daPxrhRb_1a1u8a-X2AAgk0lQjqlKxOfxi58Gfqft1jsLL-taCTmr_DaFVz1o6EBz/pub?gid=1893600573&single=true&output=csv"
};

// parserzinho de CSV que respeita aspas ("," dentro da célula)
function parseCSVLine(line) {
  // pega campos entre aspas (com "" escapando aspas) ou sem aspas
  const re = /("(?:[^"]|"")*"|[^,]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(line)) !== null) {
    let v = m[0].trim();
    if (v.startsWith('"') && v.endsWith('"')) {
      v = v.slice(1, -1).replace(/""/g, '"');
    }
    out.push(v);
  }
  return out;
}

async function carregar(aba) {
  const url = abas[aba];
  const status = document.getElementById('status');
  const ul = document.getElementById('lista-ul');

  status.textContent = 'Carregando…';
  ul.innerHTML = '';

  try {
    const resp = await fetch(url, { cache: 'no-store' }); // sem no-cors!
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const texto = await resp.text();

    // separa linhas e remove vazias
    const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== '');
    if (linhas.length === 0) {
      status.textContent = 'Planilha vazia.';
      return;
    }

    // cabeçalhos
    const headers = parseCSVLine(linhas[0]);
    const linhasDados = linhas.slice(1);

    // exibir algo útil — aqui mostro a primeira coluna; ajuste como quiser
    for (const linha of linhasDados) {
      const cols = parseCSVLine(linha);
      const li = document.createElement('li');

      // exemplo: se tiver colunas "Pessoa" e "Item", monta um texto bonitinho:
      const idxPessoa = headers.findIndex(h => /pessoa/i.test(h));
      const idxItem   = headers.findIndex(h => /item|presente/i.test(h));

      if (idxPessoa >= 0 && idxItem >= 0) {
        li.textContent = `${cols[idxPessoa]} — ${cols[idxItem] || ''}`.trim();
      } else {
        li.textContent = cols[0] || '(vazio)';
      }

      ul.appendChild(li);
    }

    status.textContent = '';
  } catch (err) {
    console.error(err);
    status.textContent = 'Erro ao carregar dados (veja o console).';
  }
}

// chama ao abrir a página e quando trocar a aba no <select>
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('aba');
  carregar(sel.value);
  sel.addEventListener('change', () => carregar(sel.value));
});
