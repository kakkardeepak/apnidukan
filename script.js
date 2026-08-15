import {
  db, auth, ADMIN_USERNAME, ADMIN_AUTH_EMAIL,
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  GoogleAuthProvider, EmailAuthProvider,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile,
  onAuthStateChanged
} from './firebase-config.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function showTemporaryToast(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ── Seed / default data ──────────────────────────────────────────────────────

const defaultProducts = [
  { id: 'watch-sport-01', title: 'Signature Sport Watch', category: 'Watches', audience: 'Men', description: 'Sleek sport watch with premium leather strap and advanced features.', price: 2499, marketPrice: 3999, qty: 18, image: 'https://via.placeholder.com/600x600?text=Sport+Watch' },
  { id: 'sneaker-air-02', title: 'Urban Runner Sneakers', category: 'Footwear', audience: 'Men', description: 'Comfortable and stylish sneakers crafted for city life.', price: 1799, marketPrice: 2999, qty: 32, image: 'https://via.placeholder.com/600x600?text=Urban+Sneakers' },
  { id: 'formal-shirt-03', title: 'Elegant Formal Shirt', category: 'Clothing', audience: 'Men', description: 'Tailored formal shirt in premium cotton for every office meeting.', price: 899, marketPrice: 1599, qty: 45, image: 'https://via.placeholder.com/600x600?text=Formal+Shirt' },
  { id: 'earbuds-pro-04', title: 'Noise-Canceling Earbuds', category: 'Electronics', audience: 'Unisex', description: 'Wireless earbuds with long battery life and crisp audio.', price: 2199, marketPrice: 3499, qty: 27, image: 'https://via.placeholder.com/600x600?text=Earbuds' }
];

const defaultTestimonials = [
  { id: 'review-priya', name: 'Priya', location: 'Bengaluru', quote: 'Amazing service and premium quality products. The delivery was fast, and the premium packaging made it feel special.', rating: 5, avatar: 'https://via.placeholder.com/80?text=P' },
  { id: 'review-aarav', name: 'Aarav', location: 'Chennai', quote: 'WhatsApp ordering was quick and the packaging felt luxurious. I appreciate the personal service and smooth checkout.', rating: 5, avatar: 'https://via.placeholder.com/80?text=A' },
  { id: 'review-meera', name: 'Meera', location: 'Pune', quote: 'The style curation is top-notch. Highly recommended—each product feels premium, and the service kept me informed at every step.', rating: 5, avatar: 'https://via.placeholder.com/80?text=M' }
];

const defaultSettings = {
  whatsappNumber: '919999999999',
  supportEmail: 'support@apnidukan.com',
  supportPhone: '+91 99999 99999',
  instagramUrl: 'https://instagram.com',
  storeTagline: 'Luxury curated for every style',
  themePack: 'default',
  accentColor: '#d4af37',
  headerColor: '#05070f',
  surfaceColor: '#ffffff',
  backgroundColor: '#050505',
  logoData: '',
  brandTextStyle: 'classic'
};

const settingsDocRef = doc(db, 'config', 'settings');

// ── Firestore loading ─────────────────────────────────────────────────────────

let cachedProducts = null;
let cachedSettings = null;

async function ensureProductsSeeded() {
  const snapshot = await getDocs(collection(db, 'products'));
  if (!snapshot.empty) return;
  let order = defaultProducts.length;
  for (const product of defaultProducts) {
    const { id, ...rest } = product;
    await setDoc(doc(db, 'products', id), { ...rest, createdAt: order });
    order -= 1;
  }
}

async function loadProducts() {
  if (cachedProducts) return cachedProducts;
  await ensureProductsSeeded();
  const snapshot = await getDocs(collection(db, 'products'));
  cachedProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  cachedProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return cachedProducts;
}

async function loadSettings() {
  if (cachedSettings) return cachedSettings;
  const snap = await getDoc(settingsDocRef);
  if (!snap.exists()) {
    await setDoc(settingsDocRef, defaultSettings);
    cachedSettings = { ...defaultSettings };
  } else {
    cachedSettings = { ...defaultSettings, ...snap.data() };
  }
  return cachedSettings;
}

