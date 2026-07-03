// ============================================
// Visual Seven — Admin Dashboard Logic (Upgraded)
// ============================================

let dashboardProjects = [];
let dashboardInquiries = [];
let editingProjectId = null;
let uploadedFiles = [];
let existingImageUrls = [];
let currentInquiryId = null;
let currentTab = 'projects';

// ---- Initialization ----

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthed = await guardAdminRoute();
    if (!isAuthed) return;

    const session = await getSession();
    const userEmail = document.getElementById('user-email');
    if (userEmail && session) {
        userEmail.textContent = session.user.email;
    }

    await Promise.all([loadDashboardProjects(), loadDashboardInquiries()]);
    setupDragDrop();
    setupForm();
});

// ---- Tab Switcher ----

function switchTab(tab) {
    currentTab = tab;
    const projectsView = document.getElementById('projects-view');
    const inquiriesView = document.getElementById('inquiries-view');
    const tabProjects = document.getElementById('tab-projects');
    const tabInquiries = document.getElementById('tab-inquiries');

    if (tab === 'projects') {
        projectsView.classList.remove('hidden');
        inquiriesView.classList.add('hidden');
        tabProjects.className = 'pb-4 font-semibold text-lg border-b-2 border-[#00d9ff] text-[#00d9ff] transition-all';
        tabInquiries.className = 'pb-4 font-semibold text-lg border-b-2 border-transparent text-white/50 hover:text-white transition-all flex items-center gap-2';
    } else {
        projectsView.classList.add('hidden');
        inquiriesView.classList.remove('hidden');
        tabProjects.className = 'pb-4 font-semibold text-lg border-b-2 border-transparent text-white/50 hover:text-white transition-all';
        tabInquiries.className = 'pb-4 font-semibold text-lg border-b-2 border-[#00d9ff] text-[#00d9ff] transition-all flex items-center gap-2';
    }
}

// ---- Analytics KPI Update ----

function updateKPIs() {
    const newLeads = dashboardInquiries.filter(i => i.status === 'New').length;
    const configuratorLeads = dashboardInquiries.filter(i => i.config_data !== null).length;

    const kpiProjects = document.getElementById('kpi-projects');
    const kpiLeads = document.getElementById('kpi-leads');
    const kpiUnread = document.getElementById('kpi-unread');
    const kpiConfigurator = document.getElementById('kpi-configurator');
    const kpiPing = document.getElementById('kpi-unread-ping');
    const unreadBadge = document.getElementById('unread-badge');
    const tabProjectsCount = document.getElementById('tab-projects-count');
    const tabInquiriesCount = document.getElementById('tab-inquiries-count');

    if (kpiProjects) kpiProjects.textContent = dashboardProjects.length;
    if (kpiLeads) kpiLeads.textContent = dashboardInquiries.length;
    if (kpiUnread) kpiUnread.textContent = newLeads;
    if (kpiConfigurator) kpiConfigurator.textContent = configuratorLeads;
    if (tabProjectsCount) tabProjectsCount.textContent = dashboardProjects.length;
    if (tabInquiriesCount) tabInquiriesCount.textContent = dashboardInquiries.length;

    if (newLeads > 0) {
        if (kpiPing) kpiPing.classList.remove('hidden');
        if (unreadBadge) {
            unreadBadge.textContent = `${newLeads} New`;
            unreadBadge.classList.remove('hidden');
        }
    } else {
        if (kpiPing) kpiPing.classList.add('hidden');
        if (unreadBadge) unreadBadge.classList.add('hidden');
    }
}

// ---- Load Projects ----

async function loadDashboardProjects() {
    const tbody = document.getElementById('projects-tbody');
    const emptyState = document.getElementById('empty-state');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="px-6 py-12 text-center">
                <div class="inline-block w-6 h-6 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                <p class="text-white/40 mt-2">Loading projects...</p>
            </td>
        </tr>
    `;

    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        dashboardProjects = data || [];
        updateKPIs();

        if (dashboardProjects.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            tbody.innerHTML = dashboardProjects.map(renderProjectRow).join('');
        }
    } catch (err) {
        console.error('Error loading projects:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-red-400">
                    Failed to load projects: ${err.message}
                </td>
            </tr>
        `;
    }
}

