

#
# Command Translater
#
def translate(command, target, value=""):
    """ Translate an api call into selenese command. """
    result = "|%s|%s|%s|" % (command, target, value)
    return result

from Dispatcher import Dispatcher

class SeleniumInterpreter(Dispatcher):
    """ Performs the following:
        1) Translates python API calls into Selenese commands,
        2) Sends the command string to the command dispatcher.

    Interpreter:
         _Computer Science_: A program that translates an instruction into a 
         machine language and executes it before proceeding to the next instruction.
         (source: http://dictionary.reference.com/search?q=Interpreter)
    """

    def __init__(self, id):
        Dispatcher.__init__(self)
        self.id = id
       
    def driver(self, REQUEST=None):
        """ expose dispatcher's webDriver method to web requests """
        return self.webDriver(REQUEST)
    

    def dispatchCommand(self, command, target, value=""):
        command_string = translate(command, target, value)        
        return self.apiDriver(command_string)

    #
    # Selenium Commands       
    #
    def chooseCancelOnNextConfirmation():
        """ pass """
        pass
        
    def click(field):
        """ pass """
        return self.dispatchCommand("click", field)
        
    def clickAndWait(field):
        """ pass """
        pass
        
    def open(self, path):
        """ Goto the specified URL """
        return self.dispatchCommand("open", path)
        
    def pause(duration): # is this needed for driven ?
        """ pass """
        pass
        
    def selectAndWait(field, value):
        """ pass """
        pass
        
    def selectWindow(window):
        """ pass """
        pass
        
    def setTextField(field, value):
        """ pass """
        pass
        
    def storeText(element, value):
        """ pass """
        pass
        
    def storeValue(field, value):
        """ pass """
        pass
        
    def testComplete():
        """ pass """
        pass
        
    def type(field, value):
        """ pass """
        pass
        
    def typeAndWait(field, value):
        """ pass """
        pass
        
    def verifyAlert(alert):
        """ pass """
        pass
        
    def verifyAttribute(element, value):
        """ pass """
        pass
        
    def verifyConfirmation(confirmation):
        """ pass """
        pass
        
    def verifyElementNotPresent(type):
        """ pass """
        pass
        
    def verifyElementPresent(type):
        """ pass """
        pass
        
    def verifyLocation(location):
        """ pass """
        pass
        
    def verifySelectOptions(field, values):
        """ pass """
        pass
        
    def verifySelected(field, value):
        """ pass """
        pass
        
    def verifyTable(table, value):
        """ pass """
        pass
        
    def verifyText(type, text):
        """ pass """
        pass
        
    def verifyTextPresent(type, text):
        """ pass """
        pass
        
    def verifyTitle(title):
        """ pass """
        pass
        
    def verifyValue(field, value):
        """ pass """
        pass
            