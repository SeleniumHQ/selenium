module Selenium
  module WebDriver
    module DriverExtensions
      module HasFedCmDialog
        FEDCM_COMMANDS = {
          set_fedcm_delay: [:post, 'session/:session_id/fedcm/setdelayenabled'],
          reset_fedcm_cooldown: [:post, 'session/:session_id/fedcm/resetcooldown']
        }.freeze

        # Disables the promise rejection delay for FedCm.
        #
        # FedCm by default delays promise resolution in failure cases for privacy reasons.
        # This method allows turning it off to let tests run faster where this is not relevant.
        def set_delay_enabled(enabled)
          execute :set_fedcm_delay, enabled: enabled
        end

        # Resets the FedCm dialog cooldown.
        #
        # If a user agent triggers a cooldown when the account chooser is dismissed,
        # this method resets that cooldown so that the dialog can be triggered again immediately.
        def reset_cooldown
          execute :reset_fedcm_cooldown
        end

        def fedcm_dialog
          @fedcm_dialog ||= Selenium::WebDriver::FedCM::Dialog.new(@bridge)
        end
      end # HasFedCmDialog
    end # DriverExtensions
  end # WebDriver
end # Selenium
