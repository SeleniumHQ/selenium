# frozen_string_literal: true

module Selenium
  module WebDriver
    module FedCM
      class Dialog
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

        def fedcm_command_list
          FEDCM_COMMANDS.merge(self.class::COMMANDS)
        end

        def fedcm_commands(command)
          fedcm_command_list[command]
        end

        # Closes the dialog as if the user had clicked X.
        def cancel_fedcm_dialog
          execute :cancel_fedcm_dialog
        end

        # Selects an account as if the user had clicked on it.
        #
        # @param [Integer] index The index of the account to select from the list returned by get_accounts.
        def select_fedcm_account(index)
          execute :select_fedcm_account, index: index
        end

        # Returns the type of the open dialog.
        #
        # One of DIALOG_TYPE_ACCOUNT_LIST and DIALOG_TYPE_AUTO_REAUTH.
        def fedcm_type
          execute :get_fedcm_dialog_type
        end

        # Returns the title of the dialog.
        def fedcm_title
          execute(:get_fedcm_title).fetch('title')
        end

        # Returns the subtitle of the dialog or nil if none.
        def fedcm_subtitle
          execute(:get_fedcm_title).fetch('subtitle', nil)
        end

        # Returns the accounts shown in the account chooser.
        #
        # If this is an auto reauth dialog, returns the single account that is being signed in.
        def fedcm_accounts
          execute :get_fedcm_account_list
        end
      end # Dialog
    end # FedCM
  end # WebDriver
end # Selenium
