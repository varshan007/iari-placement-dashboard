import companiesDataRaw from './data.js';

// ---- STATE MANAGEMENT (LOCAL STORAGE) ----
const STORAGE_KEY = 'icariari_outreach_state';

const stateManager = {
    state: {
        addedCompanies: [],
        deletedCompanies: {}
    },
    loadState: function() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // merge to ensure arrays exist
                this.state = { addedCompanies: [], deletedCompanies: {}, ...parsed };
            } catch (e) {
                console.error('Error parsing local storage state', e);
            }
        }
    },
    saveState: function() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    },
    exportState: function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "outreach_state_backup.json");
        dlAnchorElem.click();
    },
    importState: function(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.state = imported;
            this.saveState();
            hydrateData();
            initTabs();
            alert("State imported successfully. Dashboard updated.");
        } catch (e) {
            alert("Invalid state file.");
        }
    },
    updateCompany: function(id, updates) {
        if (!this.state[id]) this.state[id] = {};
        Object.assign(this.state[id], updates);
        this.saveState();
    },
    logHistory: function(id, action, author) {
        if (!this.state[id]) this.state[id] = {};
        if (!this.state[id].outreachHistory) this.state[id].outreachHistory = [];
        this.state[id].outreachHistory.unshift({
            date: new Date().toISOString().split('T')[0],
            action: action,
            by: author
        });
        this.saveState();
    },
    addCompany: function(companyObj) {
        if(!this.state.addedCompanies) this.state.addedCompanies = [];
        this.state.addedCompanies.push(companyObj);
        this.saveState();
    },
    deleteCompany: function(id) {
        if(!this.state.deletedCompanies) this.state.deletedCompanies = {};
        this.state.deletedCompanies[id] = true;
        this.saveState();
    }
};

let companiesData = [];

function hydrateData() {
    stateManager.loadState();
    
    // Merge base data with completely new user-added companies
    const added = stateManager.state.addedCompanies || [];
    const allCompanies = [...companiesDataRaw, ...added];
    
    const deleted = stateManager.state.deletedCompanies || {};
    
    companiesData = allCompanies
        .filter(c => !deleted[c.id]) // Filter out soft-deleted
        .map(company => {
            const defaultOp = {
                outreachStatus: "Not Contacted",
                lastContacted: null,
                nextFollowup: null,
                coordinator: "Unassigned",
                outreachHistory: [],
                tags: []
            };
            const base = { ...defaultOp, ...company };
            if (stateManager.state[base.id]) {
                return { ...base, ...stateManager.state[base.id] };
            }
            return base;
        });
}

// ---- DOM ELEMENTS ----
// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Overview Elements
const gridContainer = document.getElementById('company-grid-container');
const outreachContainer = document.getElementById('top-outreach-container');
const emergingContainer = document.getElementById('emerging-startups-container');
const resultsCount = document.getElementById('results-count');
const kpiTotal = document.getElementById('kpi-total-companies');
const kpiDeeptech = document.getElementById('kpi-deeptech');
const kpiAi = document.getElementById('kpi-ai-robotics');
const kpiStartupMnc = document.getElementById('kpi-startup-mnc');
const searchInput = document.getElementById('search-input');
const filterSector = document.getElementById('filter-sector');
const filterFeasibility = document.getElementById('filter-feasibility');
const filterType = document.getElementById('filter-type');
let sectorChartInstance = null;
let deptChartInstance = null;

// Operations Elements
const opContacted = document.getElementById('op-contacted');
const opInterested = document.getElementById('op-interested');
const opPpt = document.getElementById('op-ppt');
const opConfirmed = document.getElementById('op-confirmed');
const opSearchInput = document.getElementById('op-search-input');
const opFilterStatus = document.getElementById('op-filter-status');
const opFilterCoord = document.getElementById('op-filter-coordinator');
const btnViewKanban = document.getElementById('view-kanban');
const btnViewList = document.getElementById('view-list');
const kanbanView = document.getElementById('ops-kanban-view');
const listView = document.getElementById('ops-list-view');
let opStatusChartInstance = null;

// Modals & Panels
const modalStatus = document.getElementById('modal-status');
const modalNote = document.getElementById('modal-note');
const modalTimeline = document.getElementById('modal-timeline');
const slidePanel = document.getElementById('slide-panel-onboarding');
const slideOverlay = document.getElementById('slide-panel-overlay');
const modalDelete = document.getElementById('modal-delete');

