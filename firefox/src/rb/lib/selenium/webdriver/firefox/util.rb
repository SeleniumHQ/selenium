module Selenium
  module WebDriver
    module Firefox
      module Util
        module_function

        def app_data_path
          case Platform.os
          when :windows
            "#{ENV['APPDATA']}\\Mozilla\\Firefox"
          when :macosx
            "#{Platform.home}/Library/Application Support/Firefox"
          when :unix, :linux
            "#{Platform.home}/.mozilla/firefox"
          else
            raise "Unknown os: #{Platform.os}"
          end
        end

      end # Util
    end # Firefox
  end # WebDriver
end # Selenium