/* ============================================
   SISTEMA DE PRESUPUESTO DE OBRA
   Versión Premium - JavaScript
   ============================================ */

// ==================== UTILIDADES ====================
const COP = (v) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
}).format(v || 0);

const num = (v) => parseFloat(v) || 0;

let charts = {};

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== TEMA OSCURO/CLARO ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('#themeToggle i').className = 'fas fa-moon';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        document.querySelector('#themeToggle i').className = 'fas fa-moon';
        showToast('Modo claro activado', 'info');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
        showToast('Modo oscuro activado', 'info');
    }
}

// ==================== NAVEGACIÓN ====================
function showTab(index) {
    // Actualizar paneles
    document.querySelectorAll('.panel').forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
    });
    
    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Actualizar título
    const titles = ['Carátula del Proyecto', 'Anteproyecto', 'Cómputos Métricos', 'Costos Directos por Capítulos', 'Costos Indirectos - AIU', 'Resumen del Presupuesto', 'Gráficas y Análisis', 'Cronograma de Obra', 'Informe del Presupuesto'];
    document.getElementById('pageTitle').textContent = titles[index];
    
    // Renderizar contenido específico
    if (index === 5) renderSummary();
    if (index === 6) renderCharts();
}

// ==================== ANTEPROYECTO ====================
const anteDefaults = [
    ['Levantamiento topográfico', 'Topógrafo', 'glb', 1, 0],
    ['Estudio de suelos', 'Firma especializada', 'glb', 1, 0],
    ['Diseño arquitectónico', 'Arquitecto', 'glb', 1, 0],
    ['Diseño estructural', 'Ing. Civil', 'glb', 1, 0],
    ['Diseño hidrosanitario', 'Ing. Civil', 'glb', 1, 0],
    ['Diseño eléctrico', 'Ing. Electricista', 'glb', 1, 0],
    ['Diseño de gas', 'Ing. Gas', 'glb', 1, 0],
    ['Licencia de construcción', 'Curaduría Urbana', 'glb', 1, 0],
    ['Pólizas de seguros', 'Aseguradora', 'glb', 1, 0],
];

function anteRow(d, i) {
    return `<tr id="ante-${i}">
        <td>${i + 1}</td>
        <td><input type="text" value="${d[0]}" oninput="calcAnte()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="text" value="${d[1]}" oninput="calcAnte()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="text" value="${d[2]}" style="width:70px" oninput="calcAnte()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="${d[3]}" min="0" step="0.01" style="width:80px" oninput="calcAnte()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="${d[4]}" min="0" step="1000" oninput="calcAnte()" class="modern-input" style="padding:6px 8px"></td>
        <td class="ante-tot">$ 0</td>
        <td><button class="btn-danger" onclick="this.closest('tr').remove();calcAnte()"><i class="fas fa-trash"></i></button></td>
    </tr>`;
}

function initAnte() {
    const body = document.getElementById('ante-body');
    anteDefaults.forEach((d, i) => body.insertAdjacentHTML('beforeend', anteRow(d, i)));
    calcAnte();
}

function addAnte() {
    const body = document.getElementById('ante-body');
    body.insertAdjacentHTML('beforeend', anteRow(['Nuevo estudio', 'Responsable', 'glb', 1, 0], body.rows.length));
    calcAnte();
}

function calcAnte() {
    let total = 0;
    document.querySelectorAll('#ante-body tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const cantidad = num(inputs[3]?.value);
        const valorUnitario = num(inputs[4]?.value);
        const subtotal = cantidad * valorUnitario;
        total += subtotal;
        const totalCell = row.querySelector('.ante-tot');
        if (totalCell) totalCell.textContent = COP(subtotal);
    });
    document.getElementById('ante-total').textContent = COP(total);
    saveData();
}

