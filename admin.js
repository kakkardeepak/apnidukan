import {
  db, auth, ADMIN_USERNAME, ADMIN_AUTH_EMAIL,
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  EmailAuthProvider,
  signOut, updatePassword, reauthenticateWithCredential,
  onAuthStateChanged
} from './firebase-config.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
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

// ── Defaults & refs ───────────────────────────────────────────────────────────

const defaultSettings = {
  whatsappNumber: '919999999999',
  supportEmail: 'support@apnidukan.com',
  supportPhone: '+91 99999 99999',
  instagramUrl: 'https://instagram.com',
  storeTagline: 'Luxury curated for every style',
  themePack: 'default',
  accentColor: '#d4af37',
  headerColor: '#05070f',
  surfaceColor: '#0d111e',
  backgroundColor: '#050505',
  logoData: '',
  welcomeEnabled: false,
  welcomeMessage: '',
  welcomeMedia: '',
  brandTextStyle: 'classic',
  adminUsername: ADMIN_USERNAME
};

const settingsDocRef = doc(db, 'config', 'settings');

// ── In-memory cache (invalidated after each write) ────────────────────────────

let productsCache = null;
let testimonialsCache = null;
let couponsCache = null;
let settingsCache = null;
let currentReviewFilter = 'all';

// ── Data access ───────────────────────────────────────────────────────────────

async function getProducts() {
  if (productsCache) return productsCache;
  const snapshot = await getDocs(collection(db, 'products'));
  productsCache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  productsCache.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return productsCache;
}

async function getSettings() {
  if (settingsCache) return settingsCache;
  const snap = await getDoc(settingsDocRef);
  settingsCache = snap.exists() ? { ...defaultSettings, ...snap.data() } : { ...defaultSettings };
  return settingsCache;
}

async function getCoupons() {
  if (couponsCache) return couponsCache;
  const snapshot = await getDocs(collection(db, 'coupons'));
  couponsCache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return couponsCache;
}

async function getTestimonials() {
  if (testimonialsCache) return testimonialsCache;
  const snapshot = await getDocs(collection(db, 'testimonials'));
  testimonialsCache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  testimonialsCache.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return testimonialsCache;
}

// ── Render ────────────────────────────────────────────────────────────────────

