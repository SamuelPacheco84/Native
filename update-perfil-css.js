const fs = require('fs');
let content = fs.readFileSync('perfil.html', 'utf8');

// The block I added was from /* Estilos mejorados para el formulario de Mis Datos */ to /* Estilos del Rastreador Integrado en Perfil */
const newCss = `
    /* Estilos mejorados para el formulario de Mis Datos */
    .single-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #perfil-datos-form label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-left: 2px;
    }
    #perfil-datos-form input {
      width: 100%;
      padding: 12px 18px;
      border: 1.5px solid #e2e8f0;
      border-radius: 50px;
      background: #f8fafc;
      font-family: inherit;
      font-size: 14.5px;
      color: #1e293b;
      transition: all 0.2s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
    }
    #perfil-datos-form input:focus {
      outline: none;
      border-color: var(--verde-natural);
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(67, 133, 91, 0.15);
    }
    .apartado-datos-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
      border: 1px solid #f1f5f9;
      max-width: 650px;
    }
    #perfil-datos-form .btn-primary {
      padding: 12px 28px;
      border-radius: 50px;
      font-weight: 600;
      letter-spacing: 0.3px;
      background-color: var(--verde-bosque);
      box-shadow: 0 4px 12px rgba(40, 89, 67, 0.15);
      transition: all 0.3s ease;
    }
    #perfil-datos-form .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(40, 89, 67, 0.25);
    }
    #perfil-datos-form .btn-secondary {
      padding: 12px 28px;
      border-radius: 50px;
      font-weight: 600;
      letter-spacing: 0.3px;
      background-color: #f1f5f9;
      color: #334155;
      border: none;
      transition: all 0.3s ease;
    }
    #perfil-datos-form .btn-secondary:hover {
      background-color: #e2e8f0;
      color: #0f172a;
    }
    /* ... */
`;

content = content.replace(/\/\* Estilos mejorados para el formulario de Mis Datos \*\/[\s\S]*?\/\* Estilos del Rastreador Integrado en Perfil \*\//, newCss + '\n    /* Estilos del Rastreador Integrado en Perfil */');
fs.writeFileSync('perfil.html', content, 'utf8');
