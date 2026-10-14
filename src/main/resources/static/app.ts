import { FacturaDetalleRequestDTO, FacturaReporteDTO, FacturaRequestDTO } from './models/factura.dto.js';
import { FacturaService } from './services/FacturaService.js';

const api = new FacturaService();

let listaFacturas: FacturaReporteDTO[] = [];
let renglones: FacturaDetalleRequestDTO[] = [];

const seccionListado = document.getElementById('seccionListado') as HTMLElement;
const seccionAlta = document.getElementById('seccionAlta') as HTMLElement;
const tabListado = document.getElementById('tabListado') as HTMLButtonElement;
const tabNueva = document.getElementById('tabNueva') as HTMLButtonElement;

const tbodyFacturas = document.getElementById('tbodyFacturas') as HTMLTableSectionElement;
const tbodyRenglones = document.getElementById('tbodyRenglones') as HTMLTableSectionElement;
const formAltaFactura = document.getElementById('formAltaFactura') as HTMLFormElement;
const contadorFacturas = document.getElementById('contadorFacturas') as HTMLElement;

document.addEventListener('DOMContentLoaded', () => {
    traerFacturasDelServidor();

    tabListado.addEventListener('click', irAListado);
    tabNueva.addEventListener('click', irANuevaFactura);
    document.getElementById('btnVolver')?.addEventListener('click', irAListado);
    document.getElementById('btnCancelarAlta')?.addEventListener('click', irAListado);

    document.getElementById('btnAplicarFiltros')?.addEventListener('click', filtrarComprobantes);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFormularioFiltros);

    document.getElementById('btnSumarRenglon')?.addEventListener('click', agregarRenglonVacio);
    formAltaFactura.addEventListener('submit', enviarNuevaFactura);
});

function irANuevaFactura(): void {
    seccionListado.classList.add('oculto');
    seccionAlta.classList.remove('oculto');
    tabListado.classList.remove('activo');
    tabNueva.classList.add('activo');

    formAltaFactura.reset();

    (document.getElementById('inputFecha') as HTMLInputElement).valueAsDate = new Date();
    const nroAleatorio = Math.floor(1000 + Math.random() * 9000);
    (document.getElementById('inputNumero') as HTMLInputElement).value = `0001-0000${nroAleatorio}`;
    (document.getElementById('inputPuntoVenta') as HTMLInputElement).value = '1';
    (document.getElementById('inputCondicionIva') as HTMLInputElement).value = '1';
    (document.getElementById('inputMoneda') as HTMLInputElement).value = '1';

    renglones = [];
    agregarRenglonVacio();
}

function irAListado(): void {
    seccionAlta.classList.add('oculto');
    seccionListado.classList.remove('oculto');
    tabNueva.classList.remove('activo');
    tabListado.classList.add('activo');
    traerFacturasDelServidor();
}

async function traerFacturasDelServidor(): Promise<void> {
    tbodyFacturas.innerHTML = `<tr><td colspan="10" class="texto-centro">Consultando comprobantes...</td></tr>`;
    try {
        listaFacturas = await api.obtenerFacturas();
        armarTablaFacturas(listaFacturas);
    } catch (err) {
        console.error('Error al cargar facturas:', err);
        tbodyFacturas.innerHTML = `<tr><td colspan="10" class="texto-centro" style="color:#ef4444;">No se pudo conectar con la API en http://localhost:8080/api/facturas</td></tr>`;
    }
}

