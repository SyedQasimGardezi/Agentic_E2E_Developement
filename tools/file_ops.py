import os

def read_file(path: str) -> str:
    """
    Read the content of a file from the workspace.
    Args:
        path: Relative path to the file (e.g., "src/App.jsx").
    """
    try:
        full_path = os.path.join(os.getcwd(), "workspace", path)
        if not os.path.exists(full_path):
            return f"Error: File {path} not found."
        
        with open(full_path, 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def replace_in_file(path: str, old_text: str, new_text: str) -> str:
    """
    Replace a specific string in a file with new text.
    Use this for precise code edits.
    
    Args:
        path: Relative path to the file.
        old_text: The exact text segment to replace.
        new_text: The new text to insert.
    """
    try:
        full_path = os.path.join(os.getcwd(), "workspace", path)
        if not os.path.exists(full_path):
            return f"Error: File {path} not found."
            
        with open(full_path, 'r') as f:
            content = f.read()
            
        if old_text not in content:
            return f"Error: 'old_text' not found in {path}. Please check exact whitespace and indentation."
            
        new_content = content.replace(old_text, new_text)
        
        with open(full_path, 'w') as f:
            f.write(new_content)
            
        return f"Successfully updated {path}."
        
    except Exception as e:
        return f"Error updating file: {str(e)}"

def write_file(path: str, content: str) -> str:
    """
    Overwrite (or create) a file with the given full content.
    
    Args:
        path: Relative path to the file.
        content: The full content to write.
    """
    try:
        full_path = os.path.join(os.getcwd(), "workspace", path)
        
        # Ensure dir exists
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, 'w') as f:
            f.write(content)
            
        return f"Successfully wrote to {path}."
    except Exception as e:
        return f"Error writing file: {str(e)}"
