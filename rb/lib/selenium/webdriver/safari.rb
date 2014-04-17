require 'websocket'
require 'pathname'

module Selenium
  module WebDriver
    module Safari

      class << self
        def path=(path)
          Platform.assert_executable(path)
          @path = path
        end

        def path
          @path ||= (
            path = case Platform.os
                   when :windows
                     Platform.find_in_program_files("Safari\\Safari.exe")
                   when :macosx
                     "/Applications/Safari.app/Contents/MacOS/Safari"
                   else
                     Platform.find_binary("Safari")
                   end

            unless File.file?(path) && File.executable?(path)
              raise Error::WebDriverError, "unable to find the Safari executable, please set Selenium::WebDriver::Safari.path= or add it to your PATH."
            end

            path
          )
        end

        def resource_path
          @resource_path ||= Pathname.new(File.expand_path("../safari/resources", __FILE__))
        end
      end

    end
  end
end

require 'selenium/webdriver/safari/browser'
require 'selenium/webdriver/safari/server'
require 'selenium/webdriver/safari/extensions'
require 'selenium/webdriver/safari/options'
require 'selenium/webdriver/safari/bridge'