// ==================== CÓMPUTOS ====================
function compRow(n) {
    return `<tr>
        <td><input type="text" value="MAT-${String(n + 1).padStart(3, '0')}" class="modern-input" style="padding:6px 8px;width:90px"></td>
        <td><input type="text" placeholder="Descripción del material/actividad" class="modern-input" style="padding:6px 8px;min-width:180px"></td>
        <td><input type="text" value="m²" style="width:70px" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="1" min="0" step="0.01" style="width:80px" oninput="calcComp(this)" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="5" min="0" max="100" style="width:70px" oninput="calcComp(this)" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="0" min="0" step="100" oninput="calcComp(this)" class="modern-input precio-u" style="padding:6px 8px"></td>
        <td class="comp-tot">$ 0</td>
        <td>
            <button class="btn-refresh" style="background:var(--secondary);color:#fff;padding:4px 8px;margin-right:4px" onclick="consultarPrecio(this)" title="Consultar precio IA"><i class="fas fa-robot"></i></button>
            <button class="btn-danger" onclick="this.closest('tr').remove();calcAllComp()"><i class="fas fa-trash"></i></button>
        </td>
    </tr>`;
}

function initComp() {
    const body = document.getElementById('comp-body');
    for (let i = 0; i < 5; i++) body.insertAdjacentHTML('beforeend', compRow(i));
    calcAllComp();
}

function addComp() {
    const body = document.getElementById('comp-body');
    body.insertAdjacentHTML('beforeend', compRow(body.rows.length));
    calcAllComp();
}

function calcCompRow(row) {
    const inputs = row.querySelectorAll('input');
    const cantidad = num(inputs[3]?.value);
    const desperdicio = num(inputs[4]?.value);
    const precioUnitario = num(inputs[5]?.value);
    const total = cantidad * precioUnitario * (1 + desperdicio / 100);
    const totalCell = row.querySelector('.comp-tot');
    if (totalCell) totalCell.textContent = COP(total);
    return total;
}

function calcAllComp() {
    let total = 0;
    document.querySelectorAll('#comp-body tr').forEach(row => {
        total += calcCompRow(row);
    });
    document.getElementById('comp-total').textContent = COP(total);
    saveData();
}

function calcComp(element) {
    const row = element.closest('tr');
    calcCompRow(row);
    calcAllComp();
}