async function ensureTestimonialsSeeded() {
  const snapshot = await getDocs(collection(db, 'testimonials'));
  if (!snapshot.empty) return;
  let order = defaultTestimonials.length;
  for (const review of defaultTestimonials) {
    const { id, ...rest } = review;
    await setDoc(doc(db, 'testimonials', id), { ...rest, status: 'approved', createdAt: order });
    order -= 1;
  }
}

async function loadTestimonials() {
  await ensureTestimonialsSeeded();
  const snapshot = await getDocs(collection(db, 'testimonials'));
  const testimonials = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.status === 'approved');
  testimonials.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return testimonials;
}

// ── Theme & settings application ─────────────────────────────────────────────

function applyTheme(settings) {
  const classList = document.body.classList;
  classList.remove('theme-default', 'theme-midnight', 'theme-ivory', 'theme-noir');
  classList.add(`theme-${settings.themePack || 'default'}`);
  if (settings.accentColor) document.body.style.setProperty('--accent', settings.accentColor);
  if (settings.headerColor) document.body.style.setProperty('--header-bg', settings.headerColor);
  if (settings.surfaceColor) document.body.style.setProperty('--surface', settings.surfaceColor);
  if (settings.backgroundColor) document.body.style.setProperty('--bg', settings.backgroundColor);
}

function applyLogo(settings) {
  const logoContainer = document.getElementById('logoContainer');
  if (!logoContainer) return;
  if (settings.logoData) {
    logoContainer.classList.add('custom-logo');
    const img = document.createElement('img');
    img.className = 'site-logo';
    img.src = settings.logoData;
    img.alt = 'Apni Dukan logo';
    logoContainer.innerHTML = '';
    logoContainer.appendChild(img);
  } else {
    logoContainer.classList.remove('custom-logo');
    logoContainer.innerHTML = `
      <svg viewBox="0 0 160 120" class="logo-svg" aria-hidden="true">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f4d86c" />
            <stop offset="100%" stop-color="#d4af37" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g fill="none" stroke="url(#goldGrad)" stroke-width="10" filter="url(#glow)">
          <path d="M24 102 L24 18 L74 18" />
          <path d="M74 18 L100 18 L100 102" />
          <path d="M100 18 A32 32 0 0 1 132 50 L132 70 A32 32 0 0 1 100 102" />
        </g>
        <circle cx="116" cy="55" r="18" fill="none" stroke="url(#goldGrad)" stroke-width="6" />
        <line x1="116" y1="55" x2="116" y2="41" stroke="url(#goldGrad)" stroke-width="4" />
        <line x1="116" y1="55" x2="130" y2="55" stroke="url(#goldGrad)" stroke-width="4" />
        <path d="M28 86 C36 78,48 74,58 78 C68 82,80 92,102 92" stroke="url(#goldGrad)" stroke-width="6" fill="none" />
      </svg>`;
  }
}

function applyBrandTextStyle(style) {
  const logoTitle = document.querySelector('.logo-copy strong');
  if (!logoTitle) return;
  logoTitle.classList.remove('brand-text-classic', 'brand-text-glam', 'brand-text-modern');
  if (style === 'glam') logoTitle.classList.add('brand-text-glam');
  else if (style === 'modern') logoTitle.classList.add('brand-text-modern');
  else logoTitle.classList.add('brand-text-classic');
}

