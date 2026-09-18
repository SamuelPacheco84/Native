import re
import glob

def remove_modal(content, modal_id):
    # We will find `<div class="modal-overlay" id="MODAL_ID">`
    # and then count `div` openings and closings to remove the whole block.
    start_tag = f'<div class="modal-overlay" id="{modal_id}">'
    idx = content.find(start_tag)
    if idx == -1:
        return content
        
    # Start counting from the end of the start_tag
    curr_idx = idx + len(start_tag)
    div_count = 1
    
    while div_count > 0 and curr_idx < len(content):
        # find next div or /div
        next_open = content.find('<div', curr_idx)
        next_close = content.find('</div', curr_idx)
        
        if next_open != -1 and next_open < next_close:
            div_count += 1
            curr_idx = next_open + 4
        elif next_close != -1:
            div_count -= 1
            curr_idx = next_close + 6
        else:
            break
            
    # Remove from idx to curr_idx
    return content[:idx] + content[curr_idx:]

for file_path in glob.glob('*.html'):
    if file_path in ['login.html', 'register.html']:
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = remove_modal(content, 'login-modal-overlay')
    content = remove_modal(content, 'register-modal-overlay')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print('Modals removed safely using DOM-like parsing')
