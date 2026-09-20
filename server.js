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

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Archivo para persistir credenciales de correo
const CONFIG_FILE = path.join(__dirname, 'email-config.json');
// Archivo para persistir pedidos en el servidor de forma duradera
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Inicialización de Firebase Firestore en el backend
let firebaseDb = null;
try {
  const fbConfig = require('./firebase-applet-config.json');
  const { initializeApp } = require('firebase/app');
  const { getFirestore, doc, setDoc, getDoc, getDocFromServer } = require('firebase/firestore');
  const fbApp = initializeApp({
    projectId: fbConfig.projectId,
    appId: fbConfig.appId,
    apiKey: fbConfig.apiKey,
    authDomain: fbConfig.authDomain,
    storageBucket: fbConfig.storageBucket,
    messagingSenderId: fbConfig.messagingSenderId
  });
  firebaseDb = getFirestore(fbApp, fbConfig.firestoreDatabaseId);
  console.log('Firebase Firestore initialized in server with db:', fbConfig.firestoreDatabaseId);

  async function bootstrapFirestoreSync() {
    if (!firebaseDb) return;
    try {
      const { doc, setDoc } = require('firebase/firestore');
      // 1. Sincronizar credenciales y perfil de administrador
      const adm = getAdminConfig();
      await setDoc(doc(firebaseDb, 'admins', 'default'), {
        email: adm.email,
        name: adm.name,
        lastname: adm.lastname,
        role: adm.role,
        updatedAt: adm.updatedAt || new Date().toISOString()
      }, { merge: true });

      // 2. Sincronizar catálogo de productos
      const prods = getProductsFromServer();
      for (const p of prods) {
        if (p && p.id) {
          await setDoc(doc(firebaseDb, 'products', String(p.id)), p, { merge: true });
        }
      }

      // 3. Sincronizar pedidos iniciales
      const ords = getOrdersFromServer();
      for (const o of ords) {
        if (o && o.id) {
          await setDoc(doc(firebaseDb, 'orders', String(o.id)), o, { merge: true });
        }
      }
      console.log(`Firestore bootstrap sync completed successfully: ${prods.length} products, ${ords.length} orders.`);
    } catch (syncErr) {
      console.warn('Firestore bootstrap sync notice:', syncErr.message);
    }
  }

  getDocFromServer(doc(firebaseDb, 'test', 'connection')).then(() => {
    console.log('Firestore backend connection verified successfully.');
    bootstrapFirestoreSync();
  }).catch(e => {
    console.warn('Firestore initial check notice:', e.message);
    bootstrapFirestoreSync();
  });
} catch (fbErr) {
  console.warn('Firebase backend initialization notice:', fbErr.message);
}

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

  // Sincronización en tiempo real con Firebase Firestore
  if (firebaseDb && enrichedOrder.id) {
    try {
      const { doc, setDoc } = require('firebase/firestore');
      setDoc(doc(firebaseDb, 'orders', String(enrichedOrder.id)), enrichedOrder, { merge: true })
        .then(() => console.log(`Order ${enrichedOrder.id} synchronized to Firestore.`))
        .catch(err => console.warn('Firestore order sync warning:', err.message));
    } catch (e) {
      console.warn('Error invoking Firestore sync:', e.message);
    }
  }
}

// Archivos para productos, usuarios y notificaciones
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const NOTIFICATIONS_FILE = path.join(__dirname, 'notifications.json');
const ADMIN_CONFIG_FILE = path.join(__dirname, 'admin-config.json');
const CONFIRMATIONS_FILE = path.join(__dirname, 'pending-confirmations.json');

function getAdminConfig() {
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));
      if (data && data.email) return data;
    } catch (e) {
      console.error('Error reading admin config:', e);
    }
  }
  return {
    email: 'samueldpp12@gmail.com',
    name: 'Samuel',
    lastname: 'De Paula',
    password: 'SuperPassword123',
    role: 'Super Administrador Nativa',
    updatedAt: new Date().toISOString()
  };
}

