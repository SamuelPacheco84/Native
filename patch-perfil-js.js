const fs = require('fs');
let html = fs.readFileSync('perfil.html', 'utf8');

// I'll replace the JS functions directly

const submitCancelOriginal = `    function submitCancelOrder() {
      if (!currentCancelOrderId) return;
      const selectMethod = document.getElementById('cancel-refund-method').value;
      const details = document.getElementById('cancel-refund-details').value.trim();
      if (selectMethod !== 'original' && !details) {
        showToast('Por favor ingresa los detalles de la cuenta para el reembolso.');
        return;
      }`;
      
const submitCancelReplacement = `    function submitCancelOrder() {
      if (!currentCancelOrderId) return;
      const selectMethod = document.getElementById('cancel-refund-method').value;
      const details = document.getElementById('cancel-refund-details').value.trim();
      if (selectMethod !== 'original' && !details) {
        showToast('Por favor ingresa los detalles de la cuenta para el reembolso.');
        return;
      }
      if (selectMethod === 'original') {
        openConfirmPaymentModal('cancel', currentCancelOrderId);
        return;
      }`;
      
html = html.replace(submitCancelOriginal, submitCancelReplacement);

const submitRefundOriginal = `    function submitRefund() {
      if (!currentRefundOrderId) return;
      const reason = document.getElementById('refund-reason').value.trim();
      const method = document.getElementById('refund-method').value;
      const details = document.getElementById('refund-details').value.trim();
      
      if (!reason) {
        showToast('Por favor ingresa el motivo del reembolso.');
        return;
      }
      if (method !== 'original' && !details) {
        showToast('Por favor ingresa los detalles de la cuenta para el reembolso.');
        return;
      }`;
      
const submitRefundReplacement = `    function submitRefund() {
      if (!currentRefundOrderId) return;
      const reason = document.getElementById('refund-reason').value.trim();
      const method = document.getElementById('refund-method').value;
      const details = document.getElementById('refund-details').value.trim();
      
      if (!reason) {
        showToast('Por favor ingresa el motivo del reembolso.');
        return;
      }
      if (method !== 'original' && !details) {
        showToast('Por favor ingresa los detalles de la cuenta para el reembolso.');
        return;
      }
      if (method === 'original') {
        openConfirmPaymentModal('refund', currentRefundOrderId, reason);
        return;
      }`;

html = html.replace(submitRefundOriginal, submitRefundReplacement);

const confirmModalJS = `
    let currentPaymentActionType = null;
    let currentPaymentReason = '';
    
    function openConfirmPaymentModal(actionType, orderId, reason = '') {
      currentPaymentActionType = actionType;
      currentPaymentReason = reason;
      
      const orders = getOrdersList();
      const order = orders.find(o => String(o.id) === String(orderId));
      if (!order) return;
      
      let htmlContent = '';
      if (order.method === 'tarjeta' || order.method === 'tarjetas') {
        const last4 = order.cardLast4 || '****';
        htmlContent = \`<i class="fas fa-credit-card" style="color: #64748b; font-size: 20px;"></i> Tarjeta terminada en <strong>\${last4}</strong>\`;
      } else if (order.method === 'nequi') {
        const phone = order.nequiPhone || order.customer?.telefono || 'No registrado';
        htmlContent = \`<i class="fas fa-mobile-alt" style="color: #64748b; font-size: 20px;"></i> Nequi - Línea <strong>\${phone}</strong>\`;
      } else if (order.method === 'bancos') {
        const entity = order.bankEntity || 'Entidad Bancaria';
        htmlContent = \`<i class="fas fa-university" style="color: #64748b; font-size: 20px;"></i> Cuenta PSE - <strong>\${entity}</strong>\`;
      } else if (order.method === 'efectivo') {
        htmlContent = \`<i class="fas fa-money-bill-wave" style="color: #64748b; font-size: 20px;"></i> Pago en Efectivo<br><span style="font-size:12px; font-weight:normal; display:block; margin-top:4px;">Se te contactará para solicitar cuenta bancaria para consignar el reembolso.</span>\`;
      } else {
        htmlContent = \`<i class="fas fa-wallet" style="color: #64748b; font-size: 20px;"></i> <strong>\${order.paymentMethod || 'Método Original'}</strong>\`;
      }
      
      document.getElementById('confirm-original-payment-details').innerHTML = htmlContent;
      
      if (actionType === 'cancel') {
        closeCancelModal();
      } else {
        closeRefundModal();
      }
      document.getElementById('confirm-original-payment-overlay').style.display = 'flex';
    }
    
    function closeConfirmPaymentModal() {
      document.getElementById('confirm-original-payment-overlay').style.display = 'none';
      if (currentPaymentActionType === 'cancel') {
        document.getElementById('cancel-order-overlay').style.display = 'flex';
      } else if (currentPaymentActionType === 'refund') {
        document.getElementById('refund-order-overlay').style.display = 'flex';
      }
    }
    
    function confirmOriginalPaymentSubmit() {
      const orderId = currentPaymentActionType === 'cancel' ? currentCancelOrderId : currentRefundOrderId;
      const orders = getOrdersList();
      const order = orders.find(o => String(o.id) === String(orderId));
      if (!order) return;
      
      if (currentPaymentActionType === 'cancel') {
        order.status = 'Cancelado';
        order.paymentStatus = 'reembolso_pendiente';
        order.refundMethod = 'original';
        order.refundDetails = 'Reembolso al método original';
        saveOrder(order);
        fetch(\`/api/orders/\${order.id}/status\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Cancelado', currentStep: 1 })
        }).catch(e => console.warn(e));
        
        showToast('Pedido cancelado. Tu reembolso al método original está en proceso.');
      } else {
        order.status = 'Devolución solicitada';
        order.paymentStatus = 'reembolso_pendiente';
        order.refundReason = currentPaymentReason;
        order.refundMethod = 'original';
        order.refundDetails = 'Reembolso al método original';
        saveOrder(order);
        fetch(\`/api/orders/\${order.id}/status\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Devolución solicitada', currentStep: 5 })
        }).catch(e => console.warn(e));
        
        showToast('Solicitud enviada. Reembolsaremos a tu método original pronto.');
      }
      
      document.getElementById('confirm-original-payment-overlay').style.display = 'none';
      currentPaymentActionType = null;
      currentCancelOrderId = null;
      currentRefundOrderId = null;
      showTrackingView(orderId);
      renderPerfilOrders(false);
    }
`;

html = html.replace('// Inicializar datos al cargar la página', confirmModalJS + '\n    // Inicializar datos al cargar la página');

// Fix bug in submitCancelOrder where I duplicated execution if we didn't return
const submitCancelBlock = `      if (selectMethod === 'original') {
        openConfirmPaymentModal('cancel', currentCancelOrderId);
        return;
      }`;
      
// Now I also need to make sure the original execution in submitCancelOrder doesn't fire if method is original.
// Wait, my replacement did `return;` so it stops execution! That's correct!

fs.writeFileSync('perfil.html', html, 'utf8');
