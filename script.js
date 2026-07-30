const defaultProducts = [
  {
    id: 'watch-sport-01',
    title: 'Signature Sport Watch',
    category: 'Watches',
    audience: 'Men',
    description: 'Sleek sport watch with premium leather strap and advanced features.',
    price: 2499,
    marketPrice: 3999,
    qty: 18,
    image: 'https://via.placeholder.com/600x600?text=Sport+Watch'
  },
  {
    id: 'sneaker-air-02',
    title: 'Urban Runner Sneakers',
    category: 'Footwear',
    audience: 'Men',
    description: 'Comfortable and stylish sneakers crafted for city life.',
    price: 1799,
    marketPrice: 2999,
    qty: 32,
    image: 'https://via.placeholder.com/600x600?text=Urban+Sneakers'
  },
  {
    id: 'formal-shirt-03',
    title: 'Elegant Formal Shirt',
    category: 'Clothing',
    description: 'Tailored formal shirt in premium cotton for every office meeting.',
    price: 899,
    marketPrice: 1599,
    qty: 45,
    image: 'https://via.placeholder.com/600x600?text=Formal+Shirt'
  },
  {
    id: 'earbuds-pro-04',
    title: 'Noise-Canceling Earbuds',
    category: 'Electronics',
    description: 'Wireless earbuds with long battery life and crisp audio.',
    price: 2199,
    marketPrice: 3499,
    qty: 27,
    image: 'https://via.placeholder.com/600x600?text=Earbuds'
  }
];

const storageKey = 'apniDukanProducts';
const settingsKey = 'apniDukanSettings';
const testimonialsKey = 'apniDukanTestimonials';
const adminCredentialsKey = 'apniDukanAdminCredentials';
const authUsersKey = 'apniDukanCustomers';

const defaultTestimonials = [
  {
    id: 'review-priya',
    name: 'Priya',
    location: 'Bengaluru',
    quote: 'Amazing service and premium quality products. The delivery was fast, and the premium packaging made it feel special.',
    rating: 5,
    avatar: 'https://via.placeholder.com/80?text=P'
  },
  {
    id: 'review-aarav',
    status: 'approved',
    name: 'Aarav',
    location: 'Chennai',
    quote: 'WhatsApp ordering was quick and the packaging felt luxurious. I appreciate the personal service and smooth checkout.',
    rating: 5,
    avatar: 'https://via.placeholder.com/80?text=A'
  },
  {
    id: 'review-meera',
    status: 'approved',
    name: 'Meera',
    location: 'Pune',
    quote: 'The style curation is top-notch. Highly recommended—each product feels premium, and the service kept me informed at every step.',
    rating: 5,
    avatar: 'https://via.placeholder.com/80?text=M'
  }
];

function loadSettings() {
  const saved = localStorage.getItem(settingsKey);
  const defaults = {
    whatsappNumber: '919999999999',
    supportEmail: 'support@apnidukan.com',
    supportPhone: '+91 99999 99999',
    instagramUrl: 'https://instagram.com',
    storeTagline: 'Luxury curated for every style',
    themePack: 'default',
    accentColor: '#d4af37',
    headerColor: '#05070f',
    surfaceColor: 'rgba(255,255,255,.05)',
    backgroundColor: '#050505',
    logoData: '',
    brandTextStyle: 'classic'
  };
  if (!saved) {
    localStorage.setItem(settingsKey, JSON.stringify(defaults));
    return defaults;
  }
  return { ...defaults, ...JSON.parse(saved) };
}

function loadProducts() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(saved);
}

function loadTestimonials() {
  const saved = localStorage.getItem(testimonialsKey);
  if (!saved) {
    const defaults = defaultTestimonials.map(review => ({ status: review.status || 'approved', ...review }));
    localStorage.setItem(testimonialsKey, JSON.stringify(defaults));
    return defaults.filter(review => review.status === 'approved');
  }
  return JSON.parse(saved).map(review => ({ status: review.status || 'approved', ...review })).filter(review => review.status === 'approved');
}

function getAdminCredentials() {
  const saved = localStorage.getItem(adminCredentialsKey);
  const defaults = { username: 'madaag1', password: '9710800046' };
  if (!saved) {
    localStorage.setItem(adminCredentialsKey, JSON.stringify(defaults));
    return defaults;
  }
  return { ...defaults, ...JSON.parse(saved) };
}

