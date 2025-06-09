/*
// Original content of assessment-home.js - now handled by assessment.js for better centralization

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('assessmentSections');

  const SECTION_META = {
    'Aptitude': { icon: 'fa-brain', color: 'from-blue-500 to-indigo-600' },
    'Technical': { icon: 'fa-microchip', color: 'from-emerald-500 to-green-600' },
    'Coding': { icon: 'fa-code', color: 'from-purple-500 to-violet-600' },
    'HR': { icon: 'fa-handshake-angle', color: 'from-amber-500 to-orange-600' },
    'default': { icon: 'fa-star', color: 'from-gray-500 to-gray-700' },
  };

  try {
    const res = await fetch('/api/assessment/modules');
    if (!res.ok) throw new Error('Failed to fetch modules');
    const data = await res.json();
    
    container.innerHTML = '';
    
    let sectionDelay = 100;
    for (const [sectionName, modules] of Object.entries(data)) {
        const meta = SECTION_META[sectionName] || SECTION_META['default'];
        const sectionEl = document.createElement('div');
        sectionEl.className = 'section';
        sectionEl.setAttribute('data-aos', 'fade-up');
        sectionEl.setAttribute('data-aos-delay', sectionDelay);
        
        sectionEl.innerHTML = `
          <div class="section-header">
            <i class="fas ${meta.icon} section-icon bg-gradient-to-br ${meta.color}"></i>
            <h2 class="section-title">${sectionName}</h2>
          </div>
          <div class="module-grid"></div>
        `;
        
        const modulesContainer = sectionEl.querySelector('.module-grid');
        let cardDelay = sectionDelay + 100;
        modules.forEach(m => {
            const cardLink = document.createElement('a');
            cardLink.href = `assessment-module.html?id=${m._id}`;
            cardLink.className = 'module-card';
            cardLink.setAttribute('data-aos', 'zoom-in-up');
            cardLink.setAttribute('data-aos-delay', cardDelay);
            
            cardLink.innerHTML = `
              <h3>${m.name}</h3>
              <p>${m.description}</p>
              <div class="start-button">
                <i class="fas fa-bolt mr-2"></i> Start Challenge
              </div>
            `;
            modulesContainer.appendChild(cardLink);
            cardDelay += 50;
        });
        container.appendChild(sectionEl);
        sectionDelay += 150;
    }

  } catch (error) {
    console.error("Error loading assessment modules:", error);
    container.innerHTML = `<p class="text-center text-red-500 text-lg">Oops! Couldn't load the assessments. Please try refreshing!</p>`;
  }
});
*/ 

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('assessment-container');
  const errorMessageEl = document.getElementById('error-message');
  const loadingSpinner = container.querySelector('.loading-spinner');

  const SECTION_META = {
    'Aptitude': { icon: 'fa-brain', color: 'from-blue-500 to-indigo-600' },
    'Technical': { icon: 'fa-microchip', color: 'from-emerald-500 to-green-600' },
    'Coding': { icon: 'fa-code', color: 'from-purple-500 to-violet-600' },
    'HR': { icon: 'fa-handshake-angle', color: 'from-amber-500 to-orange-600' },
    'default': { icon: 'fa-star', color: 'from-gray-500 to-gray-700' },
  };

  try {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (errorMessageEl) errorMessageEl.style.display = 'none';
    container.innerHTML = `<div class="loading-spinner"></div><p class="text-center text-gray-500">Loading your challenges...</p>`;

    const res = await fetch('/api/assessment/modules');
    if (!res.ok) throw new Error('Failed to fetch modules');
    const data = await res.json();
    
    container.innerHTML = '';

    let sectionDelay = 0;
    for (const [sectionName, modules] of Object.entries(data)) {
        const meta = SECTION_META[sectionName] || SECTION_META['default'];
        const sectionEl = document.createElement('div');
        sectionEl.className = 'section';
        sectionEl.setAttribute('data-aos', 'fade-up');
        sectionEl.setAttribute('data-aos-delay', sectionDelay);
        
        sectionEl.innerHTML = `
          <div class="section-header">
            <i class="fas ${meta.icon} section-icon bg-gradient-to-br ${meta.color}"></i>
            <h2 class="section-title">${sectionName}</h2>
          </div>
          <div class="module-grid"></div>
        `;
        
        const modulesContainer = sectionEl.querySelector('.module-grid');
        let cardDelay = 0;
        modules.forEach(m => {
            const cardLink = document.createElement('a');
            cardLink.href = `assessment-module.html?id=${m._id}`;
            cardLink.className = 'module-card';
            cardLink.setAttribute('data-aos', 'zoom-in-up');
            cardLink.setAttribute('data-aos-delay', cardDelay);
            
            cardLink.innerHTML = `
              <div id="blinkingDot" class="absolute top-4 right-4"></div>
              <h3>${m.name}</h3>
              <p>${m.description}</p>
              <div class="start-button">
                <i class="fas fa-bolt mr-2"></i> Start Challenge
              </div>
            `;
            modulesContainer.appendChild(cardLink);
        });
        container.appendChild(sectionEl);
    }
    
    AOS.init({ duration: 400, once: true, offset: 20, easing: 'ease-out-cubic' });

  } catch (error) {
    console.error("Error loading assessment modules:", error);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessageEl) {
        errorMessageEl.style.display = 'block';
        errorMessageEl.textContent = `Oops! Couldn't load the assessments: ${error.message}. Please try refreshing!`;
    } else {
        container.innerHTML = `<p class="text-center text-red-500 text-lg">Oops! Couldn't load the assessments. Please try refreshing!</p>`;
    }
  }
}); 