async function consultarPrecio(button) {
    const row = button.closest('tr');
    const descripcion = row.querySelectorAll('input')[1]?.value.trim();
    if (!descripcion) {
        showToast('⚠️ Ingrese una descripción del material primero', 'warning');
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        showToast('Consultando precios de mercado...', 'info');
        // Simulación de consulta IA (en producción conectar a API real)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Precios de referencia simulados
        const preciosReferencia = {
            'cemento': 28000,
            'arena': 85000,
            'grava': 95000,
            'acero': 5200,
            'ladrillo': 1200,
            'bloque': 3800
        };
        
        let precioEncontrado = null;
        for (const [key, value] of Object.entries(preciosReferencia)) {
            if (descripcion.toLowerCase().includes(key)) {
                precioEncontrado = value;
                break;
            }
        }
        
        const precio = precioEncontrado || Math.floor(Math.random() * 100000) + 50000;
        row.querySelector('.precio-u').value = precio;
        calcComp(row.querySelector('.precio-u'));
        showToast(`✅ Precio consultado: ${COP(precio)}`, 'success');
    } catch (error) {
        showToast('❌ Error al consultar precio', 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-robot"></i>';
    }
}

// ==================== CAPÍTULOS ====================
const capDefaults = [
    ['01', 'Preliminares y descapote', 0],
    ['02', 'Movimiento de tierras / excavaciones', 0],
    ['03', 'Cimentación', 0],
    ['04', 'Estructura (concreto, acero)', 0],
    ['05', 'Mampostería de cerramiento', 0],
    ['06', 'Cubierta e impermeabilizaciones', 0],
    ['07', 'Instalaciones hidrosanitarias', 0],
    ['08', 'Instalaciones eléctricas y voz/datos', 0],
    ['09', 'Instalaciones especiales (gas, HVAC, PCI)', 0],
    ['10', 'Acabados en pisos', 0],
    ['11', 'Acabados en muros y cielos rasos', 0],
    ['12', 'Carpintería de madera', 0],
    ['13', 'Carpintería metálica y vidriería', 0],
    ['14', 'Aparatos sanitarios y griferías', 0],
    ['15', 'Obras exteriores y urbanismo', 0],
];

function capRow(d) {
    return `<tr>
        <td><input type="text" value="${d[0]}" style="width:50px" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="text" value="${d[1]}" style="min-width:200px" oninput="calcCap()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="${d[2]}" min="0" step="10000" oninput="calcCap()" class="modern-input" style="padding:6px 8px"></td>
        <td class="cap-pct">0%</td>
        <td><button class="btn-danger" onclick="this.closest('tr').remove();calcCap()"><i class="fas fa-trash"></i></button></td>
    </tr>`;
}

function initCap() {
    const body = document.getElementById('cap-body');
    capDefaults.forEach(d => body.insertAdjacentHTML('beforeend', capRow(d)));
    calcCap();
}

function addCap() {
    const body = document.getElementById('cap-body');
    const n = body.rows.length + 1;
    body.insertAdjacentHTML('beforeend', capRow([String(n).padStart(2, '0'), 'Nuevo capítulo', 0]));
    calcCap();
}

function calcCap() {
    let total = 0;
    document.querySelectorAll('#cap-body tr').forEach(row => {
        const valor = num(row.querySelectorAll('input')[2]?.value);
        total += valor;
    });
    
    document.querySelectorAll('#cap-body tr').forEach(row => {
        const valor = num(row.querySelectorAll('input')[2]?.value);
        const porcentaje = total > 0 ? (valor / total * 100).toFixed(1) : 0;
        const pctCell = row.querySelector('.cap-pct');
        if (pctCell) pctCell.textContent = `${porcentaje}%`;
    });
    
    document.getElementById('cap-total').textContent = COP(total);
    calcAIU();
    saveData();
}

function getTotalDirectos() {
    let total = 0;
    document.querySelectorAll('#cap-body tr').forEach(row => {
        total += num(row.querySelectorAll('input')[2]?.value);
    });
    return total;
}

// ==================== AIU ====================
function calcAIU() {
    const base = getTotalDirectos();
    document.getElementById('aiu-base').textContent = COP(base);
    
    const pctA = num(document.getElementById('pct-a').value) / 100;
    const pctI = num(document.getElementById('pct-i').value) / 100;
    const pctU = num(document.getElementById('pct-u').value) / 100;
    
    const valA = base * pctA;
    const valI = base * pctI;
    const valU = base * pctU;
    
    document.getElementById('val-a').textContent = COP(valA);
    document.getElementById('val-i').textContent = COP(valI);
    document.getElementById('val-u').textContent = COP(valU);
    document.getElementById('val-aiu-total').textContent = COP(valA + valI + valU);
}

// ==================== ADMINISTRACIÓN ====================
const admDefaults = [
    ['Director técnico', 'Dirección técnica de obra', 0, 0],
    ['Residente de obra', 'Residencia permanente en obra', 0, 0],
    ['Maestro general', 'Coordinación de cuadrillas', 0, 0],
    ['Papelería', 'Gastos de administración y comunicaciones', 0, 0],
    ['Campamento y servicios', 'Servicios temporales de obra', 0, 0],
];

function admRow(d) {
    return `<tr>
        <td><input type="text" value="${d[0]}" oninput="calcAdm()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="text" value="${d[1]}" oninput="calcAdm()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="${d[2]}" min="0" step="10000" oninput="calcAdm()" class="modern-input" style="padding:6px 8px"></td>
        <td><input type="number" value="${d[3]}" min="0" step="1" oninput="calcAdm()" class="modern-input" style="padding:6px 8px"></td>
        <td class="adm-tot">$ 0</td>
        <td><button class="btn-danger" onclick="this.closest('tr').remove();calcAdm()"><i class="fas fa-trash"></i></button></td>
    </tr>`;
}

function initAdm() {
    const body = document.getElementById('adm-body');
    admDefaults.forEach(d => body.insertAdjacentHTML('beforeend', admRow(d)));
    calcAdm();
}

function addAdm() {
    const body = document.getElementById('adm-body');
    body.insertAdjacentHTML('beforeend', admRow(['Nuevo rubro', 'Descripción', 0, 0]));
    calcAdm();
}

function calcAdm() {
    let total = 0;
    document.querySelectorAll('#adm-body tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const valorMes = num(inputs[2]?.value);
        const meses = num(inputs[3]?.value);
        const subtotal = valorMes * meses;
        total += subtotal;
        const totalCell = row.querySelector('.adm-tot');
        if (totalCell) totalCell.textContent = COP(subtotal);
    });
    document.getElementById('adm-total').textContent = COP(total);
    saveData();
}

