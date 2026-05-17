document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const targetElements = document.querySelectorAll('.observe-me:not(.mobile-scroll)');
    targetElements.forEach(el => {
        observer.observe(el);
    });

    // Special Observer for very long mobile scroll images
    const mobileScrollObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05 // Trigger much earlier
    };
    
    const mobileScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, mobileScrollObserverOptions);

    const mobileScrollElements = document.querySelectorAll('.mobile-scroll');
    mobileScrollElements.forEach(el => {
        mobileScrollObserver.observe(el);
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Top Button & Navbar Visibility
    const topBtn = document.getElementById('topBtn');
    const navbar = document.querySelector('.navbar');
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        // Top Button logic
        if (topBtn) {
            if (window.scrollY > 500) {
                topBtn.classList.add('visible');
            } else {
                topBtn.classList.remove('visible');
            }
        }

        // Navbar logic
        if (navbar && heroSection) {
            const heroHeight = heroSection.offsetHeight;
            if (window.scrollY > heroHeight * 0.8) {
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('visible');
            }
        }
    });

    if (topBtn) {
        topBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Poster Slider
    const posterTrack = document.getElementById('posterTrack');
    const prevPosterBtn = document.getElementById('prevPosterBtn');
    const nextPosterBtn = document.getElementById('nextPosterBtn');
    
    if (posterTrack && prevPosterBtn && nextPosterBtn) {
        let currentPosterIndex = 0;
        let isTransitioning = false;
        
        // Clone items for true infinite loop
        const originalItems = Array.from(posterTrack.children);
        const realTotalItems = originalItems.length;
        
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            posterTrack.appendChild(clone);
        });
        
        function updatePosterSlider(transition = true) {
            if (transition) {
                posterTrack.style.transition = 'transform 0.5s ease';
            } else {
                posterTrack.style.transition = 'none';
            }
            
            const gap = 32;
            const itemWidth = posterTrack.children[0].offsetWidth;
            const moveAmount = currentPosterIndex * (itemWidth + gap);
            
            posterTrack.style.transform = `translateX(-${moveAmount}px)`;
        }

        function moveSliderNext() {
            if (isTransitioning) return;
            const itemsPerView = window.innerWidth <= 1024 ? 1 : 3;
            
            isTransitioning = true;
            currentPosterIndex += itemsPerView;
            updatePosterSlider(true);
        }

        function moveSliderPrev() {
            if (isTransitioning) return;
            const itemsPerView = window.innerWidth <= 1024 ? 1 : 3;
            
            if (currentPosterIndex < itemsPerView) {
                currentPosterIndex += realTotalItems;
                updatePosterSlider(false);
                posterTrack.offsetHeight; // Force reflow
            }
            
            isTransitioning = true;
            currentPosterIndex -= itemsPerView;
            updatePosterSlider(true);
        }

        prevPosterBtn.addEventListener('click', moveSliderPrev);
        nextPosterBtn.addEventListener('click', moveSliderNext);

        posterTrack.addEventListener('transitionend', (e) => {
            if (e.target !== posterTrack) return;
            isTransitioning = false;
            
            if (currentPosterIndex >= realTotalItems) {
                currentPosterIndex -= realTotalItems;
                updatePosterSlider(false);
            }
        });

        // Touch events for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;
        let isTouching = false;

        posterTrack.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchEndX = touchStartX; // Initialize to prevent old values triggering swipe
            isTouching = true;
            
            const swipeIndicator = document.getElementById('swipeIndicator');
            if (swipeIndicator) {
                swipeIndicator.style.display = 'none';
            }
        }, {passive: true});

        posterTrack.addEventListener('touchmove', e => {
            if (!isTouching) return;
            touchEndX = e.touches[0].clientX;
        }, {passive: true});

        posterTrack.addEventListener('touchend', e => {
            if (!isTouching) return;
            isTouching = false;
            
            const swipeThreshold = 40;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    moveSliderNext();
                } else {
                    moveSliderPrev();
                }
                
                // Fallback to unlock transitioning state in case transitionend fails
                setTimeout(() => {
                    isTransitioning = false;
                }, 600); // 0.5s transition + 100ms buffer
            }
        }, {passive: true});

        posterTrack.addEventListener('touchcancel', () => {
            isTouching = false;
        }, {passive: true});

        window.addEventListener('resize', () => {
            isTransitioning = false;
            if (currentPosterIndex >= realTotalItems) {
                currentPosterIndex -= realTotalItems;
            }
            updatePosterSlider(false);
        });
        
        // Setup initial dimensions after a tiny delay for images/layout to render
        setTimeout(() => updatePosterSlider(false), 100);
    }
});
