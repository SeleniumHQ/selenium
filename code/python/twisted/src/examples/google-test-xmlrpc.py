import xmlrpclib

# Make an object to represent the XML-RPC server.
server_url = "http://localhost:8080/selenium-driver/RPC2"
app = xmlrpclib.ServerProxy(server_url)

# Bump timeout a little higher than the default 5 seconds
app.setTimeout(15)

import os
os.system('start run_firefox.bat')

print app.open('http://localhost:8080/AUT/000000A/http/www.google.com/')
print app.verifyTitle('Google')
print app.type('q','Selenium ThoughtWorks')
print app.verifyValue('q','Selenium ThoughtWorks')
print app.clickAndWait('btnG')
print app.verifyTextPresent('selenium.thoughtworks.com','')
print app.verifyTitle('Google Search: Selenium ThoughtWorks')
print app.testComplete()