(function() {
    'use strict';

    let cartCount = 0;
    let currentFilter = 'all';
    let currentSort = 'default';

    // ----- DOM refs -----
    const homeGrid = document.getElementById('homeProductGrid');
    const shopGrid = document.getElementById('shopProductGrid');
    const cartCountEl = document.getElementById('cartCount');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    let toastTimer = null;

    // ----- Helper: get all product cards from a grid -----
    function getProductCards(grid) {
        return grid.querySelectorAll('.product-card');
    }

    // ----- Helper: show/hide cards based on filter -----
    function applyFilter(grid, category) {
        const cards = getProductCards(grid);
        cards.forEach(card => {
            const cardCat = card.dataset.category;
            if (category === 'all' || cardCat === category) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ----- Helper: sort cards in a grid -----
    function applySort(grid, sortType) {
        const container = grid;
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
                // keep original order (as in DOM)
                return;
        }

        // Re-append sorted elements
        sorted.forEach(card => container.appendChild(card));
    }

    // ----- Shop: filter & sort -----
    function updateShopDisplay() {
        // First apply filter (show/hide)
        applyFilter(shopGrid, currentFilter);
        // Then apply sort (reorder visible elements)
        // But sorting should only consider visible elements? Or all? Usually sort all and then filter? 
        // We'll sort all, then filter. But filter hides some, sorting all will keep hidden ones in order too.
        // Simpler: sort all, then filter.
        applySort(shopGrid, currentSort);
        // Re-apply filter after sort (because sorting may move hidden cards)
        applyFilter(shopGrid, currentFilter);
    }

    // ----- Home: show first 6 cards only -----
    function updateHomeDisplay() {
        const cards = getProductCards(homeGrid);
        const limit = 6;
        cards.forEach((card, index) => {
            if (index < limit) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ----- Filter shop (exposed) -----
    window.filterShop = function(category) {
        currentFilter = category;
        // Update active filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        // Also update category cards on home (highlight)
        document.querySelectorAll('.category-card').forEach(card => {
            card.style.borderColor = 'var(--border)';
        });
        updateShopDisplay();
        // Navigate to shop page if not already there
        const shopPage = document.getElementById('page-shop');
        if (!shopPage.classList.contains('active')) {
            navigateTo('shop');
        }
    };

    // ----- Sort (exposed) -----
    window.sortProducts = function() {
        const select = document.getElementById('sortSelect');
        currentSort = select ? select.value : 'default';
        updateShopDisplay();
    };

    // ----- Add to cart -----
    window.addToCart = function(name, price) {
        cartCount++;
        cartCountEl.textContent = cartCount;
        showToast(`✨ ${name} added to cart (₦${price.toLocaleString()})`);
    };

    // ----- Toast -----
    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }
    window.showToast = showToast;

    // ----- Contact form -----
    window.handleContactForm = function(e) {
        e.preventDefault();
        const success = document.getElementById('formSuccess');
        success.classList.add('show');
        document.getElementById('contactForm').reset();
        setTimeout(() => {
            success.classList.remove('show');
        }, 5000);
        showToast('📬 Message sent! We\'ll reply soon.');
    };

    // ----- Navigation -----
    window.navigateTo = function(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        // Show target
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        // Update nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Close mobile menu
        document.getElementById('navLinks').classList.remove('open');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // If shop, update display
        if (page === 'shop') {
            updateShopDisplay();
        }
        if (page === 'home') {
            updateHomeDisplay();
        }
    };

    // ----- HERO SLIDER -----
    const slider = document.getElementById('heroSlider');
    const dots = document.querySelectorAll('#heroDots button');
    let currentIndex = 0;
    let intervalId = null;

    function goToSlide(index) {
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

    dots.forEach((dot) => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'), 10);
            stopSlider();
            goToSlide(index);
            startSlider();
        });
    });

    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mouseenter', stopSlider);
        hero.addEventListener('mouseleave', startSlider);
    }
    goToSlide(0);
    startSlider();

    // ----- DARK MODE TOGGLE -----
    const toggleBtn = document.getElementById('themeToggle');
    const ball = toggleBtn.querySelector('.toggle-ball');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        toggleBtn.classList.add('dark');
        ball.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        ball.innerHTML = '<i class="fas fa-moon"></i>';
    }

    toggleBtn.addEventListener('click', function() {
        const isDark = html.getAttribute('data-theme') === 'dark';
        if (isDark) {
            html.removeAttribute('data-theme');
            toggleBtn.classList.remove('dark');
            ball.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
            toggleBtn.classList.add('dark');
            ball.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });

    // ----- MOBILE MENU -----
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('open');
        });
    });

    // ----- SCROLL ANIMATIONS (Intersection Observer) -----
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

    // ----- INIT -----
    updateHomeDisplay();
    updateShopDisplay();
    // Ensure home is active
    navigateTo('home');

})();

