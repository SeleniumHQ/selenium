# frozen_string_literal: true

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
require 'set'
require 'uri'

require 'selenium/webdriver/atoms'
require 'selenium/webdriver/common'
require 'selenium/webdriver/version'

module Selenium
  module WebDriver
    Point     = Struct.new(:x, :y)
    Dimension = Struct.new(:width, :height)
    Rectangle = Struct.new(:x, :y, :width, :height)
    Location  = Struct.new(:latitude, :longitude, :altitude)

    autoload :Chrome,     'selenium/webdriver/chrome'
    autoload :DevTools,   'selenium/webdriver/devtools'
    autoload :Edge,       'selenium/webdriver/edge'
    autoload :Firefox,    'selenium/webdriver/firefox'
    autoload :IE,         'selenium/webdriver/ie'
    autoload :Remote,     'selenium/webdriver/remote'
    autoload :Safari,     'selenium/webdriver/safari'
    autoload :Support,    'selenium/webdriver/support'

    # @api private

    def self.root
      @root ||= File.expand_path('..', __dir__)
    end

    #
    # Create a new Driver instance with the correct bridge for the given browser
    #
    # @overload for(browser)
    #   @param [:ie, :internet_explorer, :edge, :remote, :chrome, :firefox, :ff, :safari] browser The browser to
    #     create the driver for
    # @overload for(browser, opts)
    #   @param [:ie, :internet_explorer, :edge, :remote, :chrome, :firefox, :ff, :safari] browser The browser to
    #     create the driver for
    #   @param [Hash] opts Options passed to Driver.new
    #
    # @return [Driver]
    #
    # @see Selenium::WebDriver::Remote::Driver
    # @see Selenium::WebDriver::Firefox::Driver
    # @see Selenium::WebDriver::IE::Driver
    # @see Selenium::WebDriver::Edge::Driver
    # @see Selenium::WebDriver::Chrome::Driver
    # @see Selenium::WebDriver::Safari::Driver
    #
    # @example
    #
    #   WebDriver.for :firefox, profile: 'some-profile'
    #   WebDriver.for :firefox, profile: Profile.new
    #   WebDriver.for :remote,  url: "http://localhost:4444/wd/hub", desired_capabilities: caps
    #
    # One special argument is not passed on to the bridges, :listener.
    # You can pass a listener for this option to get notified of WebDriver events.
    # The passed object must respond to #call or implement the methods from AbstractEventListener.
    #
    # @see Selenium::WebDriver::Support::AbstractEventListener
    #

    def self.for(*args)
      WebDriver::Driver.for(*args)
    end

    #
    # Returns logger instance that can be used across the whole Selenium.
    #
    # @return [Logger]
    #

    def self.logger
      @logger ||= WebDriver::Logger.new
    end
  end # WebDriver
end # Selenium
