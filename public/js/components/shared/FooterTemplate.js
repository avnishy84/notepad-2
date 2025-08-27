// Shared Footer Template
export class FooterTemplate {
    static render() {
        return `
            <footer>
                <span id="status">Words: 0 | Chars: 0</span>
                <div class="mt-2 md:mt-0">Made with ❤️ by Avnish</div>
            </footer>
        `;
    }

    static renderAboutPage() {
        return `
            <footer>
                <div></div>
                <div>Made with ❤️ by Avnish</div>
            </footer>
        `;
    }
}
