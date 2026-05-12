// JavaScript avançado para interatividade e animações

// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

function safeInit(moduleName, initializer) {
    try {
        initializer();
    } catch (error) {
        console.error(`Erro ao inicializar modulo ${moduleName}:`, error);
    }
}

function initializePortfolio() {
    // Inicializar cofres e navegacao principal com prioridade.
    // Assim, se algum modulo secundario falhar, o clique do cofre continua funcionando.
    safeInit('certificate-vault', initCertificateVault);
    safeInit('mobile-menu', initMobileMenu);
    safeInit('smooth-scrolling', initSmoothScrolling);
    safeInit('contact-form', initContactForm);
    safeInit('animations', initAnimations);
    safeInit('header-effects', initHeaderEffects);
    safeInit('section-reveal', initSectionReveal);
    safeInit('reveal-animations', initRevealAnimations);
    safeInit('tooltips', initTooltips);
}

function initCertificateVault() {
    const toggle = document.querySelector('.certificados-dock-toggle');
    const panel = document.querySelector('.certificados-hub');
    const closeButton = document.querySelector('.certificados-close');
    const uploadButton = document.querySelector('.certificados-upload');
    const fileInput = document.querySelector('.certificados-input');
    const list = document.querySelector('.certificados-lista-dinamica');
    const ownerTools = document.querySelector('[data-owner-only]');
    const hubCopy = document.querySelector('.certificados-hub-copy');
    const searchInput = document.querySelector('.certificados-search');
    const sortSelect = document.querySelector('.certificados-sort');

    if (!toggle || !panel || !closeButton || !list) return;

    const isLocalOwner = window.location.protocol === 'file:' || /localhost|127\.0\.0\.1/.test(window.location.hostname);
    const dbName = 'portfolio-certificados-db';
    const storeName = 'certificados';
    const publicCertificateFiles = [
        'AWS Prep Plan Overview CLF-C02.pdf',
        'curriculo-kaique-borges-de-oliveira.pdf',
        'DevLinux.pdf',
        'dio- Explorando o Serviço de Aplicativo do Azure.pdf',
        'Excel.pdf',
        'Github.pdf',
        'Kaique Borge De Oliveira.pdf',
        'Kaique Borges De Oliveira - Curso Arquitetura CSS_ descomplicando os problemas - Alura.pdf',
        'Kaique Borges De Oliveira - Curso HTML e CSS_ responsividade com mobile-first - Alura.pdf',
        'Kaique Borges De Oliveira - Curso JavaScript_ explorando a linguagem - Alura.pdf',
        'Kaique Borges De Oliveira - Curso Kubernetes_ Deployments, Volumes e Escalabilidade - Alura.pdf',
        'Kaique Borges De Oliveira - Curso Quality Assurance_ plano de testes e gestão de bugs - Alura.pdf',
        'Kaique Borges De Oliveira - Curso React_ comece seu projeto full stack - Alura.pdf',
        'Kaique Borges De Oliveira - Curso React_ escrevendo com Typescript - Alura.pdf',
        'Kaique Borges De Oliveira - Curso React_ otimizando a performance - Alura.pdf',
        'OraclePLSQL.pdf',
        'Terminal_Ubuntu.pdf'
    ];
    const publicCertificates = publicCertificateFiles.map((fileName) => ({
        id: `public-${fileName}`,
        name: fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim(),
        fileName,
        url: `Arquivo/${encodeURIComponent(fileName)}`,
        source: 'public'
    }));
    let searchTerm = '';
    let sortMode = 'recent';

    if (!isLocalOwner && ownerTools) {
        ownerTools.hidden = true;
    }

    if (!isLocalOwner && hubCopy) {
        hubCopy.textContent = 'Nesta versao publicada voce pode visualizar e baixar certificados publicos. O envio de PDFs fica disponivel apenas no ambiente local.';
    }

    function setPanelState(isOpen) {
        panel.classList.toggle('is-open', isOpen);
        panel.setAttribute('aria-hidden', String(!isOpen));
        toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        setPanelState(!isOpen);
    });

    closeButton.addEventListener('click', () => setPanelState(false));

    document.addEventListener('click', (event) => {
        const clickedInside = panel.contains(event.target) || toggle.contains(event.target);
        if (!clickedInside) {
            setPanelState(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setPanelState(false);
        }
    });

    const supportsLocalDb = !!window.indexedDB;

    function normalizeText(value) {
        return (value || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function getCertificateTimestamp(certificate) {
        return Number(certificate.createdAt || 0);
    }

    function applyFiltersAndSort(certificates) {
        const normalizedTerm = normalizeText(searchTerm);

        const filtered = certificates.filter((certificate) => {
            if (!normalizedTerm) return true;
            const haystack = normalizeText(`${certificate.name} ${certificate.fileName}`);
            return haystack.includes(normalizedTerm);
        });

        const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
        const sorted = [...filtered].sort((a, b) => {
            if (sortMode === 'oldest') {
                return getCertificateTimestamp(a) - getCertificateTimestamp(b);
            }

            if (sortMode === 'name-asc') {
                return collator.compare(a.name, b.name);
            }

            if (sortMode === 'name-desc') {
                return collator.compare(b.name, a.name);
            }

            return getCertificateTimestamp(b) - getCertificateTimestamp(a);
        });

        return sorted;
    }

    function renderNoResultsState() {
        list.innerHTML = `
            <li class="certificados-empty">
                <strong>Nenhum resultado para a busca</strong>
                <span>Limpe ou ajuste os filtros para encontrar seus certificados.</span>
            </li>
        `;
    }

    function bindFilterControls(renderer) {
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                searchTerm = searchInput.value || '';
                renderer();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                sortMode = sortSelect.value;
                renderer();
            });
        }
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function getAllCertificates() {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt - a.createdAt));
            request.onerror = () => reject(request.error);
        });
    }

    async function saveCertificate(file) {
        const db = await openDatabase();
        const certificate = {
            id: `${Date.now()}-${file.name}`,
            name: file.name.replace(/\.pdf$/i, ''),
            fileName: file.name,
            size: file.size,
            createdAt: Date.now(),
            blob: file
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(certificate);
            request.onsuccess = () => resolve(certificate);
            request.onerror = () => reject(request.error);
        });
    }

    async function deleteCertificate(id) {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    function formatFileSize(bytes) {
        if (bytes < 1024 * 1024) {
            return `${Math.round(bytes / 1024)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function renderPublicCertificatesOnly() {
        const certificates = applyFiltersAndSort(publicCertificates);

        if (!publicCertificates.length) {
            list.innerHTML = `
                <li class="certificados-empty">
                    <strong>Nenhum certificado publico disponivel</strong>
                    <span>Adicione PDFs na pasta Arquivo e publique o site para exibi-los aqui.</span>
                </li>
            `;
            return;
        }

        if (!certificates.length) {
            renderNoResultsState();
            return;
        }

        list.innerHTML = '';

        certificates.forEach((certificate) => {
            const item = document.createElement('li');

            item.innerHTML = `
                <strong>${certificate.name}</strong>
                <span>${certificate.fileName} • disponivel para visualizacao e download</span>
                <div class="certificados-item-actions">
                    <a href="${certificate.url}" class="certificados-link" target="_blank" rel="noopener noreferrer">
                        <i class="fa-regular fa-file-pdf" aria-hidden="true"></i>
                        Abrir PDF
                    </a>
                    <a href="${certificate.url}" class="certificados-link" download="${certificate.fileName}">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        Baixar
                    </a>
                </div>
            `;

            list.appendChild(item);
        });
    }

    async function renderCertificates() {
        if (!isLocalOwner || !supportsLocalDb) {
            renderPublicCertificatesOnly();
            return;
        }

        try {
            const localCertificates = await getAllCertificates();
            const allCertificates = [...localCertificates, ...publicCertificates];
            const certificates = applyFiltersAndSort(allCertificates);

            if (!allCertificates.length) {
                list.innerHTML = `
                    <li class="certificados-empty">
                        <strong>Nenhum certificado salvo ainda</strong>
                        <span>Quando concluir um curso, clique no ícone da caixa e anexe o PDF para manter seu acervo privado.</span>
                    </li>
                `;
                return;
            }

            if (!certificates.length) {
                renderNoResultsState();
                return;
            }

            list.innerHTML = '';

            certificates.forEach((certificate) => {
                const item = document.createElement('li');
                const isPublicCertificate = certificate.source === 'public';
                const pdfUrl = isPublicCertificate
                    ? certificate.url
                    : URL.createObjectURL(certificate.blob);
                const createdAt = isPublicCertificate
                    ? 'publicado'
                    : new Date(certificate.createdAt).toLocaleDateString('pt-BR');
                const details = isPublicCertificate
                    ? `${certificate.fileName} • certificado publico`
                    : `${certificate.fileName} • ${formatFileSize(certificate.size)} • salvo em ${createdAt}`;

                item.innerHTML = `
                    <strong>${certificate.name}</strong>
                    <span>${details}</span>
                    <div class="certificados-item-actions">
                        <a href="${pdfUrl}" class="certificados-link" target="_blank" rel="noopener noreferrer">
                            <i class="fa-regular fa-file-pdf" aria-hidden="true"></i>
                            Abrir PDF
                        </a>
                        <a href="${pdfUrl}" class="certificados-link" download="${certificate.fileName}">
                            <i class="fa-solid fa-download" aria-hidden="true"></i>
                            Baixar
                        </a>
                        ${isLocalOwner && !isPublicCertificate ? `
                            <button class="certificados-remove" type="button" data-id="${certificate.id}">
                                <i class="fa-solid fa-trash" aria-hidden="true"></i>
                                Remover
                            </button>
                        ` : ''}
                    </div>
                `;

                list.appendChild(item);
            });
        } catch (error) {
            console.error('Erro ao renderizar certificados:', error);
            list.innerHTML = `
                <li class="certificados-empty">
                    <strong>Não foi possível carregar o cofre</strong>
                    <span>Tente recarregar a página para acessar seus certificados locais.</span>
                </li>
            `;
        }
    }

    list.addEventListener('click', async (event) => {
        if (!isLocalOwner || !supportsLocalDb) return;

        const removeButton = event.target.closest('.certificados-remove');
        if (!removeButton) return;

        try {
            await deleteCertificate(removeButton.dataset.id);
            await renderCertificates();
            showNotification('Certificado removido do cofre local.', 'success');
        } catch (error) {
            console.error('Erro ao remover certificado:', error);
            showNotification('Não foi possível remover o certificado.', 'error');
        }
    });

    if (isLocalOwner && supportsLocalDb && uploadButton && fileInput) {
        uploadButton.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (event) => {
            const [file] = event.target.files || [];
            if (!file) return;

            if (file.type !== 'application/pdf') {
                showNotification('Selecione apenas arquivos PDF.', 'error');
                fileInput.value = '';
                return;
            }

            try {
                await saveCertificate(file);
                await renderCertificates();
                setPanelState(true);
                showNotification('PDF salvo no cofre local.', 'success');
            } catch (error) {
                console.error('Erro ao salvar certificado:', error);
                showNotification('Não foi possível salvar o PDF.', 'error');
            }

            fileInput.value = '';
        });
    }

    if (isLocalOwner && !supportsLocalDb && ownerTools) {
        ownerTools.hidden = true;
    }

    bindFilterControls(renderCertificates);
    renderCertificates();
}

// Menu mobile
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
    const navLinks = document.querySelectorAll('header nav a');

    if (!toggle || !nav) return;

    function closeMenu() {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        nav.classList.toggle('open', !isExpanded);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Navegação suave
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                // Pega a posição relativa ao topo do documento
                const targetRect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = targetRect.top + scrollTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            // Se for só "#", não faz nada
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
        updateIndicators();
        
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

    updateIndicators();
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
        backgroundColor: type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#22c55e'
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

// Inicializar scroll reveal das seções
function initSectionReveal() {
    // Garantir que seções ocultas começam invisíveis
    const hiddenSections = document.querySelectorAll('main.single-board > section.section-hidden');
    hiddenSections.forEach(section => {
        section.classList.remove('revealed');
    });
    
    // Seção primeira (sobre) começa visível
    const aboutSection = document.getElementById('sobre');
    if (aboutSection) {
        aboutSection.classList.add('revealed');
    }
}

// Animações de revelação
function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '50px 0px 50px 0px'
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

    // Observar apenas seções diretas do single-board
    document.querySelectorAll('main.single-board > section').forEach(section => {
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

