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
            expect { dialog.select_account(1) }.to raise_error(Error::NoSuchAlertError)
          end

          it 'throws an error when cancelling the dialog' do
            expect { dialog.cancel }.to raise_error(Error::NoSuchAlertError)
          end
        end

        context 'with dialog present' do
          before do
            driver.find_element(id: 'idp').click
            Wait.new.until { driver.find_element(xpath: '//input[@value="Continue"]').displayed? }
            driver.find_element(xpath: '//input[@value="Continue"]').click
            Wait.new.until { driver.find_element(xpath: '//input[@value="Sign-In"]').displayed? }
            driver.find_element(xpath: '//input[@value="Sign-In"]').click
            sleep 2
            driver.get(url)
            Wait.new(timeout: 15).until { driver.current_url == url }
            Wait.new(timeout: 15).until { driver.find_element(xpath: '//*[@id="profile"]/mwc-button[1]').displayed? }
            driver.find_element(xpath: '//*[@id="profile"]/mwc-button[1]').click
            sleep 10
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
            expect(dialog.select_account(0)).to eq 'Elisa Beckett'
          end
        end
      end
    end # FedCm
  end # WebDriver
end # Selenium
