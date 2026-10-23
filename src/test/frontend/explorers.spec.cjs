const { test, expect } = require('playwright/test');
test.setTimeout(10000);
test.use({ channel: 'chrome' });
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');

let server;
let origin;
const root = path.resolve(__dirname, '../../main/resources/static');
const clientes = [
    { id: 7, cuitCuil: '20123456789', denominacion: 'Librería Centro' },
    { id: 9, cuitCuil: '20987654321', denominacion: 'Escuela Norte' }
];
const precios = [
    { id: 25, articuloCodigo: 'A8', articuloDenominacion: 'Cuaderno', listaPrecioDenominacion: 'Minorista', precioVenta: 100 },
    { id: 26, articuloCodigo: 'A8', articuloDenominacion: 'Cuaderno', listaPrecioDenominacion: 'Mayorista', precioVenta: 80 }
];
const reporte = { id: 1, numeroFactura: 1, fechaEmision: '2026-10-23', clienteDenominacion: 'Librería Centro', condicionIva: 'IVA', puntoVentaDescripcion: 'Centro', importeTotal: 100, estado: 'PENDIENTE' };

test.beforeAll(async () => {
    server = http.createServer((req, res) => {
        const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url));
        if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        fs.readFile(file, (error, data) => {
            if (error) { res.writeHead(404).end(); return; }
            res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
            res.end(data);
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); });

test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async route => {
        const url = new URL(route.request().url());
        let body = [{ id: 1, descripcion: 'Opción' }];
        if (url.pathname.endsWith('/clientes')) body = clientes;
        else if (url.pathname.endsWith('/precios-articulos')) body = precios;
        else if (url.pathname.endsWith('/edicion')) body = {
            numeroFactura: 1, clienteId: 7, condicionIvaId: 1, tipoMonedaId: 1, puntoVentaId: 1,
            detalles: [{ listaPrecioArticuloId: 26, cantidad: 2, porcentajeBonificacion: 0 }]
        };
        else if (url.pathname === '/api/facturas') body = route.request().method() === 'GET' ? [reporte] : reporte;
        await route.fulfill({ json: body });
    });
    await page.goto(origin);
});

test('busca clientes por nombre y CUIT, selecciona y permite consumidor final', async ({ page }) => {
    await page.locator('#tabNueva').click();
    await page.locator('#btnBuscarCliente').click();
    await page.locator('#explorerBusqueda').fill('escuela');
    await expect(page.locator('#explorerFilas tr')).toHaveCount(1);
    await expect(page.locator('#explorerFilas')).toContainText('Escuela Norte');
    await page.locator('#explorerBusqueda').fill('libreria');
    await expect(page.locator('#explorerFilas tr')).toHaveCount(1);
    await expect(page.locator('#explorerFilas')).toContainText('Librería Centro');
    await page.locator('#explorerBusqueda').fill('20123456789');
    await page.locator('#explorerFilas button').click();
    await expect(page.locator('#clienteDescripcion')).toHaveValue('Librería Centro');
    await expect(page.locator('#inputCliente')).toHaveValue('7');
    await page.locator('#btnQuitarCliente').click();
    await expect(page.locator('#inputCliente')).toHaveValue('');
    await expect(page.locator('#clienteDescripcion')).toHaveValue('Consumidor final');
});

