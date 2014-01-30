module Selenium
  module WebDriver
    module DriverExtensions
      module HasRemoteStatus

        def remote_status
          @bridge.status
        end

      end
    end
  end
end
