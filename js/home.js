// ============================================
// Visual Seven — Homepage Logic
// ============================================

const PLACEHOLDER_PROJECTS = [
    { title: 'Luxury Hotel Neon', description: 'Custom LED installation', icon: 'lucide:lightbulb', gradient: 'from-[#00d9ff]/20 to-[#b000ff]/20' },
    { title: 'Restaurant Signage', description: 'Acrylic neon design', icon: 'lucide:zap', gradient: 'from-[#ff006e]/20 to-[#00d9ff]/20' },
    { title: 'Retail Brand Identity', description: 'Full branding suite', icon: 'lucide:sparkles', gradient: 'from-[#b000ff]/20 to-[#ff006e]/20' },
    { title: 'Office LED Board', description: 'Corporate signage', icon: 'lucide:star', gradient: 'from-[#00d9ff]/20 to-[#ff006e]/20' },
    { title: 'Event Installation', description: 'Outdoor advertising', icon: 'lucide:flame', gradient: 'from-[#ff006e]/20 to-[#b000ff]/20' },
    { title: 'Boutique Storefront', description: 'Premium metal signage', icon: 'lucide:award', gradient: 'from-[#b000ff]/20 to-[#00d9ff]/20' },
];

const GRADIENTS = [
    'from-[#00d9ff]/20 to-[#b000ff]/20',
    'from-[#ff006e]/20 to-[#00d9ff]/20',
    'from-[#b000ff]/20 to-[#ff006e]/20',
    'from-[#00d9ff]/20 to-[#ff006e]/20',
    'from-[#ff006e]/20 to-[#b000ff]/20',
    'from-[#b000ff]/20 to-[#00d9ff]/20',
];

/**
 * Render a single project card
 */
function renderProjectCard(project, index) {
    const gradient = GRADIENTS[index % GRADIENTS.length];
    const hasImage = project.image_urls && project.image_urls.length > 0;

    let imageContent;
    if (hasImage) {
        imageContent = `<img src="${project.image_urls[0]}" alt="${project.title}" class="w-full h-full object-cover">`;
    } else {
        const placeholder = PLACEHOLDER_PROJECTS[index % PLACEHOLDER_PROJECTS.length];
        imageContent = `<iconify-icon icon="${placeholder.icon}" class="text-8xl text-white/30 group-hover:text-white/50 transition-colors"></iconify-icon>`;
    }

    return `
        <div class="group hover-zoom rounded-2xl overflow-hidden bg-white/5 border border-white/10">
            <div class="aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
                ${imageContent}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
                <p class="text-white/60 text-sm">${((project.category || project.description || '').split(',').map(c => c.trim()).filter(Boolean).join(' · '))}</p>
            </div>
        </div>
    `;
}

/**
 * Load featured projects from Supabase
 */
async function loadFeaturedProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);

        if (error) throw error;

        if (projects && projects.length > 0) {
            grid.innerHTML = projects.map((p, i) => renderProjectCard(p, i)).join('');
        } else {
            // Show placeholders when no projects exist yet
            grid.innerHTML = PLACEHOLDER_PROJECTS.map((p, i) => renderProjectCard({
                title: p.title,
                description: p.description,
                image_urls: [],
                category: p.description,
            }, i)).join('');
        }
    } catch (err) {
        console.error('Error loading projects:', err);
        // Fallback to placeholders
        grid.innerHTML = PLACEHOLDER_PROJECTS.map((p, i) => renderProjectCard({
            title: p.title,
            description: p.description,
            image_urls: [],
            category: p.description,
        }, i)).join('');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadFeaturedProjects);
