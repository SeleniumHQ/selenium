require "tmpdir"
require "fileutils"

have_yajl = lambda {
  begin
    require "yajl/json_gem"
    true
  rescue LoadError
    false
  end
}

have_json = lambda {
  begin
    require "json"
    true
  rescue LoadError
    false
  end
}

unless have_yajl.call || have_json.call
  raise LoadError, <<-END

       You need to require rubygems or install one of these gems:

           yajl-ruby (best on MRI)
           json
           json-jruby (native JRuby)
           json_pure (any platform)

  END
end


require "selenium/webdriver/core_ext/dir"
require "selenium/webdriver/core_ext/string"
require "selenium/webdriver/error"
require "selenium/webdriver/platform"
require "selenium/webdriver/child_process"
require "selenium/webdriver/file_reaper"
require "selenium/webdriver/zip_helper"
require "selenium/webdriver/target_locator"
require "selenium/webdriver/navigation"
require "selenium/webdriver/timeouts"
require "selenium/webdriver/options"
require "selenium/webdriver/find"
require "selenium/webdriver/driver_extensions/takes_screenshot"
require "selenium/webdriver/keys"
require "selenium/webdriver/bridge_helper"
require "selenium/webdriver/driver"
require "selenium/webdriver/element"

module Selenium
  module WebDriver
    Point     = Struct.new(:x, :y)
    Dimension = Struct.new(:width, :height)

    autoload :IE,      'selenium/webdriver/ie'
    autoload :Remote,  'selenium/webdriver/remote'
    autoload :Chrome,  'selenium/webdriver/chrome'
    autoload :Firefox, 'selenium/webdriver/firefox'

    def self.root
      @root ||= File.expand_path(File.join(File.dirname(__FILE__), ".."))
    end

    #
    # @see Selenium::WebDriver::Driver.for
    #

    def self.for(*args)
      WebDriver::Driver.for(*args)
    end

  end # WebDriver
end # Selenium

Thread.abort_on_exception = true
