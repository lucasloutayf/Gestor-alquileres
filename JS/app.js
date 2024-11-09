function addTenantCard(propertyId) {
    const tenantsDiv = document.getElementById(`tenants-property${propertyId}`);

    const tenantCard = document.createElement('div');
    tenantCard.className = 'tenant-card';

    tenantCard.innerHTML = `
        <h3 class="tenant-name" onclick="toggleDetails(this)">Inquilina</h3>
        <div class="tenant-details">
            <label>Nombre: <input type="text" name="nombre" oninput="updateTenantName(this)"></label>
            <label>Apellido: <input type="text" name="apellido" oninput="updateTenantName(this)"></label>
            <label>DNI: <input type="text" name="dni"></label>
            <label>Teléfono: <input type="text" name="telefono"></label>
            <label>Teléfono de un conocido: <input type="text" name="telefono_conocido"></label>
            <label>Precio de la pieza: <input type="text" name="precio_pieza"></label>
            <label>Estado de pago: 
                <select name="estado_pago" onchange="updatePaymentStatus(this)">
                    <option value="al_dia">Al día</option>
                    <option value="debe">Debe</option>
                </select>
            </label>
            <label>Fecha del recibo: <input type="date" name="fecha_recibo"></label>
            <label>Fecha de vencimiento: <input type="date" name="fecha_vencimiento"></label>
            <button class="save-button" onclick="saveTenantData(this)">Guardar</button>
        </div>
    `;

    tenantsDiv.appendChild(tenantCard);
}

function toggleDetails(element) {
    const detailsDiv = element.nextElementSibling;
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    
    const saveButton = detailsDiv.querySelector('.save-button');
    saveButton.style.display = detailsDiv.style.display === 'block' ? 'block' : 'none';
}

function updateTenantName(inputElement) {
    const tenantCard = inputElement.closest('.tenant-card');
    const tenantName = tenantCard.querySelector('.tenant-name');

    const nombre = tenantCard.querySelector('input[name="nombre"]').value;
    const apellido = tenantCard.querySelector('input[name="apellido"]').value;

    tenantName.textContent = `${nombre} ${apellido}` || "Inquilina";

    const estadoPago = tenantCard.querySelector('select[name="estado_pago"]').value;
    if (estadoPago === 'debe') {
        tenantName.classList.add('deudora');
    } else {
        tenantName.classList.remove('deudora');
    }
}

function updatePaymentStatus(selectElement) {
    const tenantCard = selectElement.closest('.tenant-card');
    const tenantName = tenantCard.querySelector('.tenant-name');
    
    if (selectElement.value === 'debe') {
        tenantName.classList.add('deudora');
    } else {
        tenantName.classList.remove('deudora');
    }
}

function saveTenantData(buttonElement) {
    const tenantCard = buttonElement.closest('.tenant-card');
    
    const nombre = tenantCard.querySelector('input[name="nombre"]').value;
    const apellido = tenantCard.querySelector('input[name="apellido"]').value;
    const dni = tenantCard.querySelector('input[name="dni"]').value;
    const telefono = tenantCard.querySelector('input[name="telefono"]').value;
    const telefonoConocido = tenantCard.querySelector('input[name="telefono_conocido"]').value;
    const precioPieza = tenantCard.querySelector('input[name="precio_pieza"]').value;
    const estadoPago = tenantCard.querySelector('select[name="estado_pago"]').value;
    const fechaRecibo = tenantCard.querySelector('input[name="fecha_recibo"]').value;
    const fechaVencimiento = tenantCard.querySelector('input[name="fecha_vencimiento"]').value;
    
    const tenantData = {
        nombre,
        apellido,
        dni,
        telefono,
        telefonoConocido,
        precioPieza,
        estadoPago,
        fechaRecibo
    };

    console.log('Datos guardados:', tenantData);

    alert('Información guardada correctamente');
}
