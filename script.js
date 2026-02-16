/**
 * Premium Interactive Script
 * Advanced animations, scroll effects, and enhanced UX
 */

/* ===== Global — Google Maps API Callbacks ===== */
window.initGoogleReviewsCallback = function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (window._initGoogleReviews) window._initGoogleReviews();
    });
  } else {
    if (window._initGoogleReviews) window._initGoogleReviews();
  }
};
window.handleGoogleApiError = function () {
  var loading = document.getElementById('reviews-loading');
  var fallback = document.getElementById('reviews-fallback');
  if (loading) loading.style.display = 'none';
  if (fallback) { fallback.style.display = ''; fallback.removeAttribute('style'); }
};

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    WHATSAPP_NUMBER: '918919929327',
    SCROLL_THRESHOLD: 50,
    REVEAL_THRESHOLD: 0.15,
    STAT_ANIMATION_DURATION: 2000,
    TYPING_SPEED: 50
  };

  // ===== Utility Functions =====
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  
  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const lerp = (start, end, factor) => start + (end - start) * factor;

  // ===== Header Scroll Effect =====
  const initHeaderScroll = () => {
    const header = $('.site-header');
    if (!header) return;

    let lastScrollY = 0;
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > CONFIG.SCROLL_THRESHOLD) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  };

  // ===== Mobile Navigation =====
  const initMobileNav = () => {
    const nav = $('#nav');
    const toggle = $('#nav-toggle');
    
    if (!nav || !toggle) return;

    const closeNav = () => {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const openNav = () => {
      nav.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('active');
      isOpen ? closeNav() : openNav();
    });

    // Close on link click
    $$('a', nav).forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeNav();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 768) closeNav();
    }, 100));
  };

  // ===== Scroll Reveal Animations =====
  const initScrollReveal = () => {
    // Elements to reveal
    const revealElements = [
      ...$$('.card'),
      ...$$('.stat-card'),
      ...$$('.portfolio-card'),
      ...$$('.review'),
      ...$$('.faq-item'),
      ...$$('.service-areas .areas li'),
      ...$$('section > .container > h2'),
      ...$$('section > .container > p.muted'),
      ...$$('.section-line')
    ];

    // Add reveal class
    revealElements.forEach(el => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });

    // Set up stagger for grids
    $$('.grid').forEach(grid => grid.classList.add('stagger-children'));
    $$('.portfolio-grid').forEach(grid => grid.classList.add('stagger-children'));
    $$('.service-areas .areas').forEach(areas => areas.classList.add('stagger-children'));

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Trigger stagger children animation
          if (entry.target.classList.contains('stagger-children')) {
            entry.target.classList.add('active');
          }
        }
      });
    }, {
      threshold: CONFIG.REVEAL_THRESHOLD,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all reveal elements
    $$('.reveal, .stagger-children').forEach(el => observer.observe(el));
  };

  // ===== Animated Counter =====
  const initAnimatedCounters = () => {
    const statCards = $$('.stat-card');
    
    const stats = [
      { target: 150, suffix: '+' },
      { target: 145, suffix: '+' },
      { target: 10, suffix: '+' },
      { target: 98, suffix: '%' }
    ];

    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    const animateNumber = (element, target, suffix, duration) => {
      const startTime = performance.now();
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(easedProgress * target);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = target + suffix;
        }
      };
      
      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          
          statCards.forEach((card, index) => {
            const numberEl = $('.stat-number', card);
            if (numberEl && stats[index] && !card.dataset.animated) {
              card.dataset.animated = 'true';
              
              // Stagger animation start
              setTimeout(() => {
                animateNumber(
                  numberEl,
                  stats[index].target,
                  stats[index].suffix,
                  CONFIG.STAT_ANIMATION_DURATION
                );
              }, index * 150);
            }
          });
          
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.3 });

    const statsSection = $('.stats');
    if (statsSection) observer.observe(statsSection);
  };

  // ===== FAQ Accordion =====
  const initFAQ = () => {
    const faqItems = $$('.faq-item');
    
    faqItems.forEach(item => {
      const question = $('.faq-q', item);
      const answer = $('.faq-a', item);
      
      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = question.classList.contains('active');
        
        // Close all other FAQs
        faqItems.forEach(other => {
          const otherQ = $('.faq-q', other);
          const otherA = $('.faq-a', other);
          if (other !== item && otherQ && otherA) {
            otherQ.classList.remove('active');
            otherA.style.display = 'none';
          }
        });
        
        // Toggle current
        if (isOpen) {
          question.classList.remove('active');
          answer.style.display = 'none';
        } else {
          question.classList.add('active');
          answer.style.display = 'block';
        }
      });
    });
  };

  // ===== Contact Form =====
  const initContactForm = () => {
    const form = $('#contact-form');
    if (!form) return;

    // Add floating labels effect
    $$('input, textarea', form).forEach(field => {
      field.addEventListener('focus', () => {
        field.parentElement.classList.add('focused');
      });
      
      field.addEventListener('blur', () => {
        if (!field.value) {
          field.parentElement.classList.remove('focused');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = $('input[name="name"]', form)?.value.trim();
      const phone = $('input[name="phone"]', form)?.value.trim();
      const message = $('textarea[name="message"]', form)?.value.trim();
      
      // Validation
      if (!name) {
        showNotification('Please enter your name.', 'error');
        $('input[name="name"]', form)?.focus();
        return;
      }
      
      if (!phone || phone.length < 8) {
        showNotification('Please enter a valid phone number.', 'error');
        $('input[name="phone"]', form)?.focus();
        return;
      }

      // Build WhatsApp message
      const text = `Hi, my name is ${name}.\nPhone: ${phone}\n\nI am interested in carpentry services.\n\nDetails: ${message || 'N/A'}`;
      const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      
      // Show success feedback
      showNotification('Opening WhatsApp...', 'success');
      
      // Open WhatsApp
      window.open(url, '_blank');
      
      // Reset form with animation
      form.classList.add('submitted');
      setTimeout(() => {
        form.reset();
        form.classList.remove('submitted');
      }, 300);
    });
  };

  // ===== Notification System =====
  const showNotification = (message, type = 'info') => {
    const existing = $('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
      color: white;
      border-radius: 12px;
      font-weight: 500;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10000;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  };

  // ===== Google Reviews — Real-Time Fetch =====
  const initGoogleReviews = () => {
    // ★ CONFIGURATION — Replace with your actual Google Place ID
    const PLACE_ID = 'YOUR_GOOGLE_PLACE_ID';

    const loadingEl  = document.getElementById('reviews-loading');
    const gridEl     = document.getElementById('reviews-grid');
    const summaryEl  = document.getElementById('reviews-summary');
    const fallbackEl = document.getElementById('reviews-fallback');
    const attrEl     = document.getElementById('google-attr');

    if (!gridEl) return;

    // If Place ID not configured or API not loaded, show fallback
    if (PLACE_ID === 'YOUR_GOOGLE_PLACE_ID' ||
        typeof google === 'undefined' || !google.maps || !google.maps.places) {
      showFallback();
      return;
    }

    // Create an off-screen element (required by Places Service)
    const serviceDiv = document.createElement('div');
    serviceDiv.style.display = 'none';
    document.body.appendChild(serviceDiv);

    const service = new google.maps.places.PlacesService(serviceDiv);

    service.getDetails({
      placeId: PLACE_ID,
      fields: ['name', 'rating', 'user_ratings_total', 'reviews']
    }, (place, status) => {
      // Hide loading skeleton
      if (loadingEl) loadingEl.style.display = 'none';

      if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
        showFallback();
        return;
      }

      // --- Render summary bar ---
      if (summaryEl && place.rating) {
        summaryEl.removeAttribute('style');
        const ratingEl = document.getElementById('overall-rating');
        const starsEl  = document.getElementById('summary-stars');
        const totalEl  = document.getElementById('total-reviews');

        if (ratingEl) ratingEl.textContent = place.rating.toFixed(1);
        if (starsEl)  starsEl.innerHTML = renderStars(place.rating);
        if (totalEl)  totalEl.textContent = `${place.user_ratings_total || 0} reviews on Google`;
      }

      // --- Render review cards ---
      if (place.reviews && place.reviews.length) {
        const defaultAvatar = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e8e4df'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%23b0a99f'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='10' fill='%23b0a99f'/%3E%3C/svg%3E`;

        gridEl.innerHTML = place.reviews.map(r => `
          <article class="review-card">
            <div class="review-header">
              <img class="review-avatar"
                   src="${r.profile_photo_url || defaultAvatar}"
                   alt="${escapeHtml(r.author_name)}"
                   loading="lazy"
                   onerror="this.onerror=null;this.src='${defaultAvatar}'">
              <div class="review-author-info">
                <div class="review-author-name">${escapeHtml(r.author_name || 'Customer')}</div>
                <div class="review-time">${escapeHtml(r.relative_time_description || '')}</div>
              </div>
            </div>
            <div class="review-stars">${renderStars(r.rating)}</div>
            <p class="review-text">${escapeHtml(r.text || '')}</p>
          </article>
        `).join('');

        // Show Google attribution
        if (attrEl) attrEl.removeAttribute('style');
      } else {
        showFallback();
      }
    });

    function renderStars(rating) {
      let html = '';
      for (let i = 1; i <= 5; i++) {
        html += i <= Math.round(rating)
          ? '<span class="star-filled">★</span>'
          : '<span class="star-empty">★</span>';
      }
      return html;
    }

    function showFallback() {
      if (loadingEl) loadingEl.style.display = 'none';
      if (fallbackEl) { fallbackEl.removeAttribute('style'); }
    }

    function escapeHtml(text) {
      const el = document.createElement('span');
      el.textContent = text;
      return el.innerHTML;
    }
  };

  // Expose for Google Maps callback
  window._initGoogleReviews = initGoogleReviews;

  // ===== Smooth Scroll =====
  const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        const target = $(href);
        if (target) {
          e.preventDefault();
          const headerHeight = $('.site-header')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // ===== Parallax Effect for Hero =====
  const initParallax = () => {
    const hero = $('.hero');
    if (!hero || window.innerWidth < 768) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const heroHeight = hero.offsetHeight;
          
          if (scrolled < heroHeight) {
            const parallaxOffset = scrolled * 0.4;
            hero.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  };

  // ===== Portfolio Card Hover — Dim Siblings =====
  const initPortfolioHover = () => {
    const cards = $$('.portfolio-card');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        cards.forEach(other => {
          if (other !== card) {
            other.style.opacity = '0.55';
            other.style.filter = 'grayscale(40%) brightness(0.8)';
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        cards.forEach(other => {
          other.style.opacity = '';
          other.style.filter = '';
        });
      });
    });
  };

  // ===== Card Tilt Effect =====
  const initCardTilt = () => {
    if (window.matchMedia('(hover: none)').matches) return;

    $$('.card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  // ===== Magnetic Buttons =====
  const initMagneticButtons = () => {
    if (window.matchMedia('(hover: none)').matches) return;

    $$('.btn.primary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  };

  // ===== Footer Year =====
  const initFooterYear = () => {
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  };

  // ===== Back to Top Button =====
  const initBackToTop = () => {
    const btn = $('#back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Show/hide based on scroll
    let ticking = false;
    const toggle = () => {
      btn.style.opacity = window.scrollY > 600 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 600 ? 'auto' : 'none';
      ticking = false;
    };

    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.style.transition = 'opacity 0.3s, transform 0.3s, box-shadow 0.3s';

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(toggle); ticking = true; }
    }, { passive: true });
  };

  // ===== Footer Stagger Reveal =====
  const initFooterReveal = () => {
    const footer = $('.site-footer');
    if (!footer) return;

    const revealTargets = [
      '.footer-cta-title',
      '.footer-cta-sub',
      '.footer-cta-actions',
      '.footer-brand',
      '.footer-col',
      '.footer-map-wrapper'
    ];

    const items = [];
    revealTargets.forEach(sel => {
      const els = $$(sel, footer);
      els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)';
        items.push(el);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const idx = items.indexOf(entry.target);
          const delay = Math.min(idx * 100, 600);
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(el => observer.observe(el));
  };

  // ===== Initialize Everything =====
  const init = () => {
    initHeaderScroll();
    initMobileNav();
    initScrollReveal();
    initAnimatedCounters();
    initFAQ();
    initContactForm();
    initGoogleReviews();
    initSmoothScroll();
    initParallax();
    initPortfolioHover();
    initCardTilt();
    initMagneticButtons();
    initFooterYear();
    initBackToTop();
    initFooterReveal();

    // Add loaded class for initial animations
    document.body.classList.add('loaded');
    
    console.log('✨ Premium animations initialized');
  };

  // Start
  init();
});
