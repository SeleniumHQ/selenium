# frozen_string_literal: true

module Selenium
  module WebDriver
    module FedCM
      module Dialog
        FEDCM_COMMANDS = {
          get_fedcm_title: [:get, 'session/:session_id/fedcm/gettitle'],
          get_fedcm_dialog_type: [:get, 'session/:session_id/fedcm/getdialogtype'],
          get_fedcm_account_list: [:get, 'session/:session_id/fedcm/accountlist'],
          click_fedcm_dialog_button: [:post, 'session/:session_id/fedcm/clickdialogbutton'],
          cancel_fedcm_dialog: [:post, 'session/:session_id/fedcm/canceldialog'],
          select_fedcm_account: [:post, 'session/:session_id/fedcm/selectaccount'],
          set_fedcm_delay: [:post, 'session/:session_id/fedcm/setdelayenabled'],
          reset_fedcm_cooldown: [:post, 'session/:session_id/fedcm/resetcooldown']
        }.freeze

        DIALOG_TYPE_ACCOUNT_LIST = 'AccountChooser'
        DIALOG_TYPE_AUTO_REAUTH = 'AutoReauthn'

        def command_list
          FEDCM_COMMANDS.merge(self.class::COMMANDS)
        end

        def commands(command)
          command_list[command]
        end

        # Closes the dialog as if the user had clicked X.
        def cancel
          execute :cancel_fedcm_dialog
        end

        # Selects an account as if the user had clicked on it.
        #
        # @param [Integer] index The index of the account to select from the list returned by get_accounts.
        def select_account(index)
          execute :select_fedcm_account
        end

        # Returns the type of the open dialog.
        #
        # One of DIALOG_TYPE_ACCOUNT_LIST and DIALOG_TYPE_AUTO_REAUTH.
        def type
          execute :get_cast_sinks
        end

        # Returns the title of the dialog.
        def title
          execute(:get_fedcm_title).fetch('title')
        end

        # Returns the subtitle of the dialog or nil if none.
        def subtitle
          execute(:get_fedcm_title).fetch('subtitle', nil)
        end

        # Returns the accounts shown in the account chooser.
        #
        # If this is an auto reauth dialog, returns the single account that is being signed in.
        def accounts
          execute :get_fedcm_account_list
        end
      end # Dialog
    end # FedCM
  end # WebDriver
end # Selenium
