# epydoc -- Logging
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: log.py 1075 2006-03-21 07:43:58Z edloper $

"""
Functions used to report messages and progress updates to the user.
These functions are delegated to zero or more registered L{Logger}
objects, which are responsible for actually presenting the information
to the user.  Different interfaces are free to create and register
their own C{Logger}s, allowing them to present this information in the
manner that is best suited to each interface.

@note: I considered using the standard C{logging} package to provide
this functionality.  However, I found that it would be too difficult
to get that package to provide the behavior I want (esp. with respect
to progress displays; but also with respect to message blocks).

@group Message Severity Levels: DEBUG, INFO, WARNING, ERROR, FATAL
"""
__docformat__ = 'epytext en'

import sys, os

DEBUG = 10
INFO = 20
DOCSTRING_WARNING = 25
WARNING = 30
ERROR = 40
FATAL = 40

######################################################################
# Logger Base Class
######################################################################
class Logger:
    """
    An abstract base class that defines the interface for X{loggers},
    which are used by epydoc to report information back to the user.
    Loggers are responsible for tracking two types of information:
    
        - Messages, such as warnings and errors.
        - Progress on the current task.

    This abstract class allows the command-line interface and the
    graphical interface to each present this information to the user
    in the way that's most natural for each interface.  To set up a
    logger, create a subclass of C{Logger} that overrides all methods,
    and register it using L{register_logger}.
    """
    #////////////////////////////////////////////////////////////
    # Messages
    #////////////////////////////////////////////////////////////

    def log(self, level, message):
        """
        Display a message.

        @param message: The message string to display.  C{message} may
        contain newlines, but does not need to end in a newline.
        @param level: An integer value indicating the severity of the
        message.
        """

    #////////////////////////////////////////////////////////////
    # Message blocks
    #////////////////////////////////////////////////////////////
    
    def start_block(self, header):
        """
        Start a new message block.  Any calls to L{info}, L{warn}, or
        L{error} that occur between a call to C{start_block} and a
        corresponding call to C{end_block} will be grouped together,
        and displayed with a common header.  C{start_block} can be
        called multiple times (to form nested blocks), but every call
        to C{start_block} I{must} be balanced by a call to
        C{end_block}.
        """
        
    def end_block(self):
        """
        End a warning block.  See L{start_block} for details.
        """

    #////////////////////////////////////////////////////////////
    # Progress bar
    #////////////////////////////////////////////////////////////
    
    def start_progress(self, header=None):
        """
        Begin displaying progress for a new task.  C{header} is a
        description of the task for which progress is being reported.
        Each call to C{start_progress} must be followed by a call to
        C{end_progress} (with no intervening calls to
        C{start_progress}).
        """

    def end_progress(self):
        """
        Finish off the display of progress for the current task.  See
        L{start_progress} for more information.
        """

    def progress(self, percent, message=''):
        """
        Update the progress display.
        
        @param progress: A float from 0.0 to 1.0, indicating how much
            progress has been made.
        @param message: A message indicating the most recent action
            that contributed towards that progress.
        """

class SimpleLogger(Logger):
    def __init__(self, threshold=WARNING):
        self.threshold = threshold
    def log(self, level, message):
        if level >= self.threshold: print message
        
######################################################################
# Logger Registry
######################################################################

_loggers = []
"""
The list of registered logging functions.
"""

def register_logger(logger):
    """
    Register a logger.  Each call to one of the logging functions
    defined by this module will be delegated to each registered
    logger.
    """
    _loggers.append(logger)

def remove_logger(logger):
    _loggers.remove(logger)

######################################################################
# Logging Functions
######################################################################
# The following methods all just delegate to the corresponding 
# methods in the Logger class (above) for each registered logger.

def fatal(*messages):
    """Display the given fatal message."""
    message = ' '.join(['%s' % (m,) for m in messages])
    for logger in _loggers: logger.log(FATAL, message)
    
def error(*messages):
    """Display the given error message."""
    message = ' '.join(['%s' % (m,) for m in messages])
    for logger in _loggers: logger.log(ERROR, message)
    
def warning(*messages):
    """Display the given warning message."""
    message = ' '.join(['%s' % (m,) for m in messages])
    for logger in _loggers: logger.log(WARNING, message)
    
def docstring_warning(*messages):
    """Display the given docstring warning message."""
    message = ' '.join(['%s' % (m,) for m in messages])
    for logger in _loggers: logger.log(DOCSTRING_WARNING, message)
    
def info(*messages):
    """Display the given informational message."""
    message = ' '.join(['%s' % (m,) for m in messages])
    for logger in _loggers: logger.log(INFO, message)
    
def debug(*messages):
    """Display the given debugging message."""
    message = ' '.join(['%s' % (m,) for m in messages])
    for logger in _loggers: logger.log(DEBUG, message)
    
def start_block(header):
    for logger in _loggers: logger.start_block(header)
start_block.__doc__ = Logger.start_block.__doc__
    
def end_block():
    for logger in _loggers: logger.end_block()
end_block.__doc__ = Logger.end_block.__doc__
    
def start_progress(header=None):
    for logger in _loggers: logger.start_progress(header)
start_progress.__doc__ = Logger.start_progress.__doc__
    
def end_progress():
    for logger in _loggers: logger.end_progress()
end_progress.__doc__ = Logger.end_progress.__doc__
    
def progress(percent, message=''):
    for logger in _loggers: logger.progress(percent, '%s' % message)
progress.__doc__ = Logger.progress.__doc__


