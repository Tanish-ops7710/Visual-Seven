// ============================================
// Visual Seven — Portfolio Logic
// ============================================

const CATEGORIES = ['All', 'Neon Signage', 'Acrylic Signage', 'Clip On Frame', 'Fabric Box', 'ACP Work With Signage', 'Exhibition', 'MS/Sunboard/Sunpack', 'SS Signage', 'Saregama'];
let allProjects = [];
let currentFilter = 'All';

const PORTFOLIO_GRADIENTS = [
    'from-[#00d9ff]/20 to-[#b000ff]/20',
    'from-[#ff006e]/20 to-[#00d9ff]/20',
    'from-[#b000ff]/20 to-[#ff006e]/20',
    'from-[#00d9ff]/20 to-[#ff006e]/20',
    'from-[#ff006e]/20 to-[#b000ff]/20',
    'from-[#b000ff]/20 to-[#00d9ff]/20',
];

/**
 * Render filter buttons
 */
function renderFilters() {
    const container = document.getElementById('filter-buttons');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
        <button 
            onclick="filterProjects('${cat}')"
            class="filter-btn px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                currentFilter === cat
                    ? 'bg-gradient-to-r from-[#00d9ff] to-[#b000ff] text-white neon-glow-blue'
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
            }"
        >
            ${cat}
        </button>
    `).join('');
}

/**
 * Render a portfolio project card
 */
function renderPortfolioCard(project, index) {
    const gradient = PORTFOLIO_GRADIENTS[index % PORTFOLIO_GRADIENTS.length];
    const hasImage = project.image_urls && project.image_urls.length > 0;
    const imageCount = project.image_urls ? project.image_urls.length : 0;

    let imageContent;
    if (hasImage) {
        imageContent = `<img src="${project.image_urls[0]}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">`;
    } else {
        imageContent = `
            <div class="flex items-center justify-center w-full h-full">
                <iconify-icon icon="lucide:image" class="text-7xl text-white/20"></iconify-icon>
            </div>
        `;
    }

    return `
        <div class="group hover-zoom rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
             onclick="openLightbox('${project.id}')">
            <div class="aspect-[4/3] bg-gradient-to-br ${gradient} overflow-hidden relative">
                ${imageContent}
                ${imageCount > 1 ? `
                    <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <iconify-icon icon="lucide:images" class="text-sm text-white/80"></iconify-icon>
                        <span class="text-xs text-white/80 font-medium">${imageCount}</span>
                    </div>
                ` : ''}
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span class="text-white font-medium flex items-center gap-2">
                        <iconify-icon icon="lucide:expand" class="text-lg"></iconify-icon>
                        View Gallery
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
                <div class="flex items-center justify-between">
                    <span class="text-white/50 text-sm">${(project.category || 'Uncategorized').split(',').map(c => c.trim()).filter(Boolean).join(' · ')}</span>
                    <span class="text-white/30 text-xs">${new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                ${project.description ? `<p class="text-white/40 text-sm mt-3 line-clamp-2">${project.description}</p>` : ''}
            </div>
        </div>
    `;
}

/**
 * Filter and render projects
 */
function filterProjects(category) {
    currentFilter = category;
    renderFilters();

    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    const filtered = category === 'All'
        ? allProjects
        : allProjects.filter(p => {
            const cats = (p.category || '').split(',').map(c => c.trim());
            return cats.includes(category);
        });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <iconify-icon icon="lucide:folder-open" class="text-6xl text-white/20 mb-4"></iconify-icon>
                <p class="text-white/40 text-lg">No projects found in this category</p>
            </div>
        `;
    } else {
        grid.innerHTML = filtered.map((p, i) => renderPortfolioCard(p, i)).join('');
    }
}

/**
 * Open lightbox for a project
 */
function openLightbox(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project || !project.image_urls || project.image_urls.length === 0) return;

    const modal = document.getElementById('lightbox-modal');
    const title = document.getElementById('lightbox-title');
    const gallery = document.getElementById('lightbox-gallery');
    const counter = document.getElementById('lightbox-counter');

    title.textContent = project.title;
    counter.textContent = `${project.image_urls.length} image${project.image_urls.length > 1 ? 's' : ''}`;

    gallery.innerHTML = project.image_urls.map((url, i) => `
        <div class="flex-shrink-0 w-full flex items-center justify-center">
            <img src="${url}" alt="${project.title} - Image ${i + 1}" class="max-w-full max-h-[75vh] object-contain rounded-xl">
        </div>
    `).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Reset scroll
    gallery.scrollLeft = 0;
    window._lightboxIndex = 0;
    window._lightboxTotal = project.image_urls.length;
    updateLightboxNav();
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

function lightboxPrev() {
    if (window._lightboxIndex > 0) {
        window._lightboxIndex--;
        scrollLightbox();
    }
}

function lightboxNext() {
    if (window._lightboxIndex < window._lightboxTotal - 1) {
        window._lightboxIndex++;
        scrollLightbox();
    }
}

function scrollLightbox() {
    const gallery = document.getElementById('lightbox-gallery');
    const width = gallery.clientWidth;
    gallery.scrollTo({ left: width * window._lightboxIndex, behavior: 'smooth' });
    updateLightboxNav();
}

function updateLightboxNav() {
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    if (prevBtn) prevBtn.style.opacity = window._lightboxIndex === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = window._lightboxIndex >= window._lightboxTotal - 1 ? '0.3' : '1';
}

/**
 * Load all projects from Supabase
 */
async function loadPortfolioProjects() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="inline-block w-8 h-8 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-white/40">Loading projects...</p>
        </div>
    `;

    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allProjects = projects || [];
        renderFilters();
        filterProjects('All');
    } catch (err) {
        console.error('Error loading projects:', err);
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <iconify-icon icon="lucide:alert-circle" class="text-6xl text-red-400/50 mb-4"></iconify-icon>
                <p class="text-white/40 text-lg">Failed to load projects</p>
                <p class="text-white/30 text-sm mt-2">${err.message}</p>
            </div>
        `;
    }
}

// Handle keyboard for lightbox
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadPortfolioProjects);
