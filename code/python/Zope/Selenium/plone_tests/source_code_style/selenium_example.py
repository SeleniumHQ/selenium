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
os.system('start run_firefox.bat')

print app.open('/tests/html/test_click_page1.html')
print app.verifyTextPresent('Click here for next page','')
print app.click('link')
print app.verifyTextPresent('This is a test of the click command.','')
print app.click('previousPage')
print app.testComplete()