// ==================== RESUMEN ====================
function getAnteTotal() {
    let total = 0;
    document.querySelectorAll('#ante-body tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        total += num(inputs[3]?.value) * num(inputs[4]?.value);
    });
    return total;
}

function renderSummary() {
    const directos = getTotalDirectos();
    const pctA = num(document.getElementById('pct-a').value) / 100;
    const pctI = num(document.getElementById('pct-i').value) / 100;
    const pctU = num(document.getElementById('pct-u').value) / 100;
    
    const admin = directos * pctA;
    const imprevistos = directos * pctI;
    const utilidad = directos * pctU;
    const total = directos + admin + imprevistos + utilidad;
    const anteTotal = getAnteTotal();
    const area = num(document.getElementById('c-area').value);
    
    const summaryHTML = `
        <div class="summary-grid">
            <div class="sum-card">
                <div class="sum-label">Costos Directos</div>
                <div class="sum-value">${COP(directos)}</div>
            </div>
            <div class="sum-card">
                <div class="sum-label">Administración (A)</div>
                <div class="sum-value">${COP(admin)}</div>
            </div>
            <div class="sum-card">
                <div class="sum-label">Imprevistos (I)</div>
                <div class="sum-value">${COP(imprevistos)}</div>
            </div>
            <div class="sum-card">
                <div class="sum-label">Utilidad (U)</div>
                <div class="sum-value">${COP(utilidad)}</div>
            </div>
            <div class="sum-card highlight">
                <div class="sum-label">TOTAL PRESUPUESTO</div>
                <div class="sum-value">${COP(total)}</div>
            </div>
            <div class="sum-card">
                <div class="sum-label">Estudios Previos</div>
                <div class="sum-value">${COP(anteTotal)}</div>
            </div>
            ${area > 0 ? `
            <div class="sum-card">
                <div class="sum-label">Costo Directo / m²</div>
                <div class="sum-value">${COP(directos / area)}</div>
            </div>
            <div class="sum-card">
                <div class="sum-label">Costo Total / m²</div>
                <div class="sum-value">${COP(total / area)}</div>
            </div>
            ` : ''}
        </div>
        <div class="panel-card">
            <div class="card-header">
                <i class="fas fa-chart-simple"></i>
                <h2>Desglose del Presupuesto</h2>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>Componente</th><th>Valor ($)</th><th>% s/Total Obra</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Costos Directos</td><td>${COP(directos)}</td><td>${total > 0 ? (directos / total * 100).toFixed(1) + '%' : '—'}</td></tr>
                        <tr><td>Administración (${(pctA * 100).toFixed(1)}%)</td><td>${COP(admin)}</td><td>${total > 0 ? (admin / total * 100).toFixed(1) + '%' : '—'}</td></tr>
                        <tr><td>Imprevistos (${(pctI * 100).toFixed(1)}%)</td><td>${COP(imprevistos)}</td><td>${total > 0 ? (imprevistos / total * 100).toFixed(1) + '%' : '—'}</td></tr>
                        <tr><td>Utilidad (${(pctU * 100).toFixed(1)}%)</td><td>${COP(utilidad)}</td><td>${total > 0 ? (utilidad / total * 100).toFixed(1) + '%' : '—'}</td></tr>
                        <tr class="table-total"><td>TOTAL PRESUPUESTO DE OBRA</td><td>${COP(total)}</td><td>100%</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('summary-content').innerHTML = summaryHTML;
}

// ==================== GRÁFICAS ====================
function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
        delete charts[chartId];
    }
}

function renderCharts() {
    const directos = getTotalDirectos();
    const pctA = num(document.getElementById('pct-a').value) / 100;
    const pctI = num(document.getElementById('pct-i').value) / 100;
    const pctU = num(document.getElementById('pct-u').value) / 100;
    
    const admin = directos * pctA;
    const imprevistos = directos * pctI;
    const utilidad = directos * pctU;
    const total = directos + admin + imprevistos + utilidad;
    
    // Gráfica de dona - Capítulos
    const capLabels = [];
    const capValues = [];
    document.querySelectorAll('#cap-body tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const valor = num(inputs[2]?.value);
        const nombre = inputs[1]?.value || 'Sin nombre';
        if (valor > 0) {
            capLabels.push(nombre.substring(0, 25));
            capValues.push(valor);
        }
    });
    
    destroyChart('dona');
    const donaCtx = document.getElementById('chart-dona')?.getContext('2d');
    if (donaCtx && capLabels.length > 0) {
        charts['dona'] = new Chart(donaCtx, {
            type: 'doughnut',
            data: {
                labels: capLabels,
                datasets: [{
                    data: capValues,
                    backgroundColor: ['#1a4a2f', '#2a6b46', '#c88a2a', '#e0a34b', '#3d8a5c', '#a06e1f', '#5a9e75', '#b8860b', '#4a7c59', '#d4a96a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 } } }
                }
            }
        });
    }
    
    // Gráfica de pastel - Composición total
    destroyChart('pie');
    const pieCtx = document.getElementById('chart-pie')?.getContext('2d');
    if (pieCtx) {
        charts['pie'] = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Costos Directos', 'Administración', 'Imprevistos', 'Utilidad'],
                datasets: [{
                    data: [directos, admin, imprevistos, utilidad],
                    backgroundColor: ['#1a4a2f', '#c88a2a', '#e0a34b', '#2a6b46']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 } } }
                }
            }
        });
    }
    
    // Gráfica de barras - AIU
    destroyChart('aiu');
    const aiuCtx = document.getElementById('chart-aiu')?.getContext('2d');
    if (aiuCtx) {
        charts['aiu'] = new Chart(aiuCtx, {
            type: 'bar',
            data: {
                labels: ['Administración', 'Imprevistos', 'Utilidad'],
                datasets: [{
                    label: 'Valor ($)',
                    data: [admin, imprevistos, utilidad],
                    backgroundColor: ['#1a4a2f', '#c88a2a', '#2a6b46'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        ticks: { callback: v => COP(v) }
                    }
                }
            }
        });
    }
    
    // Curva S
    const meses = num(document.getElementById('cr-meses').value) || 6;
    const inversiones = [];
    let acumulado = 0;
    for (let i = 1; i <= meses; i++) {
        acumulado += total / meses;
        inversiones.push(acumulado);
    }
    
    destroyChart('curvas');
    const curvaCtx = document.getElementById('chart-curvas')?.getContext('2d');
    if (curvaCtx) {
        charts['curvas'] = new Chart(curvaCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: meses }, (_, i) => `Mes ${i + 1}`),
                datasets: [{
                    label: 'Inversión Acumulada',
                    data: inversiones,
                    borderColor: '#c88a2a',
                    backgroundColor: 'rgba(200, 138, 42, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#c88a2a'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: { callback: v => COP(v) }
                    }
                }
            }
        });
    }
    
    showToast('✅ Gráficas actualizadas', 'success');
}

// ==================== CRONOGRAMA ====================
function generarCronograma() {
    const meses = num(document.getElementById('cr-meses').value) || 6;
    const fechaInicio = document.getElementById('cr-inicio').value;
    const directos = getTotalDirectos();
    const pctA = num(document.getElementById('pct-a').value) / 100;
    const pctI = num(document.getElementById('pct-i').value) / 100;
    const pctU = num(document.getElementById('pct-u').value) / 100;
    const aiu = directos * (pctA + pctI + pctU);
    const total = directos + aiu;
    
    // Obtener capítulos
    const capitulos = [];
    document.querySelectorAll('#cap-body tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const valor = num(inputs[2]?.value);
        const nombre = inputs[1]?.value || 'Capítulo';
        if (valor > 0) {
            capitulos.push({ nombre, valor });
        }
    });
    
    if (capitulos.length === 0) {
        showToast('⚠️ Ingrese valores en al menos un capítulo', 'warning');
        return;
    }
    
    // Generar labels de meses
    const labels = [];
    if (fechaInicio) {
        const fecha = new Date(fechaInicio + 'T00:00:00');
        for (let i = 0; i < meses; i++) {
            const nuevaFecha = new Date(fecha);
            nuevaFecha.setMonth(fecha.getMonth() + i);
            labels.push(nuevaFecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }));
        }
    } else {
        for (let i = 0; i < meses; i++) labels.push(`Mes ${i + 1}`);
    }
    
    // Generar Gantt
    const anchoMaximo = 100;
    let ganttHTML = `
        <h3 style="margin: 20px 0 16px 0; color: var(--primary);"><i class="fas fa-chart-gantt"></i> Diagrama de Gantt</h3>
        <div class="table-container">
            <table class="gantt-table">
                <thead>
                    <tr><th>Capítulo</th>${labels.map(l => `<th>${l}</th>`).join('')}</thead>
                </thead>
                <tbody>
    `;
    
    capitulos.forEach(cap => {
        const porcentajeMensual = (cap.valor / meses) / cap.valor * 100;
        ganttHTML += `<tr><td style="font-weight:500">${cap.nombre}</td>`;
        for (let i = 0; i < meses; i++) {
            ganttHTML += `<td><div class="gantt-bar" style="width: ${porcentajeMensual}%"></div></td>`;
        }
        ganttHTML += `</tr>`;
    });
    
    ganttHTML += `</tbody></table></div>`;
    
    // Tabla de flujo de inversión
    let flujoHTML = `
        <h3 style="margin: 30px 0 16px 0; color: var(--primary);"><i class="fas fa-chart-line"></i> Flujo de Inversión Mensual</h3>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>Concepto</th>${labels.map(l => `<th>${l}</th>`).join('')}</thead>
                </thead>
                <tbody>
                    <tr><td style="font-weight:500">Costos Directos</td>${labels.map(() => `<td>${COP(directos / meses)}</td>`).join('')}</tr>
                    <tr><td style="font-weight:500">Costos Indirectos (AIU)</td>${labels.map(() => `<td>${COP(aiu / meses)}</td>`).join('')}</tr>
                    <tr><td style="font-weight:700;background:var(--border-light)">Total Mensual</td>${labels.map(() => `<td style="font-weight:700">${COP(total / meses)}</td>`).join('')}</tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('cronograma-output').innerHTML = ganttHTML + flujoHTML;
    showToast('✅ Cronograma generado exitosamente', 'success');
}

