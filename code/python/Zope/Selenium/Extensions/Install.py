##########################################################
##                                                      ##
## INSTALL PROCEDURE FOR Selenium                       ##
##                                                      ##
##                                                      ##
##########################################################


from Products.Selenium import selenium_globals
from Products.Selenium.config import product_name, unique_id, meta_type

from Products.CMFCore.DirectoryView import addDirectoryViews
from Products.CMFCore.utils import getToolByName

import Globals

from cStringIO import StringIO
import string

def installProduct(self, out):
    """ Install Selenium Interpreter """
    # Check that the product has not been added using its id
    if not hasattr(self, unique_id):
        # Add the product by its meta_type
        self.manage_addProduct[product_name].manage_addZSeleniumInterpreter(unique_id)        
        out.write('Successfully added ' + meta_type + '\n')

def installTools(self, out):
    """ Install the Plone tool for Selenium"""
    # Check that the tool has not been added using its id
    if not hasattr(self, 'selenium_ft_tool'):
        addTool = self.manage_addProduct['Selenium'].manage_addTool
        # Add the tool by its meta_type
        addTool('Selenium Functional Test Tool')
        out.write('Successfully added Selenium Functional Test Tool.\n')

def installSubSkin(self, out, skinFolder):
    """ Install a subskin, i.e. a folder/directoryview."""
    skinsTool = getToolByName(self, 'portal_skins')
    
    for skin in skinsTool.getSkinSelections():
        path = skinsTool.getSkinPath(skin)
        path = map( string.strip, string.split( path,',' ) )
        if not skinFolder in path:
            try:
                path.insert( path.index( 'custom')+1, skinFolder )
            except ValueError:
                path.append(skinFolder)
            path = string.join( path, ', ' )
            skinsTool.addSkinSelection( skin, path )
            out.write('Subskin successfully installed %s into %s.\n' % (skinFolder, skin))    
        else:
            out.write('*** Subskin was already installed into %s.\n' % skin) 

def setupSkins(self, out):
    skinsTool = getToolByName(self, 'portal_skins')
            
    try:  
        addDirectoryViews(skinsTool, 'skins', selenium_globals)
        out.write( "Added directory views to portal_skins.\n" )
    except:
        out.write( '*** Unable to add directory views to portal_skins.\n')

    installSubSkin(self, out, "selenium_javascript")
    installSubSkin(self, out, "selenium_python_scripts")   
    installSubSkin(self, out, "selenium_test_results") 
    installSubSkin(self, out, "ftests_browser_driven") 

def install(self):
    out=StringIO()
    installProduct(self, out)
    installTools(self, out)
    setupSkins(self, out)
    out.write('Installation completed.\n')
    return out.getvalue()

