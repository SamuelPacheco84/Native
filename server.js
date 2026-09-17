const express = require('express');
const path = require('path');
const fs = require('fs');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  console.warn('nodemailer not loaded yet:', err.message);
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Archivo para persistir credenciales de correo
const CONFIG_FILE = path.join(__dirname, 'email-config.json');
// Archivo para persistir pedidos en el servidor de forma duradera
const ORDERS_FILE = path.join(__dirname, 'orders.json');

function getOrdersFromServer() {
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.error('Error reading orders file:', e);
    }
  }
  return [];
}

function saveOrderToServer(order) {
  if (!order || !order.id) return;
  const orders = getOrdersFromServer();
  const existingIdx = orders.findIndex(o => o.id === order.id);
  const enrichedOrder = {
    ...order,
    lastUpdated: new Date().toISOString()
  };
  if (existingIdx >= 0) {
    orders[existingIdx] = { ...orders[existingIdx], ...enrichedOrder };
  } else {
    orders.unshift(enrichedOrder);
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

let emailConfig = {
  provider: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: '',
  pass: '',
  fromName: 'Nativa Alimentos & Cosmética Natural',
  fromEmail: ''
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    emailConfig = { ...emailConfig, ...saved };
  } catch (e) {
    console.error('Error reading email config file:', e);
  }
}

// Respaldo y sincronización automática con variables de entorno del sistema
if (process.env.SMTP_USER) emailConfig.user = process.env.SMTP_USER;
if (process.env.SMTP_KEY || process.env.SMTP_PASS) emailConfig.pass = process.env.SMTP_KEY || process.env.SMTP_PASS;
if (process.env.SMTP_HOST) emailConfig.host = process.env.SMTP_HOST;
if (process.env.SMTP_PORT) emailConfig.port = parseInt(process.env.SMTP_PORT, 10) || 465;
if (!emailConfig.fromEmail && emailConfig.user) emailConfig.fromEmail = emailConfig.user;

function createTransporter(config) {
  if (!nodemailer) {
    throw new Error('Nodemailer no está instalado en el servidor.');
  }

  const port = parseInt(config.port, 10) || 465;
  const isSecure = config.secure === true || config.secure === 'true' || port === 465;

  return nodemailer.createTransport({
    host: config.host,
    port: port,
    secure: isSecure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Obtener configuración actual de correo (sin exponer contraseña completa)
app.get('/api/email-config', (req, res) => {
  res.json({
    provider: emailConfig.provider || 'gmail',
    host: emailConfig.host || 'smtp.gmail.com',
    port: emailConfig.port || 465,
    secure: emailConfig.secure,
    user: emailConfig.user || '',
    fromName: emailConfig.fromName || 'Nativa Alimentos & Cosmética Natural',
    fromEmail: emailConfig.fromEmail || emailConfig.user || '',
    hasPassword: Boolean(emailConfig.pass && emailConfig.pass.length > 0)
  });
});

// Guardar credenciales de correo
app.post('/api/email-config', (req, res) => {
  try {
    const { provider, host, port, secure, user, pass, fromName, fromEmail } = req.body;

    if (!host || !user) {
      return res.status(400).json({ success: false, message: 'El servidor SMTP y el usuario/correo son obligatorios.' });
    }

    emailConfig.provider = provider || emailConfig.provider;
    emailConfig.host = host;
    emailConfig.port = parseInt(port, 10) || 465;
    emailConfig.secure = secure === true || secure === 'true' || parseInt(port, 10) === 465;
    emailConfig.user = user;
    if (pass && pass.trim()) {
      emailConfig.pass = pass.trim();
    }
    emailConfig.fromName = fromName || 'Nativa Alimentos & Cosmética Natural';
    emailConfig.fromEmail = fromEmail || user;

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(emailConfig, null, 2), 'utf8');

    res.json({
      success: true,
      message: '¡Credenciales de envío de correo guardadas con éxito!',
      config: {
        provider: emailConfig.provider,
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.user,
        fromName: emailConfig.fromName,
        fromEmail: emailConfig.fromEmail,
        hasPassword: Boolean(emailConfig.pass)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enviar correo de prueba con las credenciales
app.post('/api/send-test-email', async (req, res) => {
  try {
    const { toEmail, tempConfig } = req.body;
    const targetEmail = toEmail || emailConfig.fromEmail || emailConfig.user;

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Ingresa un correo destinatario para la prueba.' });
    }

    const effectiveConfig = tempConfig ? { ...emailConfig, ...tempConfig } : emailConfig;

    if (!effectiveConfig.user || !effectiveConfig.pass) {
      return res.status(400).json({
        success: false,
        message: 'Faltan las credenciales: ingresa el usuario/correo y la contraseña o clave de aplicación.'
      });
    }

    const transporter = createTransporter(effectiveConfig);

    // Verificar la conexión SMTP
    await transporter.verify();

    const fromAddress = `"${effectiveConfig.fromName || 'Nativa Productos Naturales'}" <${effectiveConfig.fromEmail || effectiveConfig.user}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject: '🌿 Prueba de Envío Exitosa - Nativa Alimentos & Cosmética',
      text: `¡Hola! Las credenciales de correo de Nativa han sido configuradas correctamente. Servidor: ${effectiveConfig.host}:${effectiveConfig.port}.`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d1fae5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #1f361a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NATIVA</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; text-transform: uppercase;">Alimentos & Cosmética Natural Consciente</p>
          </div>
          <div style="padding: 28px 24px; background: #ffffff;">
            <div style="display: inline-block; background: #ecfdf5; color: #047857; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; margin-bottom: 16px;">
              ✓ Conexión SMTP Verificada
            </div>
            <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 20px;">¡Tus credenciales funcionan perfectamente!</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
              Este es un correo de prueba enviado desde tu tienda <strong>Nativa</strong> utilizando tus credenciales de envío configuradas. A partir de ahora, tus clientes recibirán automáticamente sus confirmaciones de compra y enlaces de rastreo de pedidos en vivo.
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 13px; color: #374151;">
              <strong>Detalles de Conexión:</strong><br>
              • Servidor Host: <code>${effectiveConfig.host}</code><br>
              • Puerto: <code>${effectiveConfig.port} (${effectiveConfig.secure ? 'SSL' : 'TLS/STARTTLS'})</code><br>
              • Usuario Remitente: <code>${effectiveConfig.user}</code><br>
              • Destinatario: <code>${targetEmail}</code><br>
              • Fecha y Hora: <code>${new Date().toLocaleString('es-CO')}</code>
            </div>
          </div>
          <div style="background: #f0fdf4; padding: 16px 24px; text-align: center; font-size: 12px; color: #065f46; border-top: 1px solid #d1fae5;">
            Nativa &copy; 2026 - Tienda Online de Productos Naturales y Artesanales.
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: `¡Correo de prueba enviado con éxito a ${targetEmail}!`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: `Error al conectar con el servidor SMTP: ${error.message}`
    });
  }
});

// Enviar notificación de pedido real por correo
app.post('/api/send-order-email', async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || (!order.customer && !order.shippingAddress)) {
      return res.status(400).json({ success: false, message: 'Datos de orden o correo del cliente inválidos.' });
    }

    // Normalizar datos del cliente/destinatario
    const customer = order.customer || order.shippingAddress || {};
    const customerEmail = customer.email || order.email || (order.shippingAddress && order.shippingAddress.email);
    if (!customerEmail) {
      return res.status(400).json({ success: false, message: 'El correo del cliente es requerido.' });
    }

    // Persistir el pedido en el servidor inmediatamente
    saveOrderToServer({
      ...order,
      customer: {
        nombre: customer.nombre || customer.fullName || 'Cliente',
        apellido: customer.apellido || '',
        telefono: customer.telefono || customer.phone || '',
        email: customerEmail,
        departamento: customer.departamento || customer.department || '',
        ciudad: customer.ciudad || customer.city || '',
        direccion: customer.direccion || customer.address || '',
        notas: customer.notas || ''
      },
      shippingAddress: {
        fullName: `${customer.nombre || customer.fullName || 'Cliente'} ${customer.apellido || ''}`.trim(),
        phone: customer.telefono || customer.phone || '',
        email: customerEmail,
        address: customer.direccion || customer.address || '',
        city: customer.ciudad || customer.city || '',
        department: customer.departamento || customer.department || ''
      }
    });

    if (!emailConfig.user || !emailConfig.pass) {
      return res.json({
        success: false,
        warning: true,
        message: 'No hay credenciales SMTP configuradas en el servidor. El pedido se guardó localmente en el servidor.'
      });
    }

    const transporter = createTransporter(emailConfig);
    const fromAddress = `"${emailConfig.fromName || 'Nativa Alimentos & Cosmética Natural'}" <${emailConfig.fromEmail || emailConfig.user}>`;

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    let baseUrl = req.body.baseUrl;
    if (!baseUrl) {
      if (req.headers.origin) {
        baseUrl = req.headers.origin;
      } else if (req.headers.referer) {
        try {
          baseUrl = new URL(req.headers.referer).origin;
        } catch (e) {
          baseUrl = `${protocol}://${host}`;
        }
      } else {
        baseUrl = `${protocol}://${host}`;
      }
    }
    const trackingUrl = `${baseUrl}/perfil.html?order=${encodeURIComponent(order.id)}`;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.qty || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700;">${((item.price || 0) * (item.qty || 1)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td>
      </tr>
    `).join('');

    const customerName = customer.nombre || customer.fullName || 'Cliente Nativa';
    const customerCity = customer.ciudad || customer.city || 'Colombia';
    const customerDept = customer.departamento || customer.department || '';
    const customerAddress = customer.direccion || customer.address || 'Entrega estándar';
    const customerPhone = customer.telefono || customer.phone || 'No registrado';

    // 1. Enviar correo de confirmación al cliente
    const clientMailOptions = {
      from: fromAddress,
      to: customerEmail,
      subject: `🌿 ¡Confirmación de Pedido #${order.id} en Nativa!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: #1f361a; padding: 26px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: 2px;">NATIVA</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px;">Alimentos & Cosmética Natural Consciente</p>
          </div>
          <div style="padding: 26px 24px; background: #ffffff;">
            <h2 style="color: #1f361a; margin-top: 0; font-size: 20px;">¡Gracias por tu compra, ${customerName}! 🌿</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              Hemos recibido tu orden y ya se encuentra registrada en nuestro sistema para su preparación y despacho prioritario.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 18px 0; text-align: center;">
              <div style="font-size: 12px; color: #166534; text-transform: uppercase; font-weight: 600;">Número de Pedido</div>
              <div style="font-size: 25px; font-weight: 800; color: #1f361a; font-family: monospace; margin: 4px 0;">#${order.id}</div>
              <div style="font-size: 13px; color: #15803d; font-weight: 600;">Guía: ${order.guide || order.trackingNumber || 'SE-Pendiente'} (${order.carrier || 'Servientrega Express'})</div>
              <div style="margin-top: 6px; font-size: 13px; color: #374151;">${order.estimatedDelivery || 'Entrega estimada en 2 a 4 días hábiles'}</div>
            </div>

            <!-- BOTÓN PRINCIPAL DE RASTREO QUE REDIRIGE A LA PÁGINA DEDICADA DE RASTREO -->
            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${trackingUrl}" target="_blank" style="background-color: #1f361a; color: #ffffff !important; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 30px; display: inline-block; box-shadow: 0 4px 14px rgba(31, 54, 26, 0.28); text-transform: uppercase; letter-spacing: 0.5px;">
                📦 Rastrear Mi Pedido en Vivo
              </a>
            </div>
            <p style="text-align: center; margin: 0 0 24px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
              ¿Tienes problemas con el botón? Puedes rastrearlo directamente aquí:<br>
              <a href="${trackingUrl}" style="color: #2e6b26; text-decoration: underline; word-break: break-all;">${trackingUrl}</a>
            </p>

            <h3 style="color: #1f361a; font-size: 16px; margin: 20px 0 10px 0;">Productos Pedidos</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 8px 10px;">Producto</th>
                  <th style="padding: 8px 10px; text-align: center;">Cant.</th>
                  <th style="padding: 8px 10px; text-align: right;">Unitario</th>
                  <th style="padding: 8px 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: 600;">Envío Nacional:</td>
                  <td style="padding: 10px; text-align: right; color: #15803d; font-weight: 700;">¡GRATIS!</td>
                </tr>
                <tr style="font-size: 15px;">
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: 800;">Total Pagado:</td>
                  <td style="padding: 10px; text-align: right; font-weight: 800; color: #1f361a;">${order.totalFormatted || '$' + order.total}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #4b5563; line-height: 1.6;">
              <strong style="color: #1f361a;">Datos de Envío:</strong><br>
              <strong>Destinatario:</strong> ${customerName} ${customer.apellido || ''}<br>
              <strong>Dirección:</strong> ${customerAddress}, ${customerCity} (${customerDept})<br>
              <strong>Teléfono:</strong> ${customerPhone}
            </div>
          </div>
          <div style="background: #f0fdf4; padding: 16px; text-align: center; font-size: 12px; color: #15803d; border-top: 1px solid #bbf7d0;">
            Nativa &copy; 2026 - Alimentos & Cosmética Natural. Soporte WhatsApp: 300 542 7742.
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(clientMailOptions);

    // 2. Si el correo del administrador es distinto al del cliente, enviar notificación de nuevo pedido a la tienda
    const adminEmail = emailConfig.fromEmail || emailConfig.user;
    if (adminEmail && adminEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: adminEmail,
          subject: `🛒 ¡Nuevo Pedido #${order.id} Recibido! - ${customerName} (${order.totalFormatted || '$' + order.total})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px;">
              <h2 style="color: #1f361a; margin-top: 0;">📦 ¡Tienes un nuevo pedido en Nativa!</h2>
              <p>Un cliente acaba de realizar una orden en tu tienda:</p>
              <ul>
                <li><strong>Número de Pedido:</strong> #${order.id}</li>
                <li><strong>Cliente:</strong> ${customerName} ${customer.apellido || ''}</li>
                <li><strong>Email:</strong> ${customerEmail}</li>
                <li><strong>Teléfono:</strong> ${customerPhone}</li>
                <li><strong>Destino:</strong> ${customerAddress}, ${customerCity} (${customerDept})</li>
                <li><strong>Total:</strong> ${order.totalFormatted || '$' + order.total}</li>
                <li><strong>Método de Pago:</strong> ${order.paymentMethod || order.method || 'Online'}</li>
              </ul>
              <p><a href="${trackingUrl}" style="background:#1f361a; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:6px; display:inline-block;">Ver Pedido en Sistema</a></p>
            </div>
          `
        });
      } catch (adminErr) {
        console.warn('Advertencia al enviar copia al administrador:', adminErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Correo de pedido enviado con éxito',
      messageId: info.messageId,
      recipient: customerEmail
    });
  } catch (error) {
    console.error('Error sending order email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para obtener todos los pedidos guardados en el servidor
app.get('/api/orders', (req, res) => {
  try {
    const orders = getOrdersFromServer();
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para guardar o actualizar un pedido en el servidor
app.post('/api/orders', (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, message: 'Estructura de orden inválida.' });
    }
    saveOrderToServer(order);
    res.json({ success: true, message: 'Orden guardada con éxito en el servidor.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para actualizar el estado del pedido (ej. cambiar a "Enviado / En Tránsito")
app.post('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentStep } = req.body;
    const orders = getOrdersFromServer();
    const order = orders.find(o => String(o.id).toLowerCase() === String(id).toLowerCase());
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    if (status) order.status = status;
    if (currentStep !== undefined) order.currentStep = currentStep;
    saveOrderToServer(order);
    res.json({ success: true, message: `Estado actualizado a "${status || order.status}"`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static assets and html files from the root directory
app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback to index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

