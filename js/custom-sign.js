// ============================================
// Visual Seven — Custom Neon Sign Builder Logic
// ============================================


// Builder State
const state = {
    text: "Your Sign",
    font: "Pacifico",
    color: "#ff007f",
    colorGlow: "rgba(255, 0, 127, 0.85)",
    colorName: "Neon Pink",
    dimmer: 100,
    backing: "none",
    size: "medium"
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initColorPalette();
    initBackingSelectors();
    initSizeSelectors();
    initInputs();
    initModal();
    
    // Initial render
    updatePreview();
});

// Setup Color DOT select
function initColorPalette() {
    const dots = document.querySelectorAll(".color-dot");
    
    dots.forEach(dot => {
        // Set actual color as background
        const color = dot.dataset.color;
        const glow = dot.dataset.glow;
        const name = dot.title;

        // Add click listener
        dot.addEventListener("click", () => {
            // Remove active checks
            dots.forEach(d => {
                d.querySelector("iconify-icon").classList.add("hidden");
                d.classList.remove("ring-4", "ring-white/40");
            });

            // Set active
            dot.querySelector("iconify-icon").classList.remove("hidden");
            dot.classList.add("ring-4", "ring-white/40");

            state.color = color;
            state.colorGlow = glow;
            state.colorName = name;

            updatePreview();
        });

        // Select pink by default
        if (color === "#ff007f") {
            dot.click();
        }
    });
}

// Setup Backing Options click
function initBackingSelectors() {
    const btns = document.querySelectorAll(".backing-option-btn");
    
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => {
                b.classList.remove("border-[#00d9ff]", "bg-[#00d9ff]/10");
                b.classList.add("border-white/15", "bg-white/5");
            });

            btn.classList.add("border-[#00d9ff]", "bg-[#00d9ff]/10");
            btn.classList.remove("border-white/15", "bg-white/5");

            state.backing = btn.dataset.backing;
            updatePreview();
        });

        // Set none by default
        if (btn.dataset.backing === "none") {
            btn.click();
        }
    });
}

// Setup Size Buttons click
function initSizeSelectors() {
    const btns = document.querySelectorAll(".size-option-btn");
    
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => {
                b.classList.remove("border-[#00d9ff]", "bg-[#00d9ff]/10");
                b.classList.add("border-white/15", "bg-white/5");
            });

            btn.classList.add("border-[#00d9ff]", "bg-[#00d9ff]/10");
            btn.classList.remove("border-white/15", "bg-white/5");

            state.size = btn.dataset.size;
            updatePreview();
        });

        // Set medium by default
        if (btn.dataset.size === "medium") {
            btn.click();
        }
    });
}

// Setup Text, Dimmer inputs
function initInputs() {
    const textInput = document.getElementById("sign-text");
    const charCounter = document.getElementById("char-counter");
    const fontSelect = document.getElementById("sign-font");
    const dimmerSlider = document.getElementById("dimmer-slider");
    const dimmerVal = document.getElementById("dimmer-value");

    // Text event
    textInput.addEventListener("input", (e) => {
        let val = e.target.value;
        if (!val.trim()) {
            val = "Custom Sign";
        }
        state.text = val;
        charCounter.textContent = `${e.target.value.length}/30 chars`;
        updatePreview();
    });

    // Font event
    fontSelect.addEventListener("change", (e) => {
        state.font = e.target.value;
        updatePreview();
    });

    // Dimmer event
    dimmerSlider.addEventListener("input", (e) => {
        const val = e.target.value;
        state.dimmer = parseInt(val);
        dimmerVal.textContent = `${val}%`;
        updatePreview();
    });
}

// Recompute preview rendering styling and pricing calculations
function updatePreview() {
    const previewEl = document.getElementById("neon-preview-text");
    const backingContainer = document.getElementById("neon-backing-container");
    const glowOverlay = document.getElementById("canvas-glow-overlay");
    
    if (!previewEl) return;

    // Apply text content
    previewEl.textContent = state.text;

    // Apply font style
    if (state.font === "Pacifico") {
        previewEl.style.fontFamily = "'Pacifico', cursive";
        previewEl.style.textTransform = "none";
    } else if (state.font === "Sacramento") {
        previewEl.style.fontFamily = "'Sacramento', cursive";
        previewEl.style.textTransform = "none";
    } else if (state.font === "Yellowtail") {
        previewEl.style.fontFamily = "'Yellowtail', cursive";
        previewEl.style.textTransform = "none";
    } else if (state.font === "Great Vibes") {
        previewEl.style.fontFamily = "'Great Vibes', cursive";
        previewEl.style.textTransform = "none";
    } else if (state.font === "Montserrat") {
        previewEl.style.fontFamily = "'Montserrat', sans-serif";
        previewEl.style.textTransform = "uppercase";
    } else if (state.font === "Playfair Display") {
        previewEl.style.fontFamily = "'Playfair Display', serif";
        previewEl.style.textTransform = "none";
    }

    // Apply backing styles classes
    backingContainer.className = "flex items-center justify-center transition-all duration-300 max-w-full max-h-[70vh] ";
    if (state.backing === "none") {
        backingContainer.classList.add("backing-none");
    } else if (state.backing === "contour") {
        backingContainer.classList.add("backing-contour");
    } else if (state.backing === "board") {
        backingContainer.classList.add("backing-board");
    }

    // Apply size rendering scaling
    if (state.size === "small") {
        previewEl.className = "neon-preview-text font-bold text-3xl sm:text-4xl md:text-5xl tracking-wide select-none";
    } else if (state.size === "medium") {
        previewEl.className = "neon-preview-text font-bold text-4xl sm:text-5xl md:text-6xl tracking-wide select-none";
    } else if (state.size === "large") {
        previewEl.className = "neon-preview-text font-bold text-5xl sm:text-6xl md:text-7xl tracking-wide select-none";
    }

    // Glow brightness modifiers
    const dimmerPercent = state.dimmer / 100;
    const colorHex = state.color;
    const glowColor = state.colorGlow;

    // Apply neon text shadows based on glow values
    previewEl.style.color = state.color;
    previewEl.style.opacity = (0.2 + (0.8 * dimmerPercent)).toString();
    previewEl.style.textShadow = `
        0 0 5px #fff,
        0 0 10px ${colorHex},
        0 0 20px ${glowColor.replace("0.85", (0.85 * dimmerPercent).toFixed(2))},
        0 0 40px ${glowColor.replace("0.85", (0.5 * dimmerPercent).toFixed(2))},
        0 0 60px ${glowColor.replace("0.85", (0.35 * dimmerPercent).toFixed(2))}
    `;

    // Apply canvas background glow
    if (glowOverlay) {
        glowOverlay.style.backgroundColor = state.color;
        glowOverlay.style.opacity = (0.02 + (0.12 * dimmerPercent)).toString();
    }
}


