require "tmpdir"
require "fileutils"

require "selenium/webdriver/core_ext/dir"
require "selenium/webdriver/error"
require "selenium/webdriver/platform"
require "selenium/webdriver/child_process"
require "selenium/webdriver/target_locator"
require "selenium/webdriver/navigation"
require "selenium/webdriver/options"
require "selenium/webdriver/find"
require "selenium/webdriver/driver_extensions/takes_screenshot"
require "selenium/webdriver/keys"
require "selenium/webdriver/bridge_helper"
require "selenium/webdriver/driver"
require "selenium/webdriver/element"

begin
  require "json" # gem dependency
rescue LoadError => e
  msg = Selenium::WebDriver::Platform.jruby? ? "jruby -S gem install json-jruby" : "gem install json"


  raise LoadError, <<-END
       #{e.message}

       You need to install the json gem or (require rubygems):
           #{msg}
  END
end


module Selenium
  module WebDriver
    Point     = Struct.new(:x, :y)
    Dimension = Struct.new(:width, :heigth)

    autoload :IE,      'selenium/webdriver/ie'
    autoload :Remote,  'selenium/webdriver/remote'
    autoload :Chrome,  'selenium/webdriver/chrome'
    autoload :Firefox, 'selenium/webdriver/firefox'

    def self.root
      @root ||= File.expand_path(File.join(File.dirname(__FILE__), "..", "..", "..", "..", ".."))
    end

    def self.for(*args)
      WebDriver::Driver.for(*args)
    end

  end # WebDriver
end # Selenium

Thread.abort_on_exception = true
