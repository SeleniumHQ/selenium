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
    module Edge
      describe Options do
        subject(:options) { described_class.new }

        describe '#initialize' do
          it 'sets private value' do
            opt = described_class.new(in_private: true)
            expect(opt.in_private).to eq(true)
          end

          it 'sets start page' do
            url = 'http://example.com'
            opt = described_class.new(start_page: url)
            expect(opt.start_page).to eq(url)
          end

          it 'sets extension paths' do
            paths = ['/path1', '/path2']
            allow(File).to receive(:directory?).and_return(true)

            opt = described_class.new(extension_paths: paths)
            expect(opt.extension_paths).to eq(paths)
          end

          it 'sets passed options' do
            opt = described_class.new(edge_options: {foo: 'bar'})
            expect(opt.edge_options[:foo]).to eq('bar')
          end
        end

        describe '#add_extension path' do
          it 'adds extension path to the list' do
            options.add_extension_path(__dir__)
            expect(options.extension_paths).to eq([__dir__])
          end

          it 'raises error if path is not a directory' do
            expect { options.add_extension_path(__FILE__) }.to raise_error(Error::WebDriverError)
          end
        end

        describe '#as_json' do
          it 'returns JSON hash' do
            allow(File).to receive(:directory?).and_return(true)

            options = described_class.new(in_private: true,
                                          extension_paths: ['/path1', '/path2'],
                                          start_page: 'http://seleniumhq.org',
                                          edge_options: {foo: 'bar'},
                                          'custom:options': {bar: 'foo'})

            expect(options.as_json).to eq('browserName' => 'MicrosoftEdge',
                                          'custom:options' => {'bar' => 'foo'},
                                          'ms:inPrivate' => true,
                                          'ms:extensionPaths' => ['/path1', '/path2'],
                                          'ms:startPage' => 'http://seleniumhq.org',
                                          'ms:foo' => 'bar')
          end
        end
      end # Options
    end # Edge
  end # WebDriver
end # Selenium
