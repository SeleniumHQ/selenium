module Selenium
  module WebDriver
    module DriverExtensions
      module HasFedCmDialog
        # Disables the promise rejection delay for FedCm.
        #
        # FedCm by default delays promise resolution in failure cases for privacy reasons.
        # This method allows turning it off to let tests run faster where this is not relevant.
        def delay_enabled(enabled)
          @bridge.set_fedcm_delay(enabled)
        end

        # Resets the FedCm dialog cooldown.
        #
        # If a user agent triggers a cooldown when the account chooser is dismissed,
        # this method resets that cooldown so that the dialog can be triggered again immediately.
        def reset_cooldown
          @bridge.reset_fedcm_cooldown
        end

        def fedcm_dialog
          @fedcm_dialog ||= FedCM::Dialog.new(@bridge)
        end

        def wait_for_fedcm_dialog(timeout: 5, interval: 0.2, message: nil, ignore: nil)
          wait = Selenium::WebDriver::Wait.new(timeout: timeout, interval: interval, message: message, ignore: ignore)
          wait.until do
            fedcm_dialog if fedcm_dialog.type
          rescue Error::NoSuchAlertError
            nil
          end
        end
      end # HasFedCmDialog
    end # DriverExtensions
  end # WebDriver
end # Selenium