test('elige el precio de una lista, envía su ID y conserva renglones al quitar otro', async ({ page }) => {
    await page.locator('#tabNueva').click();
    await page.locator('[data-buscar-precio]').first().click();
    await page.locator('#explorerBusqueda').fill('A8');
    await expect(page.locator('#explorerFilas tr')).toHaveCount(2);
    await page.locator('#explorerBusqueda').fill('cuaderno');
    await expect(page.locator('#explorerFilas tr')).toHaveCount(2);
    await page.locator('#explorerBusqueda').fill('mayorista');
    await expect(page.locator('#explorerFilas tr')).toHaveCount(1);
    await page.locator('#explorerFilas button').click();
    await expect(page.locator('#tbodyRenglones')).toContainText('Mayorista');
    await page.locator('#btnSumarRenglon').click();
    await page.locator('[data-buscar-precio]').nth(1).click();
    await page.locator('#explorerBusqueda').fill('minorista');
    await page.locator('#explorerFilas button').click();
    await page.locator('#tbodyRenglones tr').first().getByRole('button', { name: 'Quitar' }).click();
    await expect(page.locator('#tbodyRenglones tr')).toHaveCount(1);
    await expect(page.locator('#tbodyRenglones')).toContainText('Minorista');
    await page.locator('#inputUsuario').fill('1');
    await page.locator('#inputPorcentajeIva').fill('0');
    await page.locator('#inputNumero').fill('2');
    for (const id of ['inputPuntoVenta', 'inputMoneda', 'inputCondicionIva']) await page.locator('#' + id).selectOption('1');
    page.on('dialog', dialog => dialog.accept());
    const request = page.waitForRequest(req => req.method() === 'POST' && req.url().includes('/api/facturas'));
    await page.locator('#btnGuardarFactura').click();
    const dto = (await request).postDataJSON();
    expect(dto.detalles[0].listaPrecioArticuloId).toBe(25);
    expect(dto.detalles[0]).not.toHaveProperty('articuloId');
    await expect(page.locator('#seccionListado')).toBeVisible();
});

test('edición muestra cliente y lista elegida, búsqueda vacía y Escape funcionan', async ({ page }) => {
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    await expect(page.locator('#clienteDescripcion')).toHaveValue('Librería Centro');
    await expect(page.locator('#tbodyRenglones')).toContainText('Mayorista');
    await page.locator('[data-buscar-precio]').click();
    await page.locator('#explorerBusqueda').fill('inexistente');
    await expect(page.locator('#explorerFilas')).toContainText('No hay resultados');
    await page.keyboard.press('Escape');
    await expect(page.locator('#explorerDialog')).not.toBeVisible();
    await expect(page.locator('#tbodyRenglones')).toContainText('Mayorista');
});

test('un error del explorer se informa y permite reintentar', async ({ page }) => {
    await page.locator('#tabNueva').click();
    await page.route('**/api/catalogos/clientes', route => route.fulfill({ status: 500, body: 'Error de prueba' }));
    await page.locator('#btnBuscarCliente').click();
    await expect(page.locator('#explorerEstado')).toContainText('No se pudieron cargar');
    await page.locator('#btnCerrarExplorer').click();
    await page.unroute('**/api/catalogos/clientes');
    await page.locator('#btnBuscarCliente').click();
    await expect(page.locator('#explorerFilas button')).toHaveCount(2);
});

test('no guarda renglones sin seleccionar un precio', async ({ page }) => {
    await page.locator('#tabNueva').click();
    await page.locator('#inputNumero').fill('2');
    for (const id of ['inputPuntoVenta', 'inputMoneda', 'inputCondicionIva']) await page.locator('#' + id).selectOption('1');
    const dialogo = page.waitForEvent('dialog');
    const guardar = page.locator('#btnGuardarFactura').click();
    const alerta = await dialogo;
    expect(alerta.message()).toContain('Seleccioná un artículo y su lista de precios');
    await alerta.accept();
    await guardar;
    await expect(page.locator('#seccionAlta')).toBeVisible();
});

test('catálogos vacíos muestran mensaje y permiten cerrar sin seleccionar', async ({ page }) => {
    await page.route('**/api/catalogos/clientes', route => route.fulfill({ json: [] }));
    await page.locator('#tabNueva').click();
    await page.locator('#btnBuscarCliente').click();
    await expect(page.locator('#explorerFilas')).toContainText('No hay resultados');
    await expect(page.locator('#explorerFilas button')).toHaveCount(0);
    await page.locator('#btnCerrarExplorer').click();
    await expect(page.locator('#clienteDescripcion')).toHaveValue('Consumidor final');
});
