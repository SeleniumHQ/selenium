# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Remote Control Logs Retrieval" do
  # it "can retrieve logs even when the is no session was started" do
  #   selenium_driver.stop
  #   logs = selenium_driver.retrieve_last_remote_control_logs
  #
  #   logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
  #   logs.should =~ %r{Got result: OK}
  # end
  #
  # it "can retrieve logs even when no command were issued" do
  #   page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
  #   logs = selenium_driver.retrieve_last_remote_control_logs
  #
  #   logs.should =~ %r{request: getNewBrowserSession\[\*[a-z0-9]+, http://localhost:4567, , \]}
  #   logs.should =~ %r{request: open\[http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html, \]}
  #   logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
  #   logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  # end
  #
  # it "can retrieve logs even when commands were issued" do
  #   page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
  #   page.get_title
  #   logs = selenium_driver.retrieve_last_remote_control_logs
  #
  #   logs.should =~ %r{request: getNewBrowserSession\[\*[a-z0-9]+, http://localhost:4567, , \]}
  #   logs.should =~ %r{request: open\[http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html, \]}
  #   logs.should =~ %r{request: getTitle\[, \]}
  #   logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
  #   logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  # end
end