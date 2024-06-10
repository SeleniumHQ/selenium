require_relative '../spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe Dialog, exclusive: {browser: :chrome} do
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
            expect { dialog.select_account(1) }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when cancelling the dialog' do
            expect { dialog.cancel }.to raise_error(Error::NoSuchAlertError)
          end
        end

        context 'with dialog present' do
          let(:wait) { Wait.new(timeout: 15) }

          before do
            idp_button.click
            wait.until { continue_button.displayed? }
            continue_button.click
            wait.until { sign_in_button.displayed? }
            sign_in_button.click
            wait.until { visit_rp_button.displayed? }
            visit_rp_button.click
            wait.until { driver.current_url == url }
            wait.until { sign_out_button.displayed? }
            sign_out_button.click
            driver.wait_for_fedcm_dialog(timeout: 15)
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

          private

          def idp_button = driver.find_element(id: 'idp')
          def continue_button = driver.find_element(xpath: '//input[@value="Continue"]')
          def sign_in_button = driver.find_element(xpath: '//input[@value="Sign-In"]')
          def sign_out_button = driver.find_element(xpath: '//*[@id="profile"]/mwc-button[1]')
          def visit_rp_button = driver.find_element(xpath: '//html/body/main/mwc-button[2]')
        end
      end
    end # FedCm
  end # WebDriver
end # Selenium
