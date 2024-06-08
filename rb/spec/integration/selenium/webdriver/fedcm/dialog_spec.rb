require_relative '../spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe Dialog, exclusive: { browser: :chrome } do
        let(:url) { 'https://fedcm-rp-demo.glitch.me/' }
        let(:dialog) { driver.fedcm_dialog }

        before do
          driver.get(url)
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
            expect { dialog.select_account(0) }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when cancelling the dialog' do
            expect { dialog.cancel }.to raise_error(Error::NoSuchAlertError)
          end
        end
      end
    end # FedCm
  end # WebDriver
end # Selenium