async function applyStoreSettings() {
  const settings = await loadSettings();
  applyTheme(settings);
  applyLogo(settings);
  applyBrandTextStyle(settings.brandTextStyle);

  const heroAction = document.querySelector('.hero-actions .button-secondary');
  if (heroAction) heroAction.href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Apni Dukan, I would like to order a product.')}`;

  const supportButton = document.querySelector('.support-section .button-secondary');
  if (supportButton) supportButton.href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Apni Dukan, I need support.')}`;

  const footerLinks = document.querySelectorAll('.social-links a');
  if (footerLinks.length >= 2) {
    footerLinks[0].href = settings.instagramUrl;
    footerLinks[1].href = `https://wa.me/${settings.whatsappNumber}`;
  }

  const headerInstagram = document.getElementById('headerInstagram');
  const headerWhatsApp = document.getElementById('headerWhatsApp');
  const floatInstagram = document.getElementById('floatInstagram');
  const floatWhatsApp = document.getElementById('floatWhatsApp');
  if (headerInstagram) headerInstagram.href = settings.instagramUrl;
  if (headerWhatsApp) headerWhatsApp.href = `https://wa.me/${settings.whatsappNumber}`;
  if (floatInstagram) floatInstagram.href = settings.instagramUrl;
  if (floatWhatsApp) floatWhatsApp.href = `https://wa.me/${settings.whatsappNumber}`;
  const navInstagram = document.getElementById('navInstagram');
  const navWhatsApp = document.getElementById('navWhatsApp');
  if (navInstagram) navInstagram.href = settings.instagramUrl;
  if (navWhatsApp) navWhatsApp.href = `https://wa.me/${settings.whatsappNumber}`;

  const footerWhatsAppLink = document.querySelector('.footer-card a[href*="wa.me"]');
  if (footerWhatsAppLink) footerWhatsAppLink.href = `https://wa.me/${settings.whatsappNumber}`;
  const supportWhatsAppLink = document.querySelector('.support-panel .button-secondary');
  if (supportWhatsAppLink) supportWhatsAppLink.href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Apni Dukan, I need support.')}`;

  const emailText = document.querySelector('.support-panel p:nth-of-type(2)');
  if (emailText) emailText.textContent = `Email: ${settings.supportEmail}`;
  const phoneText = document.querySelector('.support-panel p:nth-of-type(3)');
  if (phoneText) phoneText.textContent = `Phone: ${settings.supportPhone}`;
  const tagline = document.querySelector('.hero-copy p');
  if (tagline) tagline.textContent = settings.storeTagline;

  return settings;
}

// ── Product rendering ─────────────────────────────────────────────────────────

function createWhatsAppUrl(product, settings) {
  const phone = settings.whatsappNumber.replace(/[\s+]/g, '');
  const text = encodeURIComponent(`Hello Apni Dukan, I would like to order ${product.title} priced at ₹${product.price}. Please help me proceed.`);
  return `https://wa.me/${phone}?text=${text}`;
}

function getFilteredProducts(allProducts) {
  const searchValue = document.getElementById('productSearch')?.value.trim().toLowerCase() || '';
  const selectedAudience = document.getElementById('filterAudience')?.value || '';
  const selectedCategory = document.getElementById('filterCategory')?.value || '';
  const selectedBrand = document.getElementById('filterBrand')?.value.trim().toLowerCase() || '';
  const selectedSize = document.getElementById('filterSize')?.value.trim().toLowerCase() || '';
  const minPrice = Number(document.getElementById('filterMinPrice')?.value || 0);
  const maxPrice = Number(document.getElementById('filterMaxPrice')?.value || 0);

  return allProducts.filter(product => {
    const matchesSearch = !searchValue || [product.title, product.description, product.category, product.brand, product.size, product.audience].some(f => String(f || '').toLowerCase().includes(searchValue));
    const matchesAudience = !selectedAudience || String(product.audience || '').toLowerCase() === selectedAudience.toLowerCase();
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesBrand = !selectedBrand || String(product.brand || '').toLowerCase().includes(selectedBrand);
    const matchesSize = !selectedSize || String(product.size || '').toLowerCase().includes(selectedSize);
    const matchesMinPrice = !minPrice || product.price >= minPrice;
    const matchesMaxPrice = !maxPrice || product.price <= maxPrice;
    return matchesSearch && matchesAudience && matchesCategory && matchesBrand && matchesSize && matchesMinPrice && matchesMaxPrice;
  });
}

