// Utility functions
function formatDate(date) {
    return date ? new Date(date).toLocaleDateString() : '';
}

function generateId() {
    return 'tenant_' + Math.random().toString(36).substr(2, 9);
}

// Tenant management
function addTenantCard(propertyId) {
    const tenantsDiv = document.getElementById(`tenants-property${propertyId}`);
    const tenantId = generateId();

    const tenantCard = document.createElement('div');
    tenantCard.className = 'tenant-card';
    tenantCard.id = tenantId;
    tenantCard.dataset.propertyId = propertyId;

    tenantCard.innerHTML = `
        <div class="tenant-header">
            <h3 class="tenant-name" onclick="toggleDetails('${tenantId}')">Nueva Inquilina</h3>
            <button class="delete-button" onclick="deleteTenant('${tenantId}')">
                <span class="delete-icon">×</span>
            </button>
        </div>
        <div class="tenant-details">
            <label>
                Nombre:
                <input type="text" name="nombre" oninput="updateTenantInfo('${tenantId}')">
            </label>
            <label>
                Apellido:
                <input type="text" name="apellido" oninput="updateTenantInfo('${tenantId}')">
            </label>
            <label>
                DNI:
                <input type="text" name="dni" pattern="[0-9]*" maxlength="8">
            </label>
            <label>
                Teléfono:
                <input type="tel" name="telefono">
            </label>
            <label>
                Teléfono de un conocido:
                <input type="tel" name="telefono_conocido">
            </label>
            <label>
                Precio de la pieza:
                <input type="number" name="precio_pieza" min="0" step="0.01">
            </label>
            <label>
                Estado de pago:
                <select name="estado_pago" onchange="updateTenantInfo('${tenantId}')">
                    <option value="al_dia">Al día</option>
                    <option value="debe">Debe</option>
                </select>
            </label>
            <label>
                Fecha del recibo:
                <input type="date" name="fecha_recibo">
            </label>
            <label>
                Fecha de vencimiento:
                <input type="date" name="fecha_vencimiento">
            </label>
            <button class="save-button" onclick="saveTenantData('${tenantId}')">
                Guardar
            </button>
        </div>
    `;

    tenantsDiv.appendChild(tenantCard);
}

function toggleDetails(tenantId) {
    const tenantCard = document.getElementById(tenantId);
    const detailsDiv = tenantCard.querySelector('.tenant-details');
    const isVisible = detailsDiv.style.display === 'block';
    
    detailsDiv.style.display = isVisible ? 'none' : 'block';
}

function deleteTenant(tenantId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta inquilina?')) {
        const tenantCard = document.getElementById(tenantId);
        if (tenantCard) {
            // Remove from DOM
            tenantCard.remove();
            
            // Remove from localStorage
            const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
            delete tenants[tenantId];
            localStorage.setItem('tenants', JSON.stringify(tenants));
        }
    }
}

function updateTenantInfo(tenantId) {
    const tenantCard = document.getElementById(tenantId);
    const tenantName = tenantCard.querySelector('.tenant-name');
    
    const nombre = tenantCard.querySelector('input[name="nombre"]').value;
    const apellido = tenantCard.querySelector('input[name="apellido"]').value;
    const estadoPago = tenantCard.querySelector('select[name="estado_pago"]').value;

    // Update tenant name display
    const displayName = nombre || apellido ? `${nombre} ${apellido}`.trim() : 'Nueva Inquilina';
    tenantName.textContent = displayName;

    // Update payment status styling
    tenantName.classList.toggle('deudora', estadoPago === 'debe');
}

