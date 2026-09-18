import re
import glob

def remove_modals(content):
    # Regex to find everything from <!-- Modal de Login / Cuenta --> to <!-- Modal Detalle del Producto -->
    pattern = r'<!-- Modal de Login / Cuenta -->.*?<!-- Modal Detalle del Producto -->'
    return re.sub(pattern, '<!-- Modal Detalle del Producto -->', content, flags=re.DOTALL)

for file_path in glob.glob('*.html'):
    if file_path in ['login.html', 'register.html']:
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = remove_modals(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print('Done in Python')