function saveAdminConfig(cfg) {
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  if (firebaseDb) {
    try {
      const { doc, setDoc } = require('firebase/firestore');
      setDoc(doc(firebaseDb, 'admins', 'default'), {
        email: cfg.email,
        name: cfg.name,
        lastname: cfg.lastname,
        role: cfg.role,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('Firestore admin save notice:', err.message));
    } catch (e) {}
  }
}

function getPendingConfirmations() {
  if (fs.existsSync(CONFIRMATIONS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIRMATIONS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {}
  }
  return [];
}

function savePendingConfirmations(list) {
  fs.writeFileSync(CONFIRMATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function getNotificationsFromServer() {
  if (fs.existsSync(NOTIFICATIONS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.error('Error reading notifications file:', e);
    }
  }
  return [];
}

function saveNotificationToServer(notification) {
  if (!notification || !notification.id) return;
  const notifications = getNotificationsFromServer();
  const existingIdx = notifications.findIndex(n => n.id === notification.id);
  if (existingIdx >= 0) {
    notifications[existingIdx] = { ...notifications[existingIdx], ...notification };
  } else {
    notifications.unshift(notification);
  }
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');

  // Sincronización con Firestore si está disponible
  if (firebaseDb && notification.id) {
    try {
      const { doc, setDoc } = require('firebase/firestore');
      setDoc(doc(firebaseDb, 'notifications', String(notification.id)), notification, { merge: true })
        .catch(err => console.warn('Firestore notification sync warning:', err.message));
    } catch (e) {
      console.warn('Error syncing notification with Firestore:', e.message);
    }
  }
}

async function notifyUserOfOrderStatusChange(order, oldStatus, newStatus, customDetails = {}, req = null) {
  const customer = order.customer || order.shippingAddress || {};
  const customerEmail = customer.email || order.email || '';
  const customerName = customer.nombre || customer.fullName || order.nombre || 'Apreciado(a) Cliente';
  const carrier = customDetails.carrier || order.carrier || 'Servientrega Express';
  const guide = customDetails.guide || order.guide || order.trackingNumber || '';

  // Determinar URL de rastreo
  let baseUrl = 'https://ais-dev-g2r7z74d7guxefdzq5jhxf-460356644319.us-west1.run.app';
  if (req) {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    if (req.headers.origin) {
      baseUrl = req.headers.origin;
    } else if (req.headers.referer) {
      try { baseUrl = new URL(req.headers.referer).origin; } catch (e) {}
    } else {
      baseUrl = `${protocol}://${host}`;
    }
  }
  const trackingUrl = `${baseUrl}/perfil.html?order=${encodeURIComponent(order.id)}`;

  // Determinar colores, icono y mensaje según el nuevo estado
  let statusBadgeColor = '#285943';
  let statusBgColor = '#f0fdf4';
  let statusBorderColor = '#bbf7d0';
  let statusIcon = '📦';
  let statusTitle = `¡Tu pedido #${order.id} está en ${newStatus}!`;
  let statusDesc = '';

  const sLower = (newStatus || '').toLowerCase();
  if (sLower.includes('esperando') || sLower.includes('pago')) {
    statusBadgeColor = '#D97706';
    statusBgColor = '#FFFBEB';
    statusBorderColor = '#FDE68A';
    statusIcon = '⏳';
    statusTitle = `⏳ Tu pedido #${order.id} está registrado (Esperando Pago)`;
    statusDesc = 'Hemos recibido tu orden y estamos a la espera de la confirmación del pago para comenzar la preparación de tus productos naturales.';
  } else if (sLower.includes('prepar') || sLower.includes('alist')) {
    statusBadgeColor = '#285943';
    statusBgColor = '#ECFDF5';
    statusBorderColor = '#A7F3D0';
    statusIcon = '🌿';
    statusTitle = `🌿 ¡Tu pedido #${order.id} está en preparación!`;
    statusDesc = '¡Tu pago ha sido validado con éxito! Nuestro equipo en bodega está empacando cuidadosamente tus productos frescos y 100% naturales con sello artesanal.';
  } else if (sLower.includes('tránsito') || sLower.includes('transito') || sLower.includes('camino') || sLower.includes('enviado')) {
    statusBadgeColor = '#1D4ED8';
    statusBgColor = '#EFF6FF';
    statusBorderColor = '#BFDBFE';
    statusIcon = '🚚';
    statusTitle = `🚚 ¡Tu pedido #${order.id} va en camino a tu destino!`;
    statusDesc = `Tu paquete ha sido despachado con la empresa transportadora <strong>${carrier}</strong>${guide ? ` bajo el número de guía <strong>${guide}</strong>` : ''}. Ya puedes seguir la trayectoria en tiempo real.`;
  } else if (sLower.includes('entreg')) {
    statusBadgeColor = '#15803D';
    statusBgColor = '#DCFCE7';
    statusBorderColor = '#86EFAC';
    statusIcon = '✨';
    statusTitle = `✨ ¡Tu pedido #${order.id} ha sido entregado!`;
    statusDesc = 'El paquete ha llegado a su destino satisfactoriamente. Esperamos que disfrutes cada producto natural de Nativa. ¡Gracias por tu compra!';
  } else {
    statusDesc = `El estado de tu orden ha sido actualizado a: <strong>${newStatus}</strong>.`;
  }

  // 1. Guardar notificación en el servidor para visualización en el perfil del cliente
  const notificationId = 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const notificationObj = {
    id: notificationId,
    orderId: order.id,
    userEmail: customerEmail.toLowerCase(),
    userName: customerName,
    title: statusTitle,
    message: statusDesc.replace(/<[^>]*>?/gm, ''),
    htmlMessage: statusDesc,
    oldStatus: oldStatus || order.status,
    newStatus: newStatus,
    currentStep: order.currentStep || 2,
    guide: guide,
    carrier: carrier,
    read: false,
    createdAt: new Date().toISOString(),
    url: `perfil.html?order=${encodeURIComponent(order.id)}`
  };
  saveNotificationToServer(notificationObj);

  // 2. Enviar correo de notificación al usuario
  let emailSent = false;
  let emailError = null;

  if (customerEmail && customerEmail.includes('@') && emailConfig.user && emailConfig.pass && nodemailer) {
    try {
      const transporter = createTransporter(emailConfig);
      const fromAddress = `"${emailConfig.fromName || 'Nativa Alimentos & Cosmética Natural'}" <${emailConfig.fromEmail || emailConfig.user}>`;

      const itemsRows = (order.items || []).map(it => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${it.name || 'Producto natural'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${it.qty || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700;">${(it.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td>
        </tr>
      `).join('');

      const mailOptions = {
        from: fromAddress,
        to: customerEmail,
        subject: `${statusIcon} Actualización de tu Pedido #${order.id}: ¡Ahora está en ${newStatus}! - Nativa`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">
            <!-- Encabezado Nativa -->
            <div style="background: linear-gradient(135deg, #1b3d2e 0%, #285943 100%); padding: 26px 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 26px; letter-spacing: 2px; font-family: Georgia, serif;">NATIVA</h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1.5px;">Alimentos & Cosmética Natural Consciente</p>
            </div>

            <!-- Cuerpo del Correo -->
            <div style="padding: 30px 24px;">
              <h2 style="color: #1b3d2e; font-size: 20px; margin-top: 0;">¡Hola, ${customerName}! 🌿</h2>
              <p style="color: #4b5563; font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
                Te informamos que <strong>el estado de tu pedido #${order.id} ha cambiado</strong>. A continuación puedes consultar la actualización y el avance de tu entrega:
              </p>

              <!-- Tarjeta Destacada del Estado -->
              <div style="background: ${statusBgColor}; border: 1.5px solid ${statusBorderColor}; border-radius: 10px; padding: 22px 20px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 34px; margin-bottom: 8px;">${statusIcon}</div>
                <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: ${statusBadgeColor}; letter-spacing: 1px;">Estado Actual de tu Pedido</div>
                <div style="font-size: 24px; font-weight: 800; color: ${statusBadgeColor}; margin: 6px 0 8px 0;">${newStatus}</div>
                ${oldStatus && oldStatus !== newStatus ? `<div style="font-size: 12.5px; color: #6b7280; margin-bottom: 10px;">Estado anterior: <span style="text-decoration: line-through;">${oldStatus}</span> &nbsp;➔&nbsp; <strong style="color:${statusBadgeColor}">${newStatus}</strong></div>` : ''}
                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.5;">${statusDesc}</p>
                ${guide ? `
                  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed ${statusBorderColor}; font-size: 13px; color: #1f2937;">
                    <strong>Empresa de Envíos:</strong> ${carrier} &nbsp;|&nbsp; <strong>Número de Guía:</strong> <span style="font-family: monospace; font-weight: 700; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #d1d5db;">${guide}</span>
                  </div>
                ` : ''}
              </div>

              <!-- Botón Principal para Rastrear -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${trackingUrl}" target="_blank" style="background-color: #285943; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 30px; display: inline-block; box-shadow: 0 4px 12px rgba(40,89,67,0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                  📦 Rastrear Pedido
                </a>
                <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                  Accede a tu perfil para consultar la línea de tiempo y detalles en vivo
                </div>
              </div>

              <!-- Resumen de la Orden -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; font-size: 13px;">
                  <strong>Orden: #${order.id}</strong>
                  <span style="color: #6b7280;">Fecha: ${order.dateDisplay || order.date || 'Reciente'}</span>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tbody>
                    ${itemsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 10px 0 4px 0; text-align: right; font-weight: 700; color: #1b3d2e;">Total Pagado:</td>
                      <td style="padding: 10px 0 4px 0; text-align: right; font-weight: 800; color: #1b3d2e; font-size: 15px;">${order.totalFormatted || '$' + order.total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Pie de Atención al Cliente -->
              <div style="margin-top: 28px; padding: 14px; background: #fdf8f4; border-radius: 8px; font-size: 12.5px; color: #78350f; line-height: 1.5;">
                💬 ¿Tienes alguna pregunta con tu entrega? Comunícate con nuestro equipo en WhatsApp al <strong>+57 300 542 7742</strong> o responde a este correo.
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f0fdf4; padding: 18px 20px; text-align: center; font-size: 12px; color: #15803d; border-top: 1px solid #bbf7d0;">
              Nativa &copy; 2026 - Alimentos & Cosmética Natural Consciente. Colombia.
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`Notification email sent to ${customerEmail} for order #${order.id}. MessageId: ${info.messageId}`);
    } catch (err) {
      emailError = err.message;
      console.warn(`Could not send notification email to ${customerEmail}:`, err.message);
    }
  }

  return {
    notification: notificationObj,
    emailSent,
    emailError,
    recipient: customerEmail
  };
}

function getProductsFromServer() {
  if (fs.existsSync(PRODUCTS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.error('Error reading products file:', e);
    }
  }
  return [];
}

function saveProductsToFile(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

function syncProductToFirestore(product) {
  if (firebaseDb && product && product.id) {
    try {
      const { doc, setDoc } = require('firebase/firestore');
      setDoc(doc(firebaseDb, 'products', String(product.id)), product, { merge: true })
        .catch(err => console.warn('Firestore product sync warning:', err.message));
    } catch (e) {
      console.warn('Error calling Firestore product sync:', e.message);
    }
  }
}

function deleteProductFromFirestore(productId) {
  if (firebaseDb && productId) {
    try {
      const { doc, deleteDoc } = require('firebase/firestore');
      deleteDoc(doc(firebaseDb, 'products', String(productId)))
        .catch(err => console.warn('Firestore product delete warning:', err.message));
    } catch (e) {
      console.warn('Error calling Firestore product delete:', e.message);
    }
  }
}

function getUsersFromServer() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.error('Error reading users file:', e);
    }
  }
  return [];
}

function saveUserToFile(user) {
  if (!user || !user.email) return;
  const adminCfg = getAdminConfig();
  if (user.email.trim().toLowerCase() === adminCfg.email.trim().toLowerCase()) {
    console.warn('Prevented saving admin credentials as regular user in users.json:', user.email);
    return;
  }
  const users = getUsersFromServer();
  const idx = users.findIndex(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
  } else {
    users.push({ ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

  // Sincronizar usuario regular con Firestore
  if (firebaseDb && user.email) {
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const safeDocId = user.email.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
      setDoc(doc(firebaseDb, 'users', safeDocId), {
        email: user.email.trim().toLowerCase(),
        name: user.name || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        authProvider: user.authProvider || user.provider || 'password',
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('Firestore user save notice:', err.message));
    } catch (e) {}
  }
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
    const order = req.body.order || req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, message: 'Estructura de orden inválida.' });
    }
    saveOrderToServer(order);
    res.json({ success: true, message: 'Orden guardada con éxito en el servidor.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para actualizar el estado del pedido y enviar notificación inmediata al usuario
const handleOrderStatusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentStep, guide, carrier, notes } = req.body;
    const orders = getOrdersFromServer();
    const order = orders.find(o => String(o.id).toLowerCase() === String(id).toLowerCase());
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const oldStatus = order.status;
    if (status) order.status = status;
    if (currentStep !== undefined) {
      order.currentStep = currentStep;
    } else if (status) {
      const s = status.toLowerCase();
      if (s.includes('esperando') || s.includes('pago')) order.currentStep = 1;
      else if (s.includes('prepar')) order.currentStep = 2;
      else if (s.includes('tránsito') || s.includes('transito') || s.includes('camino') || s.includes('enviado')) order.currentStep = 3;
      else if (s.includes('entreg')) order.currentStep = 4;
    }

    if (guide) order.guide = guide;
    if (carrier) order.carrier = carrier;
    if (notes) order.adminNotes = notes;

    saveOrderToServer(order);

    // Enviar notificación al usuario (tanto en la plataforma como por correo electrónico)
    const notifResult = await notifyUserOfOrderStatusChange(order, oldStatus, order.status, { guide: order.guide, carrier: order.carrier }, req);

    res.json({
      success: true,
      message: `Estado actualizado a "${order.status}" y notificación enviada al usuario exitosamente.`,
      order,
      notification: notifResult.notification,
      emailSent: notifResult.emailSent,
      emailError: notifResult.emailError,
      recipient: notifResult.recipient
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

app.post('/api/orders/:id/status', handleOrderStatusUpdate);
app.put('/api/orders/:id/status', handleOrderStatusUpdate);

// Endpoints para consultar y gestionar notificaciones de usuarios
app.get('/api/notifications', (req, res) => {
  try {
    const emailFilter = (req.query.email || '').toLowerCase().trim();
    let notifications = getNotificationsFromServer();
    if (emailFilter) {
      notifications = notifications.filter(n => !n.userEmail || n.userEmail.toLowerCase() === emailFilter);
    }
    // Ordenar de más reciente a más antiguo
    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json({ success: true, notifications, unreadCount: notifications.filter(n => !n.read).length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/notifications/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const notifications = getNotificationsFromServer();
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');
    }
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  try {
    const emailFilter = (req.body.email || '').toLowerCase().trim();
    const notifications = getNotificationsFromServer();
    notifications.forEach(n => {
      if (!emailFilter || (n.userEmail && n.userEmail.toLowerCase() === emailFilter)) {
        n.read = true;
      }
    });
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para verificar el estado de la base de datos Firestore
app.get('/api/db/status', async (req, res) => {
  try {
    const isOnline = Boolean(firebaseDb);
    let testSuccess = false;
    if (firebaseDb) {
      const { doc, getDocFromServer } = require('firebase/firestore');
      await getDocFromServer(doc(firebaseDb, 'test', 'connection'));
      testSuccess = true;
    }
    res.json({
      success: true,
      provider: 'Firebase Firestore',
      connected: isOnline && testSuccess,
      databaseId: 'ai-studio-native-1641c3e6-1620-480c-b06d-13dff000c7e5',
      projectId: 'apt-lambda-8gmzr'
    });
  } catch (error) {
    res.json({
      success: true,
      provider: 'Firebase Firestore',
      connected: false,
      databaseId: 'ai-studio-native-1641c3e6-1620-480c-b06d-13dff000c7e5',
      notice: error.message
    });
  }
});

// Endpoint para sincronizar perfiles de usuario en Firestore
app.post('/api/users/sync', async (req, res) => {
  const { email, name, lastname, phone, provider } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requerido' });
  }
  const adminCfg = getAdminConfig();
  if (email.trim().toLowerCase() === adminCfg.email.trim().toLowerCase()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Este correo pertenece al Administrador del sistema y no puede registrarse como usuario común.' 
    });
  }
  try {
    saveUserToFile({ email, name, lastname, phone, provider });
    if (firebaseDb) {
      const { doc, setDoc } = require('firebase/firestore');
      const userDocId = email.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(firebaseDb, 'users', userDocId), {
        email,
        name: name || '',
        lastname: lastname || '',
        phone: phone || '',
        authProvider: provider || 'local',
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
    res.json({ success: true, message: 'Usuario sincronizado con la base de datos' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint para obtener la lista de usuarios registrados (excluye al administrador)
app.get('/api/users', (req, res) => {
  try {
    const adminCfg = getAdminConfig();
    const allUsers = getUsersFromServer();
    const filteredUsers = allUsers.filter(u => u.email && u.email.trim().toLowerCase() !== adminCfg.email.trim().toLowerCase());
    res.json({ success: true, users: filteredUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enviar correo de confirmación para cambio de correo electrónico
async function sendConfirmationEmail(toEmail, confirmationUrl, type, recipientName, req) {
  try {
    if (!emailConfig.user || !emailConfig.pass) {
      console.log('--- ENLACE DE CONFIRMACIÓN DE CORREO (SMTP pendiente) ---');
      console.log(`Destinatario: ${toEmail} | Tipo: ${type}`);
      console.log(`Enlace de confirmación: ${confirmationUrl}`);
      console.log('---------------------------------------------------------');
      return { sent: false, simulated: true, url: confirmationUrl };
    }

    const transporter = createTransporter(emailConfig);
    const fromAddress = `"${emailConfig.fromName || 'Nativa Alimentos & Cosmética Natural'}" <${emailConfig.fromEmail || emailConfig.user}>`;

    const titleText = type === 'admin' 
      ? 'Confirmación de Cambio de Correo de Administrador'
      : 'Confirmación de Cambio de Correo Electrónico';

    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `🌿 ${titleText} - Nativa`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: #1f361a; padding: 26px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NATIVA</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; text-transform: uppercase;">Alimentos & Cosmética Natural</p>
          </div>
          <div style="padding: 28px 24px; background: #ffffff;">
            <h2 style="color: #1f361a; margin-top: 0; font-size: 20px;">Hola, ${recipientName || 'Usuario de Nativa'} 🌿</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              Hemos recibido una solicitud para asociar este correo electrónico (<strong>${toEmail}</strong>) a tu cuenta en Nativa.
            </p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              Para verificar que este correo te pertenece y activar el cambio automáticamente en tu perfil, haz clic en el siguiente botón:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" target="_blank" style="background-color: #285943; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 30px; display: inline-block; box-shadow: 0 4px 14px rgba(40, 89, 67, 0.3);">
                ✅ Confirmar Mi Nuevo Correo
              </a>
            </div>

            <p style="font-size: 12px; color: #6b7280; line-height: 1.5; border-top: 1px solid #f3f4f6; padding-top: 16px;">
              ¿Tienes problemas con el botón? Copia y pega el siguiente enlace en tu navegador:<br>
              <a href="${confirmationUrl}" style="color: #285943; word-break: break-all;">${confirmationUrl}</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
              Este enlace es válido durante las próximas 24 horas. Si tú no realizaste esta solicitud, puedes ignorar este mensaje de manera segura.
            </p>
          </div>
          <div style="background: #f0fdf4; padding: 14px; text-align: center; font-size: 12px; color: #166534; border-top: 1px solid #bbf7d0;">
            Nativa &copy; 2026 - Seguridad de Cuentas y Privacidad
          </div>
        </div>
      `
    });

    return { sent: true, url: confirmationUrl };
  } catch (err) {
    console.error('Error enviando correo de confirmación:', err);
    return { sent: false, error: err.message, url: confirmationUrl };
  }
}

// AUTENTICACIÓN ESTRICTA DEL PANEL DE ADMINISTRADOR
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  const currentAdmin = getAdminConfig();
  if (
    email && 
    email.trim().toLowerCase() === currentAdmin.email.toLowerCase() && 
    password === currentAdmin.password
  ) {
    const token = 'nat_adm_' + Buffer.from(`${email}:${Date.now()}:adminSecretKey`).toString('base64');
    return res.json({
      success: true,
      token,
      admin: {
        email: currentAdmin.email,
        name: currentAdmin.name,
        lastname: currentAdmin.lastname || '',
        role: currentAdmin.role || 'Super Administrador Nativa'
      },
      message: 'Inicio de sesión como administrador exitoso'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Credenciales de administrador incorrectas. Acceso denegado.'
  });
});

// Middleware simple de verificación para rutas de administración
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (token && token.startsWith('nat_adm_')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso exclusivo para el administrador.' });
}

// Obtener datos del perfil del administrador
app.get('/api/admin/profile', requireAdmin, (req, res) => {
  try {
    const admin = getAdminConfig();
    res.json({
      success: true,
      admin: {
        email: admin.email,
        name: admin.name || 'Samuel',
        lastname: admin.lastname || 'De Paula',
        role: admin.role || 'Super Administrador Nativa'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Actualizar datos del administrador (nombre, apellido, contraseña y confirmación, y correo con verificación)
app.post('/api/admin/profile', requireAdmin, async (req, res) => {
  try {
    const { name, lastname, newEmail, password, passwordConfirm } = req.body || {};
    const adminCfg = getAdminConfig();

    if (password) {
      if (!passwordConfirm || password !== passwordConfirm) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña y su confirmación no coinciden.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      }
      adminCfg.password = password;
    }

    if (name) adminCfg.name = name.trim();
    if (lastname !== undefined) adminCfg.lastname = lastname.trim();

    let emailVerificationSent = false;
    let confirmationUrl = null;
    const cleanNewEmail = newEmail ? newEmail.trim().toLowerCase() : null;

    if (cleanNewEmail && cleanNewEmail !== adminCfg.email.toLowerCase()) {
      // Validar formato de correo
      if (!cleanNewEmail.includes('@') || !cleanNewEmail.includes('.')) {
        return res.status(400).json({ success: false, message: 'El nuevo correo electrónico no tiene un formato válido.' });
      }

      // Generar token único de verificación
      const token = 'v_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      const pendingList = getPendingConfirmations();
      // Eliminar tokens previos de admin
      const filtered = pendingList.filter(p => p.type !== 'admin');
      
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      let baseUrl = req.body.baseUrl || `${protocol}://${host}`;

      confirmationUrl = `${baseUrl}/confirm-email.html?token=${encodeURIComponent(token)}`;

      filtered.push({
        token,
        type: 'admin',
        oldEmail: adminCfg.email,
        newEmail: cleanNewEmail,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
      savePendingConfirmations(filtered);

      // Guardar también en Firestore si está conectado
      if (firebaseDb) {
        try {
          const { doc, setDoc } = require('firebase/firestore');
          setDoc(doc(firebaseDb, 'confirmations', token), {
            token,
            type: 'admin',
            oldEmail: adminCfg.email,
            newEmail: cleanNewEmail,
            createdAt: new Date().toISOString()
          }, { merge: true }).catch(err => console.warn('Firestore confirmation sync warning:', err.message));
        } catch (e) {}
      }

      // Enviar correo de confirmación al nuevo correo
      const emailResult = await sendConfirmationEmail(cleanNewEmail, confirmationUrl, 'admin', adminCfg.name, req);
      emailVerificationSent = true;
    }

    // Guardar cambios inmediatos de nombre, apellido y contraseña
    adminCfg.updatedAt = new Date().toISOString();
    saveAdminConfig(adminCfg);

    res.json({
      success: true,
      emailVerificationSent,
      confirmationUrl,
      newEmail: cleanNewEmail,
      admin: {
        email: adminCfg.email,
        name: adminCfg.name,
        lastname: adminCfg.lastname,
        role: adminCfg.role
      },
      message: emailVerificationSent
        ? `Datos actualizados. Se envió un correo de verificación a ${cleanNewEmail}. Al confirmarlo se cambiará automáticamente tu correo de administrador.`
        : 'Perfil de administrador actualizado con éxito.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Obtener perfil de usuario regular
app.get('/api/user/profile', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    const users = getUsersFromServer();
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.json({ success: true, user: { email, name: '', lastname: '', phone: '' } });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Actualizar datos de usuario regular (nombre, apellido, contraseña y confirmación, y correo con verificación)
app.post('/api/user/profile', async (req, res) => {
  try {
    const { currentEmail, name, lastname, phone, newEmail, password, passwordConfirm } = req.body || {};
    if (!currentEmail) {
      return res.status(400).json({ success: false, message: 'El correo actual es obligatorio.' });
    }

    const adminCfg = getAdminConfig();
    const cleanCurrent = currentEmail.trim().toLowerCase();
    const cleanNew = newEmail ? newEmail.trim().toLowerCase() : null;

    if (cleanNew && cleanNew === adminCfg.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'No puedes usar el correo del administrador como correo de usuario.' });
    }

    if (password) {
      if (!passwordConfirm || password !== passwordConfirm) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña y su confirmación no coinciden.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      }
    }

    // Actualizar nombre, apellido, teléfono en users.json
    const users = getUsersFromServer();
    let userIndex = users.findIndex(u => u.email && u.email.toLowerCase() === cleanCurrent);
    if (userIndex === -1) {
      const newUser = {
        email: cleanCurrent,
        name: name ? name.trim() : '',
        lastname: lastname ? lastname.trim() : '',
        phone: phone ? phone.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      userIndex = users.length - 1;
    } else {
      if (name) users[userIndex].name = name.trim();
      if (lastname !== undefined) users[userIndex].lastname = lastname.trim();
      if (phone !== undefined) users[userIndex].phone = phone.trim();
      users[userIndex].updatedAt = new Date().toISOString();
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

    // Sincronizar con Firestore
    if (firebaseDb) {
      try {
        const { doc, setDoc } = require('firebase/firestore');
        const userDocId = cleanCurrent.replace(/[^a-zA-Z0-9]/g, '_');
        setDoc(doc(firebaseDb, 'users', userDocId), users[userIndex], { merge: true })
          .catch(err => console.warn('Firestore user update warning:', err.message));
      } catch (e) {}
    }

    let emailVerificationSent = false;
    let confirmationUrl = null;

    if (cleanNew && cleanNew !== cleanCurrent) {
      if (!cleanNew.includes('@') || !cleanNew.includes('.')) {
        return res.status(400).json({ success: false, message: 'El nuevo correo no tiene un formato válido.' });
      }

      const token = 'v_usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      const pendingList = getPendingConfirmations();
      const filtered = pendingList.filter(p => !(p.type === 'user' && p.oldEmail === cleanCurrent));

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      let baseUrl = req.body.baseUrl || `${protocol}://${host}`;

      confirmationUrl = `${baseUrl}/confirm-email.html?token=${encodeURIComponent(token)}`;

      filtered.push({
        token,
        type: 'user',
        oldEmail: cleanCurrent,
        newEmail: cleanNew,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
      savePendingConfirmations(filtered);

      if (firebaseDb) {
        try {
          const { doc, setDoc } = require('firebase/firestore');
          setDoc(doc(firebaseDb, 'confirmations', token), {
            token,
            type: 'user',
            oldEmail: cleanCurrent,
            newEmail: cleanNew,
            createdAt: new Date().toISOString()
          }, { merge: true }).catch(err => console.warn('Firestore confirmation sync warning:', err.message));
        } catch (e) {}
      }

      await sendConfirmationEmail(cleanNew, confirmationUrl, 'user', name || users[userIndex].name, req);
      emailVerificationSent = true;
    }

    res.json({
      success: true,
      emailVerificationSent,
      confirmationUrl,
      newEmail: cleanNew,
      user: users[userIndex],
      message: emailVerificationSent
        ? `Datos guardados. Hemos enviado un correo de confirmación a ${cleanNew}. Al confirmarlo se cambiará automáticamente tu correo.`
        : 'Tus datos personales han sido actualizados con éxito.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint universal para confirmar el cambio de correo electrónico y aplicarlo automáticamente
app.all('/api/auth/confirm-email', async (req, res) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token de confirmación requerido.' });
    }

    const pendingList = getPendingConfirmations();
    const index = pendingList.findIndex(p => p.token === token);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'El enlace de confirmación no es válido o ya fue utilizado.' });
    }

    const record = pendingList[index];
    if (record.expiresAt && Date.now() > record.expiresAt) {
      pendingList.splice(index, 1);
      savePendingConfirmations(pendingList);
      return res.status(400).json({ success: false, message: 'El enlace de confirmación ha expirado. Por favor solicita un nuevo cambio desde tu perfil.' });
    }

    // 1. Caso Administrador
    if (record.type === 'admin') {
      const adminCfg = getAdminConfig();
      const oldEmail = adminCfg.email;
      adminCfg.email = record.newEmail;
      adminCfg.updatedAt = new Date().toISOString();
      saveAdminConfig(adminCfg);

      // Eliminar el token usado
      pendingList.splice(index, 1);
      savePendingConfirmations(pendingList);

      if (firebaseDb) {
        try {
          const { doc, deleteDoc } = require('firebase/firestore');
          deleteDoc(doc(firebaseDb, 'confirmations', token)).catch(e => {});
        } catch (e) {}
      }

      return res.json({
        success: true,
        type: 'admin',
        oldEmail,
        newEmail: record.newEmail,
        message: `¡Correo de Administrador confirmado y actualizado con éxito a ${record.newEmail}!`
      });
    }

    // 2. Caso Usuario Regular
    if (record.type === 'user') {
      const users = getUsersFromServer();
      const userIdx = users.findIndex(u => u.email && u.email.toLowerCase() === record.oldEmail.toLowerCase());
      
      if (userIdx >= 0) {
        users[userIdx].email = record.newEmail;
        users[userIdx].updatedAt = new Date().toISOString();
      } else {
        users.push({
          email: record.newEmail,
          name: '',
          lastname: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

      // Actualizar también en los pedidos para mantener el historial
      const orders = getOrdersFromServer();
      let ordersUpdated = false;
      orders.forEach(o => {
        if (o.customer && o.customer.email && o.customer.email.toLowerCase() === record.oldEmail.toLowerCase()) {
          o.customer.email = record.newEmail;
          ordersUpdated = true;
        }
        if (o.shippingAddress && o.shippingAddress.email && o.shippingAddress.email.toLowerCase() === record.oldEmail.toLowerCase()) {
          o.shippingAddress.email = record.newEmail;
          ordersUpdated = true;
        }
        if (o.email && o.email.toLowerCase() === record.oldEmail.toLowerCase()) {
          o.email = record.newEmail;
          ordersUpdated = true;
        }
      });
      if (ordersUpdated) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
      }

      // Sincronizar en Firestore
      if (firebaseDb) {
        try {
          const { doc, setDoc, deleteDoc } = require('firebase/firestore');
          const oldDocId = record.oldEmail.replace(/[^a-zA-Z0-9]/g, '_');
          const newDocId = record.newEmail.replace(/[^a-zA-Z0-9]/g, '_');
          setDoc(doc(firebaseDb, 'users', newDocId), {
            email: record.newEmail,
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(e => {});
          deleteDoc(doc(firebaseDb, 'users', oldDocId)).catch(e => {});
          deleteDoc(doc(firebaseDb, 'confirmations', token)).catch(e => {});
        } catch (e) {}
      }

      // Eliminar token usado
      pendingList.splice(index, 1);
      savePendingConfirmations(pendingList);

      return res.json({
        success: true,
        type: 'user',
        oldEmail: record.oldEmail,
        newEmail: record.newEmail,
        message: `¡Correo electrónico confirmado y actualizado automáticamente a ${record.newEmail}!`
      });
    }

    res.status(400).json({ success: false, message: 'Tipo de confirmación desconocido.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GESTIÓN DE PRODUCTOS: Obtener catálogo completo
app.get('/api/products', (req, res) => {
  try {
    const products = getProductsFromServer();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GESTIÓN DE PRODUCTOS: 1.1 Agregar producto nuevo
app.post('/api/products', requireAdmin, (req, res) => {
  try {
    const { name, description, price, image, stock, category, badge } = req.body || {};
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ success: false, message: 'El nombre y precio son obligatorios.' });
    }

    const products = getProductsFromServer();
    const newId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;

    const newProduct = {
      id: newId,
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      price: Number(price) || 0,
      stock: stock !== undefined && stock !== null ? Math.max(0, Number(stock)) : 20,
      image: image ? String(image).trim() : 'img/productos/Granola_Nativa.png',
      category: category ? String(category).trim() : 'General',
      badge: badge ? String(badge).trim() : 'Nuevo',
      active: true,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    saveProductsToFile(products);
    syncProductToFirestore(newProduct);

    res.json({ success: true, message: 'Producto agregado exitosamente al catálogo', product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GESTIÓN DE PRODUCTOS: 1.3 Cambiar nombre, precio, stock, descripción o imagen
app.put('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock, category, badge, active } = req.body || {};

    const products = getProductsFromServer();
    const index = products.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    const current = products[index];
    const updated = {
      ...current,
      name: name !== undefined ? String(name).trim() : current.name,
      description: description !== undefined ? String(description).trim() : current.description,
      price: price !== undefined ? Number(price) : current.price,
      stock: stock !== undefined ? Math.max(0, Number(stock)) : current.stock,
      image: image !== undefined ? String(image).trim() : current.image,
      category: category !== undefined ? String(category).trim() : current.category,
      badge: badge !== undefined ? String(badge).trim() : current.badge,
      active: active !== undefined ? Boolean(active) : current.active,
      updatedAt: new Date().toISOString()
    };

    products[index] = updated;
    saveProductsToFile(products);
    syncProductToFirestore(updated);

    res.json({ success: true, message: 'Producto actualizado exitosamente', product: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GESTIÓN DE PRODUCTOS: 1.2 Eliminar producto
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const products = getProductsFromServer();
    const index = products.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    const removed = products.splice(index, 1)[0];
    saveProductsToFile(products);
    deleteProductFromFirestore(id);

    res.json({ success: true, message: `Producto "${removed.name}" eliminado del catálogo.`, product: removed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint de métricas generales de administración
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  try {
    const orders = getOrdersFromServer();
    const products = getProductsFromServer();
    const users = getUsersFromServer();

    const pendingOrders = orders.filter(o => {
      const st = (o.status || '').toLowerCase();
      return st === 'pendiente' || st === 'en preparación' || st === 'confirmación' || !st.includes('entreg');
    });

    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const lowStockProducts = products.filter(p => (Number(p.stock) || 0) < 10);

    res.json({
      success: true,
      metrics: {
        totalOrders: orders.length,
        pendingOrdersCount: pendingOrders.length,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        totalUsers: users.length,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para obtener la URL de OAuth según el proveedor (Google o Facebook)
app.get('/api/auth/oauth-url', (req, res) => {
  const provider = (req.query.provider || 'google').toLowerCase();
  const origin = req.query.origin || (req.protocol + '://' + req.get('host'));
  const redirectUri = `${origin}/auth/callback`;

  if (provider === 'google') {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId) {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
      return res.json({ success: true, url: googleAuthUrl, hasCustomKey: true });
    }
    return res.json({
      success: true,
      url: `/auth-popup.html?provider=google&origin=${encodeURIComponent(origin)}`,
      hasCustomKey: false
    });
  } else if (provider === 'facebook') {
    const facebookAppId = process.env.FACEBOOK_APP_ID;
    if (facebookAppId) {
      const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(facebookAppId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&response_type=code`;
      return res.json({ success: true, url: fbAuthUrl, hasCustomKey: true });
    }
    return res.json({
      success: true,
      url: `/auth-popup.html?provider=facebook&origin=${encodeURIComponent(origin)}`,
      hasCustomKey: false
    });
  }

  res.status(400).json({ success: false, message: 'Proveedor desconocido' });
});

// Callback de OAuth para proveedores externos (Google / Facebook)
app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  const { code, state, error } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Autenticación Exitosa | Nativa</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F3EBDD; color: #285943; text-align: center; }
        .card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; }
        .spinner { border: 3px solid rgba(40, 89, 67, 0.2); border-top-color: #285943; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="spinner"></div>
        <h3>Autenticación Completada</h3>
        <p style="font-size: 14px; color: #64748b;">Conectando con tu cuenta de Nativa y cerrando ventana...</p>
      </div>
      <script>
        const user = {
          email: 'cliente.nativa@gmail.com',
          name: 'Cliente',
          lastname: 'Nativa',
          provider: 'OAuth'
        };
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'OAuth', user: user }, '*');
          setTimeout(() => window.close(), 600);
        } else {
          window.location.href = '/perfil.html';
        }
      </script>
    </body>
    </html>
  `);
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