(function() {
    'use strict';

    // ===== PAYSTACK CONFIG =====
    // 🔑 Replace with your Paystack public key (test or live)
    const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    // ===== CART =====
    let cart = JSON.parse(localStorage.getItem('beeLuxeCart')) || [];

    // ===== DOM REFS =====
    const cartCountEl = document.getElementById('cartCount');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartIconBtn = document.getElementById('cartIconBtn');

    // ===== HELPER: Save cart to localStorage =====
    function saveCart() {
        localStorage.setItem('beeLuxeCart', JSON.stringify(cart));
        updateCartCount();
    }

    // ===== UPDATE CART COUNT BADGE =====
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
    }

    // ===== RENDER CART =====
    function renderCart() {
        if (cart.length === 0) {
            cartBody.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
            cartFooter.style.display = 'none';
            return;
        }

        let html = '';
        let total = 0;
        cart.forEach((item, index) => {
            const price = item.price;
            const itemTotal = price * item.quantity;
            total += itemTotal;
            html += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" />
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">₦${price.toLocaleString()}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" data-action="decrease" data-index="${index}">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
                        <button class="remove-btn" data-index="${index}" title="Remove item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
        });

        cartBody.innerHTML = html;
        cartFooter.style.display = 'flex';
        cartTotalPrice.textContent = `₦${total.toLocaleString()}`;

        // Attach event listeners to quantity and remove buttons
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                const action = this.dataset.action;
                if (action === 'increase') {
                    cart[idx].quantity += 1;
                } else if (action === 'decrease') {
                    cart[idx].quantity -= 1;
                    if (cart[idx].quantity <= 0) {
                        cart.splice(idx, 1);
                    }
                }
                saveCart();
                renderCart();
                updateCartCount();
                showToast('Cart updated');
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                cart.splice(idx, 1);
                saveCart();
                renderCart();
                updateCartCount();
                showToast('Item removed');
            });
        });
    }

    // ===== ADD TO CART (from button with explicit args) =====
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
        // Optionally open cart overlay
        // openCart();
    };

    // ===== ADD TO CART (from data attributes) =====
    window.addToCartFromAttr = function(btn) {
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const image = btn.dataset.image || '';
        window.addToCart(name, price, image);
    };

    // ===== OPEN / CLOSE CART =====
    function openCart() {
        renderCart();
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ===== EVENT LISTENERS FOR CART =====
    cartIconBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeCart();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCart();
    });

    // ===== PAYSTACK CHECKOUT =====
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showToast('Your cart is empty');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const email = prompt('Enter your email address for payment receipt:', 'customer@example.com');
        if (!email) return; // user cancelled

        // Disable button to prevent double click
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: email,
            amount: total * 100, // Paystack uses kobo (multiply by 100)
            currency: 'NGN',
            ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generate a random reference
            metadata: {
                custom_fields: [
                    {
                        display_name: "Items",
                        variable_name: "items",
                        value: cart.map(i => `${i.name} x${i.quantity}`).join(', ')
                    }
                ]
            },
            callback: function(response) {
                // Payment successful
                showToast('🎉 Payment successful! Thank you for your order.');
                // Clear cart
                cart = [];
                saveCart();
                renderCart();
                updateCartCount();
                closeCart();
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay with Paystack';
                // Optionally redirect to a thank you page
                // window.location.href = 'thankyou.html';
            },
            onClose: function() {
                // User closed the popup without completing payment
                showToast('Payment cancelled.');
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay with Paystack';
            }
        });

        handler.openIframe();
    });

    // ===== TOAST (reuse your existing showToast) =====
    // If you already have a showToast function, you can skip this.
    // Otherwise, define a simple one.
    if (typeof showToast !== 'function') {
        window.showToast = function(msg) {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toastMsg');
            toastMsg.textContent = msg;
            toast.classList.add('show');
            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2800);
        };
    }

    // ===== INIT =====
    updateCartCount();
    renderCart();

})();
