// JavaScript avançado para interatividade e animações

// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

function initializePortfolio() {
    // Inicializar todos os módulos
    initSmoothScrolling();
    initCarousel();
    initContactForm();
    initAnimations();
    initParallaxEffects();
    initCustomCursor();
    initParticleBackground();
    initHeaderEffects();
    initTypingEffect();
    initRevealAnimations();
    initTooltips();
}

// Navegação suave
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Carrossel avançado
function initCarousel() {
    const carouselContainer = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    if (!carouselContainer || !slides.length) return;

    let currentSlide = 0;
    let isTransitioning = false;

    function updateCarousel() {
        if (isTransitioning) return;
        
        isTransitioning = true;
        const slideWidth = slides[0].clientWidth;
        carouselContainer.style.transform = `translateX(${-currentSlide * slideWidth}px)`;
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    function nextSlide() {
        if (isTransitioning) return;
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }

    function prevSlide() {
        if (isTransitioning) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    }

    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Auto-play com pausa no hover
    let autoPlayInterval = setInterval(nextSlide, 8000);
    
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });
    
    carouselContainer.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(nextSlide, 8000);
    });

    // Suporte para touch/swipe
    let startX = 0;
    let endX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    carouselContainer.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Ajustar no redimensionamento
    window.addEventListener('resize', updateCarousel);

    // Indicadores de slide
    createSlideIndicators();
    
    function createSlideIndicators() {
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'carousel-indicators';
        indicatorsContainer.innerHTML = slides.length > 0 ? 
            Array.from(slides).map((_, index) => 
                `<button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>`
            ).join('') : '';
        
        document.querySelector('.carousel').appendChild(indicatorsContainer);
        
        // Event listeners para indicadores
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (isTransitioning) return;
                currentSlide = index;
                updateCarousel();
                updateIndicators();
            });
        });
    }
    
    function updateIndicators() {
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
}

// Formulário de contato WhatsApp
function initContactForm() {
    const form = document.getElementById("form-contato");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const nome = document.getElementById("nome").value.trim();
        
        if (!nome) {
            showNotification('Por favor, digite seu nome.', 'error');
            return;
        }

        const numeroWhatsApp = "5511977825304";
        const textoMensagem = `Olá! Meu nome é ${nome}. Gostaria de conversar com você sobre oportunidades de trabalho.`;
        const mensagemCodificada = encodeURIComponent(textoMensagem);
        const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
        
        // Animação de sucesso
        const button = form.querySelector('button');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            window.open(linkWhatsApp, "_blank");
            showNotification('Redirecionando para o WhatsApp...', 'success');
        }, 150);
    });
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos inline para a notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'
    });
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Animações de entrada
function initAnimations() {
    // Animação para ícones de tecnologia
    document.querySelectorAll('.linguagens li').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.1) rotate(5deg)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        });
    });

    // Animação para cards de projeto
    document.querySelectorAll('.carousel-slide').forEach(slide => {
        const video = slide.querySelector('video');
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                slide.classList.add('loaded');
            });
        }
    });
}

// Efeitos de parallax
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (window.innerWidth > 768) { // Apenas em desktop
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }
}

// Cursor customizado
function initCustomCursor() {
    if (window.innerWidth <= 768) return; // Apenas em desktop
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Elementos interativos
    const interactiveElements = document.querySelectorAll('a, button, .carousel-btn, .linguagens li');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
    
    // Animação suave do cursor
    function animateCursor() {
        const speed = 0.1;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// Fundo de partículas
function initParticleBackground() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-bg';
    document.body.appendChild(particlesContainer);
    
    // Criar partículas
    for (let i = 0; i < 50; i++) {
        createParticle(particlesContainer);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Posição aleatória
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Delay aleatório para animação
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        container.appendChild(particle);
    }
}

// Efeitos do header
function initHeaderEffects() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let ticking = false;
    
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        // Adicionar/remover classe para backdrop blur
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

// Efeito de digitação
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-effect');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.width = '0';
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.style.borderRight = 'none';
            }
        }, 100);
    });
}

// Animações de revelação
function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Animação especial para contadores
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
                
                // Animação para progress bars
                if (entry.target.classList.contains('progress-bar')) {
                    animateProgressBar(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar seções
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('reveal-section');
        observer.observe(section);
    });
    
    // Observar outros elementos
    document.querySelectorAll('.counter, .progress-bar').forEach(element => {
        observer.observe(element);
    });
}

// Animação de contador
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target')) || 100;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Animação de progress bar
function animateProgressBar(element) {
    const fill = element.querySelector('.progress-fill');
    const percentage = element.getAttribute('data-percentage') || '75';
    
    setTimeout(() => {
        fill.style.width = percentage + '%';
    }, 500);
}

// Tooltips
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.classList.add('tooltip');
    });
}

// Lazy loading para imagens e vídeos
function initLazyLoading() {
    const lazyElements = document.querySelectorAll('img[data-src], video[data-src]');
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.src = element.getAttribute('data-src');
                element.removeAttribute('data-src');
                lazyObserver.unobserve(element);
            }
        });
    });
    
    lazyElements.forEach(element => {
        lazyObserver.observe(element);
    });
}

// Performance optimizations
function optimizePerformance() {
    // Throttle scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.onscroll = function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            if (originalScrollHandler) {
                originalScrollHandler();
            }
        }, 16); // ~60fps
    };
    
    // Preload critical resources
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Portfolio error:', e.error);
    // Opcional: enviar erro para serviço de monitoramento
});

// Inicializar otimizações
document.addEventListener('DOMContentLoaded', () => {
    initLazyLoading();
    optimizePerformance();
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Exportar funções para uso global se necessário
window.PortfolioJS = {
    showNotification,
    animateCounter,
    animateProgressBar
};

