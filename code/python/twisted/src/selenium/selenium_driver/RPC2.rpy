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
    def xmlrpc_chooseCancelOnNextConfirmation(self):
        return deferToThread(interpreter.chooseCancelOnNextConfirmation)
        
    def xmlrpc_click(self, target):
        return deferToThread(interpreter.click, target)        

    def xmlrpc_clickAndWait(self, target):
        return deferToThread(interpreter.clickAndWait, target)

    def xmlrpc_open(self, path):
        """ Goto the specified URL """
        # TODO add "use_proxy" flag to interpreter and document its use)
        return deferToThread(interpreter.open, path)

    def xmlrpc_pause(self, duration):
        return deferToThread(interpreter.pause, duration)
        
    def xmlrpc_selectAndWait(self, field, value):
        return deferToThread(interpreter.selectAndWait, field, value)
        
    def xmlrpc_selectWindow(self, window):
        return deferToThread(interpreter.selectWindow, window)        

    def xmlrpc_setTextField(self, field, value):
        return deferToThread(interpreter.setTextField, field, value)

    def xmlrpc_storeText(self, element, value):
        return deferToThread(interpreter.storeText, element, value)

    def xmlrpc_storeValue(self, field, value):
        return deferToThread(interpreter.storeValue, field, value)

    def xmlrpc_testComplete(self):
        return deferToThread(interpreter.testComplete)

    def xmlrpc_type(self, field, value):
        return deferToThread(interpreter.type, field, value)  
        
    def xmlrpc_typeAndWait(self, field, value):
        return deferToThread(interpreter.typeAndWait, field, value)  
        
    def xmlrpc_verifyAlert(self, alert):
        return deferToThread(interpreter.verifyAlert, alert)          

    def xmlrpc_verifyAttribute(self, element, value):
        return deferToThread(interpreter.verifyAttribute, element, value)
        
    def xmlrpc_verifyConfirmation(self, confirmation):
        return deferToThread(interpreter.verifyConfirmation, confirmation)
        
    def xmlrpc_verifyElementNotPresent(self, type):
        return deferToThread(interpreter.verifyElementNotPresent, type)
        
    def xmlrpc_verifyElementPresent(self, type):
        return deferToThread(interpreter.verifyElementPresent, type)
        
    def xmlrpc_verifyLocation(self, location):
        return deferToThread(interpreter.verifyLocation, location)
        
    def xmlrpc_verifySelectOptions(self, field, values):
        return deferToThread(interpreter.verifySelectOptions, field, values)
        
    def xmlrpc_verifySelected(self, field, value):
        return deferToThread(interpreter.verifySelected, field, value)
        
    def xmlrpc_verifyTable(self, table, value):
        return deferToThread(interpreter.verifyTable, table, value)
        
    def xmlrpc_verifyText(self, type, text):
        return deferToThread(interpreter.verifyText, type, text)
        
    def xmlrpc_verifyTextPresent(self, type, text):
        return deferToThread(interpreter.verifyTextPresent, type, text)

    def xmlrpc_verifyTitle(self, title):
        return deferToThread(interpreter.verifyTitle, title)
        
    def xmlrpc_verifyValue(self, field, value):
        return deferToThread(interpreter.verifyValue, field, value)


resource = XMLRPCinterface()
xmlrpc.addIntrospection(resource)
