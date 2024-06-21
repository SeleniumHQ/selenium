# frozen_string_literal: true

# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require_relative 'spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe FedCM, exclusive: [{bidi: false, reason: 'Not yet implemented with BiDi'}, {browser: %i[chrome edge]}] do
        let(:dialog) { driver.fedcm_dialog }

        before do
          driver.get url_for('fedcm/fedcm.html')
        end

        context 'without dialog present' do
          it 'throws an error' do
            expect { dialog.title }.to raise_error(Error::NoSuchAlertError)
            expect { dialog.subtitle }.to raise_error(Error::NoSuchAlertError)
            expect { dialog.type }.to raise_error(Error::NoSuchAlertError)
            expect { dialog.accounts }.to raise_error(Error::NoSuchAlertError)
            expect { dialog.select_account(1) }.to raise_error(Error::NoSuchAlertError)
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
