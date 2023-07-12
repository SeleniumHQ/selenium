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
    describe Service do
      let(:service_path) { '/path/to/service' }

      before do
        allow(Platform).to receive(:assert_executable)
        stub_const('Selenium::WebDriver::Service::DEFAULT_PORT', 1234)
        stub_const('Selenium::WebDriver::Service::EXECUTABLE', 'service')
      end

      describe 'browser shortcuts' do
        let(:args) { %w[--foo --bar] }

        it 'creates Chrome instance' do
          service = described_class.chrome(args: args)
          expect(service).to be_a(Chrome::Service)
          expect(service.args).to eq args
        end

        it 'creates Edge instance' do
          service = described_class.edge(args: args)
          expect(service).to be_a(Edge::Service)
          expect(service.args).to eq args
        end

        it 'creates Firefox instance' do
          service = described_class.firefox(args: args)
          expect(service).to be_a(Firefox::Service)
          expect(service.args).to eq args
        end

        it 'creates IE instance' do
          service = described_class.internet_explorer(args: args)
          expect(service).to be_a(IE::Service)
          expect(service.args).to eq args
        end

        it 'creates Safari instance' do
          service = described_class.safari(args: args)
          expect(service).to be_a(Safari::Service)
          expect(service.args).to eq args
        end
      end
    end
  end # WebDriver
end # Selenium
