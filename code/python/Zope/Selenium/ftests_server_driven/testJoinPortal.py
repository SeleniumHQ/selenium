# Copyright 2005 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

import xmlrpclib

# Make an object to represent the XML-RPC server.
server_url = "http://localhost/selenium_driver"
app = xmlrpclib.ServerProxy(server_url)

# Bump timeout a little higher than the default 5 seconds
app.setTimeout(15)

import os
os.system('start run_IE.bat')

print app.open('/')

# Click login button
print app.clickAndWait("//A[@href='http://localhost/join_form']")

#Enter data into registration form
print app.verifyTextPresent('Registration Form','')
print app.type('fullname','Jason Huggins')
print app.type('username','jrhuggins')
print app.type('email','jrhuggins@thoughtworks.com')
print app.type('password','12345')
print app.type('confirm','12345')
print app.clickAndWait("form.button.Register")

#Verify registration was successful
print app.verifyTextPresent('You have been registered as a member.','')

#Click login button
print app.clickAndWait("document.forms[1].elements[3]")
print app.verifyTextPresent('Welcome! You are now logged in.','')

print app.testComplete()