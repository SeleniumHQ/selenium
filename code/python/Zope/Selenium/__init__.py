""" This application implements a Selenium command interpreter and
    a dispatcher for communicating functional test commands to and from a web browser.
"""

from Products.CMFCore.DirectoryView import registerDirectory
import ZInterpreter

registerDirectory('skins', globals())
selenium_globals = globals()          # Used only in the Extensions/Install.py script

def initialize(context):
    context.registerClass(
        instance_class=ZInterpreter.ZSeleniumInterpreter,
        constructors=(ZInterpreter.manage_addZSeleniumInterpreterForm,
                      ZInterpreter.manage_addZSeleniumInterpreter),
        icon='tool.gif'                       
        )