// ==================== INFORME ====================
function generarInforme() {
    const directos = getTotalDirectos();
    const pctA = num(document.getElementById('pct-a').value) / 100;
    const pctI = num(document.getElementById('pct-i').value) / 100;
    const pctU = num(document.getElementById('pct-u').value) / 100;
    
    const admin = directos * pctA;
    const imprevistos = directos * pctI;
    const utilidad = directos * pctU;
    const total = directos + admin + imprevistos + utilidad;
    const anteTotal = getAnteTotal();
    const area = num(document.getElementById('c-area').value);
    
    const get = (id) => document.getElementById(id)?.value || '—';
    
    // Construir tablas
    let capRows = '';
    document.querySelectorAll('#cap-body tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const valor = num(inputs[2]?.value);
        const porcentaje = directos > 0 ? (valor / directos * 100).toFixed(1) : 0;
        capRows += `<tr><td>${inputs[0]?.value || ''}</td><td>${inputs[1]?.value || ''}</td><td style="text-align:right">${COP(valor)}</td><td style="text-align:center">${porcentaje}%</td></tr>`;
    });
    
    const informeHTML = `
        <div style="font-family: 'Inter', sans-serif; max-width: 1000px; margin: 0 auto;">
            <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid var(--secondary); margin-bottom: 30px;">
                <h1 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--primary);">PRESUPUESTO DE OBRA</h1>
                <h2 style="font-size: 1.1rem; color: var(--secondary); margin: 8px 0;">${get('c-nombre')}</h2>
                <p style="color: var(--text-light);">Barranquilla, Colombia · 2025</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: var(--border-light); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                <div><strong>Propietario:</strong> ${get('c-propietario')}</div>
                <div><strong>Profesional:</strong> ${get('c-profesional')} · ${get('c-matricula')}</div>
                <div><strong>Dirección:</strong> ${get('c-direccion')}</div>
                <div><strong>Área construida:</strong> ${get('c-area')} m²</div>
                <div><strong>Sistema constructivo:</strong> ${get('c-sistema')}</div>
                <div><strong>Fecha elaboración:</strong> ${get('c-fecha')}</div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: var(--primary); margin-bottom: 16px; border-left: 4px solid var(--secondary); padding-left: 12px;">Costos Directos por Capítulos</h3>
                <table style="width:100%; border-collapse: collapse; background: var(--bg-card); border-radius: 12px; overflow: hidden;">
                    <thead>
                        <tr style="background: var(--primary); color: white;">
                            <th style="padding: 12px; text-align: left">N°</th>
                            <th style="padding: 12px; text-align: left">Capítulo</th>
                            <th style="padding: 12px; text-align: right">Valor ($)</th>
                            <th style="padding: 12px; text-align: center">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${capRows}
                        <tr style="background: var(--primary); color: white; font-weight: 700;">
                            <td colspan="2" style="padding: 12px; text-align: right">TOTAL COSTOS DIRECTOS</td>
                            <td style="padding: 12px; text-align: right">${COP(directos)}</td>
                            <td style="padding: 12px; text-align: center">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: var(--primary); margin-bottom: 16px; border-left: 4px solid var(--secondary); padding-left: 12px;">Costos Indirectos - AIU</h3>
                <table style="width:100%; border-collapse: collapse; background: var(--bg-card); border-radius: 12px; overflow: hidden;">
                    <thead>
                        <tr style="background: var(--primary); color: white;">
                            <th style="padding: 12px; text-align: left">Componente</th>
                            <th style="padding: 12px; text-align: center">%</th>
                            <th style="padding: 12px; text-align: right">Valor ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 10px">A - Administración</td><td style="text-align: center">${(pctA * 100).toFixed(1)}%</td><td style="text-align: right">${COP(admin)}</td></tr>
                        <tr><td style="padding: 10px">I - Imprevistos</td><td style="text-align: center">${(pctI * 100).toFixed(1)}%</td><td style="text-align: right">${COP(imprevistos)}</td></tr>
                        <tr><td style="padding: 10px">U - Utilidad</td><td style="text-align: center">${(pctU * 100).toFixed(1)}%</td><td style="text-align: right">${COP(utilidad)}</td></tr>
                        <tr style="background: var(--primary); color: white; font-weight: 700;"><td style="padding: 12px">TOTAL AIU</td><td style="text-align: center">${((pctA + pctI + pctU) * 100).toFixed(1)}%</td><td style="text-align: right">${COP(admin + imprevistos + utilidad)}</td></tr>
                    </tbody>
                </table>
            </div>
            
            <div style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
                <div style="font-size: 0.9rem; opacity: 0.9; letter-spacing: 1px;">VALOR TOTAL DEL PRESUPUESTO DE OBRA</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary); margin: 8px 0;">${COP(total)}</div>
                ${area > 0 ? `<div style="font-size: 0.85rem; opacity: 0.8;">Costo por m²: ${COP(total / area)}</div>` : ''}
            </div>
            
            <div style="text-align: center; padding-top: 30px; border-top: 1px solid var(--border); font-size: 0.8rem; color: var(--text-light);">
                <p>${get('c-profesional')} · ${get('c-matricula')}</p>
                <p>Elaborado: ${get('c-fecha') || new Date().toLocaleDateString('es-CO')}</p>
            </div>
        </div>
    `;
    
    document.getElementById('informe-output').innerHTML = informeHTML;
    showTab(8);
    showToast('✅ Informe generado exitosamente', 'success');
}