// ---- Load Inquiries ----

async function loadDashboardInquiries() {
    const tbody = document.getElementById('inquiries-tbody');
    const emptyState = document.getElementById('inquiries-empty-state');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="px-6 py-12 text-center">
                <div class="inline-block w-6 h-6 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                <p class="text-white/40 mt-2">Loading inquiries...</p>
            </td>
        </tr>
    `;

    try {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        dashboardInquiries = data || [];
        updateKPIs();

        if (dashboardInquiries.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            tbody.innerHTML = dashboardInquiries.map(renderInquiryRow).join('');
        }
    } catch (err) {
        console.error('Error loading inquiries:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-red-400">
                    Failed to load inquiries: ${err.message}
                </td>
            </tr>
        `;
    }
}

// ---- Render Inquiry Row ----

function renderInquiryRow(inquiry) {
    const isNew = inquiry.status === 'New';
    const hasConfig = inquiry.config_data !== null;

    const statusColors = {
        'New': 'bg-red-500/20 text-red-300 border border-red-500/30',
        'Read': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        'Contacted': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        'Completed': 'bg-green-500/20 text-green-300 border border-green-500/30'
    };
    const badgeClass = statusColors[inquiry.status] || statusColors['New'];

    return `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors ${isNew ? 'bg-[#00d9ff]/3' : ''}">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d9ff]/20 to-[#b000ff]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#00d9ff]">
                        ${inquiry.name ? inquiry.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                        <p class="font-medium text-white flex items-center gap-2">
                            ${inquiry.name}
                            ${isNew ? '<span class="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>' : ''}
                        </p>
                        <p class="text-xs text-white/40">${inquiry.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-white/80 text-sm max-w-xs truncate">${inquiry.subject}</p>
                ${hasConfig ? `<span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-[10px] font-semibold text-yellow-400"><iconify-icon icon="lucide:zap" class="text-xs"></iconify-icon> Custom Neon Design</span>` : ''}
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}">${inquiry.status}</span>
            </td>
            <td class="px-6 py-4 text-white/40 text-sm">${new Date(inquiry.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <button onclick="openInquiryModal('${inquiry.id}')" class="p-2 bg-white/5 hover:bg-[#00d9ff]/20 rounded-lg transition-colors group" title="View Details">
                    <iconify-icon icon="lucide:eye" class="text-white/50 group-hover:text-[#00d9ff]"></iconify-icon>
                </button>
            </td>
        </tr>
    `;
}

// ---- Inquiry Modal Open/Close ----

async function openInquiryModal(id) {
    const inquiry = dashboardInquiries.find(i => i.id === id);
    if (!inquiry) return;

    currentInquiryId = id;

    document.getElementById('detail-name').textContent = inquiry.name;
    document.getElementById('detail-email').textContent = inquiry.email;
    document.getElementById('detail-email').href = `mailto:${inquiry.email}`;
    document.getElementById('detail-phone').textContent = inquiry.phone || 'Not provided';
    document.getElementById('detail-subject').textContent = inquiry.subject;
    document.getElementById('detail-message').textContent = inquiry.message;
    document.getElementById('detail-date').textContent = `Received: ${new Date(inquiry.created_at).toLocaleString()}`;
    document.getElementById('detail-status').value = inquiry.status;

    const configSection = document.getElementById('detail-config-section');
    const drawerGlow = document.getElementById('drawer-glow');

    if (inquiry.config_data) {
        const cfg = inquiry.config_data;
        configSection.classList.remove('hidden');

        document.getElementById('detail-config-text').textContent = `"${cfg.text}"`;
        document.getElementById('detail-config-font').textContent = cfg.font;
        document.getElementById('detail-config-color').textContent = cfg.colorName;
        document.getElementById('detail-config-backing').textContent = cfg.backing === 'none' ? 'No Backing' : (cfg.backing === 'contour' ? 'Cut-To-Shape Acrylic' : 'Rectangular Acrylic Board');
        document.getElementById('detail-config-size').textContent = cfg.size === 'small' ? 'Small (30cm)' : (cfg.size === 'medium' ? 'Medium (60cm)' : 'Large (100cm)');
        document.getElementById('detail-config-price').textContent = `₹${(cfg.price || 0).toLocaleString()}`;

        // Re-render the neon sign visual
        const previewText = document.getElementById('drawer-preview-text');
        const previewBacking = document.getElementById('drawer-preview-backing');
        const dimmerVal = (cfg.dimmer || 100) / 100;

        previewText.textContent = cfg.text;
        previewText.style.color = cfg.color;
        previewText.style.fontFamily = cfg.font === 'Montserrat' ? "'Montserrat', sans-serif" : (cfg.font === 'Playfair Display' ? "'Playfair Display', serif" : `'${cfg.font}', cursive`);
        previewText.style.textTransform = cfg.font === 'Montserrat' ? 'uppercase' : 'none';
        previewText.style.opacity = (0.2 + 0.8 * dimmerVal).toString();
        previewText.style.textShadow = `
            0 0 5px #fff,
            0 0 10px ${cfg.color},
            0 0 25px ${cfg.colorGlow || cfg.color},
            0 0 50px ${cfg.colorGlow || cfg.color}
        `;

        // Backing style for the preview container
        previewBacking.className = 'flex items-center justify-center max-w-full max-h-full';
        if (cfg.backing === 'contour') {
            previewBacking.style.border = '2px solid rgba(255,255,255,0.2)';
            previewBacking.style.background = 'rgba(255,255,255,0.03)';
            previewBacking.style.borderRadius = '20px';
            previewBacking.style.padding = '1rem 1.5rem';
        } else if (cfg.backing === 'board') {
            previewBacking.style.border = '2px solid rgba(255,255,255,0.2)';
            previewBacking.style.background = 'rgba(255,255,255,0.05)';
            previewBacking.style.borderRadius = '8px';
            previewBacking.style.padding = '1rem 1.5rem';
            previewBacking.style.width = '90%';
            previewBacking.style.height = '80%';
        } else {
            previewBacking.style = '';
        }

        // Background glow in drawer using the sign's color
        if (drawerGlow) {
            drawerGlow.style.backgroundColor = cfg.color;
        }
    } else {
        configSection.classList.add('hidden');
        if (drawerGlow) drawerGlow.style.backgroundColor = '#00d9ff';
    }

    const modal = document.getElementById('inquiry-detail-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Auto mark as Read if it was New
    if (inquiry.status === 'New') {
        try {
            await supabase.from('inquiries').update({ status: 'Read' }).eq('id', id);
            inquiry.status = 'Read';
            document.getElementById('detail-status').value = 'Read';
            await loadDashboardInquiries();
        } catch (e) {
            console.warn('Could not auto-mark as read:', e);
        }
    }
}

function closeInquiryModal() {
    const modal = document.getElementById('inquiry-detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    currentInquiryId = null;
}

async function updateInquiryStatus() {
    if (!currentInquiryId) return;
    const newStatus = document.getElementById('detail-status').value;

    try {
        const { error } = await supabase
            .from('inquiries')
            .update({ status: newStatus })
            .eq('id', currentInquiryId);

        if (error) throw error;

        const idx = dashboardInquiries.findIndex(i => i.id === currentInquiryId);
        if (idx !== -1) dashboardInquiries[idx].status = newStatus;

        updateKPIs();
        const tbody = document.getElementById('inquiries-tbody');
        if (tbody) tbody.innerHTML = dashboardInquiries.map(renderInquiryRow).join('');

        showToast('Status updated successfully!', 'success');
    } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}

function confirmDeleteInquiry() {
    const inquiry = dashboardInquiries.find(i => i.id === currentInquiryId);
    if (!inquiry) return;

    const nameEl = document.getElementById('delete-inquiry-client');
    if (nameEl) nameEl.textContent = `${inquiry.name} (${inquiry.email})`;

    const modal = document.getElementById('inquiry-delete-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeInquiryDeleteModal() {
    const modal = document.getElementById('inquiry-delete-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function deleteInquiry() {
    if (!currentInquiryId) return;

    try {
        const { error } = await supabase
            .from('inquiries')
            .delete()
            .eq('id', currentInquiryId);

        if (error) throw error;

        showToast('Inquiry deleted successfully!', 'success');
        closeInquiryDeleteModal();
        closeInquiryModal();
        await loadDashboardInquiries();
    } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}

// ---- Render Project Row ----

function renderProjectRow(project) {
    const imageThumb = project.image_urls && project.image_urls.length > 0
        ? `<img src="${project.image_urls[0]}" alt="${project.title}" class="w-12 h-12 rounded-lg object-cover">`
        : `<div class="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center"><iconify-icon icon="lucide:image" class="text-white/30"></iconify-icon></div>`;

    const imageCount = project.image_urls ? project.image_urls.length : 0;

    return `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    ${imageThumb}
                    <div>
                        <p class="font-medium text-white">${project.title}</p>
                        <p class="text-xs text-white/40">${imageCount} image${imageCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">${(project.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => `<span class="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-medium text-white/70">${c}</span>`).join('')}</div>
            </td>
            <td class="px-6 py-4 text-white/50 text-sm max-w-xs truncate">${project.description || '—'}</td>
            <td class="px-6 py-4 text-white/40 text-sm">${new Date(project.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <button onclick="editProject('${project.id}')" class="p-2 bg-white/5 hover:bg-[#00d9ff]/20 rounded-lg transition-colors group" title="Edit">
                        <iconify-icon icon="lucide:pencil" class="text-white/50 group-hover:text-[#00d9ff]"></iconify-icon>
                    </button>
                    <button onclick="confirmDelete('${project.id}', '${project.title.replace(/'/g, "\\'")}'))" class="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors group" title="Delete">
                        <iconify-icon icon="lucide:trash-2" class="text-white/50 group-hover:text-red-400"></iconify-icon>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// ---- Form Management ----

function setupForm() {
    const form = document.getElementById('project-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject();
    });
}

function openProjectModal(editing = false) {
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
    if (modalTitle) modalTitle.textContent = editing ? 'Edit Project' : 'Add New Project';
    if (!editing) resetForm();
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
    resetForm();
}

function resetForm() {
    const form = document.getElementById('project-form');
    if (form) form.reset();
    editingProjectId = null;
    uploadedFiles = [];
    existingImageUrls = [];
    renderImagePreviews();
}

function addNewProject() {
    editingProjectId = null;
    openProjectModal(false);
}

async function editProject(id) {
    const project = dashboardProjects.find(p => p.id === id);
    if (!project) return;

    editingProjectId = id;
    existingImageUrls = project.image_urls || [];
    uploadedFiles = [];

    document.getElementById('project-title').value = project.title;
    document.getElementById('project-description').value = project.description || '';

    const categories = (project.category || '').split(',').map(c => c.trim());
    document.querySelectorAll('input[name="project-category"]').forEach(cb => {
        cb.checked = categories.includes(cb.value);
    });

    renderImagePreviews();
    openProjectModal(true);
}

async function saveProject() {
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const selectedCategories = Array.from(document.querySelectorAll('input[name="project-category"]:checked')).map(cb => cb.value);
    const category = selectedCategories.join(', ');

    if (!title) { showToast('Please enter a project title', 'error'); return; }
    if (selectedCategories.length === 0) { showToast('Please select at least one category', 'error'); return; }

    const saveBtn = document.getElementById('save-btn');
    const saveBtnText = document.getElementById('save-btn-text');
    if (saveBtn) saveBtn.disabled = true;
    if (saveBtnText) saveBtnText.textContent = 'Saving...';

    try {
        const newImageUrls = [];
        for (const file of uploadedFiles) {
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
            const { data, error } = await supabase.storage.from('project-images').upload(fileName, file);
            if (error) throw error;
            newImageUrls.push(getImageUrl(data.path));
        }

        const allImageUrls = [...existingImageUrls, ...newImageUrls];
        const projectData = { title, description, category, image_urls: allImageUrls };

        if (editingProjectId) {
            const { error } = await supabase.from('projects').update(projectData).eq('id', editingProjectId);
            if (error) throw error;
            showToast('Project updated successfully!', 'success');
        } else {
            const { error } = await supabase.from('projects').insert([projectData]);
            if (error) throw error;
            showToast('Project created successfully!', 'success');
        }

        closeProjectModal();
        await loadDashboardProjects();
    } catch (err) {
        console.error('Error saving project:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        if (saveBtn) saveBtn.disabled = false;
        if (saveBtnText) saveBtnText.textContent = 'Save Project';
    }
}

// ---- Delete Project ----

function confirmDelete(id, title) {
    const modal = document.getElementById('delete-modal');
    const nameEl = document.getElementById('delete-project-name');
    if (nameEl) nameEl.textContent = title;
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    window._deleteProjectId = id;
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    window._deleteProjectId = null;
}

async function deleteProject() {
    const id = window._deleteProjectId;
    if (!id) return;
    const project = dashboardProjects.find(p => p.id === id);

    try {
        if (project && project.image_urls) {
            for (const url of project.image_urls) {
                try {
                    const path = url.split('/project-images/')[1];
                    if (path) await supabase.storage.from('project-images').remove([path]);
                } catch (e) { console.warn('Could not delete image:', e); }
            }
        }
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
        showToast('Project deleted successfully!', 'success');
        closeDeleteModal();
        await loadDashboardProjects();
    } catch (err) {
        console.error('Error deleting project:', err);
        showToast(`Error: ${err.message}`, 'error');
    }
}

// ---- Drag & Drop ----

function setupDragDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-active'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-active'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); fileInput.value = ''; });
}

