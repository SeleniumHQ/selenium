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
selenium = xmlrpclib.ServerProxy("http://localhost/selenium_driver")

print "Make sure your Zope server is already running...."
print "Now load up a web browser and goto: http://localhost/selenium_driver/SeleneseRunner.html"

# Send some commands to the browser
print selenium.open('/test_click_page1.html')