// ---- INITIALIZATION ----
function init() {
    hydrateData();
    setupTabs();
    setupModals();
    setupStateImportExport();
    setupOnboardingForm();
    
    // Overview Listeners
    searchInput.addEventListener('input', updateOverview);
    filterSector.addEventListener('change', updateOverview);
    filterFeasibility.addEventListener('change', updateOverview);
    filterType.addEventListener('change', updateOverview);

    // Operations Listeners
    opSearchInput.addEventListener('input', updateOperations);
    opFilterStatus.addEventListener('change', updateOperations);
    opFilterCoord.addEventListener('change', updateOperations);
    
    btnViewKanban.addEventListener('click', () => {
        btnViewKanban.classList.add('active');
        btnViewList.classList.remove('active');
        kanbanView.style.display = 'flex';
        listView.style.display = 'none';
    });
    
    btnViewList.addEventListener('click', () => {
        btnViewList.classList.add('active');
        btnViewKanban.classList.remove('active');
        listView.style.display = 'flex';
        kanbanView.style.display = 'none';
    });

    document.getElementById('export-csv').addEventListener('click', exportToCSV);

    updateOverview();
    updateOperations();
}

// ---- TAB LOGIC ----
function setupTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            
            const targetId = `tab-${btn.dataset.tab}`;
            document.getElementById(targetId).classList.add('active');
            
            const dirBlock = document.getElementById('tab-overview-directory');
            if(btn.dataset.tab === 'overview') {
                dirBlock.style.display = 'grid';
                updateOverview();
            } else {
                dirBlock.style.display = 'none';
                updateOperations();
            }
        });
    });
}

function setupStateImportExport() {
    document.getElementById('btn-export-state').addEventListener('click', () => stateManager.exportState());
    document.getElementById('btn-import-state').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => stateManager.importState(ev.target.result);
        reader.readAsText(file);
    });
}

// ---- OVERVIEW (INTELLIGENCE) ----
function updateOverview() {
    renderTopOutreach();
    
    const searchTerm = searchInput.value.toLowerCase();
    const sectorVal = filterSector.value;
    const feasVal = filterFeasibility.value;
    const typeVal = filterType.value;

    const filtered = companiesData.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchTerm) || c.sector.toLowerCase().includes(searchTerm) || (c.tags && c.tags.some(t => t.toLowerCase().includes(searchTerm)));
        const matchSector = sectorVal === 'All' || c.sector === sectorVal;
        const matchFeas = feasVal === 'All' || c.placementFeasibility === feasVal;
        const matchType = typeVal === 'All' || c.type === typeVal;
        return matchSearch && matchSector && matchFeas && matchType;
    });

    renderGrid(filtered);
    updateOverviewKPIs(filtered);
    updateOverviewCharts(filtered);
}