async function renderProductList() {
  const list = document.getElementById('productList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted)">Loading...</p>';
  const products = await getProducts();
  if (!products.length) {
    list.innerHTML = '<p style="color:var(--muted)">No products yet. Add one above.</p>';
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="product-row">
      <div>
        <h3>${sanitize(p.title)}</h3>
        <p>${sanitize(p.category)} · ₹${Number(p.price).toLocaleString()} · ₹${Number(p.marketPrice).toLocaleString()} · Qty: ${sanitize(String(p.qty))}</p>
      </div>
      <div class="product-actions">
        <button class="button button-secondary" data-action="edit" data-id="${sanitize(p.id)}">Edit</button>
        <button class="button button-ghost" data-action="delete" data-id="${sanitize(p.id)}">Delete</button>
      </div>
    </div>`).join('');
}

async function renderCoupons() {
  const list = document.getElementById('couponList');
  if (!list) return;
  const coupons = await getCoupons();
  if (!coupons.length) {
    list.innerHTML = '<p style="color:var(--muted)">No coupons yet. Generate one above.</p>';
    return;
  }
  list.innerHTML = coupons.map(c => `
    <div class="coupon-card">
      <div>
        <span>${sanitize(c.code)}</span>
        <p>${sanitize(String(c.discount))}% off</p>
      </div>
      <button class="button button-ghost" data-coupon-id="${sanitize(c.id)}">Remove</button>
    </div>`).join('');
}

async function renderTestimonialList(filter = 'all') {
  const list = document.getElementById('testimonialList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted)">Loading...</p>';
  const testimonials = await getTestimonials();
  const filtered = filter === 'all' ? testimonials : testimonials.filter(r => r.status === filter);
  if (!filtered.length) {
    list.innerHTML = '<p style="color:var(--muted)">No reviews match this filter.</p>';
    return;
  }
  list.innerHTML = filtered.map(r => `
    <div class="product-row review-row review-status-${sanitize(r.status || 'pending')}">
      <div>
        <div class="review-preview-top">
          <h3>${sanitize(r.name)} • ${'★'.repeat(r.rating || 0)}${'☆'.repeat(5 - (r.rating || 0))}</h3>
          <span>${sanitize(r.location)}</span>
          <span class="review-status-badge ${sanitize(r.status || 'pending')}">${sanitize(r.status || 'pending')}</span>
        </div>
        <p>${sanitize(r.quote)}</p>
        ${r.image ? `<img class="review-preview-image" src="${sanitize(r.image)}" alt="Review image" loading="lazy" />` : ''}
      </div>
      <div class="product-actions">
        <button class="button button-secondary" data-action="approve-review" data-id="${sanitize(r.id)}">Approve</button>
        <button class="button button-secondary" data-action="reject-review" data-id="${sanitize(r.id)}">Reject</button>
        <button class="button button-secondary" data-action="edit-review" data-id="${sanitize(r.id)}">Edit</button>
        <button class="button button-ghost" data-action="delete-review" data-id="${sanitize(r.id)}">Delete</button>
      </div>
    </div>`).join('');
}

// ── Theme ─────────────────────────────────────────────────────────────────────

function applyAdminTheme(settings) {
  const cl = document.body.classList;
  cl.remove('theme-default', 'theme-midnight', 'theme-ivory', 'theme-noir');
  cl.add(`theme-${settings.themePack || 'default'}`);
  if (settings.accentColor) document.body.style.setProperty('--accent', settings.accentColor);
  if (settings.headerColor) document.body.style.setProperty('--header-bg', settings.headerColor);
  if (settings.surfaceColor) document.body.style.setProperty('--surface', settings.surfaceColor);
  if (settings.backgroundColor) document.body.style.setProperty('--bg', settings.backgroundColor);
}

// ── Previews ──────────────────────────────────────────────────────────────────

function updateLogoPreview(src) {
  const preview = document.getElementById('logoPreview');
  if (!preview) return;
  preview.src = src || '';
  preview.dataset.source = src ? 'file' : '';
  preview.style.display = src ? 'block' : 'none';
}

function updateWelcomePreview(src) {
  const el = document.getElementById('welcomeMediaPreview');
  if (!el) return;
  el.dataset.media = src || '';
  el.innerHTML = '';
  if (!src) return;
  if (src.startsWith('data:video')) {
    const v = document.createElement('video');
    v.controls = true;
    v.src = src;
    el.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Welcome media preview';
    el.appendChild(img);
  }
}

// ── Populate form from settings ───────────────────────────────────────────────

async function populateSettings() {
  const settings = await getSettings();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('whatsappNumber', settings.whatsappNumber);
  set('supportEmail', settings.supportEmail);
  set('supportPhone', settings.supportPhone);
  set('instagramUrl', settings.instagramUrl);
  set('themePack', settings.themePack);
  set('accentColor', settings.accentColor);
  set('headerColor', settings.headerColor || '#05070f');
  set('surfaceColor', '#0d111e');
  set('backgroundColor', settings.backgroundColor || '#050505');
  set('welcomeMessage', settings.welcomeMessage || '');
  set('storeTagline', settings.storeTagline);
  set('brandTextStyle', settings.brandTextStyle || 'classic');
  set('newAdminUsername', settings.adminUsername || ADMIN_USERNAME);
  const wel = document.getElementById('welcomeEnabled');
  if (wel) wel.checked = !!settings.welcomeEnabled;
  updateLogoPreview(settings.logoData || '');
  updateWelcomePreview(settings.welcomeMedia || '');
  applyAdminTheme(settings);
}

// ── File reader with size guard ───────────────────────────────────────────────

function readFileAsDataUrl(input, maxBytes = 400_000) {
  return new Promise((resolve, reject) => {
    const file = input.files && input.files[0];
    if (!file) return resolve('');
    if (file.size > maxBytes) {
      reject(new Error(`Image too large (${Math.round(file.size / 1024)}KB). Max ${Math.round(maxBytes / 1024)}KB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.readAsDataURL(file);
  });
}

