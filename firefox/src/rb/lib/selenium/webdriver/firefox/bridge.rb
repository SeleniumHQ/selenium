module Selenium
  module WebDriver
    module Firefox
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          @binary     = Binary.new
          @launcher   = Launcher.new(
            @binary,
            opts.delete(:port)    || DEFAULT_PORT,
            opts.delete(:profile) || DEFAULT_PROFILE_NAME
          )

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @launcher.launch
          super :url => @launcher.connection.url, :desired_capabilities => :firefox
        end

        def browser
          :firefox
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def quit
          super
          @binary.wait rescue nil # might raise on windows

          nil
        end

        def getScreenshot
          execute :screenshot
        end

        def findElementByCssSelector(parent, selector)
          find_element_by 'css selector', selector, parent
        end

        def findElementsByCssSelector(parent, selector)
          find_elements_by 'css selector', selector, parent
        end

      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
