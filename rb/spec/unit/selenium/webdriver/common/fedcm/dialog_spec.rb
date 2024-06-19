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

require File.expand_path('../../spec_helper', __dir__)

module Selenium
  module WebDriver
    module FedCM
      describe Dialog do
        let(:bridge) { instance_double(Remote::Bridge) }
        let(:dialog) { described_class.new(bridge) }

        describe '#click' do
          it 'calls click_fedcm_dialog on the bridge' do
            allow(bridge).to receive(:click_fedcm_dialog_button).and_return(nil)
            expect(dialog.click).to be_nil
          end
        end

        describe '#cancel' do
          it 'calls cancel_fedcm_dialog on the bridge' do
            allow(bridge).to receive(:cancel_fedcm_dialog).and_return(nil)
            expect(dialog.cancel).to be_nil
          end
        end

        describe '#select_account' do
          it 'calls select_fedcm_account on the bridge with the given index' do
            index = 1
            allow(bridge).to receive(:select_fedcm_account).with(index).and_return(nil)
            expect(dialog.select_account(index)).to be_nil
          end
        end

        describe '#type' do
          it 'returns the type of the open dialog' do
            allow(bridge).to receive(:fedcm_dialog_type).and_return('AccountChooser')
            expect(dialog.type).to eq('AccountChooser')
          end
        end

        describe '#title' do
          it 'returns the title of the dialog' do
            allow(bridge).to receive(:fedcm_title).and_return('Sign in')
            expect(dialog.title).to eq('Sign in')
          end
        end

        describe '#subtitle' do
          it 'returns the subtitle of the dialog' do
            allow(bridge).to receive(:fedcm_subtitle).and_return('Choose an account')
            expect(dialog.subtitle).to eq('Choose an account')
          end

          it 'returns nil if there is no subtitle' do
            allow(bridge).to receive(:fedcm_subtitle).and_return(nil)
            expect(dialog.subtitle).to be_nil
          end
        end

        describe '#accounts' do
          it 'returns the accounts shown in the account chooser' do
            accounts_data = [{'name' => 'Account1', 'email' => 'account1@example.com'},
                             {'name' => 'Account2', 'email' => 'account2@example.com'}]
            allow(bridge).to receive(:fedcm_account_list).and_return(accounts_data)
            accounts = dialog.accounts
            expect(accounts.size).to eq(2)
            expect(accounts[0].name).to eq('Account1')
            expect(accounts[0].email).to eq('account1@example.com')
            expect(accounts[1].name).to eq('Account2')
            expect(accounts[1].email).to eq('account2@example.com')
          end
        end
      end # Dialog
    end # FedCM
  end # WebDriver
end # Selenium
