// Configuration
const CONFIG = {
    API_BASE_URL: 'https://web-api.tp.entsoe.eu/api',
    FINLAND_DOMAIN: '10YFI-1--------U',
    DOCUMENT_TYPE: 'A44', // Day-ahead prices
    // Note: API key should be provided by user
    API_KEY: 'YOUR_API_KEY_HERE'
};

// Global variables
let priceChart = null;
let currentPriceData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing Finland Electricity Price Tracker...');
    loadElectricityPrices();
}

// Main function to load electricity prices
async function loadElectricityPrices() {
    showLoading();
    hideError();
    hideChart();
    
    try {
        const priceData = await fetchElectricityPrices();
        currentPriceData = priceData;
        displayPriceChart(priceData);
        updatePriceInfo(priceData);
        showChart();
        hideLoading();
    } catch (error) {
        console.error('Error loading electricity prices:', error);
        showError(error.message);
        hideLoading();
    }
}

// Fetch electricity prices from ENTSO-E API
async function fetchElectricityPrices() {
    // Get current date in UTC
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    // Format dates for API (YYYYMMDDHHMM)
    const periodStart = formatDateForAPI(startDate);
    const periodEnd = formatDateForAPI(endDate);
    
    // Construct API URL
    const params = new URLSearchParams({
        securityToken: CONFIG.API_KEY,
        documentType: CONFIG.DOCUMENT_TYPE,
        in_Domain: CONFIG.FINLAND_DOMAIN,
        out_Domain: CONFIG.FINLAND_DOMAIN,
        periodStart: periodStart,
        periodEnd: periodEnd
    });
    
    const apiUrl = `${CONFIG.API_BASE_URL}?${params.toString()}`;
    
    // Check if API key is provided
    if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        // For demo purposes, return mock data
        console.warn('Using mock data - please provide ENTSO-E API key');
        return generateMockData();
    }
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        return parseElectricityPriceXML(xmlText);
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // Network error or CORS issue - use mock data for demo
            console.warn('Network error, using mock data for demonstration');
            return generateMockData();
        }
        throw error;
    }
}

// Parse XML response from ENTSO-E API
function parseElectricityPriceXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for XML parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        throw new Error('Invalid XML response from API');
    }
    
    // Extract price points
    const points = xmlDoc.querySelectorAll('Point');
    const priceData = [];
    
    points.forEach(point => {
        const position = parseInt(point.querySelector('position')?.textContent);
        const priceAmount = parseFloat(point.querySelector('price\\.amount')?.textContent);
        
        if (position && !isNaN(priceAmount)) {
            priceData.push({
                hour: position - 1, // Convert to 0-23 format
                price: priceAmount,
                time: `${String(position - 1).padStart(2, '0')}:00`
            });
        }
    });
    
    if (priceData.length === 0) {
        throw new Error('No price data found in API response');
    }
    
    return priceData.sort((a, b) => a.hour - b.hour);
}

// Generate mock data for demonstration
function generateMockData() {
    const mockData = [];
    const basePrice = 45; // Base price around 45 EUR/MWh
    
    for (let hour = 0; hour < 24; hour++) {
        // Create realistic price variation
        let price = basePrice;
        
        // Higher prices during peak hours (7-9, 17-21)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 21)) {
            price += Math.random() * 25 + 15; // 15-40 EUR higher
        }
        // Lower prices during night (23-6)
        else if (hour >= 23 || hour <= 6) {
            price -= Math.random() * 15 + 5; // 5-20 EUR lower
        }
        // Normal variation during other hours
        else {
            price += (Math.random() - 0.5) * 20; // ±10 EUR variation
        }
        
        mockData.push({
            hour: hour,
            price: Math.max(0, Math.round(price * 100) / 100), // Ensure positive, round to 2 decimals
            time: `${String(hour).padStart(2, '0')}:00`
        });
    }
    
    return mockData;
}

// Format date for ENTSO-E API
function formatDateForAPI(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}0000`;
}

// Display price chart using Chart.js
function displayPriceChart(priceData) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (priceChart) {
        priceChart.destroy();
    }
    
    const labels = priceData.map(item => item.time);
    const prices = priceData.map(item => item.price);
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Electricity Price',
                data: prices,
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#EC4899',
                pointBorderColor: '#EC4899',
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2D3748',
                    bodyColor: '#2D3748',
                    borderColor: '#E2E8F0',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return `Time: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Price: ${context.parsed.y.toFixed(2)} EUR/MWh`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Hours)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#4A5568'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (EUR/MWh)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#4A5568'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        callback: function(value) {
                            return value.toFixed(0) + ' €';
                        }
                    }
                }
            },
            onHover: function(event, activeElements) {
                if (activeElements.length > 0) {
                    const canvasPosition = Chart.helpers.getRelativePosition(event, priceChart);
                    const datasetIndex = activeElements[0].datasetIndex;
                    const index = activeElements[0].index;
                    
                    // Get canvas coordinates
                    const canvasRect = priceChart.canvas.getBoundingClientRect();
                    const x = canvasRect.left + (canvasPosition.x * priceChart.canvas.width / priceChart.canvas.offsetWidth);
                    const y = canvasRect.top + (canvasPosition.y * priceChart.canvas.height / priceChart.canvas.offsetHeight);
                    
                    // Trigger glitter effect
                    createGlitterBurst(x, y);
                }
            }
        }
    });
}

// Create glitter burst effect
function createGlitterBurst(x, y) {
    const glitterContainer = document.getElementById('glitter-container');
    const particleCount = 12;
    const colors = ['pink', 'green', 'blue'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = `glitter-particle ${colors[Math.floor(Math.random() * colors.length)]}`;
        
        // Random position around the click point
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.random() * 50 + 20;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        
        glitterContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
}

// Update price information display
function updatePriceInfo(priceData) {
    const currentDate = new Date().toLocaleDateString('en-FI', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const prices = priceData.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    document.getElementById('current-date').textContent = currentDate;
    document.getElementById('price-range').textContent = 
        `Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} EUR/MWh`;
}

// UI State Management Functions
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    document.getElementById('error-text').textContent = message;
    document.getElementById('error').style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function showChart() {
    document.getElementById('chart-container').style.display = 'block';
}

function hideChart() {
    document.getElementById('chart-container').style.display = 'none';
}

// Auto-refresh data every hour
setInterval(() => {
    console.log('Auto-refreshing electricity prices...');
    loadElectricityPrices();
}, 60 * 60 * 1000); // 1 hour

// Handle window resize
window.addEventListener('resize', function() {
    if (priceChart) {
        priceChart.resize();
    }
});
