(function() {
    'use strict';

    // ============================================================
    //  PAYSTACK CONFIG – REPLACE WITH YOUR PUBLIC KEY
    // ============================================================
    const PAYSTACK_PUBLIC_KEY = 'pk_test_6283c8d0b88c188b4afcdb64dac9d8bbbb23145b'; // ← CHANGE THIS

    // ============================================================
    //  CART STATE
    // ============================================================
    let cart = JSON.parse(localStorage.getItem('beeLuxeCart')) || [];

    // ============================================================
    //  DOM REFS
    // ============================================================
    const homeGrid = document.getElementById('homeProductGrid');
    const shopGrid = document.getElementById('shopProductGrid');
    const cartCountEl = document.getElementById('cartCount');
    const cartIconBtn = document.getElementById('cartIconBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const searchToggle = document.getElementById('searchToggle');
    const searchInput = document.getElementById('searchInput');

    // ============================================================
    //  SEARCH
    // ============================================================
    let currentSearch = '';

    if (searchToggle && searchInput) {
        searchToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            searchInput.classList.toggle('open');
            if (searchInput.classList.contains('open')) {
                searchInput.focus();
            } else {
                searchInput.value = '';
                currentSearch = '';
                updateAllDisplays();
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-wrapper')) {
                if (searchInput.classList.contains('open')) {
                    searchInput.classList.remove('open');
                    searchInput.value = '';
                    currentSearch = '';
                    updateAllDisplays();
                }
            }
        });

        searchInput.addEventListener('input', function() {
            currentSearch = this.value.trim().toLowerCase();
            updateAllDisplays();
        });
    }

    // ============================================================
    //  FILTER / SORT / SEARCH
    // ============================================================
    let currentFilter = 'all';
    let currentSort = 'default';

    function getProductCards(grid) {
        return grid ? grid.querySelectorAll('.product-card') : [];
    }

    function applySearchAndFilter(grid, category, searchTerm) {
        const cards = getProductCards(grid);
        cards.forEach(card => {
            const cardCat = card.dataset.category || '';
            const cardName = (card.dataset.name || '').toLowerCase();
            const matchCategory = category === 'all' || cardCat === category;
            const matchSearch = searchTerm === '' || cardName.includes(searchTerm);
            const visible = matchCategory && matchSearch;
            card.style.display = visible ? '' : 'none';
        });
    }

    function applySort(grid, sortType) {
        const container = grid;
        if (!container) return;
        const cards = Array.from(container.children);
        if (cards.length === 0) return;

        let sorted = [...cards];
        switch (sortType) {
            case 'price-low':
                sorted.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
                break;
            case 'price-high':
                sorted.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
                break;
            case 'name':
                sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
                break;
            default:
                return;
        }
        sorted.forEach(card => container.appendChild(card));
    }

    function updateShopDisplay() {
        if (!shopGrid) return;
        applySort(shopGrid, currentSort);
        applySearchAndFilter(shopGrid, currentFilter, currentSearch);
    }

    function updateHomeDisplay() {
        if (!homeGrid) return;
        const cards = getProductCards(homeGrid);
        applySearchAndFilter(homeGrid, currentFilter, currentSearch);
        let visibleCount = 0;
        const limit = 6;
        cards.forEach(card => {
            if (card.style.display !== 'none' && visibleCount < limit) {
                card.style.display = '';
                visibleCount++;
            } else if (card.style.display !== 'none') {
                card.style.display = 'none';
            }
        });
    }

    function updateAllDisplays() {
        updateHomeDisplay();
        updateShopDisplay();
    }

    // ============================================================
    //  EXPOSE FILTER & SORT
    // ============================================================
    window.filterShop = function(category) {
        currentFilter = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        document.querySelectorAll('.category-card').forEach(card => {
            card.style.borderColor = 'var(--border)';
        });
        updateShopDisplay();
        const shopPage = document.getElementById('page-shop');
        if (!shopPage.classList.contains('active')) {
            navigateTo('shop');
        }
    };

    window.sortProducts = function() {
        const select = document.getElementById('sortSelect');
        currentSort = select ? select.value : 'default';
        updateShopDisplay();
    };

    // ============================================================
    //  NAVIGATION
    // ============================================================
    window.navigateTo = function(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('open');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (page === 'shop') updateShopDisplay();
        if (page === 'home') updateHomeDisplay();
    };

    // ============================================================
    //  CART
    // ============================================================
    function saveCart() {
        localStorage.setItem('beeLuxeCart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) cartCountEl.textContent = totalItems;
    }

    function renderCart() {
    if (!cartBody) return;

    if (cart.length === 0) {
        cartBody.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }

    let html = '';
    let grandTotal = 0;

    cart.forEach((item) => {
        const lineTotal = item.price * item.quantity;
        grandTotal += lineTotal;
        const imageSrc = item.image || 'https://via.placeholder.com/60?text=No+Image';

        html += `
            <div class="cart-item" data-name="${item.name}">
                <img src="${imageSrc}" alt="${item.name}" />
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">
                        <strong>₦${lineTotal.toLocaleString()}</strong>
                        <small style="color:var(--text-muted); font-size:0.7rem;">
                            (₦${item.price.toLocaleString()} × ${item.quantity})
                        </small>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" data-action="decrease" data-name="${item.name}">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
                    <button class="remove-btn" data-name="${item.name}" title="Remove item"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });

    cartBody.innerHTML = html;
    if (cartFooter) cartFooter.style.display = 'flex';
    if (cartTotalPrice) cartTotalPrice.textContent = `₦${grandTotal.toLocaleString()}`;

    // --- Attach event listeners (using data-name for reliability) ---
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.dataset.name;
            const action = this.dataset.action;
            const itemIndex = cart.findIndex(item => item.name === name);
            if (itemIndex === -1) return;

            if (action === 'increase') {
                cart[itemIndex].quantity += 1;
            } else if (action === 'decrease') {
                cart[itemIndex].quantity -= 1;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1);
                }
            }
            saveCart();
            renderCart();   // ← re‑renders with new line totals
            updateCartCount();
            showToast('Cart updated');
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.dataset.name;
            const itemIndex = cart.findIndex(item => item.name === name);
            if (itemIndex === -1) return;
            cart.splice(itemIndex, 1);
            saveCart();
            renderCart();
            updateCartCount();
            showToast('Item removed');
        });
    });
}

    // ============================================================
    //  ADD TO CART
    // ============================================================
    window.addToCart = function(name, price, image = '') {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1, image });
        }
        saveCart();
        renderCart();
        updateCartCount();
        showToast(`✨ ${name} added to cart`);
        openCart();
    };

    window.addToCartFromAttr = function(btn) {
        const card = btn.closest('.product-card');
        if (!card) return;
        const name = card.dataset.name || btn.dataset.name;
        const price = parseFloat(card.dataset.price || btn.dataset.price);
        const image = card.dataset.image || btn.dataset.image || '';
        if (!name || isNaN(price)) {
            showToast('Error: product data missing');
            return;
        }
        window.addToCart(name, price, image);
    };

    // ============================================================
    //  CART MODAL – OPEN / CLOSE
    // ============================================================
    function openCart() {
        renderCart();
        if (cartOverlay) cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        if (cartOverlay) cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (cartIconBtn) cartIconBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function(e) {
            if (e.target === this) closeCart();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCart();
    });

    // ============================================================
    //  PAYSTACK CHECKOUT
    // ============================================================
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (typeof PaystackPop === 'undefined') {
                showToast('❌ Paystack not loaded. Check your internet connection.');
                return;
            }

            if (cart.length === 0) {
                showToast('Your cart is empty');
                return;
            }

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const email = prompt('Enter your email address for payment receipt:', 'customer@example.com');
            if (!email) return;

            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            const ref = 'BEE' + Date.now() + Math.floor(Math.random() * 1000);

            try {
                const handler = PaystackPop.setup({
                    key: PAYSTACK_PUBLIC_KEY,
                    email: email,
                    amount: total * 100,
                    currency: 'NGN',
                    ref: ref,
                    // metadata: {
                    //     custom_fields: [{
                    //         display_name: "Items",
                    //         variable_name: "items",
                    //         value: cart.map(i => `${i.name} x${i.quantity}`).join(', ')
                    //     }]
                    // },
                    callback: function(response) {
                        showToast('🎉 Payment successful! Thank you for your order.');
                        cart = [];
                        saveCart();
                        renderCart();
                        updateCartCount();
                        closeCart();
                        checkoutBtn.disabled = false;
                        checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay with Paystack';
                    },
                    onClose: function() {
                        showToast('Payment cancelled.');
                        checkoutBtn.disabled = false;
                        checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay with Paystack';
                    }
                });
                handler.openIframe();
            } catch (error) {
                console.error('Paystack error:', error);
                showToast('❌ Payment error: ' + error.message);
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay with Paystack';
            }
        });
    }

    // ============================================================
    //  TOAST
    // ============================================================
    if (typeof showToast !== 'function') {
        window.showToast = function(msg) {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toastMsg');
            if (!toast || !toastMsg) return;
            toastMsg.textContent = msg;
            toast.classList.add('show');
            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2800);
        };
    }

    // ============================================================
    //  CONTACT FORM
    // ============================================================
    window.handleContactForm = function(e) {
        e.preventDefault();
        const success = document.getElementById('formSuccess');
        if (success) {
            success.classList.add('show');
            document.getElementById('contactForm').reset();
            setTimeout(() => {
                success.classList.remove('show');
            }, 5000);
        }
        showToast('📬 Message sent! We\'ll reply soon.');
    };

    // ============================================================
    //  HERO SLIDER
    // ============================================================
    const slider = document.getElementById('heroSlider');
    const dots = document.querySelectorAll('#heroDots button');
    let currentIndex = 0;
    let intervalId = null;

    function goToSlide(index) {
        if (!slider) return;
        if (index < 0) index = 0;
        if (index >= dots.length) index = dots.length - 1;
        currentIndex = index;
        slider.style.transform = 'translateX(-' + (index * 100) + '%)';
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % dots.length);
    }

    function startSlider() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(nextSlide, 5000);
    }

    function stopSlider() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    if (dots.length) {
        dots.forEach((dot) => {
            dot.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'), 10);
                stopSlider();
                goToSlide(index);
                startSlider();
            });
        });
    }

    const hero = document.getElementById('hero');
    if (hero && slider) {
        hero.addEventListener('mouseenter', stopSlider);
        hero.addEventListener('mouseleave', startSlider);
        goToSlide(0);
        startSlider();
    }

    // ============================================================
    //  DARK MODE TOGGLE
    // ============================================================
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        const ball = toggleBtn.querySelector('.toggle-ball');
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'light';

        if (savedTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            toggleBtn.classList.add('dark');
            if (ball) ball.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            if (ball) ball.innerHTML = '<i class="fas fa-moon"></i>';
        }

        toggleBtn.addEventListener('click', function() {
            const isDark = html.getAttribute('data-theme') === 'dark';
            if (isDark) {
                html.removeAttribute('data-theme');
                toggleBtn.classList.remove('dark');
                if (ball) ball.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'light');
            } else {
                html.setAttribute('data-theme', 'dark');
                toggleBtn.classList.add('dark');
                if (ball) ball.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // ============================================================
    //  MOBILE MENU
    // ============================================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
            });
        });
    }

    // ============================================================
    //  SCROLL ANIMATIONS
    // ============================================================
    const fadeElements = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -20px 0px'
    });
    fadeElements.forEach(el => observer.observe(el));

    // ============================================================
    //  INIT
    // ============================================================
    updateAllDisplays();
    updateCartCount();
    renderCart();
    const activePage = document.querySelector('.page.active');
    if (!activePage) navigateTo('home');

})();