// ==================== PERSISTENCIA ====================
function saveData() {
    const data = {
        caratula: {
            nombre: document.getElementById('c-nombre')?.value,
            propietario: document.getElementById('c-propietario')?.value,
            profesional: document.getElementById('c-profesional')?.value,
            matricula: document.getElementById('c-matricula')?.value,
            ciudad: document.getElementById('c-ciudad')?.value,
            direccion: document.getElementById('c-direccion')?.value,
            barrio: document.getElementById('c-barrio')?.value,
            fecha: document.getElementById('c-fecha')?.value,
            corte: document.getElementById('c-corte')?.value,
            area: document.getElementById('c-area')?.value,
            lote: document.getElementById('c-lote')?.value,
            pisos: document.getElementById('c-pisos')?.value,
            uso: document.getElementById('c-uso')?.value,
            sistema: document.getElementById('c-sistema')?.value,
            normativa: document.getElementById('c-normativa')?.value,
            descripcion: document.getElementById('c-descripcion')?.value
        },
        pct: {
            a: document.getElementById('pct-a')?.value,
            i: document.getElementById('pct-i')?.value,
            u: document.getElementById('pct-u')?.value
        },
        cronograma: {
            meses: document.getElementById('cr-meses')?.value,
            inicio: document.getElementById('cr-inicio')?.value
        }
    };
    sessionStorage.setItem('presupuesto_obra', JSON.stringify(data));
}

