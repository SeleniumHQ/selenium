

#
# Command Translater
#
def translate(command, target, value=""):
    """ Translate an api call into selenese command. """
    result = "|%s|%s|%s|" % (command, target, value)
    if command == 'testComplete':
        result == "|testComplete|"
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
    def chooseCancelOnNextConfirmation(self):
        return self.dispatchCommand("chooseCancelOnNextConfirmation")
        
    def click(self, target):
        """ Click on the target """
        return self.dispatchCommand("click", target)
        
    def clickAndWait(self, target):
        """ Click on the target and wait for a page load event """
        return self.dispatchCommand("clickAndWait", target)
        
    def open(self, path):
        """ Goto the specified URL """
        return self.dispatchCommand("open", path)
        
    def pause(self, duration): # is this needed for driven ?
        """ pause for a period of time in seconds """
        return self.dispatchCommand("pause", duration)
        
    def selectAndWait(self, field, value):
        """ select the target and wait for a page load event """
        return self.dispatchCommand("selectAndWait",field, value)
        
    def selectWindow(self, window):
        return self.dispatchCommand("selectWindow", window)
        
    def setTextField(self, field, value):
        return self.dispatchCommand("setTextField", field, value)
        
    def storeText(self, element, value):
        return self.dispatchCommand("storeText", element, value)
        
    def storeValue(self, field, value):
        return self.dispatchCommand("storeValue", field, value)
        
    def testComplete(self):
        """ Tell the browser the test is complete """
        return self.dispatchCommand("testComplete")
        
    def type(self, field, value):
        return self.dispatchCommand("type", field, value)
        
    def typeAndWait(self, field, value):
        return self.dispatchCommand("typeAndWait", field, value)
        
    def verifyAlert(self, alert):
        return self.dispatchCommand("verifyAlert", alert)
        
    def verifyAttribute(self, element, value):
        return self.dispatchCommand("verifyAttribute", element, value)
        
    def verifyConfirmation(self, confirmation):
        return self.dispatchCommand("verifyConfirmation", confirmation)
        
    def verifyElementNotPresent(self, type):
        return self.dispatchCommand("verifyElementNotPresent", type)
        
    def verifyElementPresent(self, type):
        return self.dispatchCommand("verifyElementPresent", type)
        
    def verifyLocation(self, location):
        return self.dispatchCommand("verifyLocation", location)
        
    def verifySelectOptions(self, field, values):
        return self.dispatchCommand("verifySelectOptions", field, values)
        
    def verifySelected(self, field, value):
        return self.dispatchCommand("verifySelected", field, value)
        
    def verifyTable(self, table, value):
        return self.dispatchCommand("verifyTable", table, value)
        
    def verifyText(self, type, text):
        return self.dispatchCommand("verifyText", type, text)
        
    def verifyTextPresent(self, type, text):
        return self.dispatchCommand("verifyTextPresent", type, text)

    def verifyTitle(self, title):
        return self.dispatchCommand("verifyTitle", title)
        
    def verifyValue(self, field, value):
        return self.dispatchCommand("verifyValue", field, value)
            