// Inquiry Form Modal controls
function initModal() {
    const modal = document.getElementById("inquiry-modal");
    const openBtn = document.getElementById("order-inquiry-btn");
    const closeBtn = document.getElementById("close-modal-btn");
    const closeSuccessBtn = document.getElementById("close-success-btn");
    const form = document.getElementById("design-inquiry-form");
    const successState = document.getElementById("submit-success-state");

    const formText = document.getElementById("form-summary-text");
    const formColor = document.getElementById("form-summary-color");
    const formFont = document.getElementById("form-summary-font");
    const formBacking = document.getElementById("form-summary-backing");
    const formSize = document.getElementById("form-summary-size");

    // Open
    openBtn.addEventListener("click", () => {
        // Populate parameters box in form
        formText.textContent = `"${state.text}"`;
        formColor.textContent = state.colorName;
        formFont.textContent = state.font;
        formBacking.textContent = state.backing === "none" ? "None" : (state.backing === "contour" ? "Cut-To-Shape" : "Acrylic Board");
        formSize.textContent = state.size === "small" ? "Small (30cm)" : (state.size === "medium" ? "Medium (60cm)" : "Large (100cm)");

        // Reset state
        form.classList.remove("hidden");
        successState.classList.add("hidden");

        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.body.style.overflow = "hidden";
    });

    // Close
    const closeModal = () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        document.body.style.overflow = "";
    };

    closeBtn.addEventListener("click", closeModal);
    closeSuccessBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submit to Supabase
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("inquiry-name").value.trim();
        const email = document.getElementById("inquiry-email").value.trim();
        const phone = document.getElementById("inquiry-phone").value.trim();
        const message = document.getElementById("inquiry-msg").value.trim();

        const submitBtn = document.getElementById("submit-inquiry-btn");
        const submitText = document.getElementById("submit-inquiry-text");
        
        submitBtn.disabled = true;
        submitText.textContent = "Sending inquiry...";

        try {
            // Save payload to Supabase inquiries table
            const { data, error } = await supabase
                .from("inquiries")
                .insert([{
                    name,
                    email,
                    phone,
                    subject: "Custom Neon Sign Quote",
                    message,
                    status: "New",
                    config_data: {
                        text: state.text,
                        font: state.font,
                        color: state.color,
                        colorGlow: state.colorGlow,
                        colorName: state.colorName,
                        backing: state.backing,
                        size: state.size,
                        dimmer: state.dimmer
                    }
                }]);

            if (error) throw error;

            // Success state
            form.classList.add("hidden");
            successState.classList.remove("hidden");
            form.reset();
        } catch (err) {
            console.error("Error submitting inquiry:", err);
            showToast(`Submission failed: ${err.message}`, "error");
        } finally {
            submitBtn.disabled = false;
            submitText.textContent = "Send Design Inquiry";
        }
    });
}

// Toast system
function showToast(message, type = "success") {
    const container = document.getElementById("toast-wrapper");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColor = type === "success" ? "from-green-500/20 to-green-600/20 border-green-500/30" : "from-red-500/20 to-red-600/20 border-red-500/30";
    const iconName = type === "success" ? "lucide:check-circle" : "lucide:alert-circle";
    const iconColor = type === "success" ? "text-green-400" : "text-red-400";

    toast.className = `flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r ${bgColor} border backdrop-blur-xl rounded-xl shadow-2xl transform translate-x-full transition-transform duration-300`;
    toast.innerHTML = `
        <iconify-icon icon="${iconName}" class="${iconColor} text-xl"></iconify-icon>
        <span class="text-white text-sm font-medium">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove("translate-x-full");
        toast.classList.add("translate-x-0");
    });

    setTimeout(() => {
        toast.classList.remove("translate-x-0");
        toast.classList.add("translate-x-full");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
