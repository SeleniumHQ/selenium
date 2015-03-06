module Selenium
  module WebDriver
    module SpecSupport
      module Helpers

        def driver
          GlobalTestEnv.driver_instance
        end

        def reset_driver!
          GlobalTestEnv.reset_driver!
        end

        def url_for(filename)
          GlobalTestEnv.url_for filename
        end

        def fix_windows_path(path)
          return path unless WebDriver::Platform.os == :windows

          if GlobalTestEnv.browser == :ie
            path = path[%r[file://(.*)], 1]
            path.gsub!("/", '\\')

            "file://#{path}"
          else
            path.sub(%r[file:/{0,2}], "file:///")
          end
        end

        def long_wait
          @long_wait ||= Wait.new(:timeout => 30)
        end

        def short_wait
          @short_wait ||= Wait.new(:timeout => 3)
        end

        def wait_for_alert
          wait = Wait.new(:timeout => 5, :ignore => Error::NoAlertPresentError)
          wait.until { driver.switch_to.alert }
        end

        def wait(timeout = 10)
          Wait.new(:timeout => timeout)
        end

      end # Helpers
    end # SpecSupport
  end # WebDriver
end # Selenium