""" Selenium Server in Twisted Python

    Jason Huggins
    jrhuggins@thoughtworks.com
    
    This server provides the following:
    1) A static content web server for the TestRunner files,
    javascripts and stylesheets.
    
    2) A proxy server:
    Application Under Test (AUT) to be proxied and have its URLs rewritten to have the same
    hostname of the Selenium server. Uses perl-based CGIProxy.

    3) Driver interface for selenium (aka "Selenese")

    4) XML-RPC Server interface to driver.
    For taking 'Selenese' requests from Python, Ruby, Java, or .C# programs    
"""   

# following two lines only needed on windows
from twisted.internet import  win32eventreactor
win32eventreactor.install()


from twisted.internet import reactor
from twisted.web import static, server, twcgi, script, xmlrpc, resource
from twisted.internet import utils
import os

import Interpreter
import Dispatcher

class PerlScript(twcgi.FilteredScript):
    filter = 'c:/Perl/bin/perl.exe' # Points to the perl parser

def main():
    root = resource.Resource()
    
    # The proxy server (aka "The Funnel")
    # BUG: When the path includes a space... like in 
    # "C:\Program Files\Selenium", Twisted can't seam to find the file...
    # Works fine when there are no spaces in the path
    path = os.path.join(os.getcwd(),"cgi-bin","nph-proxy.cgi")
    #path = '"%s"' % path
    proxy = PerlScript(path)    
    root.putChild("AUT",proxy)        
    
    # The selenium javascript directory,driver web interface, and
    # the XML-RPC are all available from the /selenium-driver/ 
    
    driver = static.File("./selenium_driver")
    driver.ignoreExt('.rpy')
    driver.indexNames=['index.rpy']
    driver.processors = {'.rpy': script.ResourceScript}    
    root.putChild('selenium-driver', driver)       

    reactor.listenTCP(8081, server.Site(root))
    reactor.run()

if __name__ == '__main__':
    main()
