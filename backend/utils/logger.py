"""
Centralized logging utility for ToneBridge Backend
"""

import logging
import sys
from typing import Optional
from datetime import datetime

def setup_logger(name: str, level: Optional[int] = None) -> logging.Logger:
    """
    Setup a logger with consistent formatting and handlers
    
    Args:
        name: Logger name (usually __name__)
        level: Logging level (defaults to INFO)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger
    
    # Set log level
    log_level = level or logging.INFO
    logger.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (optional)
    try:
        file_handler = logging.FileHandler('tonebridge.log')
        file_handler.setLevel(log_level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except (PermissionError, OSError):
        # If we can't write to file, just use console
        pass
    
    return logger

def log_request(logger: logging.Logger, request_data: dict, response_data: dict, duration: float):
    """
    Log API request/response details
    
    Args:
        logger: Logger instance
        request_data: Request information
        response_data: Response information
        duration: Request duration in seconds
    """
    logger.info(
        f"API Request - Duration: {duration:.3f}s | "
        f"Request: {request_data} | Response: {response_data}"
    )

def log_error(logger: logging.Logger, error: Exception, context: dict = None):
    """
    Log error with context
    
    Args:
        logger: Logger instance
        error: Exception that occurred
        context: Additional context information
    """
    context_str = f" | Context: {context}" if context else ""
    logger.error(f"Error: {str(error)}{context_str}", exc_info=True) 