function armarTablaFacturas(datos: FacturaReporteDTO[]): void {
    tbodyFacturas.innerHTML = '';
    contadorFacturas.textContent = `${datos.length} comprobante(s)`;

    if (datos.length === 0) {
        tbodyFacturas.innerHTML = `<tr><td colspan="10" class="texto-centro">No hay facturas que coincidan con la búsqueda.</td></tr>`;
        return;
    }

    datos.forEach(fac => {
        const fila = document.createElement('tr');
        const fecha = fac.fechaEmision ? new Date(fac.fechaEmision).toLocaleDateString('es-AR') : '-';
        const estaAnulada = fac.estado?.toUpperCase() === 'ANULADA';

        fila.innerHTML = `
            <td><strong>${fac.numeroComprobante || fac.id}</strong></td>
            <td>${fecha}</td>
            <td>${fac.clienteNombre || '-'}</td>
            <td>${fac.condicionIva || '-'}</td>
            <td>${fac.puntoVenta || '-'}</td>
            <td class="texto-derecha">$${Number(fac.importeNeto || 0).toFixed(2)}</td>
            <td class="texto-derecha">$${Number(fac.importeIva || 0).toFixed(2)}</td>
            <td class="texto-derecha"><strong>$${Number(fac.importeTotal || 0).toFixed(2)}</strong></td>
            <td class="texto-centro">
                <span class="estado-tag ${estaAnulada ? 'tag-anulada' : 'tag-emitida'}">
                    ${fac.estado || 'EMITIDA'}
                </span>
            </td>
            <td class="texto-centro">
                <button class="btn-chico btn-anular" ${estaAnulada ? 'disabled' : ''}>Anular</button>
                <button class="btn-chico btn-borrar">Borrar</button>
            </td>
        `;

        const btnAnular = fila.querySelector('.btn-anular') as HTMLButtonElement;
        btnAnular.addEventListener('click', async () => {
            const motivo = prompt(`Ingresá una observación para anular la factura ${fac.numeroComprobante}:`, 'Anulada por error de carga');
            if (motivo !== null) {
                await api.actualizarEstado(fac.id, 'ANULADA', motivo);
                await traerFacturasDelServidor();
            }
        });

        const btnBorrar = fila.querySelector('.btn-borrar') as HTMLButtonElement;
        btnBorrar.addEventListener('click', async () => {
            if (confirm(`¿Seguro que querés eliminar la factura ${fac.numeroComprobante} (ID: ${fac.id})?`)) {
                await api.eliminarFactura(fac.id);
                await traerFacturasDelServidor();
            }
        });

        tbodyFacturas.appendChild(fila);
    });
}

function filtrarComprobantes(): void {
    const nro = (document.getElementById('txtFiltroNumero') as HTMLInputElement).value.toLowerCase().trim();
    const cliente = (document.getElementById('txtFiltroCliente') as HTMLInputElement).value.toLowerCase().trim();
    const iva = (document.getElementById('txtFiltroIva') as HTMLInputElement).value.toLowerCase().trim();
    const estado = (document.getElementById('selFiltroEstado') as HTMLSelectElement).value;
    const desde = (document.getElementById('txtFechaDesde') as HTMLInputElement).value;
    const hasta = (document.getElementById('txtFechaHasta') as HTMLInputElement).value;

    const resultado = listaFacturas.filter(f => {
        const cumpleNro = !nro || (f.numeroComprobante && f.numeroComprobante.toLowerCase().includes(nro));
        const cumpleCli = !cliente || (f.clienteNombre && f.clienteNombre.toLowerCase().includes(cliente));
        const cumpleIva = !iva || (f.condicionIva && f.condicionIva.toLowerCase().includes(iva));
        const cumpleEstado = !estado || (f.estado && f.estado.toUpperCase() === estado);

        let cumpleFecha = true;
        if (f.fechaEmision && (desde || hasta)) {
            const fechaIso = new Date(f.fechaEmision).toISOString().slice(0, 10);
            if (desde && fechaIso < desde) cumpleFecha = false;
            if (hasta && fechaIso > hasta) cumpleFecha = false;
        }

        return cumpleNro && cumpleCli && cumpleIva && cumpleEstado && cumpleFecha;
    });

    armarTablaFacturas(resultado);
}

function limpiarFormularioFiltros(): void {
    (document.getElementById('txtFiltroNumero') as HTMLInputElement).value = '';
    (document.getElementById('txtFiltroCliente') as HTMLInputElement).value = '';
    (document.getElementById('txtFiltroIva') as HTMLInputElement).value = '';
    (document.getElementById('selFiltroEstado') as HTMLSelectElement).value = '';
    (document.getElementById('txtFechaDesde') as HTMLInputElement).value = '';
    (document.getElementById('txtFechaHasta') as HTMLInputElement).value = '';
    armarTablaFacturas(listaFacturas);
}

function agregarRenglonVacio(): void {
    renglones.push({
        articuloId: 1,
        cantidad: 1,
        precioUnitario: 1000,
        porcentajeIva: 21
    });
    dibujarRenglones();
}