function loadData() {
    try {
        const data = JSON.parse(sessionStorage.getItem('presupuesto_obra') || '{}');
        if (data.caratula) {
            Object.entries(data.caratula).forEach(([id, value]) => {
                const el = document.getElementById(`c-${id === 'nombre' ? 'nombre' : id === 'propietario' ? 'propietario' : id === 'profesional' ? 'profesional' : id === 'matricula' ? 'matricula' : id === 'ciudad' ? 'ciudad' : id === 'direccion' ? 'direccion' : id === 'barrio' ? 'barrio' : id === 'fecha' ? 'fecha' : id === 'corte' ? 'corte' : id === 'area' ? 'area' : id === 'lote' ? 'lote' : id === 'pisos' ? 'pisos' : id === 'uso' ? 'uso' : id === 'sistema' ? 'sistema' : id === 'normativa' ? 'normativa' : 'descripcion'}`);
                if (el) el.value = value;
            });
        }
        if (data.pct) {
            if (data.pct.a) document.getElementById('pct-a').value = data.pct.a;
            if (data.pct.i) document.getElementById('pct-i').value = data.pct.i;
            if (data.pct.u) document.getElementById('pct-u').value = data.pct.u;
        }
        if (data.cronograma) {
            if (data.cronograma.meses) document.getElementById('cr-meses').value = data.cronograma.meses;
            if (data.cronograma.inicio) document.getElementById('cr-inicio').value = data.cronograma.inicio;
        }
    } catch (e) {
        console.warn('Error loading data:', e);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Fechas por defecto
    const today = new Date().toISOString().split('T')[0];
    const fechaEl = document.getElementById('c-fecha');
    const corteEl = document.getElementById('c-corte');
    const inicioEl = document.getElementById('cr-inicio');
    if (fechaEl) fechaEl.value = today;
    if (corteEl) corteEl.value = today;
    if (inicioEl) inicioEl.value = today;
    
    // Inicializar módulos
    initAnte();
    initComp();
    initCap();
    initAdm();
    initTheme();
    
    // Cargar datos guardados
    loadData();
    
    // Recalcular todo
    calcCap();
    calcAIU();
    calcAdm();
    calcAnte();
    calcAllComp();
    
    // Event listeners
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Eventos de navegación
    document.querySelectorAll('.nav-item').forEach((item, index) => {
        item.addEventListener('click', () => showTab(index));
    });
    
    showToast('✅ Sistema cargado correctamente', 'success');
});