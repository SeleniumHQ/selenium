require_relative '../spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe Account, exclusive: {browser: :chrome} do
        let(:url) { 'https://fedcm-rp-demo.glitch.me/' }

        def trigger_fed_cm
          driver.execute_script('triggerFedCm()')
        end

        def wait_for_dialog
          wait = Selenium::WebDriver::Wait.new(timeout: 5)
          wait.until { !driver.federated_credential_management_dialog }
        end

        it 'dismisses dialog' do
          reset_driver! do |driver|
            driver.navigate.to url

            wait_for_dialog

            dialog = driver.federated_credential_management_dialog
            expect(dialog.title).to eq('Sign in to localhost with localhost')
            expect(dialog.dialog_type).to eq('AccountChooser')

            dialog.cancel_dialog

            expect { driver.execute_script('await promise') }.to raise_error(Selenium::WebDriver::Error::JavascriptError)
          end
        end

        it 'passes emulated device correctly' do
          reset_driver! do |driver|
            driver.navigate.to url
            expect(driver.federated_credential_management_dialog).to be_nil

            wait_for_dialog

            dialog = driver.federated_credential_management_dialog
            expect(dialog.title).to eq('Sign in to localhost with localhost')
            expect(dialog.dialog_type).to eq('AccountChooser')

            dialog.select_account(0)

            response = driver.execute_script('return await promise')
            expect(response).to include('token' => 'a token')
          end
        end
      end
    end # FedCm
  end
end
