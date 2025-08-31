export class Game {
    constructor() {
        this.isGameActive = false;
        this.gameCanvas = null;
        this.gameContext = null;
        this.snake = [];
        this.food = {};
        this.powerUps = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.level = 1;
        this.difficulty = 'normal'; // easy, normal, hard
        this.gameSpeed = 150;
        this.baseSpeed = 150;
        this.gameLoop = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.particles = [];
        this.effects = [];
        this.gridSize = 20;
        this.canvasSize = 600;
        this.powerUpChance = 0.1; // 10% chance for power-up
        this.powerUpTypes = ['speed', 'slow', 'double', 'ghost', 'shrink'];
        this.activePowerUps = {};
        this.powerUpDuration = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.createGameModal();
        this.setupEventListeners();
    }

    createGameModal() {
        const modalHTML = `
            <div id="gameModal" class="modal">
                <div class="modal-content game-box" id="gameBox" style="transform: translate(5%, 8%);">
                    <div class="game-header" id="gameHeader">
                        <div></div>
                        <h2 class="game-title">🐍 Enhanced Snake</h2>
                        <span class="popup-close-btn" style="font-size: 50px !important;" onclick="window.game.closeGame()">&times;</span>
                    </div>
                    <div class="game-content" style="display:flex; flex-direction: row;align-items: center; justify-content: space-evenly;">
                    <div>
                        <canvas id="gameCanvas" width="400" height="400"></canvas>
                    </div>
                    <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-evenly;">
                        <div class="game-info">
                            <span id="gameScore">Score: 0</span>
                            <span id="gameLevel">Level: 1</span>
                            <span id="gameHighScore">High Score: 0</span>
                        </div>
                        <div class="difficulty-selector">
                            <label>Difficulty:</label>
                            <select id="difficultySelect" onchange="window.game.changeDifficulty(this.value)">
                                <option value="easy">Easy</option>
                                <option value="normal" selected>Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        
                        <div class="game-controls">
                            <button id="startGameBtn" onclick="window.game.startGame()">Start Game</button>
                            <button id="pauseGameBtn" onclick="window.game.pauseGame()" style="display: none;">Pause</button>
                            <button onclick="window.game.resetGame()">Reset</button>
                        </div>
                        <div class="game-instructions">
                            <p><strong>Controls:</strong></p>
                            <p>Use arrow keys or WASD to move the snake</p>
                            <p>Eat food to grow and collect power-ups!</p>
                            <p>Avoid hitting walls or yourself</p>
                            <p><em>💡 Tip: Drag the header to move the window</em></p>
                        </div>
                        <div class="power-up-info">
                            <h4>Power-ups:</h4>
                            <div class="power-up-list">
                                <span class="power-up-item">⚡ Speed</span>
                                <span class="power-up-item">🐌 Slow</span>
                                <span class="power-up-item">💎 Double</span>
                                <span class="power-up-item">👻 Ghost</span>
                                <span class="power-up-item">📏 Shrink</span>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive) return;

            const key = e.key.toLowerCase();
            const directions = {
                'arrowup': 'up', 'w': 'up',
                'arrowdown': 'down', 's': 'down',
                'arrowleft': 'left', 'a': 'left',
                'arrowright': 'right', 'd': 'right'
            };

            if (directions[key]) {
                e.preventDefault();
                this.changeDirection(directions[key]);
            }
        });

        // Setup drag functionality after modal is created
        this.setupDragFunctionality();
    }

    setupDragFunctionality() {
        const gameBox = document.getElementById('gameBox');
        const gameHeader = document.getElementById('gameHeader');

        if (!gameBox || !gameHeader) return;

        // Mouse events for dragging
        gameHeader.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('popup-close-btn')) return;

            this.isDragging = true;
            const rect = gameBox.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;

            gameHeader.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const modal = document.getElementById('gameModal');
            const modalRect = modal.getBoundingClientRect();
            const gameBoxRect = gameBox.getBoundingClientRect();

            let newX = e.clientX - this.dragOffset.x;
            let newY = e.clientY - this.dragOffset.y;

            // Keep the game box within the modal bounds
            const maxX = modalRect.width - gameBoxRect.width;
            const maxY = modalRect.height - gameBoxRect.height;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            gameBox.style.transform = `translate(${newX}px, ${newY}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                const gameHeader = document.getElementById('gameHeader');
                if (gameHeader) {
                    gameHeader.style.cursor = 'grab';
                }
            }
        });

        // Touch events for mobile dragging
        gameHeader.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('popup-close-btn')) return;

            this.isDragging = true;
            const touch = e.touches[0];
            const rect = gameBox.getBoundingClientRect();
            this.dragOffset.x = touch.clientX - rect.left;
            this.dragOffset.y = touch.clientY - rect.top;

            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            const touch = e.touches[0];
            const modal = document.getElementById('gameModal');
            const modalRect = modal.getBoundingClientRect();
            const gameBoxRect = gameBox.getBoundingClientRect();

            let newX = touch.clientX - this.dragOffset.x;
            let newY = touch.clientY - this.dragOffset.y;

            // Keep the game box within the modal bounds
            const maxX = modalRect.width - gameBoxRect.width;
            const maxY = modalRect.height - gameBoxRect.height;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            gameBox.style.transform = `translate(${newX}px, ${newY}px)`;
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    openGame() {
        const modal = document.getElementById('gameModal');
        modal.style.display = 'block';
        this.initCanvas();
        this.loadHighScore();
        this.setupDragFunctionality();
    }

    closeGame() {
        const overlay = document.getElementById('game-over-screen');
        if (overlay) overlay.remove();

        const modal = document.getElementById('gameModal');
        modal.style.display = 'none';
        this.stopGame();
        this.resetPosition();
    }
    restartGame() {
        // remove overlay if it exists
        const overlay = document.getElementById('game-over-screen');
        if (overlay) overlay.remove();

        this.startGame();
    }

    resetPosition() {
        const gameBox = document.getElementById('gameBox');
        if (gameBox) {
            gameBox.style.transform = 'translate(0px, 0px)';
        }
    }

    initCanvas() {
        this.gameCanvas = document.getElementById('gameCanvas');
        this.gameContext = this.gameCanvas.getContext('2d');

        this.setCanvasSize();

        window.addEventListener('resize', () => this.setCanvasSize());

        // Set canvas style
        this.gameCanvas.style.border = '2px solid #333';
        this.gameCanvas.style.borderRadius = '8px';
        this.gameCanvas.style.backgroundColor = '#1a1a2e';

        // Add roundRect method if not available
        if (!this.gameContext.roundRect) {
            this.gameContext.roundRect = function (x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }

        // Draw initial grid
        this.drawGrid();
    }

    setCanvasSize() {
        const gameBox = document.getElementById('gameBox');
        const boxWidth = gameBox.clientWidth - 56; // Subtract padding
        const boxHeight = gameBox.clientHeight - 250; // Subtract header, controls, etc.

        const size = Math.min(boxWidth, boxHeight);
        this.gameCanvas.width = size;
        this.gameCanvas.height = size;
        this.canvasSize = size;
        this.draw();
    }

    drawGrid() {
        const gridSize = 20;
        const width = this.gameCanvas.width;
        const height = this.gameCanvas.height;

        this.gameContext.strokeStyle = '#e0e0e0';
        this.gameContext.lineWidth = 0.5;

        // Draw vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            this.gameContext.beginPath();
            this.gameContext.moveTo(x, 0);
            this.gameContext.lineTo(x, height);
            this.gameContext.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            this.gameContext.beginPath();
            this.gameContext.moveTo(0, y);
            this.gameContext.lineTo(width, y);
            this.gameContext.stroke();
        }
    }

    startGame() {
        if (this.isGameActive) return;

        this.isGameActive = true;
        this.score = 0;
        this.level = 1;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
        this.powerUps = [];
        this.particles = [];
        this.effects = [];
        this.activePowerUps = {};
        this.gameSpeed = this.baseSpeed;

        this.generateFood();
        this.updateScore();
        this.updateLevel();

        document.getElementById('startGameBtn').style.display = 'none';
        document.getElementById('pauseGameBtn').style.display = 'inline-block';

        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    pauseGame() {
        if (!this.isGameActive) return;

        this.isGameActive = false;
        clearInterval(this.gameLoop);

        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('pauseGameBtn').style.display = 'none';
    }

    stopGame() {
        this.isGameActive = false;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
    }

    resetGame() {
        this.stopGame();
        this.score = 0;
        this.updateScore();
        this.drawGrid();

        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('pauseGameBtn').style.display = 'none';
    }

    changeDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    changeDifficulty(difficulty) {
        this.difficulty = difficulty;
        switch (difficulty) {
            case 'easy':
                this.baseSpeed = 200;
                this.powerUpChance = 0.15;
                break;
            case 'normal':
                this.baseSpeed = 150;
                this.powerUpChance = 0.1;
                break;
            case 'hard':
                this.baseSpeed = 100;
                this.powerUpChance = 0.05;
                break;
        }
        this.gameSpeed = this.baseSpeed;
    }

    update() {
        // Update direction
        this.direction = this.nextDirection;

        const head = { ...this.snake[0] };

        // Move head based on direction
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls (unless ghost mode is active)
        if (!this.activePowerUps.ghost) {
            if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
                this.gameOver();
                return;
            }
        } else {
            // Wrap around in ghost mode
            if (head.x < 0) head.x = this.gridSize - 1;
            if (head.x >= this.gridSize) head.x = 0;
            if (head.y < 0) head.y = this.gridSize - 1;
            if (head.y >= this.gridSize) head.y = 0;
        }

        // Check collision with self (unless ghost mode is active)
        if (!this.activePowerUps.ghost && this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }

        // Check power-up collisions
        this.checkPowerUpCollisions();

        // Update particles and effects
        this.updateParticles();
        this.updateEffects();

        // Update power-up timers
        this.updatePowerUpTimers();

        this.draw();
    }

    eatFood() {
        let points = 10;

        // Double points power-up
        if (this.activePowerUps.double) {
            points *= 2;
        }

        this.score += points;
        this.updateScore();

        // Create eating effect
        this.createEatingEffect(this.food.x, this.food.y);

        // Generate new food
        this.generateFood();

        // Chance to spawn power-up
        if (Math.random() < this.powerUpChance) {
            this.generatePowerUp();
        }

        // Level up every 50 points
        if (this.score % 50 === 0) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.updateLevel();

        // Increase speed
        if (this.gameSpeed > 50) {
            this.gameSpeed = Math.max(50, this.baseSpeed - (this.level - 1) * 5);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }

        // Create level up effect
        this.createLevelUpEffect();
    }

    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y) ||
            this.powerUps.some(powerUp => powerUp.x === this.food.x && powerUp.y === this.food.y));
    }

    generatePowerUp() {
        const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        let x, y;

        do {
            x = Math.floor(Math.random() * this.gridSize);
            y = Math.floor(Math.random() * this.gridSize);
        } while (this.snake.some(segment => segment.x === x && segment.y === y) ||
        (this.food.x === x && this.food.y === y) ||
            this.powerUps.some(powerUp => powerUp.x === x && powerUp.y === y));

        this.powerUps.push({
            x: x,
            y: y,
            type: type,
            life: 100 // Power-ups disappear after 100 frames
        });
    }

    checkPowerUpCollisions() {
        const head = this.snake[0];

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];

            if (head.x === powerUp.x && head.y === powerUp.y) {
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                this.createPowerUpEffect(powerUp.x, powerUp.y, powerUp.type);
            } else {
                powerUp.life--;
                if (powerUp.life <= 0) {
                    this.powerUps.splice(i, 1);
                }
            }
        }
    }

    activatePowerUp(type) {
        this.activePowerUps[type] = Date.now() + this.powerUpDuration;

        switch (type) {
            case 'speed':
                this.gameSpeed = Math.max(30, this.gameSpeed * 0.7);
                break;
            case 'slow':
                this.gameSpeed = Math.min(300, this.gameSpeed * 1.5);
                break;
            case 'shrink':
                if (this.snake.length > 3) {
                    this.snake.pop();
                    this.snake.pop();
                }
                break;
        }

        // Restart game loop with new speed
        if (type === 'speed' || type === 'slow') {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
    }

    updatePowerUpTimers() {
        const now = Date.now();
        for (const [type, endTime] of Object.entries(this.activePowerUps)) {
            if (now > endTime) {
                delete this.activePowerUps[type];

                // Reset speed if speed/slow power-up expires
                if (type === 'speed' || type === 'slow') {
                    this.gameSpeed = Math.max(50, this.baseSpeed - (this.level - 1) * 5);
                    clearInterval(this.gameLoop);
                    this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
                }
            }
        }
    }

    draw() {
        // Clear canvas
        this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw background gradient
        this.drawBackground();

        // Draw grid (subtle)
        this.drawGrid();

        // Draw power-ups
        this.drawPowerUps();

        // Draw snake
        this.drawSnake();

        // Draw food
        this.drawFood();

        // Draw particles
        this.drawParticles();

        // Draw effects
        this.drawEffects();

        // Draw active power-up indicators
        this.drawPowerUpIndicators();
    }

    drawBackground() {
        const gradient = this.gameContext.createLinearGradient(0, 0, this.canvasSize, this.canvasSize);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.gameContext.fillStyle = gradient;
        this.gameContext.fillRect(0, 0, this.canvasSize, this.canvasSize);
    }

    drawGrid() {
        this.gameContext.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.gameContext.lineWidth = 0.5;

        for (let x = 0; x <= this.canvasSize; x += this.canvasSize / this.gridSize) {
            this.gameContext.beginPath();
            this.gameContext.moveTo(x, 0);
            this.gameContext.lineTo(x, this.canvasSize);
            this.gameContext.stroke();
        }

        for (let y = 0; y <= this.canvasSize; y += this.canvasSize / this.gridSize) {
            this.gameContext.beginPath();
            this.gameContext.moveTo(0, y);
            this.gameContext.lineTo(this.canvasSize, y);
            this.gameContext.stroke();
        }
    }

    drawSnake() {
        const cellSize = this.canvasSize / this.gridSize;

        this.snake.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;
            const size = cellSize - 2;

            if (index === 0) {
                // Head with glow effect
                this.gameContext.shadowColor = this.activePowerUps.ghost ? '#00ffff' : '#4CAF50';
                this.gameContext.shadowBlur = 10;
                this.gameContext.fillStyle = this.activePowerUps.ghost ? '#00ffff' : '#2E7D32';
            } else {
                this.gameContext.shadowBlur = 0;
                this.gameContext.fillStyle = this.activePowerUps.ghost ? 'rgba(0, 255, 255, 0.7)' : '#4CAF50';
            }

            // Rounded rectangle for snake segments
            this.gameContext.beginPath();
            this.gameContext.roundRect(x + 1, y + 1, size, size, 4);
            this.gameContext.fill();

            // Draw eyes on head
            if (index === 0) {
                this.drawSnakeEyes(x, y, cellSize);
            }
        });

        this.gameContext.shadowBlur = 0;
    }

    drawSnakeEyes(x, y, cellSize) {
        this.gameContext.fillStyle = '#ffffff';
        const eyeSize = cellSize * 0.15;
        const eyeOffset = cellSize * 0.25;

        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

        switch (this.direction) {
            case 'right':
                leftEyeX = x + cellSize - eyeOffset;
                leftEyeY = y + eyeOffset;
                rightEyeX = x + cellSize - eyeOffset;
                rightEyeY = y + cellSize - eyeOffset;
                break;
            case 'left':
                leftEyeX = x + eyeOffset;
                leftEyeY = y + eyeOffset;
                rightEyeX = x + eyeOffset;
                rightEyeY = y + cellSize - eyeOffset;
                break;
            case 'up':
                leftEyeX = x + eyeOffset;
                leftEyeY = y + eyeOffset;
                rightEyeX = x + cellSize - eyeOffset;
                rightEyeY = y + eyeOffset;
                break;
            case 'down':
                leftEyeX = x + eyeOffset;
                leftEyeY = y + cellSize - eyeOffset;
                rightEyeX = x + cellSize - eyeOffset;
                rightEyeY = y + cellSize - eyeOffset;
                break;
        }

        this.gameContext.beginPath();
        this.gameContext.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        this.gameContext.fill();
        this.gameContext.beginPath();
        this.gameContext.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        this.gameContext.fill();
    }

    drawFood() {
        const cellSize = this.canvasSize / this.gridSize;
        const x = this.food.x * cellSize;
        const y = this.food.y * cellSize;
        const size = cellSize - 2;

        // Animated food with pulsing effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        const finalSize = size * pulse;
        const offset = (size - finalSize) / 2;

        this.gameContext.shadowColor = '#ff6b6b';
        this.gameContext.shadowBlur = 15;
        this.gameContext.fillStyle = '#ff6b6b';

        this.gameContext.beginPath();
        this.gameContext.arc(x + cellSize / 2, y + cellSize / 2, finalSize / 2, 0, Math.PI * 2);
        this.gameContext.fill();

        this.gameContext.shadowBlur = 0;
    }

    drawPowerUps() {
        const cellSize = this.canvasSize / this.gridSize;

        this.powerUps.forEach(powerUp => {
            const x = powerUp.x * cellSize;
            const y = powerUp.y * cellSize;
            const size = cellSize - 2;

            // Blinking effect
            const blink = Math.sin(Date.now() * 0.02) > 0;
            if (!blink) return;

            const colors = {
                'speed': '#ffd700',
                'slow': '#87ceeb',
                'double': '#ff69b4',
                'ghost': '#00ffff',
                'shrink': '#ff4500'
            };

            this.gameContext.shadowColor = colors[powerUp.type];
            this.gameContext.shadowBlur = 10;
            this.gameContext.fillStyle = colors[powerUp.type];

            this.gameContext.beginPath();
            this.gameContext.arc(x + cellSize / 2, y + cellSize / 2, size / 2, 0, Math.PI * 2);
            this.gameContext.fill();

            this.gameContext.shadowBlur = 0;
        });
    }

    drawPowerUpIndicators() {
        const activePowerUps = Object.keys(this.activePowerUps);
        if (activePowerUps.length === 0) return;

        let y = 10;
        activePowerUps.forEach(type => {
            const timeLeft = Math.max(0, this.activePowerUps[type] - Date.now());
            const progress = timeLeft / this.powerUpDuration;

            this.gameContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.gameContext.fillRect(10, y, 100, 20);

            const colors = {
                'speed': '#ffd700',
                'slow': '#87ceeb',
                'double': '#ff69b4',
                'ghost': '#00ffff',
                'shrink': '#ff4500'
            };

            this.gameContext.fillStyle = colors[type];
            this.gameContext.fillRect(10, y, 100 * progress, 20);

            this.gameContext.fillStyle = '#ffffff';
            this.gameContext.font = '12px Arial';
            this.gameContext.fillText(type.toUpperCase(), 15, y + 14);

            y += 25;
        });
    }

    // Particle and effect methods
    createEatingEffect(x, y) {
        const cellSize = this.canvasSize / this.gridSize;
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;

        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: '#ff6b6b',
                size: Math.random() * 3 + 2
            });
        }
    }

    createPowerUpEffect(x, y, type) {
        const cellSize = this.canvasSize / this.gridSize;
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;

        const colors = {
            'speed': '#ffd700',
            'slow': '#87ceeb',
            'double': '#ff69b4',
            'ghost': '#00ffff',
            'shrink': '#ff4500'
        };

        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 40,
                maxLife: 40,
                color: colors[type],
                size: Math.random() * 4 + 3
            });
        }
    }

    createLevelUpEffect() {
        this.effects.push({
            type: 'levelUp',
            life: 60,
            maxLife: 60,
            text: `LEVEL ${this.level}!`
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life--;

            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.gameContext.globalAlpha = alpha;
            this.gameContext.fillStyle = particle.color;
            this.gameContext.beginPath();
            this.gameContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.gameContext.fill();
        });
        this.gameContext.globalAlpha = 1;
    }

    drawEffects() {
        this.effects.forEach(effect => {
            if (effect.type === 'levelUp') {
                const alpha = effect.life / effect.maxLife;
                this.gameContext.globalAlpha = alpha;
                this.gameContext.fillStyle = '#ffd700';
                this.gameContext.font = 'bold 24px Arial';
                this.gameContext.textAlign = 'center';
                this.gameContext.fillText(effect.text, this.canvasSize / 2, this.canvasSize / 2);
                this.gameContext.globalAlpha = 1;
            }
        });
    }

    updateLevel() {
        document.getElementById('gameLevel').textContent = `Level: ${this.level}`;
    }

    gameOver() {
        this.stopGame();
        this.saveHighScore();

        // Create game over effect
        this.createGameOverEffect();

        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('pauseGameBtn').style.display = 'none';

        // Show game over message with more details
        const message = `Game Over!\n\nScore: ${this.score}\nLevel: ${this.level}\nHigh Score: ${localStorage.getItem('snakeHighScore') || 0}`;
        setTimeout(() => this.showGameOverScreen(), 100);
    }
    showGameOverScreen() {
        // remove any old overlay if it exists
        const oldOverlay = document.getElementById('game-over-screen');
        if (oldOverlay) oldOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'game-over-screen';
        overlay.className = 'game-over-screen';
        overlay.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: ${this.score}</p>
            <p>Level: ${this.level}</p>
            <p>High Score: ${localStorage.getItem('snakeHighScore') || 0}</p>
            <button onclick="window.game.restartGame()">Restart</button>
            <button onclick="window.game.closeGame()">Quit</button>
        `;
        document.getElementById('gameBox').appendChild(overlay);
    }
    updateScore() {
        document.getElementById('gameScore').textContent = `Score: ${this.score}`;
    }

    createGameOverEffect() {
        // Create explosion effect
        const head = this.snake[0];
        const cellSize = this.canvasSize / this.gridSize;
        const centerX = head.x * cellSize + cellSize / 2;
        const centerY = head.y * cellSize + cellSize / 2;

        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 50,
                maxLife: 50,
                color: '#ff4444',
                size: Math.random() * 5 + 3
            });
        }
    }


    loadHighScore() {
        const highScore = localStorage.getItem('snakeHighScore') || 0;
        document.getElementById('gameHighScore').textContent = `High Score: ${highScore}`;
    }

    saveHighScore() {
        const currentHighScore = localStorage.getItem('snakeHighScore') || 0;
        if (this.score > currentHighScore) {
            localStorage.setItem('snakeHighScore', this.score);
            document.getElementById('gameHighScore').textContent = `High Score: ${this.score}`;
        }
    }

    exposeToGlobal() {
        window.game = this;
    }
}
