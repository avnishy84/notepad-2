// About Component
export class About {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.copyTechStackBtn = document.getElementById('copyTechStack');
        this.faqQuestions = document.querySelectorAll('.faq-question');
        
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupTechStackCopy();
        this.setupFAQ();
        this.setupShareButtons();
    }

    setupContactForm() {
        if (!this.contactForm) return;

        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmit();
        });
    }

    async handleContactSubmit() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (window.auth && window.auth.currentUser && window.db) {
            try {
                const userDocRef = window.doc(window.db, "users", window.auth.currentUser.uid);
                await window.setDoc(userDocRef, {
                    contact: {
                        name: name,
                        email: email,
                        message: message,
                        timestamp: window.serverTimestamp()
                    }
                }, { merge: true });
                
                alert('Your message has been sent!');
                this.contactForm.reset();
            } catch (err) {
                console.error("Error sending message:", err);
                alert('There was an error sending your message. Please try again later.');
            }
        } else {
            alert('You must be logged in to send a message.');
        }
    }

    setupTechStackCopy() {
        if (!this.copyTechStackBtn) return;

        this.copyTechStackBtn.addEventListener('click', () => {
            const techStack = [
                'JavaScript',
                'Firebase',
                'Modern CSS',
                'Vanilla JS'
            ];
            const techStackString = techStack.join(', ');
            
            navigator.clipboard.writeText(techStackString).then(() => {
                alert('Tech stack copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy to clipboard. Please copy manually: ' + techStackString);
            });
        });
    }

    setupFAQ() {
        if (!this.faqQuestions || this.faqQuestions.length === 0) return;

        this.faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                item.classList.toggle('active');
            });
        });
    }

    setupShareButtons() {
        // Share buttons are handled by inline onclick handlers
        // These methods are exposed to global scope
    }

    shareOnTwitter() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Check out One Editor - a simple, fast, and secure note-taking app!");
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    }

    shareOnFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }

    shareOnLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}`, '_blank');
    }

    // Expose methods to global scope
    exposeToGlobal() {
        window.shareOnTwitter = () => this.shareOnTwitter();
        window.shareOnFacebook = () => this.shareOnFacebook();
        window.shareOnLinkedIn = () => this.shareOnLinkedIn();
    }
}
