from twisted.web import resource, xmlrpc
from twisted.internet.threads import deferToThread

from Interpreter import SeleniumInterpreter

"""
Called from an xml-rcp client like so:

>>> import xmlrpclib
>>> selenium = xmlrpclib.ServerProxy("http://localhost:8081/selenium-driver/RPC2")
>>> selenium.getCommandQueueSize()
0
"""

interpreter = registry.getComponent(SeleniumInterpreter)
if not interpreter:
    registry.setComponent(SeleniumInterpreter, SeleniumInterpreter())
    interpreter = registry.getComponent(SeleniumInterpreter)

class XMLRPCinterface(xmlrpc.XMLRPC):
    """ XML-RPC methods for the selenium interpreter """
    #
    # Command queue methods
    #
    def xmlrpc_addCommand(self,command):
        return deferToThread(interpreter.addCommand, command)
    
    def xmlrpc_getCommand(self):
        return deferToThread(interpreter.getCommand)
    
    def xmlrpc_getCommandQueueSize(self):
        return deferToThread(interpreter.getCommandQueueSize)
    
    #
    # Result queue methods
    #
    def xmlrpc_addResult(self,result):
        return deferToThread(interpreter.addResult, result)
    
    def xmlrpc_getResult(self):
        return deferToThread(interpreter.getResult)
    
    def xmlrpc_getResultQueueSize(self):
        return deferToThread(interpreter.getResultQueueSize)
        
    #
    # Misc. methods
    #
    def xmlrpc_setTimeout(self, timeout):
        """ Set the timeout period in seconds for requests 
        from a web browser or driver """
        return deferToThread(interpreter.setTimeout, timeout)

    def xmlrpc_apiDriver(self,command_string):
        """ Adds a command to the command queue, and gets a result 
        from the result queue."""    
        return deferToThread(interpreter.apiDriver, command_string)

    #
    # Driver methods
    #
    def xmlrpc_open(self, path):
        """ Goto the specified URL """
        return deferToThread(interpreter.open, path)


resource = XMLRPCinterface()
xmlrpc.addIntrospection(resource)
