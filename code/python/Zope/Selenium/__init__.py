""" This application implements a Selenium command interpreter and
    a dispatcher for communicating functional test commands to and from a web browser.
"""

from Products.CMFCore.DirectoryView import registerDirectory
from Products.CMFCore import utils
import ZInterpreter
import FunctionalTestTool

registerDirectory('skins', globals())
selenium_globals = globals()          # Used only in the Extensions/Install.py script

selenium_tools = ( FunctionalTestTool.FunctionalTestTool, ) 

def initialize(context):
    context.registerClass(
        instance_class=ZInterpreter.ZSeleniumInterpreter,
        constructors=(ZInterpreter.manage_addZSeleniumInterpreterForm,
                      ZInterpreter.manage_addZSeleniumInterpreter),
        icon='tool.gif'                       
        )
    utils.ToolInit('Selenium Functional Test Tool', tools=selenium_tools, 
                    product_name='Selenium', icon='tool.gif',  
              ).initialize(context)

