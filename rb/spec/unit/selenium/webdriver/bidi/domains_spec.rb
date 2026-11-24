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
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/protocol', __dir__)

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Domains do
          let(:connection) { instance_double(WebDriver::WebSocketConnection, send_cmd: nil) }
          let(:includer) do
            Class.new do
              include Domains

              attr_reader :connection

              def initialize(connection)
                @connection = connection
              end
            end
          end
          let(:accessors) { described_class.instance_methods(false) }

          it 'has one accessor per generated domain' do
            classes = accessors.map { |name| includer.new(connection).public_send(name).class }

            expect(classes).to match_array(Domain.subclasses)
          end

          it 'names each accessor after its domain' do
            host = includer.new(connection)

            expect(host.bidi_browsing_context).to be_an_instance_of(BrowsingContext)
            expect(host.bidi_network).to be_an_instance_of(Network)
            expect(host.bidi_web_extension).to be_an_instance_of(WebExtension)
            expect(host.bidi_moz_debugging).to be_an_instance_of(MozDebugging)
          end

          it 'builds each domain over the connection of the class that includes it' do
            host = includer.new(connection)

            accessors.each { |name| expect(host.public_send(name).send(:connection)).to be(connection) }
          end

          it 'memoizes each domain' do
            host = includer.new(connection)

            accessors.each do |name|
              domain = host.public_send(name)

              expect(host.public_send(name)).to be(domain)
            end
          end

          it 'raises a generic error when the includer has no connection' do
            expect { includer.new(nil).bidi_network }
              .to raise_error(Error::WebDriverError, 'No BiDi connection is available for this session')
          end

          it 'raises the message of an includer that overrides it' do
            includer.class_eval { def connection_error_message = 'enable BiDi my way' }

            expect { includer.new(nil).bidi_network }.to raise_error(Error::WebDriverError, 'enable BiDi my way')
          end
        end
      end
    end
  end
end
