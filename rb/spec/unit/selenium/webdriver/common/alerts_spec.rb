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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    describe Alerts do
      let(:bridge) { Remote::Bridge.new(http_client: Remote::Http::Default.new) }

      def behavior_for(first_match, matched)
        described_class.new(bridge, first_match).unhandled_prompt_behavior(Remote::Capabilities.new(**matched))
      end

      describe '#unhandled_prompt_behavior' do
        it 'defaults to dismiss and notify' do
          expect(behavior_for([{'webSocketUrl' => true}], browser_name: 'chrome')).to eq('dismiss and notify')
        end

        it 'reports the requested value' do
          first_match = [{'webSocketUrl' => true, 'unhandledPromptBehavior' => 'accept'}]

          expect(behavior_for(first_match, browser_name: 'chrome')).to eq('accept')
        end

        it 'applies the default entry of a map' do
          first_match = [{'webSocketUrl' => true,
                          'unhandledPromptBehavior' => {'default' => 'accept', 'alert' => 'ignore'}}]
          behavior = nil

          expect { behavior = behavior_for(first_match, browser_name: 'chrome') }
            .to have_deprecated(:unhandled_prompt_behavior)
          expect(behavior).to eq('accept')
        end

        it 'raises for a value the remote end would reject' do
          first_match = [{'webSocketUrl' => true, 'unhandledPromptBehavior' => 'acept'}]

          expect { behavior_for(first_match, browser_name: 'chrome') }
            .to raise_error(ArgumentError, /"acept" is not a valid unhandledPromptBehavior/)
        end

        it 'reports the value of the firstMatch candidate the remote end matched' do
          first_match = [{'webSocketUrl' => true, 'browserName' => 'chrome', 'unhandledPromptBehavior' => 'accept'},
                         {'webSocketUrl' => true, 'browserName' => 'firefox', 'unhandledPromptBehavior' => 'ignore'}]

          expect(behavior_for(first_match, browser_name: 'firefox')).to eq('ignore')
        end
      end
    end
  end # WebDriver
end # Selenium
