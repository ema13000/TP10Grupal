import type {
    FacturaDetalleRequestDTO,
    FacturaFiltrosDTO,
    FacturaReporteDTO,
    FacturaRequestDTO
} from './models/factura.dto.js';

import { FacturaService } from './services/FacturaService.js';

const api = new FacturaService();
let renglones: FacturaDetalleRequestDTO[] = [];
let facturaEnEdicionId: number | null = null;

function elemento<T extends HTMLElement>(id: string): T {
    const encontrado = document.getElementById(id);

    if (!encontrado) {
        throw new Error(`Falta el elemento HTML: ${id}`);
    }

    return encontrado as T;
}

function valor(id: string): string {
    return elemento<HTMLInputElement>(id).value.trim();
}

function numeroCampo(id: string): number {
    const texto = valor(id);
    const numero = Number(texto);

    if (texto === '' || !Number.isFinite(numero)) {
        throw new Error(`Completá correctamente el campo ${id}.`);
    }

    return numero;
}

function configurarOperacion(numero?: number): void {
    api.configurar(
        numeroCampo('inputUsuario'),
        numeroCampo('inputPorcentajeIva'),
        numero
    );
}

async function ejecutar(accion: () => Promise<void>): Promise<void> {
    try {
        await accion();
    } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : String(error));
    }
}

function leerFiltros(): FacturaFiltrosDTO {
    return {
        numeroFactura: valor('txtFiltroNumero'),
        cliente: valor('txtFiltroCliente'),
        condicionIva: valor('txtFiltroIva'),
        estado: valor('selFiltroEstado'),
        fechaDesde: valor('txtFechaDesde'),
        fechaHasta: valor('txtFechaHasta')
    };
}

async function cargarListado(): Promise<void> {
    const facturas = await api.obtenerFacturas(leerFiltros());
    dibujarFacturas(facturas);
}

function dibujarFacturas(facturas: FacturaReporteDTO[]): void {
    const tbody = elemento<HTMLTableSectionElement>('tbodyFacturas');
    tbody.replaceChildren();

    elemento('contadorFacturas').textContent =
        `${facturas.length} comprobante(s)`;

    if (facturas.length === 0) {
        const fila = tbody.insertRow();
        const celda = fila.insertCell();
        celda.colSpan = 8;
        celda.textContent = 'No hay facturas que coincidan con la búsqueda.';
        return;
    }

    for (const factura of facturas) {
        const fila = tbody.insertRow();

        const datos = [
            String(factura.numeroFactura),
            factura.fechaEmision.slice(0, 10),
            factura.clienteDenominacion,
            factura.condicionIva,
            factura.puntoVentaDescripcion,
            `$${factura.importeTotal.toFixed(2)}`,
            factura.estado
        ];

        for (const dato of datos) {
            fila.insertCell().textContent = dato;
        }

        const acciones = fila.insertCell();
        const editar = document.createElement('button');

        editar.type = 'button';
        editar.textContent = 'Editar';
        editar.className = 'btn-chico btn-secundario';
        editar.disabled = factura.estado === 'ANULADA';

        editar.addEventListener('click', () => {
            void ejecutar(() => editarFactura(factura.id));
        });

        const anular = document.createElement('button');
        anular.textContent = 'Anular';
        anular.className = 'btn-chico btn-anular';
        anular.disabled = factura.estado === 'ANULADA';

        anular.addEventListener('click', () => {
            void ejecutar(async () => {
                const motivo = prompt('Observación de la anulación:');

                if (motivo === null) {
                    return;
                }

                configurarOperacion();

                await api.actualizarEstado(
                    factura.id,
                    'ANULADA',
                    motivo
                );

                await cargarListado();
            });
        });

        const eliminar = document.createElement('button');
        eliminar.textContent = 'Eliminar (baja lógica)';
        eliminar.className = 'btn-chico btn-borrar';
        eliminar.disabled = factura.estado === 'ANULADA';

        eliminar.addEventListener('click', () => {
            void ejecutar(async () => {
                if (!confirm(
                    `¿Dar de baja la factura ${factura.numeroFactura}?`
                )) {
                    return;
                }

                configurarOperacion();
                await api.eliminarFactura(factura.id);
                await cargarListado();
            });
        });

        acciones.append(editar, anular, eliminar);
    }
}

function agregarRenglon(): void {
    renglones.push({
        articuloId: 1,
        cantidad: 1,
        porcentajeBonificacion: 0
    });

    dibujarRenglones();
}

function dibujarRenglones(): void {
    const tbody = elemento<HTMLTableSectionElement>('tbodyRenglones');
    tbody.replaceChildren();

    renglones.forEach((renglon, indice) => {
        const fila = tbody.insertRow();

        const crearInput = (
            valorInicial: number,
            minimo: number,
            actualizar: (numero: number) => void,
            maximo?: number
        ): void => {
            const input = document.createElement('input');

            input.type = 'number';
            input.value = String(valorInicial);
            input.min = String(minimo);
            input.step = 'any';
            input.required = true;

            if (maximo !== undefined) {
                input.max = String(maximo);
            }

            input.addEventListener('input', () => {
                actualizar(Number(input.value));
            });

            fila.insertCell().appendChild(input);
        };

        crearInput(renglon.articuloId, 1, n => renglon.articuloId = n);
        crearInput(renglon.cantidad, 0.01, n => renglon.cantidad = n);

        crearInput(
            renglon.porcentajeBonificacion ?? 0,
            0,
            n => renglon.porcentajeBonificacion = n,
            100
        );

        const quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.textContent = 'X';
        quitar.className = 'btn-chico btn-borrar';

        quitar.addEventListener('click', () => {
            renglones.splice(indice, 1);
            dibujarRenglones();
        });

        fila.insertCell().appendChild(quitar);
    });
}

