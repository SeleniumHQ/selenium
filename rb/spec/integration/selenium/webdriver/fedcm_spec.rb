require_relative 'spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe FedCM, only: {browser: :chrome} do
        let(:dialog) { driver.fedcm_dialog }

        before do
          quit_driver
          options = Selenium::WebDriver::Chrome::Options.new
          # options.accept_insecure_certs = true
          options.add_argument('host-resolver-rules=MAP localhost:443')
          options.add_argument('ignore-certificate-errors')

          @driver = Selenium::WebDriver.for :chrome, options: options
          @driver.navigate.to url_for('fedcm/fedcm.html')
        end

        context 'without dialog present' do
          it 'throws an error when getting the title' do
            expect { dialog.title }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when getting the subtitle' do
            expect { dialog.subtitle }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when getting the type' do
            expect { dialog.type }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when getting the accounts' do
            expect { dialog.accounts }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when selecting an account' do
            expect { dialog.select_account(1) }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when cancelling the dialog' do
            expect { dialog.cancel }.to raise_error(Error::NoSuchAlertError)
          end
        end

        context 'with dialog present' do
          before do
            @driver.execute_script('triggerFedCm()')
          end

          it 'returns the title' do
            expect(dialog.title).to eq('Sign in to fedcm-rp-demo.glitch.me with fedcm-idp-demo.glitch.me')
          end

          it 'returns the subtitle' do
            expect(dialog.subtitle).to be_nil
          end

          it 'returns the type' do
            expect(dialog.type).to eq('AccountChooser')
          end

          it 'returns the accounts' do
            first_account = dialog.accounts.first
            expect(first_account.name).to eq 'Elisa Beckett'
          end

          it 'returns an account' do
            expect(dialog.select_account(0)).to be_nil
          end

          it 'clicks the dialog' do
            expect(dialog.click).to be_nil
          end

          it 'cancels the dialog' do
            dialog.cancel
            expect { dialog.title }.to raise_error(Error::NoSuchAlertError)
          end
        end
      end
    end # FedCm
  end # WebDriver
end # Selenium
