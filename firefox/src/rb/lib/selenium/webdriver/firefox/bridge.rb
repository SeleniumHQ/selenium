module Selenium
  module WebDriver
    module Firefox

      # @private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          @binary     = Binary.new
          @launcher   = Launcher.new(
            @binary,
            opts.delete(:port)    || DEFAULT_PORT,
            opts.delete(:profile) || DEFAULT_PROFILE_NAME
          )

          http_client = opts.delete(:http_client)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @launcher.launch

          remote_opts = {
            :url                  => @launcher.url,
            :desired_capabilities => :firefox
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          super(remote_opts)
        end

        def browser
          :firefox
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def quit
          super
          @binary.quit

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
