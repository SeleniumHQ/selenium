from Queue import Queue, Empty


QUEUE_TIMEOUT = 5       # in seconds
""" 
    How long a 'get' command will wait before timing out if a queue is empty.

    When running automated tests, you may want to set QUEUE_TIMEOUT to a 
    lower value (e.g. .001, 1, 2, etc.)

    When running via an interactive console, set this to a 
    higher value (e.g 60, 90, 120)
"""


class Dispatcher:
    """ Sends commands to and receives results from a web browser. 
    
    Dispatcher: 
        _Computer Science_: A routine that controls the order in which input 
        and output devices obtain access to the processing system.
        (source: http://dictionary.reference.com/search?q=dispatcher)
    
    In Selenium, the Dispatcher class takes commands to be executed and puts 
    them in a queue for a web browser to read.
    
    When the browser reads this queue for a command to execute, it adds the 
    previous command's result to the Dispatcher's result queue.
    """
    
    def __init__(self):
        self.QUEUE_TIMEOUT = QUEUE_TIMEOUT
        self._v_commands = Queue()
        self._v_results = Queue()
        
        # force an initialization of the queues by 
        # putting and getting a dummy value
        self._v_commands.put('')
        self._v_commands.get('')        
        self._v_results.put('')
        self._v_results.get('')
    
    def addCommand(self, command, REQUEST=None):
        """ Add a command to the commands queue """
        
        # Reinitialize the queue if it's missing
        if not hasattr(self,'_v_commands'):
            self._v_commands = Queue()
        
        # Add the command
        self._v_commands.put(command, block=True, timeout=self.QUEUE_TIMEOUT)
        
        return 'Command added'

    def getCommand(self, REQUEST=None):
        """ Retreive a command from the commands queue """
        try:
            return self._v_commands.get(block=True, 
                                         timeout=self.QUEUE_TIMEOUT)
        except Empty:
            return 'ERROR: Command queue was empty'

    def getCommandQueueSize(self, REQUEST=None):
        """ Query the size of the commands queue """
        return self._v_commands.qsize()
        

    def addResult(self, result, REQUEST=None):
        """ Add a result to the results queue """
        self._v_results.put(result)

    def getResult(self, REQUEST=None):
        """ Retrieve a result from the results queue """
        try:
            return self._v_results.get(block=True,
                                         timeout=self.QUEUE_TIMEOUT)
        except Empty:
            return 'ERROR: Result queue was empty'         

    def getResultQueueSize(self, REQUEST=None):
        """ Query the size of the results queue """
        
        size = self._v_results.qsize()        
        return size

                               
    def webDriver(self, REQUEST=None):
        """" Gets a command from the command queue. Also, adds a result 
        to the result queue, unless the seleniumStart form paramter 
        (seleniumStart=true) is present.
        
        Note: this method is usually called from a web browser as "http://<server>/<selenium>/driver"
        """             
        if REQUEST:
            command_result = REQUEST.form.get('commandResult')
            selenium_start = REQUEST.form.get('seleniumStart')
            
            # If 'seleniumStart' is a parameter on the request, 
            # it means this is the first time hitting the driver,  
            # and therefore, there is no previous result to post to 
            # the results queue.            
            if selenium_start == None:
                self.addResult(command_result)
            
            return self.getCommand()            
        else:
            return "ERROR: Missing an HTTP REQUEST"       
            
    def apiDriver(self, command_string="", REQUEST=None):
        """ Adds a command to the command queue, and gets a result 
        from the result queue.
        
        Note: this method is usually called from Python 
        source code, not a web browser."""
        if REQUEST:
            command_string = REQUEST.form.get('command_string')

        self.addCommand(command_string)
        return self.getResult()