function mostrarAlta(): void {
    facturaEnEdicionId = null;

    elemento('seccionListado').classList.add('oculto');
    elemento('seccionAlta').classList.remove('oculto');
    elemento('tabListado').classList.remove('activo');
    elemento('tabNueva').classList.add('activo');

    elemento<HTMLFormElement>('formAltaFactura').reset();

    elemento<HTMLInputElement>('inputNumero').readOnly = false;

    elemento('btnGuardarFactura').textContent =
        'Confirmar y Guardar Factura';

    renglones = [];
    agregarRenglon();
}

async function mostrarListado(): Promise<void> {
    facturaEnEdicionId = null;
    elemento('seccionAlta').classList.add('oculto');
    elemento('seccionListado').classList.remove('oculto');
    elemento('tabNueva').classList.remove('activo');
    elemento('tabListado').classList.add('activo');

    await cargarListado();
}

async function editarFactura(id: number): Promise<void> {
    const factura = await api.obtenerParaEdicion(id);

    mostrarAlta();

    facturaEnEdicionId = id;

    const numero = elemento<HTMLInputElement>('inputNumero');
    numero.value = String(factura.numeroFactura);
    numero.readOnly = true;

    elemento<HTMLInputElement>('inputCliente').value =
        factura.clienteId === null
            ? ''
            : String(factura.clienteId);

    elemento<HTMLInputElement>('inputCondicionIva').value =
        String(factura.condicionIvaId);

    elemento<HTMLInputElement>('inputMoneda').value =
        String(factura.tipoMonedaId);

    elemento<HTMLInputElement>('inputPuntoVenta').value =
        String(factura.puntoVentaId);

    renglones = factura.detalles.map(detalle => ({ ...detalle }));

    dibujarRenglones();

    elemento('btnGuardarFactura').textContent =
        `Guardar cambios de factura ${factura.numeroFactura}`;
}

async function guardarFactura(): Promise<void> {
    if (renglones.length === 0) {
        throw new Error('Agregá al menos un renglón.');
    }

    for (const renglon of renglones) {
        if (!Number.isInteger(renglon.articuloId)
            || renglon.articuloId <= 0) {
            throw new Error(
                'Los ID de artículo deben ser enteros positivos.'
            );
        }
    }

    const textoCliente = valor('inputCliente');

    const clienteId = textoCliente === ''
        ? null
        : numeroCampo('inputCliente');

    if (clienteId !== null
        && (!Number.isInteger(clienteId) || clienteId <= 0)) {
        throw new Error('El ID de cliente debe ser un entero positivo.');
    }

    const dto: FacturaRequestDTO = {
        clienteId,
        condicionIvaId: numeroCampo('inputCondicionIva'),
        tipoMonedaId: numeroCampo('inputMoneda'),
        puntoVentaId: numeroCampo('inputPuntoVenta'),
        detalles: renglones
    };

    if (facturaEnEdicionId === null) {
        configurarOperacion(numeroCampo('inputNumero'));

        const creada = await api.crearFactura(dto);

        alert(
            `Factura ${creada.numeroFactura} creada. ` +
            `Total: $${creada.importeTotal.toFixed(2)}`
        );
    } else {
        configurarOperacion();

        const actualizada = await api.actualizarFactura(
            facturaEnEdicionId,
            dto
        );

        alert(
            `Factura ${actualizada.numeroFactura} actualizada. ` +
            `Total: $${actualizada.importeTotal.toFixed(2)}`
        );
    }

    await mostrarListado();
}

document.addEventListener('DOMContentLoaded', () => {
    elemento('tabNueva').addEventListener('click', mostrarAlta);

    for (const id of ['tabListado', 'btnVolver', 'btnCancelarAlta']) {
        elemento(id).addEventListener('click', () => {
            void ejecutar(mostrarListado);
        });
    }

    elemento('btnSumarRenglon').addEventListener('click', agregarRenglon);

    elemento('btnAplicarFiltros').addEventListener('click', () => {
        void ejecutar(cargarListado);
    });

    elemento('btnLimpiarFiltros').addEventListener('click', () => {
        for (const id of [
            'txtFiltroNumero',
            'txtFiltroCliente',
            'txtFiltroIva',
            'selFiltroEstado',
            'txtFechaDesde',
            'txtFechaHasta'
        ]) {
            elemento<HTMLInputElement>(id).value = '';
        }

        void ejecutar(cargarListado);
    });

    elemento<HTMLFormElement>('formAltaFactura')
        .addEventListener('submit', evento => {
            evento.preventDefault();
            void ejecutar(guardarFactura);
        });

    void ejecutar(cargarListado);
});