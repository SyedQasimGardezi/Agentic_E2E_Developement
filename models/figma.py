from dataclasses import dataclass
from typing import Optional, List, Dict, Any

@dataclass
class FigmaFile:
    """
    Domain model representing a Figma File
    """
    key: str
    name: str
    last_modified: str
    thumbnail_url: Optional[str] = None
    editor_type: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "key": self.key,
            "name": self.name,
            "last_modified": self.last_modified,
            "thumbnail_url": self.thumbnail_url,
            "editor_type": self.editor_type
        }

@dataclass
class FigmaComment:
    """
    Domain model representing a Figma Comment
    """
    id: str
    file_key: str
    message: str
    user_name: str
    created_at: str
    resolved_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "file_key": self.file_key,
            "message": self.message,
            "user_name": self.user_name,
            "created_at": self.created_at,
            "resolved_at": self.resolved_at
        }
