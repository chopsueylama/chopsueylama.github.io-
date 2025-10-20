// ---- Utilities ----
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

// Mobile nav
const menuBtn = $('#menuBtn');
const mobileNav = $('#mobileNav');
menuBtn?.addEventListener('click', () => {
  const shown = mobileNav.style.display === 'flex';
  mobileNav.style.display = shown ? 'none' : 'flex';
  mobileNav.style.flexDirection = 'column';
});

// Year
const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

// ---- Cart (localStorage) ----
const CART_KEY = 'veloura_cart_v1';
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY))||[] } catch { return [] } }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); refreshBadges(); }
function addItem(item){
  const c = getCart();
  const idx = c.findIndex(x => x.slug === item.slug);
  if (idx >= 0) c[idx].qty += 1; else c.push({...item, qty:1});
  setCart(c);
  alert(`${item.name} added to cart.`);
}
function removeItem(slug){
  const c = getCart().filter(x => x.slug !== slug);
  setCart(c);
}

function refreshBadges(){
  const count = getCart().reduce((a,b)=>a+b.qty,0);
  const b1 = $('#cartBadge'), b2 = $('#cartBadgeMobile');
  if (b1) b1.textContent = count;
  if (b2) b2.textContent = count;
}
refreshBadges();

// Bind add buttons
$$('[data-add]').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = JSON.parse(btn.getAttribute('data-add'));
    addItem(item);
  });
});

// Render cart if on cart page
function renderCart(){
  const mount = $('#cartContainer');
  if (!mount) return;
  const cart = getCart();
  if (!cart.length){
    mount.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  const rows = cart.map(i => `
    <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--line);border-radius:12px;padding:10px;margin:8px 0;background:#fff">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="card-media ${i.slug.includes('ring')?'ring': i.slug.includes('pendant')?'pendant': i.slug.includes('bracelet')?'bracelet':'earrings'}" style="width:80px;height:60px"></div>
        <div><strong>${i.name}</strong><div class="muted">Qty: ${i.qty}</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div>$${(i.price * i.qty).toFixed(2)}</div>
        <button class="btn ghost" data-remove="${i.slug}">Remove</button>
      </div>
    </div>
  `).join('');
  const subtotal = cart.reduce((a,b)=>a + b.price*b.qty, 0);
  mount.innerHTML = rows + `<div style="text-align:right;margin-top:10px"><strong>Subtotal: $${subtotal.toFixed(2)}</strong></div>`;
  $$('[data-remove]').forEach(b => b.addEventListener('click', ()=>{ removeItem(b.getAttribute('data-remove')); renderCart(); }));
}
renderCart();

// Checkout mock
const checkoutBtn = $('#checkoutBtn');
checkoutBtn?.addEventListener('click', () => {
  const total = getCart().reduce((a,b)=>a + b.price*b.qty, 0);
  alert(`Demo checkout — total $${total.toFixed(2)}. Connect Stripe/Shopify for real payments.`);
});

// Keyboard search (very simple)
document.addEventListener('keydown', (e) => {
  if (e.key === '/'){
    e.preventDefault();
    const term = prompt('Search products (name):')?.toLowerCase().trim();
    if (!term) return;
    const link = Array.from(document.links).find(a => a.textContent.toLowerCase().includes(term));
    if (link) link.focus(), link.click();
    else alert('No match.');
  }
});
