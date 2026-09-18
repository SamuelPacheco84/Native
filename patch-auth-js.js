const fs = require('fs');
['login.html', 'register.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const scriptInsert = `
    function handleAuthSubmit(e) {
      e.preventDefault();
      
      let emailInput = null;
      let nameInput = null;
      let lastnameInput = null;
      
      const inputs = e.target.querySelectorAll('input');
      inputs.forEach(input => {
        if(input.type === 'email') emailInput = input.value;
        if(input.placeholder.toLowerCase().includes('nombre')) nameInput = input.value;
        if(input.placeholder.toLowerCase().includes('apellido')) lastnameInput = input.value;
      });
      
      if(emailInput) {
        localStorage.setItem('nativa_user_email', emailInput);
      }
      if(nameInput) {
        localStorage.setItem('nativa_user_name', nameInput);
      }
      if(lastnameInput) {
        localStorage.setItem('nativa_user_lastname', lastnameInput);
      }
      
      // Redirect to profile
      window.location.href = 'perfil.html';
    }
  </script>
`;
  
  content = content.replace('</script>', scriptInsert);
  
  // add onsubmit to the form
  content = content.replace('<form action="perfil.html">', '<form onsubmit="handleAuthSubmit(event)">');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('JS patched');
