require_relative 'spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe FedCM, only: {browser: :chrome} do
        let(:url) { url_for('xhtmlTest.html') }
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
          it 'returns the title' do
            expect(dialog.title).to eq('Test title')
          end

          it 'returns the subtitle' do
            expect(dialog.subtitle).to eq('Test subtitle')
          end

          it 'returns the type' do
            expect(dialog.type).to eq('AccountChooser')
          end

          it 'returns the accounts' do
            first_account = dialog.accounts.first
            expect(first_account.name).to eq 'Test user'
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