function renderTopOutreach() {
    const topCompanies = companiesData.filter(c => c.topRecommended && !c.emergingHighlight);
    outreachContainer.innerHTML = topCompanies.map(c => `
        <div class="outreach-card">
            <h3>${c.name}</h3>
            <div class="reason">Strategic Value: ${c.strategicReason}</div>
            <div class="outreach-tags">
                ${c.tags ? c.tags.map(tag => `<span class="meta-pill">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `).join('');
    
    if (emergingContainer) {
        const emerging = companiesData.filter(c => c.emergingHighlight);
        emergingContainer.innerHTML = emerging.map(c => `
            <div class="outreach-card" style="border-left-color: var(--color-accent);">
                <h3 style="color: var(--color-accent);">${c.name} <span style="font-size: 0.75rem; background: var(--color-accent); color: white; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">DeepTech</span></h3>
                <div class="reason" style="margin-bottom: 4px;">Sector: ${c.sector}</div>
                <div class="outreach-tags" style="margin-top: 8px;">
                    ${c.tags ? c.tags.map(tag => `<span class="meta-pill">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `).join('');
    }
}

function renderGrid(data) {
    resultsCount.textContent = `Showing ${data.length} companies`;
    if (data.length === 0) {
        gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-muted);">No companies found matching the selected filters.</div>`;
        return;
    }

    gridContainer.innerHTML = data.map(company => `
        <div class="company-card">
            <div class="card-header">
                <div class="card-title">
                    <h3>${company.name}</h3>
                    <div class="hq"><i class="ph ph-map-pin"></i> ${company.hq || 'N/A'}</div>
                </div>
                <div class="tier-badge">${company.tier || company.strategicPriority || 'N/A'}</div>
            </div>
            
            <div class="card-meta">
                <span class="meta-pill pill-feasibility" data-level="${company.placementFeasibility}">
                    Feasibility: ${company.placementFeasibility}
                </span>
                <span class="meta-pill">${company.type}</span>
                ${company.salaryBand ? `<span class="meta-pill">${company.salaryBand}</span>` : ''}
            </div>

            <p class="card-description">${company.description}</p>
            
            <div class="quick-stats">
                <div class="quick-stats-grid">
                    <div><span style="color: var(--color-text-muted);"><i class="ph ph-map-pin"></i> India:</span> <b style="color: var(--color-primary);">${(company.indiaOffices || []).join(', ') || 'N/A'}</b></div>
                    <div><span style="color: var(--color-text-muted);"><i class="ph ph-trend-up"></i> Score:</span> <b style="color: var(--color-primary);">${company.outreachScore || 'N/A'}/10</b></div>
                    <div><span style="color: var(--color-text-muted);"><i class="ph ph-users"></i> Freshers:</span> <b style="color: var(--color-primary);">${company.freshersHiring || 'N/A'}</b></div>
                    <div><span style="color: var(--color-text-muted);"><i class="ph ph-chart-line-up"></i> Growth:</span> <b style="color: var(--color-primary);">${company.sectorGrowth || 'N/A'}</b></div>
                </div>
            </div>
            
            <div class="card-departments">
                <h4>Department Relevance Score</h4>
                <div class="dept-bars">
                    ${company.departmentFit ? Object.entries(company.departmentFit).map(([dept, score]) => `
                        <div class="dept-bar">
                            <span class="dept-label">${dept}</span>
                            <div class="dept-track"><div class="dept-fill" style="width: ${score}%"></div></div>
                            <span class="dept-value">${score}</span>
                        </div>
                    `).join('') : '<div style="color:var(--color-text-muted); font-size: 0.8rem;">No relevance data available.</div>'}
                </div>
            </div>

            <div class="card-footer" style="margin-top: 1rem;">
                <a href="${company.careersLink || '#'}" target="_blank" class="careers-link" style="color: var(--color-primary); font-weight: 600; text-decoration: none; font-size: 0.85rem;"><i class="ph ph-link"></i> Official Careers Page</a>
            </div>
        </div>
    `).join('');
}

function updateOverviewKPIs(data) {
    kpiTotal.textContent = data.length;
    kpiDeeptech.textContent = data.filter(c => c.tags && c.tags.includes("DeepTech")).length;
    kpiAi.textContent = data.filter(c => (c.tags && (c.tags.includes("Robotics") || c.tags.includes("Agri AI"))) || c.sector === 'AI in Agriculture' || c.sector === 'Agri Robotics').length;
    
    const mnc = data.filter(c => c.type === 'MNC').length;
    const startup = data.filter(c => c.type === 'Startup').length;
    kpiStartupMnc.textContent = `${startup} : ${mnc}`;
}