function getAuthUsers() {
  const saved = localStorage.getItem(authUsersKey);
  if (!saved) {
    localStorage.setItem(authUsersKey, JSON.stringify([]));
    return [];
  }
  return JSON.parse(saved);
}

function saveAuthUsers(users) {
  localStorage.setItem(authUsersKey, JSON.stringify(users));
}

function findAuthUser(contact) {
  const users = getAuthUsers();
  return users.find(user => user.email === contact || user.mobile === contact);
}

function renderTestimonials() {
  const rotator = document.getElementById('testimonialRotator');
  const indicators = document.getElementById('testimonialIndicators');
  if (!rotator) return;
  const testimonials = loadTestimonials();
  if (!testimonials.length) {
    rotator.innerHTML = '<p style="color: var(--muted);">No customer reviews available yet.</p>';
    if (indicators) indicators.innerHTML = '';
    return;
  }
  rotator.innerHTML = testimonials.map((item, index) => {
    const stars = '★★★★★'.slice(0, item.rating) + '☆☆☆☆☆'.slice(0, 5 - item.rating);
    return `
      <article class="testimonial-item${index === 0 ? ' active' : ''}" data-id="${item.id}">
        <div class="testimonial-top">
          <img class="testimonial-avatar" src="${item.avatar || 'https://via.placeholder.com/80?text=' + item.name.charAt(0)}" alt="${item.name} portrait" />
          <div>
            <div class="testimonial-rating">${stars}</div>
            <span class="testimonial-name">${item.name}, ${item.location}</span>
          </div>
        </div>
        <p>${item.quote}</p>
        ${item.image ? `<img class="testimonial-image" src="${item.image}" alt="Customer image from ${item.name}" />` : ''}
      </article>
    `;
  }).join('');
  if (indicators) {
    indicators.innerHTML = testimonials.map((_, index) => `
      <span class="testimonial-indicator${index === 0 ? ' active' : ''}" data-index="${index}"></span>
    `).join('');
  }
}

