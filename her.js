(function() {
    'use strict';

    // ----- PRODUCT DATA (with image placeholders) -----
    const products = [
        { id: 1, name: 'Luxe claw clip', category: 'clips', price: 3200, oldPrice: 4500, icon: 'fa-paperclip',
            badge: 'Hot', rating: 4.8, image: 'https://via.placeholder.com/200x200?text=Claw+Clip' },
        { id: 2, name: 'Silk headwrap', category: 'wraps', price: 5800, oldPrice: null, icon: 'fa-ribbon',
            badge: null, rating: 4.9, image: '.png' },
        { id: 3, name: 'Pearl hair pins', category: 'jewelry', price: 2100, oldPrice: 3000, icon: 'fa-gem',
            badge: 'Sale', rating: 4.7, image: 'https://via.placeholder.com/200x200?text=Pearl+Pins' },
        { id: 4, name: 'Boar bristle brush', category: 'brushes', price: 4400, oldPrice: null, icon: 'fa-brush',
            badge: null, rating: 4.6, image: 'https://via.placeholder.com/200x200?text=Brush' },
        { id: 5, name: 'Argan oil serum', category: 'oils', price: 6200, oldPrice: null, icon: 'fa-tint',
            badge: null, rating: 4.9, image: 'https://via.placeholder.com/200x200?text=Argan+Oil' },
        { id: 6, name: 'Starter accessory set', category: 'sets', price: 9900, oldPrice: 12500, icon: 'fa-star',
            badge: 'New', rating: 4.8, image: 'https://via.placeholder.com/200x200?text=Starter+Set' },
        { id: 7, name: 'Gold chain hair clip', category: 'clips', price: 2800, oldPrice: 3500, icon: 'fa-crown',
            badge: null, rating: 4.5, image: 'https://via.placeholder.com/200x200?text=Gold+Clip' },
        { id: 8, name: 'Satin scrunchie set', category: 'wraps', price: 2400, oldPrice: null, icon: 'fa-circle',
            badge: 'Bestseller', rating: 4.7, image: 'https://via.placeholder.com/200x200?text=Scrunchie+Set' },
        { id: 9, name: 'Crystal hair comb', category: 'jewelry', price: 3900, oldPrice: 4900, icon: 'fa-gem',
            badge: null, rating: 4.4, image: 'https://via.placeholder.com/200x200?text=Crystal+Comb' },
        { id: 10, name: 'Wooden paddle brush', category: 'brushes', price: 3700, oldPrice: null, icon: 'fa-tree',
            badge: null, rating: 4.3, image: 'https://via.placeholder.com/200x200?text=Wooden+Brush' },
        { id: 11, name: 'Coconut oil hair food', category: 'oils', price: 4500, oldPrice: 5500, icon: 'fa-seedling',
            badge: 'Sale', rating: 4.6, image: 'https://via.placeholder.com/200x200?text=Coconut+Oil' },
        { id: 12, name: 'Deluxe travel set', category: 'sets', price: 7500, oldPrice: 8900, icon: 'fa-suitcase',
            badge: null, rating: 4.7, image: 'https://via.placeholder.com/200x200?text=Travel+Set' },
    ];

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

    // ----- Render products -----
    function renderProducts(grid, productList, limit = null) {
        const list = limit ? productList.slice(0, limit) : productList;
        grid.innerHTML = list.map(p => {
            const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '★' : '');
            const emptyStars = '☆'.repeat(5 - Math.ceil(p.rating));
            const badgeHtml = p.badge ? `<span class="badge">${p.badge}</span>` : '';
            const oldPriceHtml = p.oldPrice ? `<span class="old-price">₦${p.oldPrice.toLocaleString()}</span>` : '';
            // Image placeholder - replace src with your own images
            const imageHtml = `<div class="product-image"><img src="${p.image}" alt="${p.name}" /></div>`;
            return `
                <div class="product-card fade-up">
                    ${badgeHtml}
                    ${imageHtml}
                    <div class="icon-wrap"><i class="fas ${p.icon}"></i></div>
                    <h4>${p.name}</h4>
                    <div class="rating">${stars}${emptyStars} <span>(${p.rating})</span></div>
                    <div class="price">₦${p.price.toLocaleString()} ${oldPriceHtml}</div>
                    <button class="add-btn" onclick="addToCart('${p.name}', ${p.price})">
                        <i class="fas fa-plus"></i> Add to cart
                    </button>
                </div>
            `;
        }).join('');

        // Trigger fade-up for new elements
        requestAnimationFrame(() => {
            grid.querySelectorAll('.fade-up').forEach(el => {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) entry.target.classList.add('visible');
                    });
                }, { threshold: 0.1 });
                obs.observe(el);
            });
        });
    }

    // ----- Get filtered products -----
    function getFilteredProducts() {
        let list = [...products];
        if (currentFilter !== 'all') {
            list = list.filter(p => p.category === currentFilter);
        }
        return list;
    }

    // ----- Sort products -----
    function sortProducts() {
        const select = document.getElementById('sortSelect');
        currentSort = select ? select.value : 'default';
        const list = getFilteredProducts();
        switch (currentSort) {
            case 'price-low':
                list.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                list.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                list.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
        renderProducts(shopGrid, list);
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
        sortProducts();
        // Navigate to shop page if not already there
        const shopPage = document.getElementById('page-shop');
        if (!shopPage.classList.contains('active')) {
            navigateTo('shop');
        }
    };

    // ----- Sort (exposed) -----
    window.sortProducts = sortProducts;

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

        // If shop, re-render with current filter
        if (page === 'shop') {
            sortProducts();
        }
        if (page === 'home') {
            renderProducts(homeGrid, products, 6);
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
    renderProducts(homeGrid, products, 6);
    renderProducts(shopGrid, products);
    // Ensure home is active
    navigateTo('home');

    // Expose products for sort
    window._products = products;

})();