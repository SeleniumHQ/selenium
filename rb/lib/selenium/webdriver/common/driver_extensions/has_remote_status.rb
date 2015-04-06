module Selenium
  module WebDriver
    module DriverExtensions
      module HasRemoteStatus

        def remote_status
          @bridge.status
        end

      end # HasRemoteStatus
    end # DriverExtensions
  end # WebDriver
end # Selenium
