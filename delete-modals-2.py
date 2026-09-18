import re
import glob

def remove_modals(content):
    # Just remove the divs entirely by matching the specific ID and closing tags
    # Since we can't reliably parse HTML with regex, let's find the ID and delete that block
    start_str = '<!-- Modal de Login / Cuenta -->'
    end_str = '<!-- Modal Detalle del Producto -->'
    
    if start_str in content and end_str in content:
        start_idx = content.find(start_str)
        end_idx = content.find(end_str)
        if start_idx < end_idx:
            content = content[:start_idx] + content[end_idx:]
            
    # Also remove register if it's separate
    start_str = '<!-- Modal de Registro -->'
    if start_str in content and end_str in content:
        start_idx = content.find(start_str)
        end_idx = content.find(end_str)
        if start_idx < end_idx:
            content = content[:start_idx] + content[end_idx:]
            
    return content

for file_path in glob.glob('*.html'):
    if file_path in ['login.html', 'register.html']:
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = remove_modals(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print('Done in Python 2')
