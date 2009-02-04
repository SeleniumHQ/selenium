class ErrorInResponseException(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)

class InvalidSwitchToTargetException(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)