async function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  const allProducts = await loadProducts();
  if (!cachedSettings) cachedSettings = await loadSettings();
  const products = getFilteredProducts(allProducts);

  if (!products.length) {
    productGrid.innerHTML = '<p style="color: var(--muted); padding: 20px 0;">No products match the selected filters. Clear filters to see all items.</p>';
    return;
  }

  productGrid.innerHTML = products.map(product => {
    const discount = product.marketPrice > product.price ? Math.round(100 - (product.price / product.marketPrice) * 100) : 0;
    const qty = Number(product.qty);
    const outOfStock = qty === 0;
    const lowStock = qty > 0 && qty <= 3;
    return `
      <article class="product-card${outOfStock ? ' card-oos' : ''}">
        <div class="card-image-wrap">
          <img src="${sanitize(product.image)}" alt="${sanitize(product.title)}" loading="lazy" />
          ${discount ? `<span class="card-badge badge-sale">-${discount}%</span>` : ''}
          ${outOfStock ? `<span class="card-badge badge-oos">Sold out</span>` : ''}
          ${lowStock ? `<span class="card-badge badge-low">Only ${qty} left</span>` : ''}
        </div>
        <div class="product-info">
          <div>
            <p class="customer-tag">${sanitize(product.category)}</p>
            <h3>${sanitize(product.title)}</h3>
            <p>${sanitize(product.description)}</p>
            ${product.brand ? `<p class="product-detail">Brand: ${sanitize(product.brand)}</p>` : ''}
            ${product.size ? `<p class="product-detail">Size: ${sanitize(product.size)}</p>` : ''}
          </div>
          <div>
            <div class="product-pricing">
              <span class="product-price">₹${Number(product.price).toLocaleString()}</span>
              ${discount ? `<span class="product-market">₹${Number(product.marketPrice).toLocaleString()}</span>` : ''}
            </div>
            <div class="product-actions">
              <a class="button button-primary${outOfStock ? ' btn-disabled' : ''}" href="${outOfStock ? '#' : createWhatsAppUrl(product, cachedSettings)}" ${outOfStock ? 'aria-disabled="true"' : 'target="_blank" rel="noopener noreferrer"'}>
                ${outOfStock ? 'Out of stock' : 'Order on WhatsApp'}
              </a>
              <span class="stock-count${lowStock ? ' stock-low' : ''}">${outOfStock ? '' : qty + ' in stock'}</span>
            </div>
            ${discount ? `<p class="save-label">You save ₹${(Number(product.marketPrice) - Number(product.price)).toLocaleString()} (${discount}% off)</p>` : ''}
          </div>
        </div>
      </article>`;
  }).join('');
}

// ── Testimonial rendering ─────────────────────────────────────────────────────

let testimonialInterval = null;

function rotateTestimonials() {
  const rotator = document.getElementById('testimonialRotator');
  if (!rotator) return;
  const items = Array.from(rotator.querySelectorAll('.testimonial-item'));
  const indicators = Array.from(document.querySelectorAll('.testimonial-indicator'));
  if (!items.length) return;
  let currentIndex = 0;

  const showItem = index => {
    items.forEach((item, i) => item.classList.toggle('active', i === index));
    indicators.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  showItem(currentIndex);
  indicators.forEach(dot => {
    dot.addEventListener('click', () => {
      currentIndex = Number(dot.dataset.index);
      showItem(currentIndex);
    });
  });

  if (testimonialInterval) clearInterval(testimonialInterval);
  testimonialInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    showItem(currentIndex);
  }, 4000);
}

