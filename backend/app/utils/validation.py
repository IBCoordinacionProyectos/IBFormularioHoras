import re
from datetime import datetime
from typing import Optional, Union

def sanitize_string(input_str: str, max_length: int = 1000) -> str:
    """
    Sanitize a string by removing potentially dangerous characters and limiting length.
    
    Args:
        input_str: The string to sanitize
        max_length: Maximum length of the string
        
    Returns:
        Sanitized string
    """
    if not isinstance(input_str, str):
        return ""
    
    # Remove potentially dangerous characters
    # Remove HTML injection chars and control characters
    sanitized = re.sub(r'[<>"&\x00-\x1F\x7F]', '', input_str)
    
    # Limit length
    return sanitized[:max_length]

def validate_project_code(project_code: str) -> str:
    """
    Validate and sanitize project code.
    
    Args:
        project_code: The project code to validate
        
    Returns:
        Validated project code
        
    Raises:
        ValueError: If project code is invalid
    """
    if not isinstance(project_code, str):
        raise ValueError("Project code must be a string")
    
    sanitized = sanitize_string(project_code, 50)
    
    # Project code should contain alphanumeric characters, hyphens, underscores, spaces, periods, and forward slashes
    if not re.match(r'^[A-Za-z0-9_\- .()/]+$', sanitized):
        raise ValueError("Project code contains invalid characters")
    
    return sanitized

def validate_phase_discipline_activity(value: str, field_name: str) -> str:
    """
    Validate and sanitize phase, discipline, or activity fields.

    Args:
        value: The value to validate
        field_name: Name of the field for error messages

    Returns:
        Validated value

    Raises:
        ValueError: If value is invalid
    """
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    sanitized = sanitize_string(value, 200)

    # Allow alphanumeric characters, spaces, hyphens, underscores, parentheses, forward slashes, and accented characters
    if not re.match(r'^[A-Za-z0-9\s\-_()/ÁÉÍÓÚáéíóúÑñ]+$', sanitized):
        raise ValueError(f"{field_name} contains invalid characters")

    return sanitized

def validate_hours(hours: Union[str, float, int]) -> float:
    """
    Validate and convert hours to float.
    
    Args:
        hours: The hours value to validate
        
    Returns:
        Validated hours as float
        
    Raises:
        ValueError: If hours value is invalid
    """
    if isinstance(hours, str):
        # Replace comma with dot for decimal separator
        hours = hours.replace(',', '.')
    
    try:
        hours_float = float(hours)
    except (ValueError, TypeError):
        raise ValueError("Hours must be a valid number")
    
    if hours_float < 0 or hours_float > 24:
        raise ValueError("Hours must be between 0 and 24")
    
    return hours_float

def validate_date(date_str: str) -> str:
    """
    Validate date string format (YYYY-MM-DD).
    
    Args:
        date_str: The date string to validate
        
    Returns:
        Validated date string
        
    Raises:
        ValueError: If date format is invalid
    """
    if not isinstance(date_str, str):
        raise ValueError("Date must be a string")
    
    # Check format
    if not re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        raise ValueError("Date must be in YYYY-MM-DD format")
    
    # Validate actual date
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        raise ValueError("Invalid date")
    
    return date_str

def validate_employee_id(employee_id: Union[str, int]) -> int:
    """
    Validate employee ID.
    
    Args:
        employee_id: The employee ID to validate
        
    Returns:
        Validated employee ID as integer
        
    Raises:
        ValueError: If employee ID is invalid
    """
    try:
        emp_id = int(employee_id)
    except (ValueError, TypeError):
        raise ValueError("Employee ID must be a valid integer")
    
    if emp_id <= 0:
        raise ValueError("Employee ID must be a positive integer")
    
    return emp_id

def validate_note(note: Optional[str]) -> Optional[str]:
    """
    Validate and sanitize note field.
    
    Args:
        note: The note to validate
        
    Returns:
        Validated note or None
    """
    if note is None:
        return None
    
    if not isinstance(note, str):
        raise ValueError("Note must be a string")
    
    return sanitize_string(note, 500)