// ── Form helpers ──────────────────────────────────────────────────────────────

function clearProductForm() {
  ['productTitle', 'productDescription', 'productBrand', 'productSize', 'productImage', 'productPrice', 'productMarketPrice', 'productQty'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const pu = document.getElementById('productImageUpload');
  if (pu) pu.value = '';
  const au = document.getElementById('productAudience');
  if (au) au.value = 'Men';
  const ca = document.getElementById('productCategory');
  if (ca) ca.value = 'Watches';
  const pf = document.getElementById('productForm');
  if (pf) pf.dataset.editing = '';
}

function clearTestimonialForm() {
  ['testimonialName', 'testimonialLocation', 'testimonialQuote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['testimonialAvatarUpload', 'testimonialImageUpload'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const rat = document.getElementById('testimonialRating');
  if (rat) rat.value = '5';
  const tf = document.getElementById('testimonialForm');
  if (tf) tf.dataset.editing = '';
}

// ── Event setup ───────────────────────────────────────────────────────────────

function setupEvents() {
  // Save settings
  document.getElementById('saveSettings').addEventListener('click', async () => {
    const logoPreview = document.getElementById('logoPreview');
    const welcomePreview = document.getElementById('welcomeMediaPreview');
    const logoDataValue = (logoPreview && logoPreview.dataset.source === 'file') ? logoPreview.src : '';
    const welcomeMediaValue = (welcomePreview && welcomePreview.dataset.media) ? welcomePreview.dataset.media : '';
    const settings = {
      whatsappNumber: document.getElementById('whatsappNumber').value.trim() || '919999999999',
      supportEmail: document.getElementById('supportEmail').value.trim() || 'support@apnidukan.com',
      supportPhone: document.getElementById('supportPhone').value.trim() || '+91 99999 99999',
      instagramUrl: document.getElementById('instagramUrl').value.trim() || 'https://instagram.com',
      storeTagline: document.getElementById('storeTagline').value.trim() || 'Luxury curated for every style',
      themePack: document.getElementById('themePack').value || 'default',
      accentColor: document.getElementById('accentColor').value || '#d4af37',
      headerColor: document.getElementById('headerColor').value || '#05070f',
      surfaceColor: document.getElementById('surfaceColor').value || '#0d111e',
      backgroundColor: document.getElementById('backgroundColor').value || '#050505',
      logoData: logoDataValue,
      welcomeEnabled: document.getElementById('welcomeEnabled').checked,
      welcomeMessage: document.getElementById('welcomeMessage').value.trim(),
      welcomeMedia: welcomeMediaValue,
      brandTextStyle: document.getElementById('brandTextStyle').value || 'classic',
      adminUsername: document.getElementById('newAdminUsername').value.trim() || ADMIN_USERNAME
    };
    try {
      await setDoc(settingsDocRef, settings);
      settingsCache = settings;
      applyAdminTheme(settings);
      showToast('Store settings saved.');
    } catch {
      showToast('Failed to save settings. Check your connection.');
    }
  });

  // Logo upload
  document.getElementById('logoUpload').addEventListener('change', async event => {
    try {
      const data = await readFileAsDataUrl(event.target, 200_000);
      const preview = document.getElementById('logoPreview');
      if (data && preview) {
        preview.dataset.source = 'file';
        preview.src = data;
        preview.style.display = 'block';
      }
    } catch (err) { showToast(err.message); }
  });

  // Admin password change via Firebase Auth
  document.getElementById('saveAdminAccount').addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentAdminPassword').value.trim();
    const newPassword = document.getElementById('newAdminPassword').value.trim();
    if (!currentPassword) { showToast('Enter your current password.'); return; }
    if (!newPassword) { showToast('Enter a new password.'); return; }
    if (newPassword.length < 6) { showToast('New password must be at least 6 characters.'); return; }
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      document.getElementById('currentAdminPassword').value = '';
      document.getElementById('newAdminPassword').value = '';
      showToast('Admin password updated successfully.');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showToast('Current password is incorrect.');
      } else {
        showToast('Failed to update password. Please try again.');
      }
    }
  });

  // Save product
  const productImageUpload = document.getElementById('productImageUpload');
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

    if (!title || !price || !marketPrice || !qty) { showToast('Complete all required fields (title, prices, quantity).'); return; }
    if (price <= 0 || marketPrice <= 0 || qty < 0) { showToast('Price and quantity must be positive numbers.'); return; }

    let imageFileData = '';
    try { imageFileData = await readFileAsDataUrl(productImageUpload, 400_000); }
    catch (err) { showToast(err.message); return; }

    const editingId = document.getElementById('productForm').dataset.editing;
    const products = await getProducts();
    const existing = products.find(p => p.id === editingId);
    const image = imageFileData || imageUrl || (existing ? existing.image : 'https://via.placeholder.com/600x600?text=Product');

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), { title, audience, category, brand, size, description, price, marketPrice, qty, image });
        showToast('Product updated.');
      } else {
        const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
        await setDoc(doc(db, 'products', id), { title, audience, category, brand, size, description, price, marketPrice, qty, image, createdAt: Date.now() });
        showToast('Product added.');
      }
      productsCache = null;
      clearProductForm();
      await renderProductList();
    } catch { showToast('Failed to save product. Please try again.'); }
  });

  document.getElementById('clearProduct').addEventListener('click', clearProductForm);

  // Coupons
  document.getElementById('couponForm').addEventListener('submit', e => e.preventDefault());
  document.getElementById('generateCoupon').addEventListener('click', async () => {
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const discount = Number(document.getElementById('couponDiscount').value);
    if (!code || !discount || discount <= 0 || discount > 100) { showToast('Enter a valid code and discount (1–100%).'); return; }
    try {
      await addDoc(collection(db, 'coupons'), { code, discount, createdAt: Date.now() });
      couponsCache = null;
      document.getElementById('couponCode').value = '';
      document.getElementById('couponDiscount').value = '';
      await renderCoupons();
      showToast('Coupon created.');
    } catch { showToast('Failed to create coupon.'); }
  });

  document.getElementById('couponList').addEventListener('click', async event => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.couponId;
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      couponsCache = null;
      await renderCoupons();
      showToast('Coupon removed.');
    } catch { showToast('Failed to remove coupon.'); }
  });

  // Welcome media upload
  document.getElementById('welcomeMediaUpload').addEventListener('change', async event => {
    try {
      const data = await readFileAsDataUrl(event.target, 1_000_000);
      updateWelcomePreview(data);
    } catch (err) { showToast(err.message); }
  });

  // Save testimonial
  const avatarInput = document.getElementById('testimonialAvatarUpload');
  const imageInput = document.getElementById('testimonialImageUpload');
  document.getElementById('saveTestimonial').addEventListener('click', async () => {
    const name = document.getElementById('testimonialName').value.trim();
    const location = document.getElementById('testimonialLocation').value.trim();
    const quote = document.getElementById('testimonialQuote').value.trim();
    const rating = Number(document.getElementById('testimonialRating').value) || 5;
    if (!name || !location || !quote) { showToast('Fill in name, location and review text.'); return; }

    let avatarData = '', imageData = '';
    try {
      avatarData = await readFileAsDataUrl(avatarInput, 200_000);
      imageData = await readFileAsDataUrl(imageInput, 400_000);
    } catch (err) { showToast(err.message); return; }

    const testimonials = await getTestimonials();
    const editingId = document.getElementById('testimonialForm').dataset.editing;
    const existing = testimonials.find(r => r.id === editingId);
    const avatar = avatarData || (existing ? existing.avatar : `https://via.placeholder.com/80?text=${encodeURIComponent(name.charAt(0))}`);
    const image = imageData || (existing ? existing.image : '');

    try {
      if (editingId) {
        await updateDoc(doc(db, 'testimonials', editingId), { name, location, quote, rating, avatar, image });
        showToast('Review updated.');
      } else {
        await addDoc(collection(db, 'testimonials'), { name, location, quote, rating, avatar, image, status: 'pending', createdAt: Date.now() });
        showToast('Review added (pending approval).');
      }
      testimonialsCache = null;
      clearTestimonialForm();
      await renderTestimonialList(currentReviewFilter);
    } catch { showToast('Failed to save review.'); }
  });

  document.getElementById('clearTestimonial').addEventListener('click', clearTestimonialForm);

  // Testimonial list actions
  document.getElementById('testimonialList').addEventListener('click', async event => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (!action || !id) return;
    try {
      if (action === 'delete-review') {
        await deleteDoc(doc(db, 'testimonials', id));
        testimonialsCache = null;
        await renderTestimonialList(currentReviewFilter);
        showToast('Review deleted.');
      } else if (action === 'approve-review' || action === 'reject-review') {
        const status = action === 'approve-review' ? 'approved' : 'rejected';
        await updateDoc(doc(db, 'testimonials', id), { status });
        testimonialsCache = null;
        await renderTestimonialList(currentReviewFilter);
        showToast(`Review ${status}.`);
      } else if (action === 'edit-review') {
        const testimonials = await getTestimonials();
        const r = testimonials.find(t => t.id === id);
        if (!r) return;
        document.getElementById('testimonialName').value = r.name || '';
        document.getElementById('testimonialLocation').value = r.location || '';
        document.getElementById('testimonialQuote').value = r.quote || '';
        document.getElementById('testimonialRating').value = String(r.rating || 5);
        document.getElementById('testimonialAvatarUpload').value = '';
        document.getElementById('testimonialImageUpload').value = '';
        document.getElementById('testimonialForm').dataset.editing = id;
        showToast('Editing review. Save to apply changes.');
        document.getElementById('testimonialName').scrollIntoView({ behavior: 'smooth' });
      }
    } catch { showToast('Action failed. Please try again.'); }
  });

  // Review filter buttons
  const filterMap = { showAllReviews: 'all', showApprovedReviews: 'approved', showPendingReviews: 'pending', showRejectedReviews: 'rejected' };
  Object.entries(filterMap).forEach(([btnId, filter]) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      currentReviewFilter = filter;
      renderTestimonialList(filter);
    });
  });

  // Product list actions
  document.getElementById('productList').addEventListener('click', async event => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (!action || !id) return;
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, 'products', id));
        productsCache = null;
        await renderProductList();
        showToast('Product removed.');
      } else if (action === 'edit') {
        const products = await getProducts();
        const p = products.find(x => x.id === id);
        if (!p) return;
        document.getElementById('productTitle').value = p.title || '';
        document.getElementById('productDescription').value = p.description || '';
        document.getElementById('productAudience').value = p.audience || 'Men';
        document.getElementById('productCategory').value = p.category || 'Watches';
        document.getElementById('productBrand').value = p.brand || '';
        document.getElementById('productSize').value = p.size || '';
        document.getElementById('productPrice').value = p.price || '';
        document.getElementById('productMarketPrice').value = p.marketPrice || '';
        document.getElementById('productQty').value = p.qty || '';
        document.getElementById('productImage').value = p.image || '';
        document.getElementById('productImageUpload').value = '';
        document.getElementById('productForm').dataset.editing = id;
        showToast('Editing product. Update fields and save.');
        document.getElementById('productTitle').scrollIntoView({ behavior: 'smooth' });
      }
    } catch { showToast('Action failed. Please try again.'); }
  });

  // Logout
  document.getElementById('adminLogout')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html#login';
  });
}

// ── Auth guard & init ─────────────────────────────────────────────────────────

async function initializeAdmin() {
  // Wait for Firebase Auth to resolve (avoids flash before redirect)
  const user = await new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, u => { unsub(); resolve(u); });
  });

  if (!user || user.email !== ADMIN_AUTH_EMAIL) {
    window.location.href = 'index.html#login';
    return;
  }

  // Remove loading overlay and reveal content
  document.getElementById('adminLoadingOverlay')?.remove();
  const main = document.getElementById('adminMain');
  if (main) main.hidden = false;

  await populateSettings();
  await renderProductList();
  await renderCoupons();
  await renderTestimonialList();
  setupEvents();
}

initializeAdmin();