function saveTenantData(tenantId) {
    const tenantCard = document.getElementById(tenantId);
    const propertyId = tenantCard.dataset.propertyId;
    
    const tenantData = {
        id: tenantId,
        propertyId: propertyId,
        nombre: tenantCard.querySelector('input[name="nombre"]').value,
        apellido: tenantCard.querySelector('input[name="apellido"]').value,
        dni: tenantCard.querySelector('input[name="dni"]').value,
        telefono: tenantCard.querySelector('input[name="telefono"]').value,
        telefonoConocido: tenantCard.querySelector('input[name="telefono_conocido"]').value,
        precioPieza: tenantCard.querySelector('input[name="precio_pieza"]').value,
        estadoPago: tenantCard.querySelector('select[name="estado_pago"]').value,
        fechaRecibo: tenantCard.querySelector('input[name="fecha_recibo"]').value,
        fechaVencimiento: tenantCard.querySelector('input[name="fecha_vencimiento"]').value
    };

    // Save to localStorage for persistence
    const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
    tenants[tenantId] = tenantData;
    localStorage.setItem('tenants', JSON.stringify(tenants));

    // Visual feedback
    const saveButton = tenantCard.querySelector('.save-button');
    const originalText = saveButton.textContent;
    saveButton.textContent = '¡Guardado!';
    saveButton.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.backgroundColor = '';
    }, 2000);
}

// Load saved tenants on page load
document.addEventListener('DOMContentLoaded', () => {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '{}');
    
    Object.values(tenants).forEach(tenant => {
        const propertyId = tenant.propertyId;
        const tenantsDiv = document.getElementById(`tenants-property${propertyId}`);
        
        if (tenantsDiv) {
            const tenantCard = document.createElement('div');
            tenantCard.className = 'tenant-card';
            tenantCard.id = tenant.id;
            tenantCard.dataset.propertyId = propertyId;
            
            tenantCard.innerHTML = `
                <div class="tenant-header">
                    <h3 class="tenant-name ${tenant.estadoPago === 'debe' ? 'deudora' : ''}" 
                        onclick="toggleDetails('${tenant.id}')">
                        ${tenant.nombre} ${tenant.apellido}
                    </h3>
                    <button class="delete-button" onclick="deleteTenant('${tenant.id}')">
                        <span class="delete-icon">×</span>
                    </button>
                </div>
                <div class="tenant-details">
                    <label>
                        Nombre:
                        <input type="text" name="nombre" value="${tenant.nombre}" 
                            oninput="updateTenantInfo('${tenant.id}')">
                    </label>
                    <label>
                        Apellido:
                        <input type="text" name="apellido" value="${tenant.apellido}" 
                            oninput="updateTenantInfo('${tenant.id}')">
                    </label>
                    <label>
                        DNI:
                        <input type="text" name="dni" value="${tenant.dni}" 
                            pattern="[0-9]*" maxlength="8">
                    </label>
                    <label>
                        Teléfono:
                        <input type="tel" name="telefono" value="${tenant.telefono}">
                    </label>
                    <label>
                        Teléfono de un conocido:
                        <input type="tel" name="telefono_conocido" value="${tenant.telefonoConocido}">
                    </label>
                    <label>
                        Precio de la pieza:
                        <input type="number" name="precio_pieza" value="${tenant.precioPieza}" 
                            min="0" step="0.01">
                    </label>
                    <label>
                        Estado de pago:
                        <select name="estado_pago" onchange="updateTenantInfo('${tenant.id}')">
                            <option value="al_dia" ${tenant.estadoPago === 'al_dia' ? 'selected' : ''}>
                                Al día
                            </option>
                            <option value="debe" ${tenant.estadoPago === 'debe' ? 'selected' : ''}>
                                Debe
                            </option>
                        </select>
                    </label>
                    <label>
                        Fecha del recibo:
                        <input type="date" name="fecha_recibo" value="${tenant.fechaRecibo}">
                    </label>
                    <label>
                        Fecha de vencimiento:
                        <input type="date" name="fecha_vencimiento" value="${tenant.fechaVencimiento}">
                    </label>
                    <button class="save-button" onclick="saveTenantData('${tenant.id}')">
                        Guardar
                    </button>
                </div>
            `;
            
            tenantsDiv.appendChild(tenantCard);
        }
    });
});