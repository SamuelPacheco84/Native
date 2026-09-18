const fs = require('fs');
['login.html', 'register.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Update CSS classes
  content = content.replace(
    '.bg-top-left { top: 0; left: 0; width: 215px; transform: rotate(180deg); }',
    '.bg-top-left { top: 0; left: 0; width: 260px; }'
  );
  
  // Add a new class for the bottom right
  if (!content.includes('.bg-bottom-right-1')) {
    content = content.replace(
      '.bg-top-right-5 { top: 0; right: 0; width: 480px; }',
      '.bg-top-right-5 { top: 0; right: 0; width: 480px; }\n    .bg-bottom-right-1 { bottom: 0; right: 0; width: 280px; }'
    );
  }

  // 2. Update HTML
  content = content.replace(
    '<img src="img_login/2.png" class="bg-decor bg-top-left" alt="">',
    '<img src="img_login/2.png" class="bg-decor bg-top-left" alt="">' // keep 2.png top-left
  );
  
  // Replace the image source of 2.png in top-right with 1.png in bottom-right
  content = content.replace(
    '<img src="img_login/2.png" class="bg-decor bg-top-right" alt="">',
    '<img src="img_login/1.png" class="bg-decor bg-bottom-right-1" alt="">'
  );

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Decor updated');