function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  const products = loadProducts();
  productGrid.innerHTML = products.map(product => {
    const discount = product.marketPrice > product.price ? Math.round(100 - (product.price / product.marketPrice) * 100) : 0;
    return `
      <article class="product-card">
        <img src="${product.image}" alt="${product.title}" />
        <div class="product-info">
          <div>
            <p class="customer-tag">${product.category}</p>
            <h3>${product.title}</h3>
            <p>${product.description}</p>
          </div>
          <div>
            <div class="product-pricing">
              <span class="product-price">₹${product.price.toLocaleString()}</span>
              <span class="product-market">₹${product.marketPrice.toLocaleString()}</span>
            </div>
            <div class="product-actions">
              <a class="button button-primary" href="${createWhatsAppUrl(product)}" target="_blank">Order on WhatsApp</a>
              <span>${product.qty} in stock</span>
            </div>
            ${discount ? `<p style="margin-top:12px;color:var(--accent);">Save ${discount}%</p>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function createWhatsAppUrl(product) {
  const settings = loadSettings();
  const phone = settings.whatsappNumber.replace(/[\s+]/g, '');
  const text = encodeURIComponent(`Hello Apni Dukan, I would like to order ${product.title} priced at ₹${product.price}. Please help me proceed.`);
  return `https://wa.me/${phone}?text=${text}`;
}

function applyStoreSettings() {
  const settings = loadSettings();
  applyTheme(settings);
  applyLogo(settings);
  applyBrandTextStyle(settings.brandTextStyle);

  const heroAction = document.querySelector('.hero-actions .button-secondary');
  if (heroAction) {
    heroAction.href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Apni Dukan, I would like to order a product.')}`;
  }
  const supportButton = document.querySelector('.support-section .button-secondary');
  if (supportButton) {
    supportButton.href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Apni Dukan, I need support.')}`;
  }
  const footerLinks = document.querySelectorAll('.social-links a');
  if (footerLinks.length >= 2) {
    footerLinks[0].href = settings.instagramUrl;
    footerLinks[1].href = `https://wa.me/${settings.whatsappNumber}`;
  }
  const headerInstagram = document.getElementById('headerInstagram');
  const headerWhatsApp = document.getElementById('headerWhatsApp');
  const floatInstagram = document.getElementById('floatInstagram');
  const floatWhatsApp = document.getElementById('floatWhatsApp');

  if (headerInstagram) {
    headerInstagram.href = settings.instagramUrl;
  }
  if (headerWhatsApp) {
    headerWhatsApp.href = `https://wa.me/${settings.whatsappNumber}`;
  }
  if (floatInstagram) {
    floatInstagram.href = settings.instagramUrl;
  }
  if (floatWhatsApp) {
    floatWhatsApp.href = `https://wa.me/${settings.whatsappNumber}`;
  }
  const emailText = document.querySelector('.support-panel p:nth-of-type(2)');
  if (emailText) emailText.textContent = `Email: ${settings.supportEmail}`;
  const phoneText = document.querySelector('.support-panel p:nth-of-type(3)');
  if (phoneText) phoneText.textContent = `Phone: ${settings.supportPhone}`;
  const tagline = document.querySelector('.hero-copy p');
  if (tagline) tagline.textContent = settings.storeTagline;
}

function applyTheme(settings) {
  const classList = document.body.classList;
  classList.remove('theme-default', 'theme-midnight', 'theme-ivory', 'theme-noir');
  classList.add(`theme-${settings.themePack || 'default'}`);
  if (settings.accentColor) {
    document.body.style.setProperty('--accent', settings.accentColor);
  }
  if (settings.headerColor) {
    document.body.style.setProperty('--header-bg', settings.headerColor);
  }
  if (settings.surfaceColor) {
    document.body.style.setProperty('--surface', settings.surfaceColor);
  }
  if (settings.backgroundColor) {
    document.body.style.setProperty('--bg', settings.backgroundColor);
  }
}

function applyLogo(settings) {
  const logoContainer = document.getElementById('logoContainer');
  if (!logoContainer) return;
  const logoSrc = settings.logoData;
  if (logoSrc) {
    logoContainer.innerHTML = `<img class="site-logo" src="${logoSrc}" alt="Apni Dukan logo" />`;
  } else {
    logoContainer.innerHTML = `
      <svg viewBox="0 0 160 120" class="logo-svg" aria-hidden="true">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f4d86c" />
            <stop offset="100%" stop-color="#d4af37" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </feMerge>
        </defs>
        <g fill="none" stroke="url(#goldGrad)" stroke-width="10" filter="url(#glow)">
          <path d="M24 102 L24 18 L74 18" />
          <path d="M74 18 L100 18 L100 102" />
          <path d="M100 18 A32 32 0 0 1 132 50 L132 70 A32 32 0 0 1 100 102" />
        </g>
        <circle cx="116" cy="55" r="20" fill="url(#goldGrad)" opacity="0.08" />
        <circle cx="116" cy="55" r="18" fill="none" stroke="url(#goldGrad)" stroke-width="6" />
        <line x1="116" y1="55" x2="116" y2="41" stroke="url(#goldGrad)" stroke-width="4" />
        <line x1="116" y1="55" x2="130" y2="55" stroke="url(#goldGrad)" stroke-width="4" />
        <path d="M28 86 C36 78, 48 74, 58 78 C68 82, 80 92, 102 92" stroke="url(#goldGrad)" stroke-width="6" fill="none" />
        <path d="M30 86 L40 74 L56 74 L64 86" stroke="url(#goldGrad)" stroke-width="5" fill="none" />
      </svg>
    `;
  }
}

function applyBrandTextStyle(style) {
  const logoTitle = document.querySelector('.logo-copy strong');
  if (!logoTitle) return;
  logoTitle.classList.remove('brand-text-classic', 'brand-text-glam', 'brand-text-modern');
  if (style === 'glam') {
    logoTitle.classList.add('brand-text-glam');
  } else if (style === 'modern') {
    logoTitle.classList.add('brand-text-modern');
  } else {
    logoTitle.classList.add('brand-text-classic');
  }
}

function getFilteredProducts() {
  const products = loadProducts();
  const searchValue = document.getElementById('productSearch')?.value.trim().toLowerCase() || '';
  const selectedAudience = document.getElementById('filterAudience')?.value || '';
  const selectedCategory = document.getElementById('filterCategory')?.value || '';
  const selectedBrand = document.getElementById('filterBrand')?.value.trim().toLowerCase() || '';
  const selectedSize = document.getElementById('filterSize')?.value.trim().toLowerCase() || '';
  const minPrice = Number(document.getElementById('filterMinPrice')?.value || 0);
  const maxPrice = Number(document.getElementById('filterMaxPrice')?.value || 0);

  return products.filter(product => {
    const matchesSearch = !searchValue || [product.title, product.description, product.category, product.brand, product.size, product.audience].some(field => String(field || '').toLowerCase().includes(searchValue));
    const matchesAudience = !selectedAudience || String(product.audience || '').toLowerCase() === selectedAudience.toLowerCase();
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesBrand = !selectedBrand || String(product.brand || '').toLowerCase().includes(selectedBrand);
    const matchesSize = !selectedSize || String(product.size || '').toLowerCase().includes(selectedSize);
    const matchesMinPrice = !minPrice || product.price >= minPrice;
    const matchesMaxPrice = !maxPrice || product.price <= maxPrice;
    return matchesSearch && matchesAudience && matchesCategory && matchesBrand && matchesSize && matchesMinPrice && matchesMaxPrice;
  });
}

function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  const products = getFilteredProducts();
  if (!products.length) {
    productGrid.innerHTML = '<p style="color: var(--muted);">No products match the selected filters. Clear filters to see all items.</p>';
    return;
  }

  productGrid.innerHTML = products.map(product => {
    const discount = product.marketPrice > product.price ? Math.round(100 - (product.price / product.marketPrice) * 100) : 0;
    return `
      <article class="product-card">
        <img src="${product.image}" alt="${product.title}" />
        <div class="product-info">
          <div>
            <p class="customer-tag">${product.category}</p>
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            ${product.brand ? `<p class="product-detail">Brand: ${product.brand}</p>` : ''}
            ${product.size ? `<p class="product-detail">Size: ${product.size}</p>` : ''}
          </div>
          <div>
            <div class="product-pricing">
              <span class="product-price">₹${product.price.toLocaleString()}</span>
              <span class="product-market">₹${product.marketPrice.toLocaleString()}</span>
            </div>
            <div class="product-actions">
              <a class="button button-primary" href="${createWhatsAppUrl(product)}" target="_blank">Order on WhatsApp</a>
              <span>${product.qty} in stock</span>
            </div>
            ${discount ? `<p style="margin-top:12px;color:var(--accent);">Save ${discount}%</p>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function updateFiltersFromAction(filterType, filterValue, audienceValue) {
  if (filterType === 'category') {
    const categorySelect = document.getElementById('filterCategory');
    if (categorySelect) categorySelect.value = filterValue;
  }
  if (filterType === 'audience') {
    const audienceSelect = document.getElementById('filterAudience');
    if (audienceSelect) audienceSelect.value = filterValue;
  }
  if (audienceValue) {
    const audienceSelect = document.getElementById('filterAudience');
    if (audienceSelect) audienceSelect.value = audienceValue;
  }
  renderProducts();
  const collectionsSection = document.getElementById('collections');
  if (collectionsSection) {
    collectionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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
    <a class="dropdown-item" href="#collections" data-role="subcat" data-category="${item}" data-audience="${audience}">${item}</a>
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
  const categoryButtons = document.querySelectorAll('.category-action');
  categoryButtons.forEach(button => {
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
      if (role === 'audience') {
        showAudienceSubmenu(target.dataset.audience);
        return;
      }
      if (role === 'subcat') {
        const category = target.dataset.category;
        const audience = target.dataset.audience;
        updateFiltersFromAction('category', category, audience);
        hideAudienceSubmenu();
        return;
      }
      const filterType = target.dataset.filterType;
      const filterValue = target.dataset.filter;
      if (!filterType || !filterValue) return;
      updateFiltersFromAction(filterType, filterValue);
    });
  }

  const dropdownBack = document.getElementById('dropdownBack');
  if (dropdownBack) {
    dropdownBack.addEventListener('click', () => {
      hideAudienceSubmenu();
    });
  }


  const searchForm = document.querySelector('.search-bar');
  if (searchForm) {
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      renderProducts();
    });
  }

  const filterInputs = ['productSearch', 'filterCategory', 'filterBrand', 'filterSize', 'filterMinPrice', 'filterMaxPrice'];
  filterInputs.forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('input', () => renderProducts());
    }
  });

  const clearFilters = document.getElementById('clearFilters');
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      document.getElementById('productSearch').value = '';
      document.getElementById('filterCategory').value = '';
      document.getElementById('filterBrand').value = '';
      document.getElementById('filterSize').value = '';
      document.getElementById('filterMinPrice').value = '';
      document.getElementById('filterMaxPrice').value = '';
      renderProducts();
    });
  }
}

