Until an automated install script gets written... here's the manual process to install Selenium in Plone.

This has been tested with Plone 2.0.4.

1) Copy the Selenium directory, which is inside the "Zope" folder (selenium/trunk/code/python/Zope/Selenium) to your Plone Products folder (<Plone_Instance_Home>/Products/).

2) Copy the contents of the Selenium javascript folder (not the folder itself, just the contents, including all files and all sub-folders (selenium/trunk/code/javascript/*) to <Plone_Instance_Home>/Products/Selenium/skins/selenium_javascript.

3) Append ".dtml" to all *.html, *.js, and *.css files inside the selenium_javascript folder and all sub-folders
   Example: 
        Before: selenium_javascript/TestRunner.html
        After: selenium_javascript/TestRunner.html.dtml

4) Use the Plone QuickInstaller to install the Plone product.
    a) Login to plone  as admin (not the Zope Management Interface (ZMI), but the Plone interface)
    b) Click preferences
    c) Click Add/Remove Products
    d) Select "Selenium", then click "install"


5) The default Selenium self-tests should now be available at:
    http://localhost/TestRunner.html

    (the ".dtml" that we added to the file name gets dropped from the name when you call it from Plone)

    The TestRunner.html file is *really* stored here:
    <Plone_Instance_Home>/Products/Selenium/skins/selenium_javascript/TestRunner.html.dtml

    and it makes a reference to the TestSuite.html file located here:
    <Plone_Instance_Home>/Products/Selenium/skins/selenium_javascript/tests/TestSuite.html.dtml

    which refers to the actual tests located in the same folder:
    <Plone_Instance_Home>/Products/Selenium/skins/selenium_javascript/tests/*
    
        

Here's a script that I used to do the file renaming in step 3...


In command prompt window:
c:
cd C:\MyStuff\projects\mythoughtworks\trunk\server\InstanceHome\Products\Selenium\skins\selenium_javascript
c:\python23\python.exe


From Python shell:

import os
from os.path import join

# We need to append ".dtml" to all html, js, and css files so the "original" filename can be
# called in the browser. 
# For example:
# By default, in Zope, TestRunner.html would be available from a URL as "http://localhost/TestRunner" with
# no ".html" attached. To preserve the original file name, we append ".dtml" to the file name.     

for root, dirs, files  in os.walk(os.getcwd()):    
    if '.svn' in dirs or 'CVS' in dirs:
        dirs.remove('.svn') # don't visit Subversion or CVS directories     
    
    for file in files:
        if file.endswith('.html') or file.endswith('.js') or file.endswith('.css'):
            old_file = join(root, file)
            new_file = old_file + '.dtml'
            os.rename(old_file,new_file)
