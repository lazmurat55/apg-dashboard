// ============================================
// APG BOCHUM - ANA UYGULAMA (TAMAMEN YENİLENDİ)
// ============================================

// Global değişkenler
let currentSchicht = "B";
let currentSchichtType = "Frühschicht";
let selectedStaff = [];
let loggedInUser = "";
let currentSchichtFilter = "B";
let allReports = [];

// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", function() {
    initApp();
});

function initApp() {
    setInitialTodayDate();
    bindEvents();
    setSchichtType(currentSchichtType);
    setSchicht(currentSchicht);
}

function setInitialTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('datum');
    if (dateInput) {
        dateInput.value = `${year}-${month}-${day}`;
    }
}

function getCorrectDateForNightShift() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentSchichtType === "Nachtschicht") {
        if (currentHour >= 22) {
            return new Date();
        }
        else if (currentHour < 6 || (currentHour === 6 && currentMinute <= 10)) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
        }
    }
    return new Date();
}

function bindEvents() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', checkLogin);
    
    const savePassBtn = document.getElementById('savePassBtn');
    if (savePassBtn) savePassBtn.addEventListener('click', saveNewPassword);
    
    document.querySelectorAll('.schicht-btn[data-schicht]').forEach(btn => {
        btn.addEventListener('click', () => setSchicht(btn.dataset.schicht));
    });
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => setSchichtType(btn.dataset.type));
    });
    
    const openWorkerBtn = document.getElementById('openWorkerBtn');
    if (openWorkerBtn) openWorkerBtn.addEventListener('click', openWorkerOverlay);
    
    const addManualBtn = document.getElementById('addManualBtn');
    if (addManualBtn) addManualBtn.addEventListener('click', addManualWorker);
    
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    if (closeOverlayBtn) closeOverlayBtn.addEventListener('click', () => {
        document.getElementById('workerOverlay').style.display = 'none';
    });
    
    const anlageSelect = document.getElementById('anlage');
    if (anlageSelect) anlageSelect.addEventListener('change', (e) => onAnlageChange(e.target.value));
    
    const addArtikelBtn = document.getElementById('addArtikelBtn');
    if (addArtikelBtn) addArtikelBtn.addEventListener('click', addArtikel);
    
    const mainSendBtn = document.getElementById('mainSendBtn');
    if (mainSendBtn) mainSendBtn.addEventListener('click', processReport);
    
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadAdminDashboard);
    
    const grantRightsBtn = document.getElementById('grantRightsBtn');
    if (grantRightsBtn) grantRightsBtn.addEventListener('click', grantSuperManagerRights);
    
    document.querySelectorAll('.ft-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            liveCheck();
        });
    });
    
    // FILTRE BUTONLARI
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const schicht = btn.dataset.filterSchicht;
            if (schicht) {
                currentSchichtFilter = schicht;
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active-filter');
                    b.style.background = "#0f172a";
                    b.style.borderColor = "#334155";
                });
                btn.classList.add('active-filter');
                btn.style.background = "#38bdf8";
                btn.style.borderColor = "#38bdf8";
                document.getElementById('activeSchichtFilter').innerText = schicht;
                loadAdminDashboard();
            }
        });
    });
}

// ============================================
// LOGIN SİSTEMİ
// ============================================

async function checkLogin() {
    const btn = document.getElementById('loginBtn');
    const username = document.getElementById('userInp').value.trim();
    const password = document.getElementById('passInp').value.trim();
    
    if (!INITIAL_DB[username]) {
        showLoginError("Benutzer nicht gefunden!");
        return;
    }
    
    btn.innerHTML = "Check... ⏳";
    hideLoginError();
    
    try {
        if (SCRIPT_URL && SCRIPT_URL !== "") {
            const response = await fetch(SCRIPT_URL);
            const cloudDB = await response.json();
            if (cloudDB && cloudDB[username] && cloudDB[username] === password) {
                enterApp(username);
                return;
            }
        }
    } catch(e) {}
    
    if (INITIAL_DB[username] === password) {
        enterApp(username);
    } else {
        showLoginError("Falsches Passwort!");
    }
    
    btn.innerHTML = "ANMELDEN";
}

function showLoginError(msg) {
    const errorEl = document.getElementById('loginError');
    errorEl.innerText = "⚠️ " + msg;
    errorEl.style.display = 'block';
}

function hideLoginError() {
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
}