function rotateTestimonials() {
  const rotator = document.getElementById('testimonialRotator');
  if (!rotator) return;
  const items = Array.from(rotator.querySelectorAll('.testimonial-item'));
  const indicators = Array.from(document.querySelectorAll('.testimonial-indicator'));
  if (!items.length) return;
  let currentIndex = 0;

  const showItem = index => {
    items.forEach((item, itemIndex) => {
      item.classList.toggle('active', itemIndex === index);
    });
    indicators.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  showItem(currentIndex);
  indicators.forEach(dot => {
    dot.addEventListener('click', () => {
      currentIndex = Number(dot.dataset.index);
      showItem(currentIndex);
    });
  });
  setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    showItem(currentIndex);
  }, 4000);
}

function showTemporaryToast(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function updateAuthMode(mode) {
  const tabs = document.querySelectorAll('.tab-button');
  const rows = document.querySelectorAll('.form-row');
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
  rows.forEach(row => row.classList.toggle('hidden', row.dataset.mode !== mode));
}

function handleCustomerLogin(event) {
  event.preventDefault();
  const contact = document.getElementById('authContact').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  if (!contact || !password) {
    showTemporaryToast('Enter your email or mobile and password.');
    return;
  }
  const user = findAuthUser(contact);
  if (user && user.password === password) {
    showTemporaryToast(`Welcome back, ${user.name || 'customer'}!`);
    return;
  }
  showTemporaryToast('Login failed. Please check your credentials or sign up.');
}

function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const mobile = document.getElementById('signupMobile').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!name || !email || !mobile || !password) {
    showTemporaryToast('Complete all signup fields to create your account.');
    return;
  }
  const users = getAuthUsers();
  if (findAuthUser(email) || findAuthUser(mobile)) {
    showTemporaryToast('An account already exists with that email or mobile.');
    return;
  }
  users.unshift({ id: `user-${Date.now()}`, name, email, mobile, password });
  saveAuthUsers(users);
  showTemporaryToast('Account created successfully. You can now login.');
  document.getElementById('signupName').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupMobile').value = '';
  document.getElementById('signupPassword').value = '';
}

