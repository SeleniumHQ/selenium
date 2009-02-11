class ErrorInResponseException(Exception):
    def __init__(self, response, *args):
        Exception.__init__(self, *args)
        self.response = response

class InvalidSwitchToTargetException(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)

class NoSuchElementException(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)

