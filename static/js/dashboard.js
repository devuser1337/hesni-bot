// Enhanced JavaScript functionality for the modern dashboard

class TradingDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.refreshInterval = null;
        this.websocket = null;
        this.charts = {};
        this.notifications = [];
        
        this.init();
    }

    init() {
        this.initializeParticles();
        this.initializeWebSocket();
        this.setupEventListeners();
        this.startAutoRefresh();
        this.loadInitialData();
        this.initializeCharts();
    }

    // Enhanced particle system
    initializeParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const particleCount = 100;
        const colors = ['#00d4ff', '#8b5cf6', '#00ff88'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particlesContainer.appendChild(particle);
        }
    }

    // WebSocket connection for real-time updates
    initializeWebSocket() {
        // This would connect to a WebSocket endpoint for real-time data
        // For now, we'll simulate with periodic updates
        console.log('WebSocket connection initialized (simulated)');
    }

    // Enhanced event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Form submissions
        const createStrategyForm = document.getElementById('createStrategyForm');
        if (createStrategyForm) {
            createStrategyForm.addEventListener('submit', (e) => this.handleCreateStrategy(e));
        }

        // Responsive design
        window.addEventListener('resize', () => this.handleResize());
    }

    // Navigation handler
    handleNavigation(e) {
        e.preventDefault();
        const sectionName = e.target.textContent.toLowerCase().trim();
        this.showSection(sectionName);
    }

    // Enhanced section switching with animations
    showSection(sectionName) {
        // Hide all sections with fade out
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            setTimeout(() => {
                section.style.display = 'none';
            }, 300);
        });

        // Show target section with fade in
        setTimeout(() => {
            const targetSection = document.getElementById(sectionName + '-section');
            if (targetSection) {
                targetSection.style.display = 'block';
                setTimeout(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateY(0)';
                }, 50);
            }

            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const activeNav = Array.from(document.querySelectorAll('.nav-item'))
                .find(item => item.textContent.toLowerCase().includes(sectionName));
            if (activeNav) {
                activeNav.classList.add('active');
            }

            this.currentSection = sectionName;
            this.loadSectionData(sectionName);
        }, 300);
    }

    // Load section-specific data
    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'stratégies':
                this.loadStrategies();
                break;
            case 'trades':
                this.loadTrades();
                break;
            case 'logs':
                this.loadLogs();
                break;
        }
    }

    // Enhanced data loading with error handling and loading states
    async loadDashboardData() {
        try {
            this.showLoadingState('dashboard');
            
            const response = await fetch('/api/dashboard-data');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            // Animate number changes
            this.animateValue('activeStrategies', data.active_count);
            this.animateValue('totalPnl', data.total_pnl, '$');
            this.animateValue('dailyTrades', data.daily_trades);
            this.animateValue('balance', data.balance, '$');
            
            this.updateMexcStatus(data.mexc_status);
            this.hideLoadingState('dashboard');
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
            this.hideLoadingState('dashboard');
        }
    }

    // Animate value changes
    animateValue(elementId, targetValue, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = startValue + (targetValue - startValue) * this.easeOutCubic(progress);
            element.textContent = prefix + currentValue.toFixed(2);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Easing function
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Enhanced strategy loading with real-time status
    async loadStrategies() {
        try {
            this.showLoadingState('strategies');
            
            const response = await fetch('/api/strategies');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            const grid = document.getElementById('strategiesGrid');
            if (grid) {
                grid.innerHTML = '';
                
                data.strategies.forEach((strategy, index) => {
                    setTimeout(() => {
                        const card = this.createStrategyCard(strategy);
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        grid.appendChild(card);
                        
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    }, index * 100);
                });
            }
            
            this.hideLoadingState('strategies');
            
        } catch (error) {
            console.error('Error loading strategies:', error);
            this.showNotification('Erreur lors du chargement des stratégies', 'error');
            this.hideLoadingState('strategies');
        }
    }

    // Enhanced strategy card creation
    createStrategyCard(strategy) {
        const card = document.createElement('div');
        card.className = 'strategy-card cyber-card';
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const statusClass = strategy.status === 'running' ? 'status-running' : 'status-stopped';
        const statusText = strategy.status === 'running' ? 'En cours' : 'Arrêtée';
        const statusIcon = strategy.status === 'running' ? 'fa-play' : 'fa-stop';
        
        // Calculate some mock metrics for demonstration
        const pnl = (Math.random() * 200 - 100).toFixed(2);
        const pnlColor = pnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        const pnlIcon = pnl >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        card.innerHTML = `
            <div class="strategy-header">
                <h3 class="strategy-name">${strategy.name}</h3>
                <span class="strategy-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${statusText}
                </span>
            </div>
            <div class="strategy-info">
                <div class="strategy-metric">
                    <span class="strategy-metric-label">Type:</span>
                    <span class="strategy-metric-value">${strategy.type}</span>
                </div>
                <div class="strategy-metric">
                    <span class="strategy-metric-label">Créée le:</span>
                    <span class="strategy-metric-value">${new Date(strategy.created_at).toLocaleDateString()}</span>
                </div>
                <div class="strategy-metric">
                    <span class="strategy-metric-label">P&L:</span>
                    <span class="strategy-metric-value" style="color: ${pnlColor};">
                        <i class="fas ${pnlIcon}"></i>
                        $${pnl}
                    </span>
                </div>
                <div class="strategy-metric">
                    <span class="strategy-metric-label">Performance:</span>
                    <div class="data-bar">
                        <div class="data-bar-fill" style="width: ${Math.random() * 100}%"></div>
                    </div>
                </div>
            </div>
            <div class="strategy-actions">
                ${strategy.status === 'running' ? 
                    `<button class="btn btn-danger" onclick="dashboard.stopStrategy(${strategy.id})">
                        <i class="fas fa-stop"></i> Arrêter
                    </button>` :
                    `<button class="btn btn-success" onclick="dashboard.startStrategy(${strategy.id})">
                        <i class="fas fa-play"></i> Démarrer
                    </button>`
                }
                <button class="btn btn-outline" onclick="dashboard.editStrategy(${strategy.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        `;
        
        return card;
    }

    // Enhanced strategy management
    async startStrategy(strategyId) {
        try {
            this.showLoadingButton(`button[onclick="dashboard.startStrategy(${strategyId})"]`);
            
            const response = await fetch(`/api/strategies/${strategyId}/start`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showNotification('Stratégie démarrée avec succès', 'success');
                await this.loadStrategies();
                await this.loadDashboardData();
            } else {
                throw new Error('Erreur lors du démarrage');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Erreur lors du démarrage de la stratégie', 'error');
        } finally {
            this.hideLoadingButton(`button[onclick="dashboard.startStrategy(${strategyId})"]`);
        }
    }

    async stopStrategy(strategyId) {
        try {
            this.showLoadingButton(`button[onclick="dashboard.stopStrategy(${strategyId})"]`);
            
            const response = await fetch(`/api/strategies/${strategyId}/stop`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showNotification('Stratégie arrêtée avec succès', 'success');
                await this.loadStrategies();
                await this.loadDashboardData();
            } else {
                throw new Error('Erreur lors de l\'arrêt');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Erreur lors de l\'arrêt de la stratégie', 'error');
        } finally {
            this.hideLoadingButton(`button[onclick="dashboard.stopStrategy(${strategyId})"]`);
        }
    }

    // Loading states
    showLoadingState(section) {
        const loader = document.createElement('div');
        loader.className = 'cyber-loader';
        loader.id = `${section}-loader`;
        
        const container = document.getElementById(`${section}Grid`) || 
                         document.querySelector(`#${section}-section .section-content`);
        
        if (container) {
            container.appendChild(loader);
        }
    }

    hideLoadingState(section) {
        const loader = document.getElementById(`${section}-loader`);
        if (loader) {
            loader.remove();
        }
    }

    showLoadingButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.disabled = true;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }
        }
    }

    hideLoadingButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.disabled = false;
            const icon = button.querySelector('i');
            if (icon) {
                // Restore original icon based on button content
                if (button.textContent.includes('Démarrer')) {
                    icon.className = 'fas fa-play';
                } else if (button.textContent.includes('Arrêter')) {
                    icon.className = 'fas fa-stop';
                }
            }
        }
    }

    // Enhanced notification system
    showNotification(message, type = 'success', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
    }

    renderNotification(notification) {
        const toast = document.createElement('div');
        toast.className = `toast ${notification.type} show`;
        toast.id = `toast-${notification.id}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                <span>${notification.message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
    }

    removeNotification(id) {
        const toast = document.getElementById(`toast-${id}`);
        if (toast) {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-bell';
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.key === 'Escape') {
            this.closeAllModals();
        } else if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    this.refreshData();
                    break;
                case 'n':
                    e.preventDefault();
                    this.showCreateStrategyModal();
                    break;
            }
        }
    }

    // Modal management
    showCreateStrategyModal() {
        const modal = document.getElementById('createStrategyModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    closeModal(modal) {
        modal.classList.remove('show');
    }

    // Auto-refresh functionality
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000); // 30 seconds
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Manual refresh
    refreshData() {
        this.loadSectionData(this.currentSection);
        this.showNotification('Données actualisées', 'success');
    }

    // Initialize charts (placeholder for future chart integration)
    initializeCharts() {
        // This would initialize TradingView charts or other charting libraries
        console.log('Charts initialized (placeholder)');
    }

    // Load initial data
    loadInitialData() {
        this.loadDashboardData();
        this.loadStrategies();
    }

    // Update MEXC status with enhanced visual feedback
    updateMexcStatus(isConnected) {
        const statusElement = document.getElementById('mexcStatus');
        if (!statusElement) return;

        if (isConnected) {
            statusElement.className = 'status-indicator status-online pulse-glow';
            statusElement.innerHTML = `
                <div class="status-dot" style="background: var(--success-color);"></div>
                <span>MEXC Connecté</span>
            `;
        } else {
            statusElement.className = 'status-indicator status-offline';
            statusElement.innerHTML = `
                <div class="status-dot" style="background: var(--danger-color);"></div>
                <span>MEXC Déconnecté</span>
            `;
        }
    }

    // Responsive design handler
    handleResize() {
        if (window.innerWidth <= 768) {
            // Mobile optimizations
            this.optimizeForMobile();
        } else {
            // Desktop optimizations
            this.optimizeForDesktop();
        }
    }

    optimizeForMobile() {
        // Add mobile-specific optimizations
        console.log('Optimizing for mobile');
    }

    optimizeForDesktop() {
        // Add desktop-specific optimizations
        console.log('Optimizing for desktop');
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        if (this.websocket) {
            this.websocket.close();
        }
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new TradingDashboard();
});

// Global functions for backward compatibility
function showSection(sectionName) {
    if (dashboard) {
        dashboard.showSection(sectionName);
    }
}

function refreshData() {
    if (dashboard) {
        dashboard.refreshData();
    }
}

function showCreateStrategyModal() {
    if (dashboard) {
        dashboard.showCreateStrategyModal();
    }
}

function hideCreateStrategyModal() {
    if (dashboard) {
        dashboard.closeAllModals();
    }
}