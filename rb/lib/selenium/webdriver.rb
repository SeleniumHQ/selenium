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

require 'childprocess'
require 'tmpdir'
require 'fileutils'
require 'date'
require 'json'

require 'selenium/webdriver/common'

module Selenium
  module WebDriver
    Point     = Struct.new(:x, :y)
    Dimension = Struct.new(:width, :height)
    Location  = Struct.new(:latitude, :longitude, :altitude)

    autoload :Android,   'selenium/webdriver/android'
    autoload :Chrome,    'selenium/webdriver/chrome'
    autoload :Edge,      'selenium/webdriver/edge'
    autoload :Firefox,   'selenium/webdriver/firefox'
    autoload :IE,        'selenium/webdriver/ie'
    autoload :IPhone,    'selenium/webdriver/iphone'
    autoload :PhantomJS, 'selenium/webdriver/phantomjs'
    autoload :Remote,    'selenium/webdriver/remote'
    autoload :Safari,    'selenium/webdriver/safari'
    autoload :Support,   'selenium/webdriver/support'

    # @api private

    def self.root
      @root ||= File.expand_path("../..", __FILE__)
    end

    #
    # Create a new Driver instance with the correct bridge for the given browser
    #
    # @param browser [:ie, :internet_explorer, :edge, :remote, :chrome, :firefox, :ff, :android, :iphone, :phantomjs, :safari]
    #   the driver type to use
    # @param *rest
    #   arguments passed to Bridge.new
    #
    # @return [Driver]
    #
    # @see Selenium::WebDriver::Remote::Bridge
    # @see Selenium::WebDriver::Firefox::Bridge
    # @see Selenium::WebDriver::IE::Bridge
    # @see Selenium::WebDriver::Edge::Bridge
    # @see Selenium::WebDriver::Chrome::Bridge
    # @see Selenium::WebDriver::Android::Bridge
    # @see Selenium::WebDriver::IPhone::Bridge
    # @see Selenium::WebDriver::PhantomJS::Bridge
    # @see Selenium::WebDriver::Safari::Bridge
    #
    # @example
    #
    #   WebDriver.for :firefox, :profile => "some-profile"
    #   WebDriver.for :firefox, :profile => Profile.new
    #   WebDriver.for :remote,  :url => "http://localhost:4444/wd/hub", :desired_capabilities => caps
    #
    # One special argument is not passed on to the bridges, :listener. You can pass a listener for this option
    # to get notified of WebDriver events. The passed object must respond to #call or implement the methods from AbstractEventListener.
    #
    # @see Selenium::WebDriver::Support::AbstractEventListener
    #

    def self.for(*args)
      WebDriver::Driver.for(*args)
    end

  end # WebDriver
end # Selenium