function dibujarRenglones(): void {
    tbodyRenglones.innerHTML = '';

    renglones.forEach((renglon, idx) => {
        const tr = document.createElement('tr');
        const netoFila = renglon.cantidad * renglon.precioUnitario;

        tr.innerHTML = `
            <td><input type="number" class="in-art" value="${renglon.articuloId}" min="1" style="width:100%; padding:6px;"></td>
            <td><input type="number" class="in-cant" value="${renglon.cantidad}" min="1" style="width:100%; padding:6px;"></td>
            <td><input type="number" class="in-precio" value="${renglon.precioUnitario}" min="0" step="0.01" style="width:100%; padding:6px;"></td>
            <td>
                <select class="in-iva" style="width:100%; padding:6px;">
                    <option value="21" ${renglon.porcentajeIva === 21 ? 'selected' : ''}>21%</option>
                    <option value="10.5" ${renglon.porcentajeIva === 10.5 ? 'selected' : ''}>10.5%</option>
                    <option value="0" ${renglon.porcentajeIva === 0 ? 'selected' : ''}>0%</option>
                </select>
            </td>
            <td class="texto-derecha celda-sub">$${netoFila.toFixed(2)}</td>
            <td class="texto-centro">
                <button type="button" class="btn-chico btn-borrar btn-quitar-fila">X</button>
            </td>
        `;

        const inArt = tr.querySelector('.in-art') as HTMLInputElement;
        const inCant = tr.querySelector('.in-cant') as HTMLInputElement;
        const inPrecio = tr.querySelector('.in-precio') as HTMLInputElement;
        const inIva = tr.querySelector('.in-iva') as HTMLSelectElement;
        const celdaSub = tr.querySelector('.celda-sub') as HTMLTableCellElement;

        const recalcularFila = () => {
            renglon.articuloId = Number(inArt.value);
            renglon.cantidad = Number(inCant.value) || 0;
            renglon.precioUnitario = Number(inPrecio.value) || 0;
            renglon.porcentajeIva = Number(inIva.value);

            const sub = renglon.cantidad * renglon.precioUnitario;
            celdaSub.textContent = `$${sub.toFixed(2)}`;
            calcularTotalesFactura();
        };

        inArt.addEventListener('input', recalcularFila);
        inCant.addEventListener('input', recalcularFila);
        inPrecio.addEventListener('input', recalcularFila);
        inIva.addEventListener('change', recalcularFila);

        tr.querySelector('.btn-quitar-fila')?.addEventListener('click', () => {
            renglones.splice(idx, 1);
            dibujarRenglones();
        });

        tbodyRenglones.appendChild(tr);
    });

    calcularTotalesFactura();
}

function calcularTotalesFactura(): void {
    let acumNeto = 0;
    let acumIva = 0;

    renglones.forEach(r => {
        const subNeto = r.cantidad * r.precioUnitario;
        const montoIva = subNeto * ((r.porcentajeIva ?? 21) / 100);
        acumNeto += subNeto;
        acumIva += montoIva;
    });

    const total = acumNeto + acumIva;

    (document.getElementById('txtNeto') as HTMLElement).textContent = `$${acumNeto.toFixed(2)}`;
    (document.getElementById('txtIva') as HTMLElement).textContent = `$${acumIva.toFixed(2)}`;
    (document.getElementById('txtTotal') as HTMLElement).textContent = `$${total.toFixed(2)}`;
}

async function enviarNuevaFactura(e: Event): Promise<void> {
    e.preventDefault();

    if (renglones.length === 0) {
        alert('Tenés que cargar al menos un renglón en la factura.');
        return;
    }

    const dto: FacturaRequestDTO = {
        numeroComprobante: (document.getElementById('inputNumero') as HTMLInputElement).value,
        fechaEmision: (document.getElementById('inputFecha') as HTMLInputElement).value,
        puntoVentaId: Number((document.getElementById('inputPuntoVenta') as HTMLInputElement).value),
        clienteId: Number((document.getElementById('inputCliente') as HTMLInputElement).value),
        condicionIvaId: Number((document.getElementById('inputCondicionIva') as HTMLInputElement).value),
        tipoMonedaId: Number((document.getElementById('inputMoneda') as HTMLInputElement).value),
        observaciones: (document.getElementById('inputObservaciones') as HTMLInputElement).value,
        detalles: renglones
    };

    try {
        await api.crearFactura(dto);
        alert('Factura registrada correctamente.');
        irAListado();
    } catch (err) {
        console.error(err);
        alert('Hubo un problema al guardar la factura. Revisá que existan los IDs cargados en la base de datos.');
    }
}