module Selenium
  module WebDriver
    module IPhone
      class Bridge < Remote::Bridge

        DEFAULT_URL = "http://#{Platform.localhost}:3001/hub/"

        def initialize(opts = nil)
          if opts
            super
          else
            super(
              :url                  => DEFAULT_URL,
              :desired_capabilities => capabilities
            )
          end
        end

        def browser
          :iphone
        end

        def driver_extensions
          []
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.iphone
        end

      end # Bridge
    end # IPhone
  end # WebDriver
end # Selenium