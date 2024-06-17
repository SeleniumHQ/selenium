require_relative 'spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe FedCM, only: { browser: :chrome }, exclusive: {bidi: false, reason: 'Not yet implemented with BiDi'} do
        let(:dialog) { driver.fedcm_dialog }

        before do
          driver.get url_for('fedcm/fedcm.html')
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
            driver.execute_script('triggerFedCm();')
            driver.wait_for_fedcm_dialog
          end

          it 'returns the title' do
            expect(dialog.title).to eq('Sign in to localhost with localhost')
          end

          it 'returns the subtitle' do
            expect(dialog.subtitle).to be_nil
          end

          it 'returns the type' do
            expect(dialog.type).to eq('AccountChooser')
          end

          it 'returns the accounts' do
            first_account = dialog.accounts.first
            expect(first_account.name).to eq 'John Doe'
          end

          it 'selects an account' do
            expect(dialog.select_account(1)).to be_nil
          end

          it 'clicks the dialog', skip: 'Investigate IDP config issue' do
            expect(dialog.click).to be_nil
          end

          it 'cancels the dialog' do
            dialog.cancel
            expect { dialog.title }.to raise_error(Error::NoSuchAlertError)
          end

          it 'sets the delay' do
            expect(driver.enable_fedcm_delay = true).to be_truthy
          end

          it 'resets the cooldown' do
            expect(driver.reset_fedcm_cooldown).to be_nil
          end
        end
      end
    end # FedCm
  end # WebDriver
end # Selenium
