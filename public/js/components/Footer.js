// Footer Component
export class Footer {
    constructor() {
        this.statusElement = document.getElementById('status');
        this.footerElement = document.querySelector('footer');
        
        this.init();
    }

    init() {
        this.setupBackToTop();
    }

    setupBackToTop() {
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 200) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
            });

            backToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    updateStatus(editorElement) {
        if (!this.statusElement || !editorElement) return;
        
        const text = editorElement.innerText.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        this.statusElement.textContent = `Words: ${words} | Chars: ${chars}`;
    }

    setStatusText(text) {
        if (this.statusElement) {
            this.statusElement.textContent = text;
        }
    }

    showStatus() {
        if (this.statusElement) {
            this.statusElement.style.display = 'block';
        }
    }

    hideStatus() {
        if (this.statusElement) {
            this.statusElement.style.display = 'none';
        }
    }
}
