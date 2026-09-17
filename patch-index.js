const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const search = `        method: method,
        paymentMethod: getPaymentMethodLabel(method),
        bankEntity: entidad,
        nequiPhone: phoneNequi,`;
        
const replace = `        method: method,
        paymentMethod: getPaymentMethodLabel(method),
        bankEntity: entidad,
        nequiPhone: phoneNequi,
        cardLast4: method === 'tarjetas' || method === 'tarjeta' ? (document.getElementById('card-num') ? document.getElementById('card-num').value.slice(-4) : '4567') : '',`;

html = html.replace(search, replace);

fs.writeFileSync('index.html', html, 'utf8');
