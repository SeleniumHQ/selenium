"""
Py2exe setup script for selenium
"""
import os, sys

# include src/selenium in the sys.path so py2exe can find
# Interpreter.py and Dispatcher.py
currentDir = os.getcwd()
includePath = os.path.join(currentDir, 'src\\selenium')
sys.path.insert(0,includePath)


# spiders a directory getting a list of all files and sub-directories
def getFiles(dir):
    the_list = []
    for root, dirs, files  in os.walk(dir):    
        if '.svn' in dirs or 'CVS' in dirs:
            dirs.remove('.svn') # don't visit Subversion or CVS directories     
        
        #convert from absolute to relative path
        # should use os path split here...
        subdir = root.split('src\\selenium\\')[1]
        
        #append subdir path to each file
        def joinPath(file):
            return os.path.join('src', 'selenium', subdir,file)
            
        files = map(joinPath, files)                    
        the_list.append( (subdir, files) )    
    return the_list


cgi_bin_dir = os.path.join(currentDir, 'src', 'selenium', 'cgi-bin')
selenium_driver_dir = os.path.join(currentDir, 'src', 
                                   'selenium', 'selenium_driver')


# list_of_files should have the following format:
# [('cgi-bin', ['src/selenium/cgi-bin/README'])]
list_of_files = getFiles(cgi_bin_dir) + getFiles(selenium_driver_dir)


myname="Jason Huggins"
myeddress="jrhuggins@thoughtworks.com"
distname="selenium_proxy_server"
myfullname="Selenium Web Application Functional Testing Tool"
distvers="0.3.0"
dist_url="selenium.thoughtworks.com"

from distutils.core import setup
import py2exe                 
setup(console=["src/selenium/selenium_server.py"],
      data_files=list_of_files,
      author=myname, 
      author_email=myeddress,
      name=distname, 
      fullname=myfullname,
      version=distvers, 
      url=dist_url,)                   
                   
