const fs = require('fs');

const products = [
  {
    id: 1,
    key: "prod-1",
    file: "portfolio-1.html",
    title: "Granola Nativa Artesanal",
    category: "Despensa Natural",
    badge: "Tostado Lento",
    price: 18500,
    priceFormatted: "$18.500 COP",
    subtitle: "Tostado lento con miel pura de abejas y semillas seleccionadas",
    img: "img/productos/Granola_Nativa.png",
    paras: [
      "Nuestra granola insignia es elaborada artesanalmente en pequeñas tandas para garantizar su máxima frescura y textura crujiente. Horneamos avena integral de grano entero con miel pura de abejas silvestres, aceite de coco virgen y una generosa mezcla de almendras, semillas de calabaza, chía y arándanos deshidratados.",
      "Sin azúcares añadidos, sin jarabes de maíz ni conservantes artificiales. Una fuente natural de energía duradera para tus desayunos, meriendas y batidos saludables."
    ],
    benefits: "Rica en fibra soluble, grasas saludables monoinsaturadas y minerales esenciales como hierro y magnesio. Proporciona saciedad prolongada y vitalidad limpia sin provocar picos bruscos de glucosa.",
    usage: "Disfrútala con leche vegetal o yogur griego al desayuno, espolvoreada sobre bowls de frutas frescas o como snack crujiente y nutritivo durante tus horas de actividad física o trabajo.",
    specs: [
      { icon: "fas fa-leaf", label: "Ingredientes", value: "Avena integral, miel de montaña, semillas de chía, girasol y almendras" },
      { icon: "fas fa-award", label: "Certificación", value: "100% Artesanal y Libre de Conservantes" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "400g en empaque biodegradable resellable" },
      { icon: "fas fa-box", label: "Conservación", value: "Guardar en lugar fresco, seco y protegido de la luz solar" }
    ],
    prev: null,
    next: { file: "portfolio-2.html", title: "Miel de Montaña Pura" }
  },
  {
    id: 2,
    key: "prod-2",
    file: "portfolio-2.html",
    title: "Miel de Montaña Pura",
    category: "Miel & Dulces",
    badge: "100% Pura y Cruda",
    price: 22000,
    priceFormatted: "$22.000 COP",
    subtitle: "Cruda, sin pasteurizar y recolectada en bosques altoandinos",
    img: "img/productos/Miel_de_Montaña.png",
    paras: [
      "Nuestra miel de montaña proviene de colmenas ubicadas en zonas silvestres libres de pesticidas y agroquímicos. Es extraída por centrifugación en frío y envasada directamente sin someterse a procesos térmicos de pasteurización, garantizando que conserve todas sus propiedades antibacterianas, polen vivo y enzimas originales.",
      "Posee una tonalidad ámbar oscura con notas florales complejas y una cristalización suave y natural que certifica su pureza total y nula adulteración."
    ],
    benefits: "Excelente endulzante natural, aliada comprobada para reforzar el sistema inmunológico, suavizar las vías respiratorias y apoyar la digestión gracias a sus enzimas bioactivas vivas.",
    usage: "Consumir una cucharadita pura en ayunas, o para endulzar infusiones tibias (evitar hervir para proteger sus enzimas sensibles) y recetas gastronómicas conscientes.",
    specs: [
      { icon: "fas fa-map-marker-alt", label: "Origen", value: "Bosques nativos protegidos de alta montaña" },
      { icon: "fas fa-award", label: "Pureza", value: "100% miel cruda de abeja sin aditivos" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Frasco de vidrio reutilizable de 500g" },
      { icon: "fas fa-box", label: "Conservación", value: "Temperatura ambiente, no refrigerar para evitar endurecimiento" }
    ],
    prev: { file: "portfolio-1.html", title: "Granola Nativa Artesanal" },
    next: { file: "portfolio-3.html", title: "Infusión Relax y Calma" }
  },
  {
    id: 3,
    key: "prod-3",
    file: "portfolio-3.html",
    title: "Infusión Relax y Calma",
    category: "Tés & Infusiones",
    badge: "Blend Botánico",
    price: 14900,
    priceFormatted: "$14.900 COP",
    subtitle: "Mezcla botánica reconfortante para el descanso y la serenidad",
    img: "img/productos/Infusión_relax.png",
    paras: [
      "Un blend de botánica medicinal diseñado para relajar los sentidos al final del día. Combinamos flores enteras de manzanilla silvestre, hojas de toronjil, melisa andina y botones aromáticos de lavanda cultivada sin pesticidas.",
      "Sin cafeína ni teína, ideal para disfrutar antes de dormir o en momentos que requieran pausa y calma interior. Su aroma suave y floral transporta a la serenidad de los campos andinos."
    ],
    benefits: "Ayuda a reducir la sobrecarga de estrés acumulado, relaja la musculatura tensa, favorece la digestión nocturna y promueve un ciclo de descanso profundo y reparador.",
    usage: "Agregar 1 cucharadita por taza de agua caliente a 90°C. Dejar reposar tapado durante 5 a 7 minutos para liberar todos sus aceites esenciales antes de colar.",
    specs: [
      { icon: "fas fa-leaf", label: "Composición", value: "Manzanilla, toronjil, melisa, lavanda y menta piperita" },
      { icon: "fas fa-coffee", label: "Rendimiento", value: "Aprox. 40 tazas reconstituyentes" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Bolsa hermética kraft de 100g" },
      { icon: "fas fa-heartbeat", label: "Cafeína", value: "0% libre de cafeína / teína" }
    ],
    prev: { file: "portfolio-2.html", title: "Miel de Montaña Pura" },
    next: { file: "portfolio-4.html", title: "Mermelada Frutos Silvestres" }
  },
  {
    id: 4,
    key: "prod-4",
    file: "portfolio-4.html",
    title: "Mermelada Frutos Silvestres",
    category: "Miel & Dulces",
    badge: "Sin Conservantes",
    price: 16800,
    priceFormatted: "$16.800 COP",
    subtitle: "Cocción lenta en paila tradicional con trozos enteros de fruta",
    img: "img/productos/MERMELADA ARTESANAL DE FRUTOS SILVESTRES.png",
    paras: [
      "Elaborada a base de mora silvestre, agraz andino, arándanos y frambuesas frescas. Se cocina a fuego lento conservando la textura viva de las bayas y una acidez equilibrada con panela pulverizada orgánica.",
      "Sin pectinas artificiales, sin colorantes ni conservantes químicos. Ideal para acompañar panes artesanales, quesos madurados, panqueques o yogur griego."
    ],
    benefits: "Concentrado natural de antioxidantes, antocianinas y vitamina C que protegen contra el estrés oxidativo y refuerzan las defensas celulares con pura fruta real.",
    usage: "Perfecta para untar sobre hogazas de masa madre, complementar tablas de quesos semicurados o verter sobre avenas trasnochadas y postres naturales.",
    specs: [
      { icon: "fas fa-apple-alt", label: "Fruta Real", value: "Más del 80% de fruta entera por porción" },
      { icon: "fas fa-seedling", label: "Endulzante", value: "Panela orgánica de cultivo limpio" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Tarro de vidrio de 320g" },
      { icon: "fas fa-temperature-low", label: "Conservación", value: "Refrigerar después de abrir y consumir en 30 días" }
    ],
    prev: { file: "portfolio-3.html", title: "Infusión Relax y Calma" },
    next: { file: "portfolio-5.html", title: "Aceite de Coco Extravirgen" }
  },
  {
    id: 5,
    key: "prod-5",
    file: "portfolio-5.html",
    title: "Aceite de Coco Extravirgen",
    category: "Despensa Natural",
    badge: "Prensado en Frío",
    price: 24500,
    priceFormatted: "$24.500 COP",
    subtitle: "Prensado en frío de pulpa de coco fresca, sin refinar ni desodorizar",
    img: "img/productos/ACEITE  DECOCO EXTRAVIRGEN.png.png",
    paras: [
      "Extraído mecánicamente a baja temperatura exclusivamente de cocos frescos madurados al sol en costas sostenibles. Conserva su aroma natural delicado y sabor auténtico.",
      "Libre de blanqueamiento, hidrogenación o solventes químicos. Altamente estable al calor para cocinar a altas temperaturas, preparar café keto o usar como hidratante capilar y corporal puro."
    ],
    benefits: "Rico en triglicéridos de cadena media (MCT) que proporcionan energía limpia inmediata al cerebro y ácido láurico con propiedades antimicrobianas naturales.",
    usage: "Ideal para saltear a temperaturas medias-altas, preparar café bulletproof, hornear panes o aplicar directamente sobre la piel y puntas del cabello seco.",
    specs: [
      { icon: "fas fa-cog", label: "Método", value: "Primera prensada en frío sin calor artificial" },
      { icon: "fas fa-utensils", label: "Usos", value: "Culinario, repostería saludable y cosmética natural" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Frasco de vidrio de 450ml" },
      { icon: "fas fa-sun", label: "Estado físico", value: "Sólido por debajo de 24°C, líquido en clima cálido" }
    ],
    prev: { file: "portfolio-4.html", title: "Mermelada Frutos Silvestres" },
    next: { file: "portfolio-6.html", title: "Vinagre de Manzana Artesanal" }
  },
  {
    id: 6,
    key: "prod-6",
    file: "portfolio-6.html",
    title: "Vinagre de Manzana Artesanal",
    category: "Despensa Natural",
    badge: "Con Madre Viva",
    price: 15600,
    priceFormatted: "$15.600 COP",
    subtitle: "Crudo, sin filtrar y con la madre viva llena de enzimas y probióticos",
    img: "img/productos/VINAGRE DE MANZANA ARTESANAL.png",
    paras: [
      "Obtenido mediante la fermentación espontánea de manzanas criollas cultivadas en huertos limpios de altura. Nunca es calentado ni filtrado, lo que mantiene viva la 'madre' del vinagre: un complejo cultivo biológico de bacterias benéficas y aminoácidos esenciales.",
      "De acidez suave, aroma afrutado y turbidez natural que atestigua su carácter vivo y artesanal."
    ],
    benefits: "Favorece el equilibrio del microbioma intestinal, estimula la secreción de jugos digestivos y contribuye a regular las curvas de glucosa después de comer.",
    usage: "Diluir 1 cucharada sopera en un vaso con agua tibia 15 minutos antes de la comida principal, o emulsionar con aceite de oliva para vinagretas vivas.",
    specs: [
      { icon: "fas fa-apple-alt", label: "Origen", value: "Manzanas enteras sin concentrados ni agua añadida" },
      { icon: "fas fa-dna", label: "Propiedades", value: "Con la 'madre' viva probiótica activa" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Botella de vidrio oscuro de 500ml" },
      { icon: "fas fa-vial", label: "Filtrado", value: "Sin filtrar, crudo y no pasteurizado" }
    ],
    prev: { file: "portfolio-5.html", title: "Aceite de Coco Extravirgen" },
    next: { file: "portfolio-7.html", title: "Jarabe de Arce Puro" }
  },
  {
    id: 7,
    key: "prod-7",
    file: "portfolio-7.html",
    title: "Jarabe de Arce Puro",
    category: "Miel & Dulces",
    badge: "Grado A Puro",
    price: 28000,
    priceFormatted: "$28.000 COP",
    subtitle: "Savia 100% natural recolectada en bosques de arce certificados",
    img: "img/productos/JARABE DE ARCE  PURO.png",
    paras: [
      "Elaborado mediante la evaporación lenta de la savia pura del arce azucarero. No contiene jarabes de glucosa, saborizantes de imitación ni aditivos sintéticos: es el elixir auténtico de los árboles centenarios.",
      "De color ámbar profundo, aroma cálido y dulzura noble con notas a vainilla, nuez y madera. Ideal para panqueques, waffles, glaseados gourmet y aderezos agridulces."
    ],
    benefits: "Aporta minerales clave como manganeso, zinc y calcio, combinados con antioxidantes bioactivos naturales que lo distinguen de azúcares procesados.",
    usage: "Baña tus hot cakes de avena, crepes, granola horneada o utilízalo para caramelizar vegetales asados y elaborar salsas agridulces de alta cocina.",
    specs: [
      { icon: "fas fa-star", label: "Grado", value: "Grado A Color Ámbar y Sabor Rico" },
      { icon: "fas fa-tint", label: "Pureza", value: "100% Savia de Arce Concentrada sin aditivos" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Botella de vidrio con asa tradicional de 250ml" },
      { icon: "fas fa-temperature-low", label: "Conservación", value: "Refrigerar tras la apertura" }
    ],
    prev: { file: "portfolio-6.html", title: "Vinagre de Manzana Artesanal" },
    next: { file: "portfolio-8.html", title: "Azúcar Mascabado Orgánico" }
  },
  {
    id: 8,
    key: "prod-8",
    file: "portfolio-8.html",
    title: "Azúcar Mascabado Orgánico",
    category: "Despensa Natural",
    badge: "No Refinado",
    price: 11200,
    priceFormatted: "$11.200 COP",
    subtitle: "Integral, no refinado y con toda su melaza natural viva",
    img: "img/productos/AZUCAR MASCABADO ORGÁNICO.png",
    paras: [
      "Producido por evaporación y cristalización directa del jugo de caña recién extraído de trapiches comunitarios sostenibles. No pasa por procesos de centrifugación forzada ni blanqueamiento químico con sulfitos.",
      "Mantiene su textura húmeda característica, aroma a caramelo y notas especiadas que realzan recetas de panadería, café de especialidad e infusiones herbales."
    ],
    benefits: "Preserva los micronutrientes nativos de la caña de azúcar, incluidos potasio, magnesio, hierro vegetal y complejo vitamínico natural.",
    usage: "Reemplaza el azúcar blanco 1:1 en recetas de repostería rústica, panes integrales, café filtrado o macerados de fruta de temporada.",
    specs: [
      { icon: "fas fa-seedling", label: "Cultivo", value: "Caña de azúcar orgánica sin pesticidas" },
      { icon: "fas fa-fire", label: "Proceso", value: "Evaporación tradicional limpia en paila" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Bolsa ecológica de 500g con cierre zip" },
      { icon: "fas fa-box", label: "Textura", value: "Húmeda, grano fino con melaza viva" }
    ],
    prev: { file: "portfolio-7.html", title: "Jarabe de Arce Puro" },
    next: { file: "portfolio-9.html", title: "Nueces Mariposa Naturales" }
  },
  {
    id: 9,
    key: "prod-9",
    file: "portfolio-9.html",
    title: "Nueces Mariposa Naturales",
    category: "Frutos Secos",
    badge: "Selección Extra",
    price: 19800,
    priceFormatted: "$19.800 COP",
    subtitle: "Mitades enteras extra seleccionadas, ricas en ácidos grasos Omega-3",
    img: "img/productos/NUECES MARIPOSA NATURALES.png",
    paras: [
      "Nuestras nueces mariposa son cosechadas en temporada óptima y partidas a mano para preservar su forma entera y evitar la rotura del fruto. Son empacadas frescas al natural, sin aceites añadidos, sin sal y sin sulfitos blanqueadores.",
      "Textura crocante inconfundible y sabor suave con un retrogusto ligeramente dulce. Perfectas para picoteo inteligente, ensaladas de huerto, yogures y granolas caseras."
    ],
    benefits: "El fruto seco por excelencia para la salud cardiovascular y la función cognitiva gracias a su riqueza en ácido alfa-linolénico (Omega-3), polifenoles y vitamina E.",
    usage: "Consume un puñado diario (4-6 mitades) como colación nutritiva, añádelas a ensaladas verdes con queso de cabra o tritúralas en pestos caseros.",
    specs: [
      { icon: "fas fa-brain", label: "Beneficio", value: "Alto contenido en Omega-3 vegetal y magnesio" },
      { icon: "fas fa-check-circle", label: "Calidad", value: "Calibre Extra Light 100% natural sin tostar" },
      { icon: "fas fa-weight-hanging", label: "Presentación", value: "Bolsa sellada al vacío de 250g" },
      { icon: "fas fa-shield-alt", label: "Frescura", value: "Envasado en atmósfera protectora" }
    ],
    prev: { file: "portfolio-8.html", title: "Azúcar Mascabado Orgánico" },
    next: null
  }
];

function generateHtml(p) {
  const whatsappBuyUrl = `https://wa.me/573005427742?text=${encodeURIComponent(`Hola NATIVA, quiero hacer un pedido de ${p.title} (${p.priceFormatted}). ¿Tienen disponibilidad para envío?`)}`;
  
  const prevBtn = p.prev 
    ? `<a href="${p.prev.file}" class="btn-nav-prod"><i class="fas fa-arrow-left"></i> <span>${p.prev.title}</span></a>`
    : `<span style="flex:1;"></span>`;

  const nextBtn = p.next
    ? `<a href="${p.next.file}" class="btn-nav-prod"><span>${p.next.title}</span> <i class="fas fa-arrow-right"></i></a>`
    : `<span style="flex:1;"></span>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP" crossorigin="anonymous">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" media="screen and (max-width: 768px)" href="css/mobile.css">
  <title>${p.title} | NATIVA Productos Naturales</title>
</head>
<body>

  <!-- Encabezado / Barra de Navegación -->
  <header>
    <nav id="navbar">
      <div class="container">
        <div class="nav-wrapper">
          <h1 class="logo">
            <a href="index.html" aria-label="Nativa Inicio">
              <img src="img/logo.png" alt="Nativa" class="brand-logo">
            </a>
          </h1>

          <ul id="main-nav" class="txt-btn">
            <li><a href="index.html#portfolio"><i class="fas fa-leaf"></i> Productos</a></li>
            <li><a href="contact.html"><i class="fas fa-envelope"></i> Contacto</a></li>
            <li>
              <button type="button" class="nav-action-btn cart-btn-wrap" id="open-cart-btn" aria-label="Ver Carrito de Compras">
                <i class="fas fa-shopping-cart"></i>
                <span>Carrito</span>
                <span class="cart-counter" id="cart-counter-badge">0</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <!-- Miga de Pan (Breadcrumbs) -->
  <div class="product-breadcrumb-bar">
    <div class="container">
      <nav class="product-breadcrumbs" aria-label="Navegación secundaria">
        <a href="index.html"><i class="fas fa-home"></i> Inicio</a>
        <span class="crumb-sep">/</span>
        <a href="index.html#portfolio">Catálogo</a>
        <span class="crumb-sep">/</span>
        <a href="index.html#portfolio">${p.category}</a>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${p.title}</span>
      </nav>
    </div>
  </div>

  <!-- Sección Principal del Detalle de Producto -->
  <section class="product-detail-section">
    <div class="container">
      
      <!-- Grid de 2 Columnas Principal -->
      <div class="product-detail-grid">

        <!-- Columna Izquierda: Galería y Garantías -->
        <div class="product-gallery-side">
          <div class="product-gallery-card">
            <span class="product-gallery-badge"><i class="fas fa-check"></i> ${p.badge}</span>
            <div class="product-gallery-image-wrap">
              <img src="${p.img}" alt="${p.title}">
            </div>
          </div>

          <!-- Tira de Confianza y Calidad -->
          <div class="product-trust-strip">
            <div class="trust-strip-item">
              <i class="fas fa-seedling"></i>
              <span>100% Consciente</span>
            </div>
            <div class="trust-strip-item">
              <i class="fas fa-box-open"></i>
              <span>Empaque Ecológico</span>
            </div>
            <div class="trust-strip-item">
              <i class="fas fa-truck"></i>
              <span>Envíos a Colombia</span>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Información y Compra -->
        <div class="product-info-column">
          <span class="product-cat-tag"><i class="fas fa-tag"></i> ${p.category}</span>
          <h1 class="product-main-title">${p.title}</h1>
          <p class="product-subtitle">${p.subtitle}</p>

          <!-- Valoración -->
          <div class="product-rating-row">
            <div class="product-rating-stars" aria-label="Calificación 5 de 5">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
            </div>
            <span><strong>4.9 / 5.0</strong> (Clientes Satisfechos)</span>
          </div>

          <!-- Caja de Precio y Disponibilidad -->
          <div class="product-price-box">
            <div>
              <span class="product-price-amount">${p.priceFormatted}</span>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">IVA incluido &bull; Venta artesanal</div>
            </div>
            <span class="product-stock-tag">En Stock Inmediato</span>
          </div>

          <!-- Acciones de Compra -->
          <div class="product-actions-wrap">
            <div class="product-qty-row">
              <div class="qty-picker">
                <button type="button" class="qty-btn" id="qty-minus" aria-label="Disminuir cantidad">&minus;</button>
                <input type="text" id="qty-val" class="qty-input" value="1" readonly aria-label="Cantidad">
                <button type="button" class="qty-btn" id="qty-plus" aria-label="Aumentar cantidad">&plus;</button>
              </div>

              <button type="button" class="btn-add-cart-detail" id="btn-add-to-cart">
                <i class="fas fa-shopping-bag"></i> Agregar al Carrito
              </button>
            </div>

            <a href="${whatsappBuyUrl}" class="btn-whatsapp-detail" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-whatsapp"></i> Pedir Directo por WhatsApp
            </a>
          </div>

          <!-- Especificaciones Resumidas -->
          <div class="product-specs-card">
            <ul class="specs-list">
              ${p.specs.map(s => `<li><i class="${s.icon}"></i> <strong>${s.label}:</strong> <span>${s.value}</span></li>`).join('\n              ')}
            </ul>
          </div>
        </div>

      </div>

      <!-- Secciones Ampliadas (Descripción y Beneficios) -->
      <div class="product-extended-details">
        
        <!-- Tarjeta de Descripción -->
        <div class="extended-card">
          <h3><i class="fas fa-book-open"></i> Descripción del Producto</h3>
          ${p.paras.map(para => `<p class="lora-text">${para}</p>`).join('\n          ')}
        </div>

        <!-- Tarjeta de Beneficios y Consumo -->
        <div class="extended-card">
          <h3><i class="fas fa-heart"></i> Beneficios para tu Bienestar</h3>
          <p class="lora-text">${p.benefits}</p>
          
          <h3 style="margin-top: 24px;"><i class="fas fa-utensils"></i> Recomendación de Consumo</h3>
          <p class="lora-text">${p.usage}</p>
        </div>

      </div>

      <!-- Barra de Navegación entre Productos -->
      <div class="product-nav-strip">
        ${prevBtn}
        <a href="index.html#portfolio" class="btn-nav-prod btn-catalog"><i class="fas fa-th-large"></i> Ver Todo el Catálogo</a>
        ${nextBtn}
      </div>

    </div>
  </section>

  <!-- Pie de Página -->
  <footer id="main-footer">
    <div class="container">
      <div class="footer-wrap">
        <div class="footer-brand">
          <img src="img/logo.png" alt="Nativa" class="footer-logo">
          <p class="small">NATIVA &copy; 2026. Alimentos naturales y conscientes de origen artesanal.</p>
        </div>
        <ul>
          <li><a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a></li>
          <li><a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a></li>
          <li><a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a></li>
          <li><a href="https://wa.me/573005427742" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a></li>
        </ul>
      </div>
    </div>
  </footer>

  <!-- Botón Flotante de WhatsApp -->
  <a href="${whatsappBuyUrl}" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chatea con nosotros por WhatsApp">
    <svg class="whatsapp-icon" viewBox="0 0 448 512" width="32" height="32" fill="currentColor" aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>
  </a>

  <!-- Drawer Lateral del Carrito de Compras -->
  <div class="cart-overlay" id="cart-overlay"></div>
  <aside class="cart-drawer" id="cart-drawer" aria-label="Carrito de Compras">
    <div class="cart-drawer-header">
      <h3><i class="fas fa-shopping-cart"></i> Tu Carrito (<span id="drawer-cart-count">0</span>)</h3>
      <button type="button" class="close-cart close-cart-btn" id="close-cart-btn" aria-label="Cerrar Carrito">&times;</button>
    </div>

    <div class="cart-drawer-body" id="cart-items-container">
      <div class="cart-empty-state" id="cart-empty-msg">
        <i class="fas fa-shopping-basket"></i>
        <h4>Tu carrito está vacío</h4>
        <p class="lora-text">Descubre nuestros productos naturales y agrega tus favoritos.</p>
        <a href="index.html#portfolio" class="btn btn-primary" style="margin-top: 14px; display: inline-flex;">Explorar Tienda</a>
      </div>
      <div id="cart-list"></div>
    </div>

    <div class="cart-drawer-footer" id="cart-drawer-footer" style="display: none;">
      <div class="cart-subtotal-row">
        <span>Subtotal:</span>
        <span id="cart-subtotal" style="font-weight: 700;">$0</span>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        <i class="fas fa-truck" style="color: var(--verde-natural);"></i> Envíos a todo el país &bull; Pagas contraentrega
      </div>
      <a href="#" class="btn btn-primary" id="checkout-whatsapp-btn" target="_blank" rel="noopener noreferrer" style="width: 100%; text-align: center; justify-content: center;">
        <i class="fab fa-whatsapp"></i> Finalizar Pedido por WhatsApp
      </a>
      <button type="button" class="btn btn-light" id="continue-shopping-btn" style="width: 100%; justify-content: center; margin-top: 8px;">
        Continuar Comprando
      </button>
    </div>
  </aside>

  <!-- Notificaciones Toast -->
  <div class="toast-notice" id="cart-toast"><i class="fas fa-check-circle"></i> <span id="toast-message"></span></div>

  <!-- Lógica Interactiva del Producto y Carrito -->
  <script>
    // Datos del producto actual
    const currentProduct = {
      id: "${p.key}",
      name: "${p.title}",
      price: ${p.price},
      img: "${p.img}"
    };

    // Contador de cantidad para la página
    let qty = 1;
    const qtyValEl = document.getElementById('qty-val');
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');

    if (qtyMinusBtn && qtyPlusBtn && qtyValEl) {
      qtyMinusBtn.addEventListener('click', () => {
        if (qty > 1) {
          qty--;
          qtyValEl.value = qty;
        }
      });

      qtyPlusBtn.addEventListener('click', () => {
        qty++;
        qtyValEl.value = qty;
      });
    }

    // Carrito de compras sincronizado con localStorage
    let cart = [];
    try {
      const saved = localStorage.getItem('nativa_cart');
      if (saved) cart = JSON.parse(saved);
    } catch(e) {}

    // Normalizar items para compatibilidad entre páginas (qty y quantity)
    if (Array.isArray(cart)) {
      cart.forEach(item => {
        const q = item.qty || item.quantity || 1;
        item.qty = q;
        item.quantity = q;
      });
    } else {
      cart = [];
    }

    function saveCart() {
      try {
        localStorage.setItem('nativa_cart', JSON.stringify(cart));
      } catch(e) {}
      renderCart();
    }

    function formatPrice(number) {
      return '$' + number.toLocaleString('es-CO');
    }

    function showToast(msg) {
      let toast = document.getElementById('cart-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'toast-notice';
        toast.innerHTML = '<i class="fas fa-check-circle"></i> <span id="toast-message"></span>';
        document.body.appendChild(toast);
      }
      const toastMsg = document.getElementById('toast-message') || toast;
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
    }

    function renderCart() {
      const totalCount = cart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
      const cartCountEl = document.getElementById('cart-count');
      const badgeEl = document.getElementById('cart-counter-badge');
      const drawerCountEl = document.getElementById('drawer-cart-count');
      
      if (cartCountEl) cartCountEl.textContent = totalCount;
      if (badgeEl) badgeEl.textContent = totalCount;
      if (drawerCountEl) drawerCountEl.textContent = totalCount;

      const cartList = document.getElementById('cart-list');
      const emptyMsg = document.getElementById('cart-empty-msg');
      const footer = document.getElementById('cart-drawer-footer');
      if (!cartList) return;

      if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (footer) footer.style.display = 'none';
        cartList.innerHTML = '';
        return;
      }

      if (emptyMsg) emptyMsg.style.display = 'none';
      if (footer) footer.style.display = 'block';

      let total = 0;
      cartList.innerHTML = cart.map((item, index) => {
        const itemQty = item.qty || item.quantity || 1;
        const itemTotal = item.price * itemQty;
        total += itemTotal;
        return \`
          <div class="cart-item">
            <img src="\${item.img}" alt="\${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="cart-item-name">\${item.name}</div>
              <div class="cart-item-price">\${formatPrice(itemTotal)}</div>
              <div class="cart-item-qty">
                <button type="button" class="qty-btn" onclick="changeQty(\${index}, -1)" aria-label="Disminuir">-</button>
                <span style="min-width: 18px; text-align: center; font-size: 13px; font-weight: 700;">\${itemQty}</span>
                <button type="button" class="qty-btn" onclick="changeQty(\${index}, 1)" aria-label="Aumentar">+</button>
                <button type="button" class="remove-item-btn" onclick="removeItem(\${index})" aria-label="Eliminar producto" title="Eliminar">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');

      const subtotalEl = document.getElementById('cart-subtotal');
      if (subtotalEl) subtotalEl.textContent = formatPrice(total);

      const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
      if (checkoutBtn) {
        let msg = "¡Hola NATIVA! Deseo confirmar el siguiente pedido de productos naturales:\\n\\n";
        cart.forEach(item => {
          const q = item.qty || item.quantity || 1;
          msg += \`• \${q}x \${item.name} (\${formatPrice(item.price * q)})\\n\`;
        });
        msg += \`\\nTotal: \${formatPrice(total)}\\n¿Cuáles son los métodos de pago disponibles?\`;
        checkoutBtn.href = \`https://wa.me/573005427742?text=\${encodeURIComponent(msg)}\`;
      }
    }

    window.changeQty = function(index, delta) {
      if (!cart[index]) return;
      const current = cart[index].qty || cart[index].quantity || 1;
      const newQty = current + delta;
      if (newQty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].qty = newQty;
        cart[index].quantity = newQty;
      }
      saveCart();
    };

    window.removeItem = function(index) {
      if (!cart[index]) return;
      const removedName = cart[index].name;
      cart.splice(index, 1);
      saveCart();
      showToast(\`Se eliminó "\${removedName}" del carrito\`);
    };

    // Apertura y Cierre del Drawer del Carrito
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');

    function openCart() {
      if (cartDrawer) {
        cartDrawer.classList.add('open');
        cartDrawer.classList.add('active');
      }
      if (cartOverlay) {
        cartOverlay.classList.add('show');
        cartOverlay.classList.add('active');
      }
      renderCart();
    }

    function closeCart() {
      if (cartDrawer) {
        cartDrawer.classList.remove('open');
        cartDrawer.classList.remove('active');
      }
      if (cartOverlay) {
        cartOverlay.classList.remove('show');
        cartOverlay.classList.remove('active');
      }
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Agregar al Carrito desde el Botón Principal
    const btnAddToCart = document.getElementById('btn-add-to-cart');
    if (btnAddToCart) {
      btnAddToCart.addEventListener('click', () => {
        const itemQuantity = qty || 1;
        const existing = cart.find(i => i.id === currentProduct.id);
        if (existing) {
          const prev = existing.qty || existing.quantity || 0;
          existing.qty = prev + itemQuantity;
          existing.quantity = existing.qty;
        } else {
          cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            img: currentProduct.img,
            qty: itemQuantity,
            quantity: itemQuantity
          });
        }
        saveCart();
        showToast(\`¡\${itemQuantity}x \${currentProduct.name} añadido al carrito!\`);
        openCart();
      });
    }

    // Inicializar Carrito al cargar la página
    renderCart();
  </script>
</body>
</html>
`;
}

products.forEach(p => {
  const html = generateHtml(p);
  fs.writeFileSync(p.file, html, 'utf8');
  console.log(`Successfully generated aesthetic page for ${p.file}`);
});
