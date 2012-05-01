require 'childprocess'
require 'tmpdir'
require 'fileutils'
require 'date'

require 'multi_json'
require 'selenium/webdriver/common'

module Selenium
  module WebDriver
    extend JsonHelper

    Point     = Struct.new(:x, :y)
    Dimension = Struct.new(:width, :height)
    Location  = Struct.new(:latitude, :longitude, :altitude)

    autoload :Android, 'selenium/webdriver/android'
    autoload :Chrome,  'selenium/webdriver/chrome'
    autoload :Firefox, 'selenium/webdriver/firefox'
    autoload :IE,      'selenium/webdriver/ie'
    autoload :IPhone,  'selenium/webdriver/iphone'
    autoload :Opera,   'selenium/webdriver/opera'
    autoload :Remote,  'selenium/webdriver/remote'
    autoload :Safari,  'selenium/webdriver/safari'
    autoload :Support, 'selenium/webdriver/support'

    # @api private

    def self.root
      @root ||= File.expand_path("../..", __FILE__)
    end

    #
    # Create a new Driver instance with the correct bridge for the given browser
    #
    # @param browser [:ie, :internet_explorer, :remote, :chrome, :firefox, :ff, :android, :iphone, :opera, :safari]
    #   the driver type to use
    # @param *rest
    #   arguments passed to Bridge.new
    #
    # @return [Driver]
    #
    # @see Selenium::WebDriver::Remote::Bridge
    # @see Selenium::WebDriver::Firefox::Bridge
    # @see Selenium::WebDriver::IE::Bridge
    # @see Selenium::WebDriver::Chrome::Bridge
    # @see Selenium::WebDriver::Android::Bridge
    # @see Selenium::WebDriver::IPhone::Bridge
    # @see Selenium::WebDriver::Opera::Bridge
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
