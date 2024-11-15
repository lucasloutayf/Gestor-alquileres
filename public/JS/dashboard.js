// Dashboard Statistics
function calculateStatistics() {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
    const propertyLimits = {
        1: 14,  // Neuquen 266
        2: 26,  // Neuquen 274
        3: 18   // Santa Rosa
    };

    const stats = {
        totalTenants: { 1: 0, 2: 0, 3: 0 },
        monthlyIncome: { 1: 0, 2: 0, 3: 0 },
        paymentStatus: { al_dia: 0, debe: 0 },
        occupancy: propertyLimits
    };

    Object.values(tenants).forEach(tenant => {
        // Count tenants per property
        if (tenant.propertyId) {
            stats.totalTenants[tenant.propertyId]++;
            
            // Calculate monthly income
            stats.monthlyIncome[tenant.propertyId] += Number(tenant.precioPieza) || 0;
            
            // Payment status count
            if (tenant.estadoPago) {
                stats.paymentStatus[tenant.estadoPago]++;
            }
        }
    });

    return stats;
}

function updateDashboard() {
    const stats = calculateStatistics();
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    // Determine current property based on URL
    const currentPath = window.location.pathname;
    let currentPropertyId = 1; // Default to Neuquen 266

    if (currentPath.includes('neuquen274')) {
        currentPropertyId = 2;
    } else if (currentPath.includes('santarosa')) {
        currentPropertyId = 3;
    }

    // Calculate occupancy rate for current property
    const occupancyRate = ((stats.totalTenants[currentPropertyId] / stats.occupancy[currentPropertyId]) * 100).toFixed(1);
    const totalIncome = Object.values(stats.monthlyIncome).reduce((a, b) => a + b, 0);

    dashboard.innerHTML = `
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-icons">people</span>
                </div>
                <h3>Inquilinas Totales</h3>
                <div class="stat-content">
                    <p>Neuquen 266: ${stats.totalTenants[1]}</p>
                    <p>Neuquen 274: ${stats.totalTenants[2]}</p>
                    <p>Santa Rosa: ${stats.totalTenants[3]}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-icons">payments</span>
                </div>
                <h3>Ingresos Mensuales</h3>
                <div class="stat-content">
                    <p>Total: $${totalIncome.toLocaleString()}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: 100%"></div>
                    </div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-icons">account_balance_wallet</span>
                </div>
                <h3>Estado de Pagos</h3>
                <div class="stat-content">
                    <p>Al día: ${stats.paymentStatus.al_dia}</p>
                    <p>En deuda: ${stats.paymentStatus.debe}</p>
                    <div class="payment-status-chart">
                        <div class="status-bar al-dia" style="width: ${(stats.paymentStatus.al_dia / (stats.paymentStatus.al_dia + stats.paymentStatus.debe) * 100) || 0}%"></div>
                    </div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-icons">home</span>
                </div>
                <h3>Tasa de Ocupación</h3>
                <div class="stat-content">
                    <p>${occupancyRate}% Ocupado</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${occupancyRate}%"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="dashboard-actions">
            <button onclick="generateReport()" class="action-button">
                <span class="material-icons">description</span>
                Generar Reporte
            </button>
            <button onclick="showPaymentReminders()" class="action-button">
                <span class="material-icons">notifications</span>
                Recordatorios de Pago
            </button>
            <button onclick="exportData()" class="action-button">
                <span class="material-icons">download</span>
                Exportar Datos
            </button>
        </div>
    `;
}

// Export functionality
function exportData() {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
    const csvContent = generateCSV(tenants);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inquilinas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function generateCSV(tenants) {
    const headers = ['Nombre', 'Apellido', 'DNI', 'Teléfono', 'Precio', 'Estado', 'Última Fecha de Pago'];
    const rows = Object.values(tenants).map(t => [
        t.nombre,
        t.apellido,
        t.dni,
        t.telefono,
        t.precioPieza,
        t.estadoPago,
        t.fechaRecibo
    ]);
    
    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

// Payment reminders
function showPaymentReminders() {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
    const today = new Date();
    const reminders = [];

    Object.values(tenants).forEach(tenant => {
        const lastPayment = new Date(tenant.fechaRecibo);
        const daysSincePayment = Math.floor((today - lastPayment) / (1000 * 60 * 60 * 24));
        
        if (daysSincePayment >= 30) {
            reminders.push({
                name: `${tenant.nombre} ${tenant.apellido}`,
                days: daysSincePayment,
                amount: tenant.precioPieza
            });
        }
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Recordatorios de Pago</h2>
            <div class="reminders-list">
                ${reminders.map(r => `
                    <div class="reminder-item">
                        <p>${r.name}</p>
                        <p>Días desde último pago: ${r.days}</p>
                        <p>Monto: $${r.amount}</p>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.closest('.modal').remove()">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
});