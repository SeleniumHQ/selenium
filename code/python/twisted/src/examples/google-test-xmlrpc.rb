require "xmlrpc/client"

# Make an object to represent the XML-RPC server.
server = XMLRPC::Client.new( "localhost", "/selenium-driver/RPC2", 8080)

# Bump timeout a little higher than the default 5 seconds
server.call('setTimeout',15)

system 'start run_firefox.bat'

puts server.call('open','http://localhost:8080/AUT/000000A/http/www.google.com/')
puts server.call('verifyTitle','Google')
puts server.call('type','q','Selenium ThoughtWorks')
puts server.call('verifyValue','q','Selenium ThoughtWorks')
puts server.call('clickAndWait','btnG')
puts server.call('verifyTextPresent','selenium.thoughtworks.com','')
puts server.call('verifyTitle','Google Search: Selenium ThoughtWorks')
puts server.call('testComplete')