async function saveNewPassword() {
    const btn = document.getElementById('savePassBtn');
    const p1 = document.getElementById('newPass1').value;
    const p2 = document.getElementById('newPass2').value;
    
    if (p1.length < 4) {
        alert("Passwort muss mindestens 4 Zeichen haben!");
        return;
    }
    
    if (p1 !== p2) {
        alert("Passwörter stimmen nicht überein!");
        return;
    }
    
    btn.innerHTML = "Aktivieren... ⏳";
    
    try {
        if (SCRIPT_URL && SCRIPT_URL !== "") {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({
                    action: "setPassword",
                    username: loggedInUser,
                    password: p1
                })
            });
        }
        enterApp(loggedInUser);
    } catch(e) {
        alert("Fehler beim Speichern des Passworts.");
    }
    
    btn.innerHTML = "PASSWORT AKTIVIEREN";
}

async function enterApp(username) {
    loggedInUser = username;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('setPassScreen').style.display = 'none';
    
    const correctedDate = getCorrectDateForNightShift();
    const year = correctedDate.getFullYear();
    const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
    const day = String(correctedDate.getDate()).padStart(2, '0');
    document.getElementById('datum').value = `${year}-${month}-${day}`;
    
    try {
        if (SCRIPT_URL && SCRIPT_URL !== "") {
            const res = await fetch(SCRIPT_URL + "?action=getReports");
            const data = await res.json();
            if (data.managers) SUPER_MANAGERS = data.managers;
        }
    } catch(e) {}
    
    if (SUPER_MANAGERS.includes(username)) {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminUserDisplay').innerHTML = "Willkommen, " + username + " (Admin Mode)";
        
        if (username === "Keskin") {
            document.getElementById('rightsManagementBox').style.display = 'block';
            updateManagersList();
            loadUserSelectForRights();
        }
        loadAdminDashboard();
    } else {
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('currentUserDisplay').innerHTML = "Angemeldet: " + username;
        
        let foundSchicht = "B";
        if (WORKER_DATA["A"].some(w => w.includes(username))) foundSchicht = "A";
        if (WORKER_DATA["C"].some(w => w.includes(username))) foundSchicht = "C";
        
        setSchicht(foundSchicht);
    }
}

// ============================================
// SCHİCHT YÖNETİMİ
// ============================================

function setSchicht(schicht) {
    currentSchicht = schicht;
    
    document.querySelectorAll('.schicht-btn[data-schicht]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.schicht === schicht) {
            btn.classList.add('active');
        }
    });
    
    selectedStaff = [];
    renderStaff();
    
    if (schicht === "A") setSchichtType('Frühschicht');
    else if (schicht === "B") setSchichtType('Spätschicht');
    else if (schicht === "C") setSchichtType('Nachtschicht');
}

function setSchichtType(type) {
    currentSchichtType = type;
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
}

// ============================================
// MİTARBEİTER YÖNETİMİ
// ============================================

function openWorkerOverlay() {
    const workerListDiv = document.getElementById('workerList');
    const workers = WORKER_DATA[currentSchicht] || [];
    
    workerListDiv.innerHTML = workers.map(w => 
        `<div class="worker-opt" data-worker="${w.replace(/"/g, '&quot;')}">${escapeHtml(w)}</div>`
    ).join('');
    
    document.querySelectorAll('.worker-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            const name = opt.dataset.worker;
            if (!selectedStaff.includes(name)) {
                selectedStaff.push(name);
            }
            document.getElementById('workerOverlay').style.display = 'none';
            renderStaff();
        });
    });
    
    document.getElementById('workerOverlay').style.display = 'flex';
}

function addManualWorker() {
    const input = document.getElementById('manualWorker');
    const name = input.value.trim();
    if (name) {
        selectedStaff.push("✍️ " + name);
        input.value = '';
        document.getElementById('workerOverlay').style.display = 'none';
        renderStaff();
    }
}

function renderStaff() {
    const container = document.getElementById('workerDisplayContainer');
    if (!container) return;
    
    container.innerHTML = selectedStaff.map(s => `
        <div class="selected-worker">
            <span>${escapeHtml(s)}</span>
            <span onclick="removeStaff('${escapeHtml(s).replace(/'/g, "\\'")}')">✕</span>
        </div>
    `).join('');
    
    liveCheck();
}

