#################################################################################
#                                                                               #
#                       copyright (c) 2004 ThoughtWorks, Inc.                   #
#                                                                               #
#################################################################################

#this is the one to look for Functional tests 
from OFS.SimpleItem import Item
from Globals import InitializeClass, Persistent
from Acquisition import Implicit
from AccessControl.Role import RoleManager

from Products.CMFCore import utils
from Globals import InitializeClass
from AccessControl import ClassSecurityInfo

import random
import os
import time
import urllib


# Member type definitions


class UserType:
    pass

FTuser = UserType()
FTuser.fullname = 'FTuser'
FTuser.roles = ('Member',)

FTmanageruser = UserType()
FTmanageruser.fullname = 'FTmanageruser'
FTmanageruser.roles = ('Member','Manager',)

userTypeChoices = {'Member': FTuser,
                   'Manager': FTmanageruser                       
                  }

class FunctionalTestTool (Item, Persistent, Implicit, RoleManager):
    """ This tool is useful for server-side setup, tear-down,
    and posting of results during functional test runs."""
    id = 'selenium_ft_tool'
    meta_type= 'Selenium Functional Test Tool'

    security = ClassSecurityInfo() 

    manage_options=(
        Item.manage_options + RoleManager.manage_options
        )
    
    security.declarePublic('setup')
    def setup(self, user_type=None, REQUEST=None):
        """ Setup method to be called at the beginning of each functional test.
            Must be explicitly called from the test (not implicit, yet)
            
            You should disable this in your production code, cause this
            is a big freakin hug security hole when not used
            for dev/testing purposes.
            
        """
        if REQUEST:
            user_type = REQUEST.form.get('user_type')
        
        return self.addUser(user_type)

    security.declarePublic('tearDown')                 
    def tearDown(self, user=None, REQUEST=None):
        """ Tear down method to be called at the end of each functional test
            Must be explicitly called from the test (not implicit, yet)
            
            You should disable this in your production code, cause this
            is a big freakin hug security hole when not used
            for dev/testing purposes.
        """
        if REQUEST:
            user = REQUEST.form.get('user','')   
        
        if user:
            self.deleteUser(user)
            
        return 'tearDown complete'
        
    def addUser(self,user_type=None):
        """ Adds a dummy user for the functional tests. """
        pm = utils.getToolByName(self, 'portal_membership')

        try:
            user = userTypeChoices[user_type]
        except KeyError:
            user = userTypeChoices['Member']
        
        user.username = user.password = '%s%s' % (user.fullname, random.randrange(10000))
        user.email = '%s@example.org' % user.username
        user.properties = {'username': user.username
                         ,'fullname': user.fullname
                         ,'email': user.email
                         }

        
        try:
            pm.addMember(user.username, user.password, user.roles, '')
            
            #Yes, the following line of code looks odd, I need to find out why this didn't work:
            #pm.addMember(user.username, user.password, user.roles, '', properties=user.properties)
            pm.getMemberById(user.username).setMemberProperties(user.properties)

            return user.username
        except: #which exception?
            return "ERROR: Couldn't create user"
                     
    def deleteUser(self, user):
        """ Deletes the user from Plone. """
        # Delete the user from acl_users
        self.acl_users._delUsers([user])

        # Delete the users member data
        pm = utils.getToolByName(self, 'portal_memberdata')
        pm.pruneMemberDataContents()
        
        
    security.declarePublic('postResults')         
    def postResults(self, formData, userAgent):
        """ called by test runner to write results to file"""
        browserName = self.getBrowserName(userAgent)

        suiteTable = ''
        if formData.has_key('suite'):
            suiteTable = formData.get('suite', '')
            del formData['suite']
        
        testTables = []

        testTableNum = 1
        while formData.has_key('testTable.%s' % testTableNum):
            testTable = formData['testTable.%s' % testTableNum]
            testTables.append(testTable)
            del formData['testTable.%s' % testTableNum]
            testTableNum += 1
        
        # Unescape the HTML tables
        suiteTable = urllib.unquote(suiteTable)
        testTables = map(urllib.unquote, testTables)
            
        outputDir, metadatalink, datafilelink = self.writeResultsToFiles(browserName, formData, suiteTable, testTables)
        
        message = '<html><body>Results have been successfully posted to the server here:<br />'
        message += '\n%s<p /><p />\n\n' % outputDir
        message += "<a href='./%s'>%s</a><br />\n" % (metadatalink, metadatalink)
        message += "<a href='./%s'>%s</a>" % (datafilelink, datafilelink)
        
        return message
      

    # Writes the data out to 2 files.  The formData is written to 
    # result-browserName.txt as a list of key: value, one per line.  The 
    # suiteTable and testTables are written to output-browserName.html.
    def writeResultsToFiles(self, browserName, formData, suiteTable, testTables):
        import Products.Selenium
        file_path = Products.Selenium.__file__
        path, init_file = os.path.split(file_path)
        outputDir = os.path.join(path,'skins','selenium_test_results')

        metadatalink = 'selenium-results-metadata-%s.txt' % browserName
        metadatafile = metadatalink + '.dtml'

        f = open(os.path.join(outputDir, metadatafile), 'w')
        for key in formData.keys():
            print >> f, '%s: %s' % (key, formData[key])
        f.close()
        
        datafilelink = 'selenium-results-%s' % browserName
        datafile = datafilelink + '.html'
        
        f = open(os.path.join(outputDir, datafile), 'w')
        print >> f, suiteTable
        
        for testTable in testTables:
            print >> f, '<br/><br/>'
            print >> f, testTable
        
        f.close()
        return (outputDir, metadatalink, datafilelink)
        

    def getBrowserName(self,userAgent):
        if userAgent.find('MSIE') > -1:
            return 'IE'
        elif userAgent.find('Firefox') > -1:
            return 'Firefox'
        elif userAgent.find('Gecko') > -1:
            return 'Mozilla'
        else:
            return 'Unknown'


InitializeClass(FunctionalTestTool)