function updateOverviewCharts(data) {
    const sectorCounts = {};
    data.forEach(c => sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1);
    
    // Sort sectors by count descending
    const sortedSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);
    const labels = sortedSectors.map(s => s[0]);
    const counts = sortedSectors.map(s => s[1]);
    const colors = ['#1F4E3D', '#2C4B63', '#C5832B', '#596D66', '#2A6650', '#8D9F98', '#E65100', '#10b981', '#3b82f6', '#f59e0b', '#6366f1'];
    
    if (sectorChartInstance) sectorChartInstance.destroy();
    sectorChartInstance = new Chart(document.getElementById('sectorChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }
    });

    // Populate custom text legend
    const legendContainer = document.getElementById('sector-legend');
    if (legendContainer) {
        legendContainer.innerHTML = sortedSectors.map((s, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.25rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colors[idx % colors.length]}; flex-shrink: 0;"></div>
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${s[0]}">${s[0]}</div>
                </div>
                <div style="font-weight: 600; color: var(--color-primary);">${s[1]}</div>
            </div>
        `).join('');
    }
}

// ---- OPERATIONS ----
function updateOperations() {
    const searchTerm = opSearchInput.value.toLowerCase();
    const statusVal = opFilterStatus.value;
    const coordVal = opFilterCoord.value;

    const filtered = companiesData.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchTerm) || c.sector.toLowerCase().includes(searchTerm);
        const matchStatus = statusVal === 'All' || c.outreachStatus === statusVal;
        const matchCoord = coordVal === 'All' || c.coordinator === coordVal;
        return matchSearch && matchStatus && matchCoord;
    });

    renderOpKPIs(filtered);
    renderKanban(filtered);
    renderOpsList(filtered);
    updateOpsChart(filtered);
}

function renderOpKPIs(data) {
    opContacted.textContent = data.filter(c => c.outreachStatus !== 'Not Contacted' && c.outreachStatus !== 'Outreach Pending').length;
    opInterested.textContent = data.filter(c => c.outreachStatus === 'Interested').length;
    opPpt.textContent = data.filter(c => c.outreachStatus === 'PPT Scheduled').length;
    opConfirmed.textContent = data.filter(c => c.outreachStatus === 'Drive Confirmed').length;
}

function renderKanban(data) {
    const columns = document.querySelectorAll('.kanban-col');
    columns.forEach(col => {
        const status = col.dataset.status;
        const body = col.querySelector('.k-col-body');
        const countSpan = col.querySelector('.k-count');
        
        const matching = data.filter(c => c.outreachStatus === status);
        countSpan.textContent = matching.length;
        
        body.innerHTML = matching.map(c => `
            <div class="k-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 style="margin:0;">${c.name}</h4>
                    <div>
                        <button class="btn-icon edit op-btn-edit" data-id="${c.id}" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-icon delete op-btn-delete" data-id="${c.id}" title="Archive"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
                <div class="k-sector" style="margin-top: 0.25rem;">${c.sector}</div>
                <span class="status-badge" data-status="${c.outreachStatus}">${c.outreachStatus}</span>
                <div class="op-meta" style="margin-top: 0.5rem; font-size: 0.75rem;">
                    <div>Coord: <b>${c.coordinator}</b></div>
                    <div>Last: <b>${c.lastContacted || 'N/A'}</b></div>
                </div>
                <div class="op-actions">
                    <button class="btn btn-secondary btn-small op-btn-status" data-id="${c.id}">Status</button>
                    <button class="btn btn-secondary btn-small op-btn-note" data-id="${c.id}">Note</button>
                    <button class="btn btn-secondary btn-small op-btn-timeline" data-id="${c.id}"><i class="ph ph-clock"></i></button>
                </div>
            </div>
        `).join('');
    });
    attachOpEventListeners();
}

function renderOpsList(data) {
    listView.innerHTML = data.map(c => `
        <div class="op-list-item">
            <div class="op-list-info">
                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <h3 style="font-size: 1.1rem; color: var(--color-primary); margin:0;">${c.name}</h3>
                    <button class="btn-icon edit op-btn-edit" data-id="${c.id}" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon delete op-btn-delete" data-id="${c.id}" title="Archive"><i class="ph ph-trash"></i></button>
                </div>
                <div style="font-size: 0.85rem; color: var(--color-text-muted);">${c.sector} | Coord: <b>${c.coordinator}</b> | Next Follow-up: <b>${c.nextFollowup || 'None'}</b></div>
            </div>
            <div style="display:flex; align-items:center; gap: 1.5rem;">
                <span class="status-badge" data-status="${c.outreachStatus}">${c.outreachStatus}</span>
                <div class="op-list-actions">
                    <button class="btn btn-secondary btn-small op-btn-status" data-id="${c.id}">Update Status</button>
                    <button class="btn btn-secondary btn-small op-btn-note" data-id="${c.id}">Log Note</button>
                    <button class="btn btn-secondary btn-small op-btn-timeline" data-id="${c.id}">Timeline</button>
                </div>
            </div>
        </div>
    `).join('');
    attachOpEventListeners();
}

function updateOpsChart(data) {
    const statusCounts = {};
    data.forEach(c => statusCounts[c.outreachStatus] = (statusCounts[c.outreachStatus] || 0) + 1);
    
    if (opStatusChartInstance) opStatusChartInstance.destroy();
    opStatusChartInstance = new Chart(document.getElementById('opStatusChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Companies',
                data: Object.values(statusCounts),
                backgroundColor: '#2C4B63',
                borderRadius: 4
            }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// ---- ADD / EDIT COMPANY ONBOARDING LOGIC ----
function setupOnboardingForm() {
    document.getElementById('btn-add-company').addEventListener('click', () => {
        document.getElementById('onboarding-form').reset();
        document.getElementById('form-edit-id').value = '';
        document.getElementById('slide-title').textContent = 'Add New Company / Startup';
        document.getElementById('score-val').textContent = '8.0';
        slideOverlay.classList.add('active');
        slidePanel.classList.add('open');
    });

    document.querySelectorAll('.close-slide').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            slidePanel.classList.remove('open');
            setTimeout(() => slideOverlay.classList.remove('active'), 300);
        });
    });

    document.getElementById('form-score').addEventListener('input', (e) => {
        document.getElementById('score-val').textContent = parseFloat(e.target.value).toFixed(1);
    });

    document.getElementById('btn-save-company').addEventListener('click', (e) => {
        e.preventDefault();
        
        // Basic Validation
        const name = document.getElementById('form-name').value.trim();
        const type = document.getElementById('form-type').value;
        const sector = document.getElementById('form-sector').value;
        if (!name || !type || !sector) {
            alert('Please fill out all required fields (Name, Type, Sector).');
            return;
        }

        const editId = document.getElementById('form-edit-id').value;
        let id = editId;

        // Duplicate Check for NEW companies
        if (!editId) {
            id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (companiesData.some(c => c.id === id)) {
                alert('A company with this name already exists in the intelligence database.');
                return;
            }
        }

        // Build object
        const newCompany = {
            id: id,
            name: name,
            type: type,
            sector: sector,
            hq: document.getElementById('form-hq').value || '',
            indiaOffices: document.getElementById('form-india-offices').value.split(',').map(s=>s.trim()).filter(Boolean),
            careersLink: document.getElementById('form-careers-link').value || '',
            placementFeasibility: document.getElementById('form-feasibility').value,
            strategicPriority: document.getElementById('form-priority').value,
            outreachScore: parseFloat(document.getElementById('form-score').value),
            coordinator: document.getElementById('form-coordinator').value,
            outreachStatus: document.getElementById('form-status').value,
            description: document.getElementById('form-description').value,
            sectorGrowth: document.getElementById('form-growth').value,
            freshersHiring: document.getElementById('form-hiring').value,
            tags: document.getElementById('form-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
        };

        if (editId) {
            // Update existing
            stateManager.updateCompany(id, newCompany);
            stateManager.logHistory(id, `Company profile manually updated.`, newCompany.coordinator);
        } else {
            // Add new
            stateManager.addCompany(newCompany);
            stateManager.logHistory(id, `Company onboarded to platform. Initial Status: ${newCompany.outreachStatus}`, newCompany.coordinator);
        }

        slidePanel.classList.remove('open');
        setTimeout(() => slideOverlay.classList.remove('active'), 300);
        refreshDataAndUI();
    });

    // Delete Confirmation Logic
    document.getElementById('btn-confirm-delete').addEventListener('click', () => {
        const id = document.getElementById('delete-company-id').value;
        stateManager.deleteCompany(id);
        modalDelete.classList.remove('active');
        refreshDataAndUI();
    });
}

function attachOpEventListeners() {
    // Existing Modals
    document.querySelectorAll('.op-btn-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const company = companiesData.find(c => c.id === id);
            document.getElementById('modal-company-id').value = id;
            document.getElementById('modal-status-select').value = company.outreachStatus;
            document.getElementById('modal-coord-select').value = company.coordinator;
            document.getElementById('modal-status-note').value = '';
            document.getElementById('modal-status').classList.add('active');
        });
    });
    
    document.querySelectorAll('.op-btn-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const company = companiesData.find(c => c.id === id);
            document.getElementById('modal-note-company-id').value = id;
            document.getElementById('modal-note-text').value = '';
            document.getElementById('modal-note-date').value = company.nextFollowup || '';
            document.getElementById('modal-note').classList.add('active');
        });
    });

    document.querySelectorAll('.op-btn-timeline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const company = companiesData.find(c => c.id === id);
            document.getElementById('timeline-company-name').textContent = `${company.name} - Outreach Timeline`;
            
            const timelineList = document.getElementById('timeline-list');
            if (!company.outreachHistory || company.outreachHistory.length === 0) {
                timelineList.innerHTML = `<div style="color: var(--color-text-muted);">No outreach history logged yet.</div>`;
            } else {
                timelineList.innerHTML = company.outreachHistory.map(evt => `
                    <div class="timeline-event">
                        <div class="timeline-dot"><i class="ph ph-check"></i></div>
                        <div class="timeline-content">
                            <div class="timeline-date">${evt.date}</div>
                            <div class="timeline-action">${evt.action}</div>
                            <div class="timeline-author">Logged by: <b>${evt.by}</b></div>
                        </div>
                    </div>
                `).join('');
            }
            
            document.getElementById('modal-timeline').classList.add('active');
        });
    });

    // Edit Button
    document.querySelectorAll('.op-btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const company = companiesData.find(c => c.id === id);
            
            document.getElementById('form-edit-id').value = id;
            document.getElementById('slide-title').textContent = 'Edit Company Details';
            
            document.getElementById('form-name').value = company.name || '';
            document.getElementById('form-type').value = company.type || 'Startup';
            document.getElementById('form-sector').value = company.sector || 'Farm Power & Machinery';
            document.getElementById('form-hq').value = company.hq || '';
            document.getElementById('form-india-offices').value = (company.indiaOffices || []).join(', ');
            document.getElementById('form-careers-link').value = company.careersLink || '';
            
            document.getElementById('form-feasibility').value = company.placementFeasibility || 'High';
            document.getElementById('form-priority').value = company.strategicPriority || 'Tier 2';
            
            const score = company.outreachScore || 8.0;
            document.getElementById('form-score').value = score;
            document.getElementById('score-val').textContent = parseFloat(score).toFixed(1);
            
            document.getElementById('form-coordinator').value = company.coordinator || 'Unassigned';
            document.getElementById('form-status').value = company.outreachStatus || 'Not Contacted';
            
            document.getElementById('form-description').value = company.description || '';
            document.getElementById('form-growth').value = company.sectorGrowth || 'Strong';
            document.getElementById('form-hiring').value = company.freshersHiring || 'Medium';
            document.getElementById('form-tags').value = (company.tags || []).join(', ');

            slideOverlay.classList.add('active');
            slidePanel.classList.add('open');
        });
    });

    // Delete Button
    document.querySelectorAll('.op-btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const company = companiesData.find(c => c.id === id);
            document.getElementById('delete-company-id').value = id;
            document.getElementById('delete-company-name').textContent = company.name;
            modalDelete.classList.add('active');
        });
    });
}

function setupModals() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });

    document.getElementById('btn-save-status').addEventListener('click', () => {
        const id = document.getElementById('modal-company-id').value;
        const newStatus = document.getElementById('modal-status-select').value;
        const newCoord = document.getElementById('modal-coord-select').value;
        const note = document.getElementById('modal-status-note').value;
        
        const updates = { outreachStatus: newStatus, coordinator: newCoord };
        if (newStatus !== 'Not Contacted' && newStatus !== 'Outreach Pending') {
            updates.lastContacted = new Date().toISOString().split('T')[0];
        }
        
        stateManager.updateCompany(id, updates);
        const actionStr = `Status changed to [${newStatus}], Assigned to [${newCoord}]` + (note ? ` - Note: ${note}` : '');
        stateManager.logHistory(id, actionStr, newCoord);
        
        document.getElementById('modal-status').classList.remove('active');
        refreshDataAndUI();
    });

    document.getElementById('btn-save-note').addEventListener('click', () => {
        const id = document.getElementById('modal-note-company-id').value;
        const text = document.getElementById('modal-note-text').value;
        const date = document.getElementById('modal-note-date').value;
        
        if (date) stateManager.updateCompany(id, { nextFollowup: date });
        
        const actionStr = text + (date ? ` (Next follow-up: ${date})` : '');
        const company = companiesData.find(c=>c.id===id);
        const coord = company ? company.coordinator : 'User';
        
        stateManager.logHistory(id, actionStr, coord);
        document.getElementById('modal-note').classList.remove('active');
        refreshDataAndUI();
    });
}

function refreshDataAndUI() {
    hydrateData();
    updateOverview();
    updateOperations();
}

function exportToCSV() {
    if (companiesData.length === 0) return;
    const grouped = {};
    companiesData.forEach(c => {
        if (!grouped[c.sector]) grouped[c.sector] = [];
        grouped[c.sector].push(c);
    });
    
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ['Company Name', 'HQ', 'Type', 'Salary Band', 'Feasibility', 'Data Confidence', 'Outreach Status', 'Coordinator', 'Careers Link'];
    
    Object.keys(grouped).forEach(sector => {
        csvContent += `\n"DOMAIN: ${sector}"\n`;
        csvContent += headers.join(",") + "\n";
        grouped[sector].forEach(c => {
            const row = [
                `"${c.name}"`,
                `"${c.hq}"`,
                `"${c.type}"`,
                `"${c.salaryBand || ''}"`,
                `"${c.placementFeasibility}"`,
                `"${c.dataConfidence || 'Internal'}"`,
                `"${c.outreachStatus}"`,
                `"${c.coordinator}"`,
                `"${c.careersLink || ''}"`
            ];
            csvContent += row.join(",") + "\n";
        });
    });
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ICAR_IARI_Placement_Intelligence_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', init);
