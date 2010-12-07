require "tmpdir"
require "fileutils"
require "date"
require "childprocess"

have_lib = lambda { |lib|
  begin
    require lib
    true
  rescue LoadError
    false
  end
}

unless have_lib["yajl/json_gem"] || have_lib["json"]
  raise LoadError, <<-END

       You need to require rubygems or install one of these gems:

           yajl-ruby (best on MRI)
           json
           json-jruby (native JRuby)
           json_pure (any platform)

  END
end

require "selenium/webdriver/common"

module Selenium
  module WebDriver
    Point     = Struct.new(:x, :y)
    Dimension = Struct.new(:width, :height)

    autoload :Android, 'selenium/webdriver/android'
    autoload :Chrome,  'selenium/webdriver/chrome'
    autoload :IE,      'selenium/webdriver/ie'
    autoload :IPhone,  'selenium/webdriver/iphone'
    autoload :Remote,  'selenium/webdriver/remote'
    autoload :Firefox, 'selenium/webdriver/firefox'

    # @api private

    def self.root
      @root ||= File.expand_path(File.join(File.dirname(__FILE__), ".."))
    end

    #
    # Create a new Driver instance with the correct bridge for the given browser
    #
    # @param browser [:ie, :internet_explorer, :remote, :chrome, :firefox, :ff, :android, :iphone]
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
    #
    # @example
    #
    #   WebDriver.for :firefox, :profile => "some-profile"
    #   WebDriver.for :firefox, :profile => Profile.new
    #   WebDriver.for :remote,  :url => "http://localhost:4444/wd/hub", :desired_capabilities => caps
    #

    def self.for(*args)
      WebDriver::Driver.for(*args)
    end

  end # WebDriver
end # Selenium

Thread.abort_on_exception = true