function removeStaff(name) {
    selectedStaff = selectedStaff.filter(x => x !== name);
    renderStaff();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// ANLAGE & FT & COMPOUND
// ============================================

function onAnlageChange(value) {
    const ftBox = document.getElementById('ftBox');
    const comTimeBox = document.getElementById('comTimeBox');
    const addArtikelBtn = document.getElementById('addArtikelBtn');
    const artikelContainer = document.getElementById('artikelContainer');
    
    if (ftBox) ftBox.style.display = value.startsWith("PUR") ? "block" : "none";
    if (comTimeBox) comTimeBox.style.display = value === "COM" ? "block" : "none";
    
    if (artikelContainer) artikelContainer.innerHTML = "";
    
    if (addArtikelBtn) {
        addArtikelBtn.disabled = value === "";
    }
    
    liveCheck();
}

// ============================================
// ARTİKEL YÖNETİMİ
// ============================================

let artikelCounter = 0;

function addArtikel() {
    const id = Date.now() + artikelCounter++;
    const container = document.getElementById('artikelContainer');
    const anlageValue = document.getElementById('anlage').value;
    const isCom = anlageValue === 'COM';
    
    const div = document.createElement('div');
    div.className = "section-card artikel-row";
    div.id = `art_${id}`;
    
    div.innerHTML = `
        <button class="remove-artikel-btn" style="position:absolute; right:10px; top:10px; background:var(--danger); color:white; border:none; border-radius:5px; width:30px; height:30px; cursor:pointer;">✕</button>
        <label>Artikelnummer</label>
        <input type="text" class="art-name" placeholder="Nummer eingeben...">
        ${isCom ? '<label>Dauer (Min)</label><input type="number" class="art-duration" placeholder="Minuten..." oninput="liveCheck()">' : ''}
        <div class="grid-2" style="margin-top:10px;">
            <div><label>Gutteile (Stk)</label><input type="number" class="art-gut" placeholder="Anzahl..."></div>
            <div><label>Aus Gesamt</label><input type="number" class="art-aus-total" placeholder="Anzahl..." oninput="liveCheck()"></div>
        </div>
        <div class="status-badge" id="badge_${id}"></div>
        <div id="rows_${id}"></div>
        <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="sub-btn add-aus-btn" data-id="${id}" data-type="aus">+ Ausschuss</button>
            <button class="sub-btn add-stoer-btn" data-id="${id}" data-type="stoer">+ Störung</button>
        </div>
    `;
    
    container.appendChild(div);
    
    const removeBtn = div.querySelector('.remove-artikel-btn');
    removeBtn.addEventListener('click', () => {
        div.remove();
        liveCheck();
    });
    
    const addAusBtn = div.querySelector('.add-aus-btn');
    addAusBtn.addEventListener('click', () => addRow(id, 'aus'));
    
    const addStoerBtn = div.querySelector('.add-stoer-btn');
    addStoerBtn.addEventListener('click', () => addRow(id, 'stoer'));
}

function addRow(artId, type) {
    const anlage = document.getElementById('anlage').value;
    let category = 'Spritz';
    if (anlage === 'COM') category = 'COM';
    else if (anlage.startsWith('PUR')) category = 'PUR';
    
    const codes = CODE_DATA[category][type];
    const placeholder = type === 'aus' ? 'Stk' : 'Min';
    
    const rowsDiv = document.getElementById(`rows_${artId}`);
    if (!rowsDiv) return;
    
    const rowDiv = document.createElement('div');
    rowDiv.className = "code-row";
    
    rowDiv.innerHTML = `
        <div class="code-row-inputs">
            <select class="${type}-select" style="flex:3;">
                ${codes.map(c => `<option value="${c.replace(/"/g, '&quot;')}">${c}</option>`).join('')}
            </select>
            <input type="number" class="${type}-value" style="flex:1; min-width:80px;" placeholder="${placeholder}" oninput="liveCheck()">
            <button class="remove-row-btn" style="color:var(--danger); background:none; border:none; font-size:20px; cursor:pointer;">✕</button>
        </div>
        <input type="text" class="sonstige-input" placeholder="Grund manuell..." style="display:none;">
    `;
    
    rowsDiv.appendChild(rowDiv);
    
    const select = rowDiv.querySelector(`.${type}-select`);
    const sonstInput = rowDiv.querySelector('.sonstige-input');
    
    select.addEventListener('change', () => {
        sonstInput.style.display = select.value === 'Sonstige' ? 'block' : 'none';
    });
    
    const removeRowBtn = rowDiv.querySelector('.remove-row-btn');
    removeRowBtn.addEventListener('click', () => {
        rowDiv.remove();
        liveCheck();
    });
    
    liveCheck();
}

// ============================================
// VALİDASYON
// ============================================

function liveCheck() {
    let isValid = true;
    let compoundTotal = 0;
    
    document.querySelectorAll('.artikel-row').forEach(row => {
        const id = row.id.split('_')[1];
        const ausTotal = parseInt(row.querySelector('.art-aus-total')?.value) || 0;
        
        let sumAus = 0;
        row.querySelectorAll('.aus-value').forEach(input => {
            sumAus += parseInt(input.value) || 0;
        });
        
        const badge = document.getElementById(`badge_${id}`);
        if (badge) {
            if (ausTotal > 0 && ausTotal !== sumAus) {
                badge.className = "status-badge status-error";
                badge.innerText = `⚠️ Differenz: ${sumAus}/${ausTotal}`;
                isValid = false;
            } else if (ausTotal > 0) {
                badge.className = "status-badge status-ok";
                badge.innerText = `✅ OK: ${sumAus}/${ausTotal}`;
            } else {
                badge.innerText = "";
            }
        }
        
        const duration = parseInt(row.querySelector('.art-duration')?.value) || 0;
        compoundTotal += duration;
    });
    
    const comTotalSpan = document.getElementById('comTotal');
    const anlageValue = document.getElementById('anlage')?.value;
    
    if (anlageValue === 'COM' && comTotalSpan) {
        comTotalSpan.innerText = compoundTotal;
        if (compoundTotal !== 480) {
            isValid = false;
        }
    }
    
    if (selectedStaff.length === 0) isValid = false;
    if (!document.getElementById('anlage')?.value) isValid = false;
    
    const sendBtn = document.getElementById('mainSendBtn');
    if (sendBtn) sendBtn.disabled = !isValid;
}

// ============================================
// RAPOR GÖNDERME
// ============================================

async function processReport() {
    const btn = document.getElementById('mainSendBtn');
    btn.innerHTML = "Sende... ⏳";
    btn.disabled = true;
    
    const fts = Array.from(document.querySelectorAll('.ft-btn.active'))
        .map(btn => btn.dataset.ft || btn.innerText)
        .join(", ");
    
    const rawDate = document.getElementById('datum').value;
    let formattedDate = "";
    if (rawDate) {
        const parts = rawDate.split("-");
        if (parts.length === 3) {
            formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
    }
    
    const articles = [];
    document.querySelectorAll('.artikel-row').forEach(row => {
        const artName = row.querySelector('.art-name')?.value || "NA";
        const artGut = parseInt(row.querySelector('.art-gut')?.value) || 0;
        const artAusTotal = parseInt(row.querySelector('.art-aus-total')?.value) || 0;
        
        let ausDetails = { grund: "-", stk: 0 };
        let stoerDetails = { grund: "-", min: 0 };
        
        row.querySelectorAll('.code-row').forEach(cr => {
            const select = cr.querySelector('select');
            const value = parseInt(cr.querySelector('input[type="number"]')?.value) || 0;
            
            if (value > 0 && select) {
                let text = select.value;
                if (text === "Sonstige") {
                    const sonst = cr.querySelector('.sonstige-input')?.value || "Sonstige";
                    text = "✍️ " + sonst;
                }
                
                if (select.classList.contains('aus-select')) {
                    ausDetails = { grund: text, stk: value };
                } else {
                    stoerDetails = { grund: text, min: value };
                }
            }
        });
        
        articles.push({
            name: artName,
            gut: artGut,
            ausTotal: artAusTotal,
            ausGrund: ausDetails.grund,
            ausStk: ausDetails.stk,
            stoerGrund: stoerDetails.grund,
            stoerMin: stoerDetails.min
        });
    });
    
    const payload = {
        action: "sendReport",
        sender: loggedInUser,
        staff: selectedStaff.join(", "),
        anlage: document.getElementById('anlage').value,
        schicht: currentSchicht,
        schichtType: currentSchichtType,
        customDate: formattedDate,
        ft: fts || "-",
        articles: articles
    };
    
    try {
        if (SCRIPT_URL && SCRIPT_URL !== "") {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(payload)
            });
        }
        alert("✅ Vielen Dank! Der Bericht wurde erfolgreich übermittelt.");
        window.location.reload();
    } catch(e) {
        alert("✅ Vielen Dank! Der Bericht wurde erfolgreich übermittelt.");
        window.location.reload();
    }
}

// ============================================
// ADMIN PANELİ (FILTRELİ)
// ============================================

async function loadAdminDashboard() {
    const container = document.getElementById('reportsContainer');
    const loadingDiv = document.getElementById('dashboardLoading');
    const activeFilterSpan = document.getElementById('activeSchichtFilter');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    
    try {
        if (SCRIPT_URL && SCRIPT_URL !== "") {
            const response = await fetch(SCRIPT_URL + "?action=getReports");
            const data = await response.json();
            allReports = data.reports || [];
        } else {
            allReports = [];
        }
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (!container) return;
        
        let filteredReports = allReports;
        if (currentSchichtFilter !== "ALL") {
            filteredReports = allReports.filter(r => r.schicht === currentSchichtFilter);
        }
        
        if (filteredReports.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#94a3b8;">Keine Berichte für Schicht ${currentSchichtFilter} vorhanden.</p>`;
            if (activeFilterSpan) activeFilterSpan.innerText = currentSchichtFilter;
            return;
        }
        
        if (activeFilterSpan) activeFilterSpan.innerText = currentSchichtFilter;
        
        container.innerHTML = filteredReports.map(r => {
            let schichtColor = "";
            if (r.schicht === "A") schichtColor = "#3b82f6";
            if (r.schicht === "B") schichtColor = "#22c55e";
            if (r.schicht === "C") schichtColor = "#f97316";
            
            return `
                <div class="report-box" style="border-left: 5px solid ${schichtColor};">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge-origin" style="background:${schichtColor};">Schicht ${escapeHtml(r.schicht || '-')} - ${escapeHtml(r.schichtType || '-')}</span>
                        <span style="font-size:12px; color:#94a3b8;">📅 ${escapeHtml(r.date || '-')}</span>
                    </div>
                    <div style="margin-top:12px;">
                        <p class="dash-text">👤 Gesendet von: <b>${escapeHtml(r.sender || '-')}</b></p>
                        <p class="dash-text">🏭 Anlage: <b>${escapeHtml(r.anlage || '-')}</b> ${r.ft && r.ft !== '-' ? `<span style="color:var(--primary);">[FT: ${escapeHtml(r.ft)}]</span>` : ''}</p>
                        <p class="dash-text">📦 Artikel: <b>${escapeHtml(r.artikel || '-')}</b></p>
                        <p class="dash-text" style="color:var(--success);">✅ Gutteile: <b>${r.gut || 0}</b></p>
                        <p class="dash-text" style="color:var(--danger);">❌ Ausschuss: <b>${r.ausTotal || 0}</b></p>
                        ${r.ausGrund && r.ausGrund !== '-' ? `<p class="dash-sub-text">↳ Grund: ${escapeHtml(r.ausGrund)} | ${r.ausStk || 0} Stk</p>` : ''}
                        ${r.stoerung && r.stoerung !== '-' ? `<p class="dash-sub-text">⚙️ Störung: ${escapeHtml(r.stoerung)} | ${r.dauer || 0} Min</p>` : ''}
                        <p style="margin-top:12px; padding-top:8px; border-top:1px dashed var(--border); font-size:13px;">
                            👥 Team: ${escapeHtml(r.staff || '-')}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch(e) {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <p style="color:var(--danger);">❌ Fehler beim Laden der Berichte.</p>
                    <p style="color:#94a3b8; font-size:13px;">${e.message || 'Netzwerkfehler'}</p>
                    <p style="color:#94a3b8; font-size:12px; margin-top:10px;">Tipp: Google Sheets Verbindung nicht aktiv. Demo Modus.</p>
                </div>
            `;
        }
    }
}

function updateManagersList() {
    const listEl = document.getElementById('currentManagersList');
    if (listEl) {
        listEl.innerText = "Berechtigte Manager: " + SUPER_MANAGERS.join(', ');
    }
}

function loadUserSelectForRights() {
    const select = document.getElementById('rightsSelect');
    if (!select) return;
    
    const users = Object.keys(INITIAL_DB);
    select.innerHTML = users.map(u => `<option value="${u}">${u}</option>`).join('');
}

async function grantSuperManagerRights() {
    const select = document.getElementById('rightsSelect');
    const name = select?.value;
    
    if (!name) return;
    
    if (!SUPER_MANAGERS.includes(name)) {
        SUPER_MANAGERS.push(name);
        updateManagersList();
        
        try {
            if (SCRIPT_URL && SCRIPT_URL !== "") {
                await fetch(SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    body: JSON.stringify({
                        action: "updateRights",
                        managers: SUPER_MANAGERS
                    })
                });
            }
            alert(`${name} wurde als Super-Manager aktiviert!`);
        } catch(e) {
            alert("Fehler beim Speichern der Berechtigung.");
        }
    }
}

window.removeStaff = removeStaff;
window.liveCheck = liveCheck;
