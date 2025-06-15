// Advanced particle system for the trading dashboard

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.particles = [];
        this.options = {
            count: options.count || 100,
            colors: options.colors || ['#00d4ff', '#8b5cf6', '#00ff88', '#ff6b6b'],
            speed: options.speed || 1,
            size: options.size || 2,
            opacity: options.opacity || 0.6,
            interactive: options.interactive || true,
            ...options
        };
        
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < this.options.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * this.options.speed,
            vy: (Math.random() - 0.5) * this.options.speed,
            size: Math.random() * this.options.size + 1,
            color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
            opacity: Math.random() * this.options.opacity,
            life: Math.random() * 100,
            element: this.createElement()
        };
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'particle';
        element.style.position = 'absolute';
        element.style.borderRadius = '50%';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '-1';
        this.container.appendChild(element);
        return element;
    }

    updateParticle(particle) {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > window.innerWidth) {
            particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > window.innerHeight) {
            particle.vy *= -1;
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
        particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));

        // Interactive behavior
        if (this.options.interactive) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.1;
                particle.vy -= (dy / distance) * force * 0.1;
            }
        }

        // Update life and opacity
        particle.life += 0.5;
        particle.opacity = Math.sin(particle.life * 0.02) * 0.5 + 0.5;

        // Update DOM element
        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';
        particle.element.style.width = particle.size + 'px';
        particle.element.style.height = particle.size + 'px';
        particle.element.style.background = particle.color;
        particle.element.style.opacity = particle.opacity * this.options.opacity;
        particle.element.style.boxShadow = `0 0 ${particle.size * 2}px ${particle.color}`;
    }

    animate() {
        this.particles.forEach(particle => this.updateParticle(particle));
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        if (this.options.interactive) {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
        }

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Adjust particles for new window size
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight;
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        this.particles = [];
    }

    // Add new particle
    addParticle(x, y) {
        const particle = this.createParticle();
        particle.x = x || Math.random() * window.innerWidth;
        particle.y = y || Math.random() * window.innerHeight;
        this.particles.push(particle);
    }

    // Remove particles
    removeParticles(count) {
        for (let i = 0; i < count && this.particles.length > 0; i++) {
            const particle = this.particles.pop();
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        }
    }

    // Update options
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// Matrix rain effect
class MatrixRain {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.1';
        
        this.container.appendChild(this.canvas);
        this.resize();
        this.createDrops();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createDrops() {
        const columns = Math.floor(this.canvas.width / 20);
        this.drops = Array(columns).fill(0).map(() => Math.random() * this.canvas.height);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = '15px monospace';
        
        this.drops.forEach((drop, i) => {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.ctx.fillText(char, i * 20, drop);
            
            if (drop > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            this.drops[i] += 20;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Neural network visualization
class NeuralNetwork {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        
        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.3';
        
        this.container.appendChild(this.canvas);
        this.resize();
        this.createNetwork();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createNetwork() {
        const nodeCount = 50;
        this.nodes = [];
        this.connections = [];
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                pulse: Math.random() * Math.PI * 2
            });
        }
        
        // Create connections
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.connections.push({
                        from: i,
                        to: j,
                        strength: 1 - (distance / 150)
                    });
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw connections
        this.ctx.strokeStyle = '#00d4ff';
        this.connections.forEach(connection => {
            const from = this.nodes[connection.from];
            const to = this.nodes[connection.to];
            
            this.ctx.globalAlpha = connection.strength * 0.3;
            this.ctx.lineWidth = connection.strength * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
        });
        
        // Update and draw nodes
        this.nodes.forEach(node => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
            
            // Keep in bounds
            node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            
            // Update pulse
            node.pulse += 0.02;
            
            // Draw node
            const pulseSize = node.size + Math.sin(node.pulse) * 2;
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw glow
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// Export for use in main dashboard
window.ParticleSystem = ParticleSystem;
window.MatrixRain = MatrixRain;
window.NeuralNetwork = NeuralNetwork;