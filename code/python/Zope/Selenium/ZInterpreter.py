from Globals import InitializeClass, Persistent
from Acquisition import Implicit
from AccessControl.Role import RoleManager
from OFS.SimpleItem import Item
from Products.PageTemplates.PageTemplateFile import PageTemplateFile
from Interpreter import SeleniumInterpreter

from AccessControl import ClassSecurityInfo

class ZSeleniumInterpreter(SeleniumInterpreter, Item, Persistent, Implicit, RoleManager):
    """ Zope wrapper for SeleniumInterpreter """

    meta_type = 'Selenium Interpreter'
    
    security = ClassSecurityInfo() 

    manage_options=(
        Item.manage_options + RoleManager.manage_options
        )
        
    def __init__(self, id):
        SeleniumInterpreter.__init__(self, id)

    # Dispatcher methods - queue input/output
    security.declarePublic('driver')
    security.declarePublic('apiDriver')
    security.declarePublic('addCommand')
    security.declarePublic('getCommand')
    security.declarePublic('getCommandQueueSize')
    security.declarePublic('addResult')
    security.declarePublic('getResult')
    security.declarePublic('getResultQueueSize')

    # Interpreter methods - Selenese commands 
    security.declarePublic('chooseCancelOnNextConfirmation')
    security.declarePublic('click')
    security.declarePublic('clickAndWait')
    security.declarePublic('open')
    security.declarePublic('pause')
    security.declarePublic('selectAndWait')
    security.declarePublic('selectWindow')
    security.declarePublic('setTextField')
    security.declarePublic('storeText')
    security.declarePublic('storeValue')
    security.declarePublic('testComplete')
    security.declarePublic('type')
    security.declarePublic('typeAndWait')
    security.declarePublic('verifyAlert')
    security.declarePublic('verifyAttribute')
    security.declarePublic('verifyConfirmation')
    security.declarePublic('verifyElementNotPresent')
    security.declarePublic('verifyElementPresent')
    security.declarePublic('verifyLocation')
    security.declarePublic('verifySelectOptions')
    security.declarePublic('verifySelected')
    security.declarePublic('verifyTable')
    security.declarePublic('verifyText')
    security.declarePublic('verifyTextPresent')
    security.declarePublic('verifyTitle')
    security.declarePublic('verifyValue')

InitializeClass(ZSeleniumInterpreter)


manage_addZSeleniumInterpreterForm = PageTemplateFile(
    'www/addZSeleniumInterpreter.zpt', globals(),
    __name__='manage_addZSeleniumInterpreterForm')
    
    
def manage_addZSeleniumInterpreter(dispatcher, id, REQUEST=None):
    """ Add a ZSeleniumInterpreter instance """
    ob = ZSeleniumInterpreter(id)
    dispatcher._setObject(id, ob)

    if REQUEST is not None:
        return dispatcher.manage_main(dispatcher, REQUEST, update_menu=1)    