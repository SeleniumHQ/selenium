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
    describe Network do
      let(:reference) { 'https://www.selenium.dev/documentation/warnings/bidi-implementation/' }
      let(:bidi) do
        instance_double(BiDi).as_null_object.tap do |bidi|
          allow(bidi).to receive_messages(session: BiDi::Session.new(bidi), send_cmd: {'intercept' => 'intercept-id'})
        end
      end
      let(:network) { described_class.new(instance_double(Remote::Bridge, bidi: bidi)) }

      before { allow(WebDriver.logger).to receive(:deprecate) }

      it 'deprecates #network once per call in favor of BiDi::Protocol::Network' do
        expect(network.network).to be_a BiDi::Network

        expect(WebDriver.logger).to have_received(:deprecate)
          .with('Network#network', 'BiDi::Protocol::Network.new(driver)', id: :network_bidi, reference: reference)
          .once
      end

      it 'deprecates #bidi once per call under its own name' do
        expect(network.bidi).to be_a BiDi::Network

        expect(WebDriver.logger).to have_received(:deprecate)
          .with('Network#bidi', 'BiDi::Protocol::Network.new(driver)', id: :network_bidi, reference: reference)
          .once
      end

      it 'does not deprecate its own handler bookkeeping' do
        id = network.add_request_handler(&:continue)
        network.add_response_handler(&:continue)
        network.add_authentication_handler('user', 'pass')
        network.remove_handler(id)
        network.clear_handlers

        expect(WebDriver.logger).not_to have_received(:deprecate)
      end
    end
  end
end
