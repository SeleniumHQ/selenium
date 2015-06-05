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

require File.expand_path(__FILE__ + '/../../spec_helper')
require 'selenium/webdriver'

describe "WebDriver-backed Selenium::Client" do
  let(:webdriver) { Selenium::WebDriver.for :remote }
  let(:selenium) {
    Selenium::Client::Driver.new :host    => test_environment.server_host,
                                 :port    => test_environment.server_port,
                                 :browser => "*webdriver",
                                 :url     => test_environment.app_url

  }
  after { selenium.stop }

  it 'can wrap an existing Selenium::WebDriver::Driver instance' do
    selenium.start :driver => webdriver

    selenium.open '/'
    selenium.title.should == webdriver.title
  end
end