async function renderTestimonials() {
  const rotator = document.getElementById('testimonialRotator');
  const indicators = document.getElementById('testimonialIndicators');
  if (!rotator) return;

  const testimonials = await loadTestimonials();
  if (!testimonials.length) {
    rotator.innerHTML = '<p style="color: var(--muted);">No customer reviews available yet.</p>';
    if (indicators) indicators.innerHTML = '';
    return;
  }

  rotator.innerHTML = testimonials.map((item, index) => {
    const stars = '★★★★★'.slice(0, item.rating) + '☆☆☆☆☆'.slice(0, 5 - item.rating);
    return `
      <article class="testimonial-item${index === 0 ? ' active' : ''}" data-id="${sanitize(item.id)}">
        <div class="testimonial-top">
          <img class="testimonial-avatar" src="${sanitize(item.avatar || `https://via.placeholder.com/80?text=${encodeURIComponent((item.name || 'U').charAt(0))}`)}" alt="${sanitize(item.name)} portrait" />
          <div>
            <div class="testimonial-rating">${stars}</div>
            <span class="testimonial-name">${sanitize(item.name)}, ${sanitize(item.location)}</span>
          </div>
        </div>
        <p>${sanitize(item.quote)}</p>
        ${item.image ? `<img class="testimonial-image" src="${sanitize(item.image)}" alt="Customer image from ${sanitize(item.name)}" loading="lazy" />` : ''}
      </article>`;
  }).join('');

  if (indicators) {
    indicators.innerHTML = testimonials.map((_, index) => `
      <span class="testimonial-indicator${index === 0 ? ' active' : ''}" data-index="${index}"></span>
    `).join('');
  }
  rotateTestimonials();
}

// ── Filter & navigation ───────────────────────────────────────────────────────

function updateFiltersFromAction(filterType, filterValue, audienceValue) {
  if (filterType === 'category') {
    const el = document.getElementById('filterCategory');
    if (el) el.value = filterValue;
  }
  if (filterType === 'audience') {
    const el = document.getElementById('filterAudience');
    if (el) el.value = filterValue;
  }
  if (audienceValue) {
    const el = document.getElementById('filterAudience');
    if (el) el.value = audienceValue;
  }
  renderProducts();
  document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const audienceSubcategories = {
  Men: ['Footwear', 'Watches', 'Sunglasses', 'Perfume', 'Belts'],
  Women: ['Handbags', 'Perfume', 'Shoes', 'Accessories', 'Watches'],
  Kids: ['Footwear', 'Clothing', 'Accessories', 'Other'],
  Unisex: ['Watches', 'Sunglasses', 'Perfume', 'Accessories']
};

function showAudienceSubmenu(audience) {
  const submenu = document.getElementById('dropdownSubmenu');
  const submenuTitle = document.getElementById('submenuTitle');
  const submenuItems = document.getElementById('submenuItems');
  const menu = document.getElementById('navDropdownMenu');
  if (!submenu || !submenuTitle || !submenuItems || !menu) return;
  submenuTitle.textContent = `${audience} subcategories`;
  const items = audienceSubcategories[audience] || [];
  submenuItems.innerHTML = items.map(item => `
    <a class="dropdown-item" href="#collections" data-role="subcat" data-category="${sanitize(item)}" data-audience="${sanitize(audience)}">${sanitize(item)}</a>
  `).join('');
  submenu.hidden = false;
  menu.classList.add('submenu-active');
}

function hideAudienceSubmenu() {
  const submenu = document.getElementById('dropdownSubmenu');
  const menu = document.getElementById('navDropdownMenu');
  if (!submenu || !menu) return;
  submenu.hidden = true;
  menu.classList.remove('submenu-active');
}

function setupStorefrontFilters() {
  document.querySelectorAll('.category-action').forEach(button => {
    button.addEventListener('click', event => {
      const filterType = button.dataset.filterType;
      const filterValue = button.dataset.filter;
      if (!filterType || !filterValue) return;
      updateFiltersFromAction(filterType, filterValue);
      event.preventDefault();
    });
  });

  const dropdownMenu = document.getElementById('navDropdownMenu');
  if (dropdownMenu) {
    dropdownMenu.addEventListener('click', event => {
      const target = event.target.closest('[data-role], [data-filter-type]');
      if (!target) return;
      event.preventDefault();
      const role = target.dataset.role;
      if (role === 'audience') { showAudienceSubmenu(target.dataset.audience); return; }
      if (role === 'subcat') {
        updateFiltersFromAction('category', target.dataset.category, target.dataset.audience);
        hideAudienceSubmenu();
        return;
      }
      const filterType = target.dataset.filterType;
      const filterValue = target.dataset.filter;
      if (filterType && filterValue) updateFiltersFromAction(filterType, filterValue);
    });
  }

  document.getElementById('dropdownBack')?.addEventListener('click', hideAudienceSubmenu);

  // Header search syncs value to filter panel search and triggers render
  const headerSearch = document.getElementById('headerSearch');
  const searchForm = document.querySelector('.search-bar');
  if (searchForm) {
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      if (headerSearch) {
        const ps = document.getElementById('productSearch');
        if (ps) ps.value = headerSearch.value;
      }
      renderProducts();
      document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const filterInputIds = ['productSearch', 'filterAudience', 'filterCategory', 'filterBrand', 'filterSize', 'filterMinPrice', 'filterMaxPrice'];

  function updateFiltersActiveCount() {
    const count = filterInputIds.filter(id => {
      const el = document.getElementById(id);
      return el && el.value.trim() !== '';
    }).length;
    const badge = document.getElementById('filtersActiveCount');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count;
      badge.removeAttribute('hidden');
    } else {
      badge.setAttribute('hidden', '');
    }
  }

  filterInputIds.forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      renderProducts();
      updateFiltersActiveCount();
    });
  });

  document.getElementById('clearFilters')?.addEventListener('click', () => {
    ['productSearch', 'filterBrand', 'filterSize', 'filterMinPrice', 'filterMaxPrice'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['filterAudience', 'filterCategory'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderProducts();
    updateFiltersActiveCount();
  });

  // Mobile: toggle filter panel visibility
  const filtersToggle = document.getElementById('filtersToggle');
  const filtersPanel = document.getElementById('filtersPanel');
  if (filtersToggle && filtersPanel) {
    filtersToggle.addEventListener('click', () => {
      const isOpen = filtersPanel.classList.toggle('filters-open');
      filtersToggle.setAttribute('aria-expanded', String(isOpen));
      filtersToggle.classList.toggle('toggle-active', isOpen);
    });
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

function updateAuthMode(mode) {
  document.querySelectorAll('.tab-button').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
  document.querySelectorAll('.form-row').forEach(row => row.classList.toggle('hidden', row.dataset.mode !== mode));
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  // Focus first focusable element inside the dialog
  const first = modal.querySelector('button, input, a');
  if (first) first.focus();
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

function updateSignInButton(label) {
  const btn = document.getElementById('signInLink');
  if (btn) btn.textContent = label;
  const btnNav = document.getElementById('signInLinkNav');
  if (btnNav) btnNav.textContent = label;
}

function showAuthLoggedIn(user) {
  const loggedIn = document.getElementById('authLoggedIn');
  const form = document.getElementById('userAuthForm');
  const toggle = document.querySelector('.login-toggle');
  const note = document.querySelector('.login-note');
  if (!loggedIn) return;
  const nameEl = document.getElementById('authUserName');
  const displayName = user.displayName || user.email;
  if (nameEl) nameEl.textContent = displayName;
  loggedIn.classList.remove('hidden');
  if (form) form.classList.add('hidden');
  if (toggle) toggle.classList.add('hidden');
  if (note) note.classList.add('hidden');
  // Show first name on the sign-in button
  const firstName = (user.displayName || '').split(' ')[0] || user.email.split('@')[0];
  updateSignInButton(firstName);
}

function showAuthLoggedOut() {
  const loggedIn = document.getElementById('authLoggedIn');
  const form = document.getElementById('userAuthForm');
  const toggle = document.querySelector('.login-toggle');
  const note = document.querySelector('.login-note');
  if (loggedIn) loggedIn.classList.add('hidden');
  if (form) form.classList.remove('hidden');
  if (toggle) toggle.classList.remove('hidden');
  if (note) note.classList.remove('hidden');
  updateAuthMode('customer-login');
  updateSignInButton('Sign in');
}

async function handleCustomerLogin(event) {
  event.preventDefault();
  const contact = document.getElementById('authContact').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  if (!contact || !password) {
    showTemporaryToast('Enter your email and password.');
    return;
  }
  if (!contact.includes('@')) {
    showTemporaryToast('Please enter a valid email address to login.');
    return;
  }
  try {
    const result = await signInWithEmailAndPassword(auth, contact, password);
    showTemporaryToast(`Welcome back, ${result.user.displayName || result.user.email}!`);
    closeLoginModal();
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      showTemporaryToast('Login failed. Check your email and password.');
    } else {
      showTemporaryToast('Login failed. Please try again.');
    }
  }
}

async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const mobile = document.getElementById('signupMobile').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  if (!name || !email || !password) {
    showTemporaryToast('Please fill in name, email, and password.');
    return;
  }
  if (password.length < 6) {
    showTemporaryToast('Password must be at least 6 characters.');
    return;
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    // Save profile (name + mobile) to Firestore
    await setDoc(doc(db, 'customers', result.user.uid), { name, email, mobile: mobile || '' });
    showTemporaryToast(`Account created! Welcome, ${name}!`);
    closeLoginModal();
    ['signupName', 'signupEmail', 'signupMobile', 'signupPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      showTemporaryToast('An account already exists with that email.');
    } else if (err.code === 'auth/invalid-email') {
      showTemporaryToast('Please enter a valid email address.');
    } else {
      showTemporaryToast('Signup failed. Please try again.');
    }
  }
}

async function handleAdminLogin() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  if (!username || !password) {
    showTemporaryToast('Enter admin username and password.');
    return;
  }
  if (username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    showTemporaryToast('Admin login failed. Check username/password.');
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, ADMIN_AUTH_EMAIL, password);
    window.location.href = 'admin.html';
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      showTemporaryToast('Admin account not configured. Set it up in Firebase Console.');
    } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      showTemporaryToast('Admin login failed. Check username/password.');
    } else {
      showTemporaryToast('Admin login failed. Please try again.');
    }
  }
}

async function handleGoogleLogin() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Save profile if new user
    const profileRef = doc(db, 'customers', user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      await setDoc(profileRef, { name: user.displayName || '', email: user.email || '', mobile: '' });
    }
    showTemporaryToast(`Welcome, ${user.displayName || user.email}!`);
    closeLoginModal();
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return;
    showTemporaryToast('Google login failed. Please try again.');
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    showTemporaryToast('You have been logged out.');
  } catch {
    showTemporaryToast('Logout failed.');
  }
}

// ── Mobile nav ────────────────────────────────────────────────────────────────

function setupMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.primary-nav');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.querySelector('.hamburger-icon').setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close nav when a link or button inside is clicked
  nav.addEventListener('click', event => {
    if (event.target.closest('a') || event.target.closest('.nav-mobile-link')) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Nav sign-in button opens login modal
  document.getElementById('signInLinkNav')?.addEventListener('click', openLoginModal);

  // Touch-friendly dropdown: toggle on tap instead of hover
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', () => {
      const menu = document.getElementById('navDropdownMenu');
      if (menu) menu.classList.toggle('dropdown-open');
    });
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  // Show loading state on product grid
  const productGrid = document.getElementById('productGrid');
  if (productGrid) productGrid.innerHTML = '<p class="loading-products" style="color:var(--muted);padding:20px 0;">Loading products...</p>';

  cachedSettings = await applyStoreSettings();

  // Auth state listener
  onAuthStateChanged(auth, user => {
    if (user && user.email !== ADMIN_AUTH_EMAIL) {
      showAuthLoggedIn(user);
    } else if (user && user.email === ADMIN_AUTH_EMAIL) {
      // Admin on storefront — show admin link in modal and update header button
      const loggedIn = document.getElementById('authLoggedIn');
      const nameEl = document.getElementById('authUserName');
      if (nameEl) nameEl.textContent = 'Admin';
      if (loggedIn) loggedIn.classList.remove('hidden');
      document.getElementById('userAuthForm')?.classList.add('hidden');
      document.querySelector('.login-toggle')?.classList.add('hidden');
      document.querySelector('.login-note')?.classList.add('hidden');
      const adminLink = document.getElementById('authAdminLink');
      if (adminLink) adminLink.classList.remove('hidden');
      updateSignInButton('Admin');
    } else {
      showAuthLoggedOut();
    }
  });

  await renderProducts();
  await renderTestimonials();

  // Modal open / close
  document.getElementById('signInLink')?.addEventListener('click', openLoginModal);
  document.getElementById('modalClose')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginModal')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeLoginModal(); // click on backdrop
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLoginModal();
  });

  document.getElementById('userAuthForm')?.addEventListener('submit', handleCustomerLogin);
  document.querySelectorAll('.tab-button').forEach(btn => btn.addEventListener('click', () => updateAuthMode(btn.dataset.mode)));
  document.getElementById('signupButton')?.addEventListener('click', handleSignup);
  document.getElementById('adminLoginButton')?.addEventListener('click', handleAdminLogin);
  document.getElementById('googleLoginButton')?.addEventListener('click', handleGoogleLogin);
  document.getElementById('otpLoginButton')?.addEventListener('click', () => showTemporaryToast('Phone OTP requires Firebase billing setup. Use email login instead.'));
  document.getElementById('authLogoutButton')?.addEventListener('click', handleLogout);

  setupStorefrontFilters();
  setupMobileNav();
}

init();
