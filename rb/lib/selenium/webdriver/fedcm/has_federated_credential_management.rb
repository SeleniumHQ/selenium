module HasFederatedCredentialManagement
  def execute_fedcm(cmd, **params)
    @bridge.send_command(cmd: cmd, params: params)
  end
  # Disables the promise rejection delay for FedCM.
  #
  # FedCM by default delays promise resolution in failure cases for privacy reasons.
  # This method allows turning it off to let tests run faster where this is not relevant.
  def set_delay_enabled(enabled)
    # Implementation to disable the delay
    # Placeholder for actual code to interact with browser APIs or other integrations.
  end

  # Resets the FedCM dialog cooldown.
  #
  # If a user agent triggers a cooldown when the account chooser is dismissed,
  # this method resets that cooldown so that the dialog can be triggered again immediately.
  def reset_cooldown
    # Implementation to reset the cooldown
    # Placeholder for actual code to interact with browser APIs or other integrations.
  end

  # Gets the currently open FedCM dialog, or nil if there is no dialog.
  #
  # This can be used similar to WebDriverWait in Selenium to wait until a dialog appears.
  def federated_credential_management_dialog
    # Implementation to retrieve the dialog
    # Placeholder for actual code to check the dialog's presence.
  end
end