function handleFiles(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) { showToast('Please select image files only', 'error'); return; }
    uploadedFiles.push(...files);
    renderImagePreviews();
}

function renderImagePreviews() {
    const container = document.getElementById('image-previews');
    if (!container) return;
    let html = '';
    existingImageUrls.forEach((url, i) => {
        html += `<div class="relative group"><img src="${url}" alt="Image ${i + 1}" class="w-24 h-24 object-cover rounded-xl border border-white/10"><button onclick="removeExistingImage(${i})" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><iconify-icon icon="lucide:x" class="text-xs text-white"></iconify-icon></button></div>`;
    });
    uploadedFiles.forEach((file, i) => {
        const url = URL.createObjectURL(file);
        html += `<div class="relative group"><img src="${url}" alt="${file.name}" class="w-24 h-24 object-cover rounded-xl border border-[#00d9ff]/30"><div class="absolute inset-0 rounded-xl bg-[#00d9ff]/10 border-2 border-[#00d9ff]/20"></div><button onclick="removeUploadedFile(${i})" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><iconify-icon icon="lucide:x" class="text-xs text-white"></iconify-icon></button><span class="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-black/60 rounded px-1 truncate">new</span></div>`;
    });
    container.innerHTML = html || '<p class="text-white/30 text-sm col-span-full">No images added yet</p>';
}

function removeExistingImage(index) { existingImageUrls.splice(index, 1); renderImagePreviews(); }
function removeUploadedFile(index) { uploadedFiles.splice(index, 1); renderImagePreviews(); }

// ---- Toast Notifications ----

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'from-green-500/20 to-green-600/20 border-green-500/30' : 'from-red-500/20 to-red-600/20 border-red-500/30';
    const iconName = type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
    toast.className = `flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r ${bgColor} border backdrop-blur-xl rounded-xl shadow-2xl transform translate-x-full transition-transform duration-300`;
    toast.innerHTML = `<iconify-icon icon="${iconName}" class="${iconColor} text-xl"></iconify-icon><span class="text-white text-sm font-medium">${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.remove('translate-x-full'); toast.classList.add('translate-x-0'); });
    setTimeout(() => { toast.classList.remove('translate-x-0'); toast.classList.add('translate-x-full'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ---- Logout ----

async function handleLogout() {
    try { await signOut(); } catch (err) { window.location.href = '/admin/login.html'; }
}
