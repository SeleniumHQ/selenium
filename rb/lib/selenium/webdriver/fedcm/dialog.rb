# frozen_string_literal: true

module Selenium
  module WebDriver
    module FedCM
      class Dialog
        def initialize(bridge)
          @bridge = bridge
        end

        DIALOG_TYPE_ACCOUNT_LIST = 'AccountChooser'
        DIALOG_TYPE_AUTO_REAUTH = 'AutoReauthn'

        # Closes the dialog as if the user had clicked X.
        def cancel
          @bridge.execute :cancel_fedcm_dialog
        end

        # Selects an account as if the user had clicked on it.
        #
        # @param [Integer] index The index of the account to select from the list returned by get_accounts.
        def select_account(index)
          @bridge.execute :select_fedcm_account, index: index
        end

        # Returns the type of the open dialog.
        #
        # One of DIALOG_TYPE_ACCOUNT_LIST and DIALOG_TYPE_AUTO_REAUTH.
        def type
          @bridge.execute :get_fedcm_dialog_type
        end

        # Returns the title of the dialog.
        def title
          @bridge.execute(:get_fedcm_title).fetch('title')
        end

        # Returns the subtitle of the dialog or nil if none.
        def subtitle
          @bridge.execute(:get_fedcm_title).fetch('subtitle', nil)
        end

        # Returns the accounts shown in the account chooser.
        #
        # If this is an auto reauth dialog, returns the single account that is being signed in.
        def accounts
          @bridge.execute :get_fedcm_account_list
        end
      end # Dialog
    end # FedCM
  end # WebDriver
end # Selenium
