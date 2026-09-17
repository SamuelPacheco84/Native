const fs = require('fs');
let html = fs.readFileSync('perfil.html', 'utf8');

// Insert new modal
const modalHtml = `
  <!-- Modal Confirmación de Método Original -->
  <div class="modal-overlay" id="confirm-original-payment-overlay" style="display: none; align-items: center; justify-content: center;" role="dialog" aria-modal="true">
    <div class="modal-dialog" style="max-width: 450px; padding: 24px; text-align: center; border-radius: 12px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
      <h3 style="color: var(--verde-bosque); margin-top: 0;">Verifica tus datos de pago</h3>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
        Tu reembolso será procesado a tu método de pago original:
      </p>
      <div id="confirm-original-payment-details" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-weight: 600; color: #1e293b; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
        <!-- Inyectado dinámicamente -->
      </div>
      <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">
        ¿La información es correcta?
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button type="button" class="btn btn-secondary" onclick="closeConfirmPaymentModal()" style="padding: 10px 20px;">No, volver</button>
        <button type="button" class="btn btn-primary" onclick="confirmOriginalPaymentSubmit()" style="padding: 10px 20px;">Sí, confirmar</button>
      </div>
    </div>
  </div>
`;

html = html.replace('<!-- Toast de Notificaciones -->', modalHtml + '\n  <!-- Toast de Notificaciones -->');

fs.writeFileSync('perfil.html', html, 'utf8');
