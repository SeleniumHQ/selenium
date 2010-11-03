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
