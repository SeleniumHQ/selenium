from Queue import Queue, Empty

QUEUE_TIMEOUT = 5       # default timeout in seconds
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
        self.queue_timeout = QUEUE_TIMEOUT             
        self._commands = Queue()
        self._results = Queue()
   
    #
    # Command queue methods
    #    
    def addCommand(self, command):
        """ Add a command to the commands queue """          
        self._commands.put(command, block=True, timeout=self.queue_timeout)   
        return 'Command added'

    def getCommand(self):
        """ Retreive a command from the commands queue """
        try:
            return self._commands.get(block=True, timeout=self.queue_timeout)
        except Empty:
            return 'ERROR: Command queue was empty'
            
    def getCommandQueueSize(self):
        """ Query the size of the commands queue """
        return self._commands.qsize()
    
    #
    # Result queue methods
    #        
    def addResult(self, result):
        """ Add a result to the results queue """        
        self._results.put(result)
        return 'Result added'

    def getResult(self):
        """ Retrieve a result from the results queue """
        try:
            return self._results.get(block=True, timeout=self.queue_timeout)
        except Empty:
            return 'ERROR: Result queue was empty'       

    def getResultQueueSize(self):
        """ Query the size of the results queue """        
        size = self._results.qsize()        
        return size

    #
    # Misc. methods
    #
    def setTimeout(self,timeout):
        """ Set the timeout period in seconds for requests 
        from a web browser or driver """
        self.queue_timeout = timeout
        return "Timeout set to %s seconds" % timeout
                                        
    def webDriver(self, request):
        """" Get a command from the command queue. Also, add a result 
        to the result queue, unless the seleniumStart form paramter 
        (seleniumStart=true) is present.
        
        Note: this method is usually called from a web browser
        as "http://<server>/selenium-driver/driver"
        """             
        if request:
            command_result = request.args.get('commandResult')
            selenium_start = request.args.get('seleniumStart')            
            
            # If 'seleniumStart' is a parameter on the request, 
            # it means this is the first time hitting the driver,  
            # and therefore, there is no previous result to post to 
            # the results queue.            
            if command_result:
                #In twisted the arg is given to us as a list, 
                # we only need the first item
                command_result = command_result.pop()
                self.addResult(command_result)
                                 
            return self.getCommand()                 
        else:
            return "ERROR: Missing an HTTP REQUEST"       
            
    def apiDriver(self, command_string=""):
        """ Adds a command to the command queue, and gets a result 
        from the result queue."""
        self.addCommand(command_string)
        # if test is complete, don't try retrieving a response from the browser.
        if command_string.find('testComplete') >= 0:
            return 'test complete'
        else:
            return self.getResult()