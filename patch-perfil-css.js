const fs = require('fs');
let content = fs.readFileSync('perfil.html', 'utf8');

const additionalCss = `
    /* Estilos mejorados para el formulario de Mis Datos */
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    @media (max-width: 600px) {
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
    }
    .single-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #perfil-datos-form label {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--verde-bosque);
      margin-left: 4px;
    }
    #perfil-datos-form input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 50px;
      background: #f8fafc;
      font-family: inherit;
      font-size: 14.5px;
      color: #334155;
      transition: all 0.3s ease;
    }
    #perfil-datos-form input:focus {
      outline: none;
      border-color: var(--verde-bosque);
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.15);
    }
    .apartado-datos-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      border: 1px solid #f1f5f1;
      max-width: 700px;
    }
    .apartado-datos-card h4 {
      font-size: 18px;
      color: var(--verde-bosque);
      margin-top: 0;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .apartado-pedidos-desc {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
    }
    #perfil-datos-form .btn {
      padding: 11px 24px;
      border-radius: 50px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
`;

content = content.replace('/* Estilos del Rastreador Integrado en Perfil */', additionalCss + '\n    /* Estilos del Rastreador Integrado en Perfil */');
fs.writeFileSync('perfil.html', content, 'utf8');
console.log('CSS added');
