// Report generation functions
function generateReport() {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
    const reportData = prepareReportData(tenants);
    
    const reportContent = `
        <div class="report-container">
            <div class="report-header">
                <h2>Reporte de Gestión de Alquileres</h2>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="report-section">
                <h3>Resumen General</h3>
                <ul>
                    <li>Total de Inquilinas: ${reportData.totalTenants}</li>
                    <li>Ingresos Mensuales Totales: $${reportData.totalMonthlyIncome.toLocaleString()}</li>
                    <li>Tasa de Ocupación Total: ${reportData.totalOccupancyRate}%</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h3>Estado de Pagos</h3>
                <ul>
                    <li>Al día: ${reportData.paymentStatus.alDia}</li>
                    <li>En mora: ${reportData.paymentStatus.debe}</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h3>Detalle por Propiedad</h3>
                ${generatePropertyDetails(reportData.properties)}
            </div>
        </div>
    `;
    
    showReportModal(reportContent);
}

function prepareReportData(tenants) {
    const propertyLimits = {
        1: 14,  // Neuquen 266
        2: 26,  // Neuquen 274
        3: 18   // Santa Rosa
    };

    const data = {
        totalTenants: 0,
        totalMonthlyIncome: 0,
        totalOccupancyRate: 0,
        paymentStatus: { alDia: 0, debe: 0 },
        properties: {
            1: { 
                name: 'Neuquen 266', 
                tenants: 0, 
                income: 0,
                maxTenants: propertyLimits[1],
                occupancyRate: 0
            },
            2: { 
                name: 'Neuquen 274', 
                tenants: 0, 
                income: 0,
                maxTenants: propertyLimits[2],
                occupancyRate: 0
            },
            3: { 
                name: 'Santa Rosa 1459', 
                tenants: 0, 
                income: 0,
                maxTenants: propertyLimits[3],
                occupancyRate: 0
            }
        }
    };
    
    // Calculate property-specific stats
    Object.values(tenants).forEach(tenant => {
        if (tenant.propertyId && tenant.precioPieza) {
            data.totalTenants++;
            const income = Number(tenant.precioPieza) || 0;
            data.totalMonthlyIncome += income;
            
            if (tenant.estadoPago) {
                data.paymentStatus[tenant.estadoPago === 'al_dia' ? 'alDia' : 'debe']++;
            }
            
            const property = data.properties[tenant.propertyId];
            if (property) {
                property.tenants++;
                property.income += income;
            }
        }
    });

    // Calculate occupancy rates for each property
    Object.values(data.properties).forEach(property => {
        property.occupancyRate = ((property.tenants / property.maxTenants) * 100).toFixed(1);
    });

    // Calculate total occupancy rate
    const totalMaxTenants = Object.values(propertyLimits).reduce((sum, limit) => sum + limit, 0);
    data.totalOccupancyRate = ((data.totalTenants / totalMaxTenants) * 100).toFixed(1);
    
    return data;
}

function generatePropertyDetails(properties) {
    return Object.values(properties).map(property => `
        <div class="property-detail">
            <h4>${property.name}</h4>
            <ul>
                <li>Inquilinas: ${property.tenants} / ${property.maxTenants}</li>
                <li>Tasa de Ocupación: ${property.occupancyRate}%</li>
                <li>Ingresos Mensuales: $${property.income.toLocaleString()}</li>
            </ul>
        </div>
    `).join('');
}

function showReportModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content report-modal">
            ${content}
            <div class="report-actions">
                <button onclick="printReport()">Imprimir</button>
                <button onclick="exportToPDF()">Exportar a PDF</button>
                <button onclick="closeModal(this)">Cerrar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function printReport() {
    window.print();
}

function exportToPDF() {
    alert('Función de exportación a PDF en desarrollo');
}

function closeModal(button) {
    button.closest('.modal').remove();
}