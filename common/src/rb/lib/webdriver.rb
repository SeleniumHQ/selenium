require "tmpdir"
require "fileutils"

require "webdriver/core_ext/dir"
require "webdriver/error"
require "webdriver/platform"
require "webdriver/child_process"
require "webdriver/target_locator"
require "webdriver/navigation"
require "webdriver/options"
require "webdriver/find"
require "webdriver/bridge_helper"
require "webdriver/driver"
require "webdriver/element"

begin
  require "json" # gem dependency
rescue LoadError => e
  msg = WebDriver::Platform.jruby? ? "jruby -S gem install json-jruby" : "gem install json"


  raise LoadError, <<-END
       #{e.message}

       You need to install the json gem or require rubygems:
           #{msg}
  END
end



module WebDriver
  Point     = Struct.new(:x, :y)
  Dimension = Struct.new(:width, :heigth)

  autoload :IE,      'webdriver/ie'
  autoload :Remote,  'webdriver/remote'
  autoload :Chrome,  'webdriver/chrome'
  autoload :Firefox, 'webdriver/firefox'

  def self.root
    @root ||= File.expand_path(File.join(File.dirname(__FILE__), "..", "..", "..", ".."))
  end

  def self.for(*args)
    WebDriver::Driver.for(*args)
  end

end

Thread.abort_on_exception = true
