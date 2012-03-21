require 'libwebsocket'

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
              # TODO: improve this
              File.join(ENV['ProgramFiles'], 'Safari', 'Safari.exe')
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
      end

    end
  end
end

require 'selenium/webdriver/safari/browser'
require 'selenium/webdriver/safari/server'
require 'selenium/webdriver/safari/bridge'

