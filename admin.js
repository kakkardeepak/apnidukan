const adminStorageKey = 'apniDukanProducts';
const adminSettingsKey = 'apniDukanSettings';
const adminCouponsKey = 'apniDukanCoupons';
const adminTestimonialsKey = 'apniDukanTestimonials';
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
    name: 'Aarav',
    location: 'Chennai',
    quote: 'WhatsApp ordering was quick and the packaging felt luxurious. I appreciate the personal service and smooth checkout.',
    rating: 5,
    avatar: 'https://via.placeholder.com/80?text=A'
  },
  {
    id: 'review-meera',
    name: 'Meera',
    location: 'Pune',
    quote: 'The style curation is top-notch. Highly recommended—each product feels premium, and the service kept me informed at every step.',
    rating: 5,
    avatar: 'https://via.placeholder.com/80?text=M'
  }
];

const defaultProducts = [
  {
    id: 'watch-sport-01',
    title: 'Signature Sport Watch',
    category: 'Watches',
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

function getProducts() {
  const saved = localStorage.getItem(adminStorageKey);
  if (!saved) {
    localStorage.setItem(adminStorageKey, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(saved);
}

function getSettings() {
  const saved = localStorage.getItem(adminSettingsKey);
  const defaultSettings = {
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
    welcomeEnabled: false,
    welcomeMessage: '',
    welcomeMedia: '',
    brandTextStyle: 'classic'
  };
  if (!saved) {
    localStorage.setItem(adminSettingsKey, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  return { ...defaultSettings, ...JSON.parse(saved) };
}

function getCoupons() {
  const saved = localStorage.getItem(adminCouponsKey);
  if (!saved) {
    localStorage.setItem(adminCouponsKey, JSON.stringify([]));
    return [];
  }
  return JSON.parse(saved);
}

function saveProducts(products) {
  localStorage.setItem(adminStorageKey, JSON.stringify(products));
}

function saveSettings(settings) {
  localStorage.setItem(adminSettingsKey, JSON.stringify(settings));
}

function saveCoupons(coupons) {
  localStorage.setItem(adminCouponsKey, JSON.stringify(coupons));
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

function saveAdminCredentials(credentials) {
  localStorage.setItem(adminCredentialsKey, JSON.stringify(credentials));
}

let currentReviewFilter = 'all';

function getTestimonials() {
  const saved = localStorage.getItem(adminTestimonialsKey);
  const defaults = defaultTestimonials.map(review => ({ ...review, status: review.status || 'approved' }));
  if (!saved) {
    localStorage.setItem(adminTestimonialsKey, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(saved).map(review => ({ status: review.status || 'pending', ...review }));
}

function saveTestimonials(testimonials) {
  localStorage.setItem(adminTestimonialsKey, JSON.stringify(testimonials));
}

function renderTestimonialList(filter = 'all') {
  const list = document.getElementById('testimonialList');
  const testimonials = getTestimonials();
  if (!list) return;
  const filtered = filter === 'all' ? testimonials : testimonials.filter(review => review.status === filter);
  if (!filtered.length) {
    list.innerHTML = '<p style="color: var(--muted);">No customer reviews match this filter.</p>';
    return;
  }
  list.innerHTML = filtered.map(review => `
    <div class="product-row review-row review-status-${review.status}">
      <div>
        <div class="review-preview-top">
          <h3>${review.name} • ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</h3>
          <span>${review.location}</span>
          <span class="review-status-badge ${review.status}">${review.status}</span>
        </div>
        <p>${review.quote}</p>
        ${review.image ? `<img class="review-preview-image" src="${review.image}" alt="Review image for ${review.name}" />` : ''}
      </div>
      <div class="product-actions">
        <button class="button button-secondary" data-action="approve-review" data-id="${review.id}">Approve</button>
        <button class="button button-secondary" data-action="reject-review" data-id="${review.id}">Reject</button>
        <button class="button button-secondary" data-action="edit-review" data-id="${review.id}">Edit</button>
        <button class="button button-ghost" data-action="delete-review" data-id="${review.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function clearTestimonialForm() {
  document.getElementById('testimonialName').value = '';
  document.getElementById('testimonialLocation').value = '';
  document.getElementById('testimonialQuote').value = '';
  document.getElementById('testimonialRating').value = '5';
  document.getElementById('testimonialAvatarUpload').value = '';
  document.getElementById('testimonialImageUpload').value = '';
  document.getElementById('testimonialForm').dataset.editing = '';
}

function renderProductList() {
  const list = document.getElementById('productList');
  const products = getProducts();
  if (!list) return;
  list.innerHTML = products.map(product => `
    <div class="product-row">
      <div>
        <h3>${product.title}</h3>
        <p>${product.category} · ₹${product.price.toLocaleString()} · ₹${product.marketPrice.toLocaleString()} · Qty: ${product.qty}</p>
      </div>
      <div class="product-actions">
        <button class="button button-secondary" data-action="edit" data-id="${product.id}">Edit</button>
        <button class="button button-ghost" data-action="delete" data-id="${product.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderCoupons() {
  const list = document.getElementById('couponList');
  const coupons = getCoupons();
  if (!coupons.length) {
    list.innerHTML = '<p style="color: var(--muted);">No coupons created yet. Generate one to share with customers.</p>';
    return;
  }
  list.innerHTML = coupons.map(coupon => `
    <div class="coupon-card">
      <div>
        <span>${coupon.code}</span>
        <p>${coupon.discount}% off</p>
      </div>
      <button class="button button-ghost" data-coupon="${coupon.code}">Remove</button>
    </div>
  `).join('');
}

function updateLogoPreview(src) {
  const preview = document.getElementById('logoPreview');
  if (!preview) return;
  preview.src = src || '';
  preview.dataset.source = src ? 'file' : '';
  preview.style.display = src ? 'block' : 'none';
}

function updateWelcomePreview(src) {
  const welcomeMediaPreview = document.getElementById('welcomeMediaPreview');
  if (!welcomeMediaPreview) return;
  welcomeMediaPreview.dataset.media = src || '';
  welcomeMediaPreview.innerHTML = '';
  if (!src) return;
  if (src.startsWith('data:video')) {
    welcomeMediaPreview.innerHTML = `<video controls src="${src}"></video>`;
  } else {
    welcomeMediaPreview.innerHTML = `<img src="${src}" alt="Welcome media preview" />`;
  }
}

function populateSettings() {
  const settings = getSettings();
  const adminCred = getAdminCredentials();
  document.getElementById('whatsappNumber').value = settings.whatsappNumber;
  document.getElementById('supportEmail').value = settings.supportEmail;
  document.getElementById('supportPhone').value = settings.supportPhone;
  document.getElementById('instagramUrl').value = settings.instagramUrl;
  document.getElementById('themePack').value = settings.themePack;
  document.getElementById('accentColor').value = settings.accentColor;
  document.getElementById('headerColor').value = settings.headerColor || '#05070f';
  document.getElementById('surfaceColor').value = settings.surfaceColor || 'rgba(255,255,255,.05)';
  document.getElementById('backgroundColor').value = settings.backgroundColor || '#050505';
  document.getElementById('welcomeEnabled').checked = settings.welcomeEnabled || false;
  document.getElementById('welcomeMessage').value = settings.welcomeMessage || '';
  document.getElementById('storeTagline').value = settings.storeTagline;
  document.getElementById('brandTextStyle').value = settings.brandTextStyle || 'classic';
  document.getElementById('newAdminUsername').value = adminCred.username;
  updateLogoPreview(settings.logoData || '');
  updateWelcomePreview(settings.welcomeMedia || '');
  applyAdminTheme(settings);
}

function applyAdminTheme(settings) {
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

function clearProductForm() {
  document.getElementById('productTitle').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productAudience').value = 'Men';
  document.getElementById('productCategory').value = 'Watches';
  document.getElementById('productBrand').value = '';
  document.getElementById('productSize').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productMarketPrice').value = '';
  document.getElementById('productQty').value = '';
  document.getElementById('productImage').value = '';
  document.getElementById('productImageUpload').value = '';
  document.getElementById('couponCode').value = '';
  document.getElementById('couponDiscount').value = '';
  document.getElementById('productForm').dataset.editing = '';
}

function showToast(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function readFileAsDataUrl(input) {
  return new Promise(resolve => {
    const file = input.files && input.files[0];
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.readAsDataURL(file);
  });
}

function setupEvents() {
  document.getElementById('saveSettings').addEventListener('click', () => {
    const logoPreview = document.getElementById('logoPreview');
    const welcomePreview = document.getElementById('welcomeMediaPreview');
    const logoDataValue = logoPreview && logoPreview.dataset.source === 'file' ? logoPreview.src : '';
    const welcomeMediaValue = welcomePreview && welcomePreview.dataset.media ? welcomePreview.dataset.media : '';
    const settings = {
      whatsappNumber: document.getElementById('whatsappNumber').value.trim() || '919999999999',
      supportEmail: document.getElementById('supportEmail').value.trim() || 'support@apnidukan.com',
      supportPhone: document.getElementById('supportPhone').value.trim() || '+91 99999 99999',
      instagramUrl: document.getElementById('instagramUrl').value.trim() || 'https://instagram.com',
      storeTagline: document.getElementById('storeTagline').value.trim() || 'Luxury curated for every style',
      themePack: document.getElementById('themePack').value || 'default',
      accentColor: document.getElementById('accentColor').value || '#d4af37',
      headerColor: document.getElementById('headerColor').value || '#05070f',
      surfaceColor: document.getElementById('surfaceColor').value || 'rgba(255,255,255,.05)',
      backgroundColor: document.getElementById('backgroundColor').value || '#050505',
      logoData: logoDataValue,
      welcomeEnabled: document.getElementById('welcomeEnabled').checked,
      welcomeMessage: document.getElementById('welcomeMessage').value.trim(),
      welcomeMedia: welcomeMediaValue,
      brandTextStyle: document.getElementById('brandTextStyle').value || 'classic'
    };
    saveSettings(settings);
    applyAdminTheme(settings);
    showToast('Store settings saved.');
  });

  document.getElementById('logoUpload').addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    const preview = document.getElementById('logoPreview');
    if (!file || !preview) return;
    const reader = new FileReader();
    reader.onload = () => {
      preview.dataset.source = 'file';
      preview.src = reader.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('saveAdminAccount').addEventListener('click', () => {
    const currentPassword = document.getElementById('currentAdminPassword').value.trim();
    const newUsername = document.getElementById('newAdminUsername').value.trim();
    const newPassword = document.getElementById('newAdminPassword').value.trim();
    const credentials = getAdminCredentials();
    if (!currentPassword) {
      showToast('Enter your current admin password to update credentials.');
      return;
    }
    if (currentPassword !== credentials.password) {
      showToast('Current admin password is incorrect.');
      return;
    }
    if (!newUsername && !newPassword) {
      showToast('Enter a new admin username or password.');
      return;
    }
    const updated = {
      username: newUsername || credentials.username,
      password: newPassword || credentials.password
    };
    saveAdminCredentials(updated);
    document.getElementById('currentAdminPassword').value = '';
    document.getElementById('newAdminPassword').value = '';
    showToast('Admin credentials updated successfully.');
  });

  const productImageUpload = document.getElementById('productImageUpload');
  const avatarUploadInput = document.getElementById('testimonialAvatarUpload');
  const imageUploadInput = document.getElementById('testimonialImageUpload');
  const welcomeMediaUpload = document.getElementById('welcomeMediaUpload');

  document.getElementById('saveProduct').addEventListener('click', async () => {
    const title = document.getElementById('productTitle').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const audience = document.getElementById('productAudience').value;
    const category = document.getElementById('productCategory').value;
    const price = Number(document.getElementById('productPrice').value);
    const marketPrice = Number(document.getElementById('productMarketPrice').value);
    const qty = Number(document.getElementById('productQty').value);
    const brand = document.getElementById('productBrand').value.trim();
    const size = document.getElementById('productSize').value.trim();
    const imageUrl = document.getElementById('productImage').value.trim();
    const imageFileData = await readFileAsDataUrl(productImageUpload);
    if (!title || !price || !marketPrice || !qty) {
      showToast('Please complete all required product fields.');
      return;
    }
    const products = getProducts();
    const editingId = document.getElementById('productForm').dataset.editing;
    const existingProduct = products.find(product => product.id === editingId);
    const image = imageFileData || imageUrl || (existingProduct ? existingProduct.image : 'https://via.placeholder.com/600x600?text=Product');
    if (editingId) {
      const updated = products.map(product => product.id === editingId ? {
        ...product,
        title,
        audience,
        category,
        brand,
        size,
        description,
        price,
        marketPrice,
        qty,
        image
      } : product);
      saveProducts(updated);
      showToast('Product updated successfully.');
    } else {
      const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      products.unshift({ id, title, audience, category, brand, size, description, price, marketPrice, qty, image });
      saveProducts(products);
      showToast('Product added successfully.');
    }
    renderProductList();
    clearProductForm();
  });

  document.getElementById('clearProduct').addEventListener('click', () => {
    clearProductForm();
  });

  document.getElementById('couponForm').addEventListener('submit', event => {
    event.preventDefault();
  });

  document.getElementById('generateCoupon').addEventListener('click', () => {
    const codeInput = document.getElementById('couponCode').value.trim().toUpperCase();
    const discount = Number(document.getElementById('couponDiscount').value);
    if (!codeInput || !discount || discount <= 0) {
      showToast('Enter a valid coupon code and discount.');
      return;
    }
    const coupons = getCoupons();
    coupons.unshift({ code: codeInput, discount });
    saveCoupons(coupons);
    renderCoupons();
    document.getElementById('couponCode').value = '';
    document.getElementById('couponDiscount').value = '';
    showToast('Coupon generated successfully.');
  });

  welcomeMediaUpload.addEventListener('change', async event => {
    const fileData = await readFileAsDataUrl(event.target);
    updateWelcomePreview(fileData);
  });

  document.getElementById('saveTestimonial').addEventListener('click', async () => {
    const name = document.getElementById('testimonialName').value.trim();
    const location = document.getElementById('testimonialLocation').value.trim();
    const quote = document.getElementById('testimonialQuote').value.trim();
    const rating = Number(document.getElementById('testimonialRating').value) || 5;
    const avatarFileData = await readFileAsDataUrl(avatarUploadInput);
    const imageFileData = await readFileAsDataUrl(imageUploadInput);
    if (!name || !location || !quote) {
      showToast('Please fill in name, location and review text.');
      return;
    }
    const testimonials = getTestimonials();
    const editingId = document.getElementById('testimonialForm').dataset.editing;
    const existingReview = testimonials.find(review => review.id === editingId);
    const avatar = avatarFileData || (existingReview ? existingReview.avatar : `https://via.placeholder.com/80?text=${name ? name.charAt(0) : 'U'}`);
    const image = imageFileData || (existingReview ? existingReview.image : '');
    if (editingId) {
      const updated = testimonials.map(review => review.id === editingId ? {
        ...review,
        name,
        location,
        quote,
        rating,
        avatar,
        image,
        status: review.status || 'pending'
      } : review);
      saveTestimonials(updated);
      showToast('Review updated successfully.');
    } else {
      const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      testimonials.unshift({ id, name, location, quote, rating, avatar, image, status: 'pending' });
      saveTestimonials(testimonials);
      showToast('Review added successfully and is pending approval.');
    }
    renderTestimonialList(currentReviewFilter);
    clearTestimonialForm();
  });

  document.getElementById('clearTestimonial').addEventListener('click', () => {
    clearTestimonialForm();
  });

  document.getElementById('testimonialList').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    const testimonials = getTestimonials();
    if (action === 'delete-review') {
      const updated = testimonials.filter(review => review.id !== id);
      saveTestimonials(updated);
      renderTestimonialList(currentReviewFilter);
      showToast('Review deleted.');
      return;
    }
    if (action === 'approve-review' || action === 'reject-review') {
      const updated = testimonials.map(review => review.id === id ? {
        ...review,
        status: action === 'approve-review' ? 'approved' : 'rejected'
      } : review);
      saveTestimonials(updated);
      renderTestimonialList(currentReviewFilter);
      showToast(`Review ${action === 'approve-review' ? 'approved' : 'rejected'}.`);
      return;
    }
    if (action === 'edit-review') {
      const review = testimonials.find(item => item.id === id);
      if (!review) return;
      document.getElementById('testimonialName').value = review.name;
      document.getElementById('testimonialLocation').value = review.location;
      document.getElementById('testimonialQuote').value = review.quote;
      document.getElementById('testimonialRating').value = review.rating.toString();
      document.getElementById('testimonialAvatarUpload').value = '';
      document.getElementById('testimonialImageUpload').value = '';
      document.getElementById('testimonialForm').dataset.editing = id;
      showToast('Editing review. Save to apply changes.');
    }
  });

  document.getElementById('showAllReviews').addEventListener('click', () => {
    currentReviewFilter = 'all';
    renderTestimonialList('all');
  });
  document.getElementById('showApprovedReviews').addEventListener('click', () => {
    currentReviewFilter = 'approved';
    renderTestimonialList('approved');
  });
  document.getElementById('showPendingReviews').addEventListener('click', () => {
    currentReviewFilter = 'pending';
    renderTestimonialList('pending');
  });
  document.getElementById('showRejectedReviews').addEventListener('click', () => {
    currentReviewFilter = 'rejected';
    renderTestimonialList('rejected');
  });

  document.getElementById('productList').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === 'delete') {
      const products = getProducts().filter(product => product.id !== id);
      saveProducts(products);
      renderProductList();
      showToast('Product removed.');
      return;
    }
    if (action === 'edit') {
      const product = getProducts().find(item => item.id === id);
      if (!product) return;
      document.getElementById('productTitle').value = product.title;
      document.getElementById('productDescription').value = product.description;
      document.getElementById('productAudience').value = product.audience || 'Men';
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productBrand').value = product.brand || '';
      document.getElementById('productSize').value = product.size || '';
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productMarketPrice').value = product.marketPrice;
      document.getElementById('productQty').value = product.qty;
      document.getElementById('productImage').value = product.image;
      document.getElementById('productImageUpload').value = '';
      document.getElementById('productForm').dataset.editing = id;
      showToast('Editing product. Update fields and save.');
    }
  });

  document.getElementById('couponList').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const code = button.dataset.coupon;
    if (!code) return;
    const coupons = getCoupons().filter(coupon => coupon.code !== code);
    saveCoupons(coupons);
    renderCoupons();
    showToast('Coupon removed.');
  });
}

function initializeAdmin() {
  populateSettings();
  renderProductList();
  renderCoupons();
  renderTestimonialList();
  setupEvents();
}

initializeAdmin();