function handleAdminLogin() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const credentials = getAdminCredentials();
  if (!username || !password) {
    showTemporaryToast('Enter admin username and password.');
    return;
  }
  if (username === credentials.username && password === credentials.password) {
    window.location.href = 'admin.html';
    return;
  }
  showTemporaryToast('Admin login failed. Check username/password.');
}

function handleOtpLogin() {
  const contact = document.getElementById('authContact').value.trim();
  if (!contact) {
    showTemporaryToast('Enter email or mobile to receive an OTP.');
    return;
  }
  const user = findAuthUser(contact);
  if (!user) {
    showTemporaryToast('No user found for that email or mobile. Please sign up first.');
    return;
  }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const entered = prompt(`Enter the OTP sent to ${contact}. (Simulated OTP: ${otp})`);
  if (entered === otp) {
    showTemporaryToast(`OTP verified. Welcome back, ${user.name}!`);
  } else {
    showTemporaryToast('OTP verification failed. Try again.');
  }
}

function handleGoogleLogin() {
  showTemporaryToast('Google login simulated. Welcome to Apni Dukan!');
}

function init() {
  renderProducts();
  renderTestimonials();
  applyStoreSettings();
  rotateTestimonials();

  const authForm = document.getElementById('userAuthForm');
  if (authForm) {
    authForm.addEventListener('submit', handleCustomerLogin);
  }

  setupStorefrontFilters();

  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => updateAuthMode(button.dataset.mode));
  });

  const signupButton = document.getElementById('signupButton');
  if (signupButton) {
    signupButton.addEventListener('click', handleSignup);
  }

  const adminLoginButton = document.getElementById('adminLoginButton');
  if (adminLoginButton) {
    adminLoginButton.addEventListener('click', handleAdminLogin);
  }

  const otpLoginButton = document.getElementById('otpLoginButton');
  if (otpLoginButton) {
    otpLoginButton.addEventListener('click', handleOtpLogin);
  }

  const googleLoginButton = document.getElementById('googleLoginButton');
  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', handleGoogleLogin);
  }
}

init();
