# encoding: utf-8
#
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

require File.expand_path('../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Chrome
      describe Options do
        describe '#initialize' do
          it 'sets passed args' do
            opt = Options.new(args: %w[foo bar])
            expect(opt.args).to eq(%w[foo bar])
          end

          it 'sets passed prefs' do
            opt = Options.new(prefs: {foo: 'bar'})
            expect(opt.prefs[:foo]).to eq('bar')
          end

          it 'sets passed binary value' do
            opt = Options.new(binary: '/foo/bar')
            expect(opt.binary).to eq('/foo/bar')
          end

          it 'sets passed extensions' do
            opt = Options.new(extensions: ['foo.crx', 'bar.crx'])
            expect(opt.extensions).to eq(['foo.crx', 'bar.crx'])
          end

          it 'sets passed options' do
            opt = Options.new(options: {foo: 'bar'})
            expect(opt.options[:foo]).to eq('bar')
          end

          it 'sets passed emulation options' do
            opt = Options.new(emulation: {foo: 'bar'})
            expect(opt.emulation[:foo]).to eq('bar')
          end
        end

        describe '#add_extension' do
          it 'adds an extension' do
            allow(File).to receive(:file?).with('/foo/bar.crx').and_return(true)

            subject.add_extension('/foo/bar.crx')
            expect(subject.extensions).to include('/foo/bar.crx')
          end

          it 'raises error when the extension file is missing' do
            allow(File).to receive(:file?).with('/foo/bar').and_return false

            expect { subject.add_extension('/foo/bar') }.to raise_error(Error::WebDriverError)
          end

          it 'raises error when the extension file is not .crx' do
            allow(File).to receive(:file?).with('/foo/bar').and_return true

            expect { subject.add_extension('/foo/bar') }.to raise_error(Error::WebDriverError)
          end
        end

        describe '#add_encoded_extension' do
          it 'adds an encoded extension' do
            subject.add_encoded_extension('foo')
            expect(subject.encoded_extensions).to include('foo')
          end
        end

        describe '#binary=' do
          it 'sets the binary path' do
            subject.binary = '/foo/bar'
            expect(subject.binary).to eq('/foo/bar')
          end
        end

        describe '#add_argument' do
          it 'adds a command-line argument' do
            subject.add_argument('foo')
            expect(subject.args).to include('foo')
          end
        end

        describe '#add_option' do
          it 'adds an option' do
            subject.add_option(:foo, 'bar')
            expect(subject.options[:foo]).to eq('bar')
          end
        end

        describe '#add_preference' do
          it 'adds a preference' do
            subject.add_preference(:foo, 'bar')
            expect(subject.prefs[:foo]).to eq('bar')
          end
        end

        describe '#add_emulation' do
          it 'add an emulated device by name' do
            subject.add_emulation(device_name: 'iPhone 6')
            expect(subject.emulation).to eq(deviceName: 'iPhone 6')
          end

          it 'adds emulated device metrics' do
            subject.add_emulation(device_metrics: {width: 400})
            expect(subject.emulation).to eq(deviceMetrics: {width: 400})
          end

          it 'adds emulated user agent' do
            subject.add_emulation(user_agent: 'foo')
            expect(subject.emulation).to eq(userAgent: 'foo')
          end
        end

        describe '#as_json' do
          it 'encodes extensions to base64' do
            allow(File).to receive(:file?).and_return(true)
            subject.add_extension('/foo.crx')

            allow(File).to receive(:open).and_yield(instance_double(File, read: :foo))
            expect(Base64).to receive(:strict_encode64).with(:foo)
            subject.as_json
          end

          it 'returns a JSON hash' do
            allow(File).to receive(:open).and_return('bar')
            opts = Options.new(args: ['foo'],
                               binary: '/foo/bar',
                               prefs: {a: 1},
                               extensions: ['/foo.crx'],
                               options: {foo: :bar},
                               emulation: {c: 3})
            json = opts.as_json
            expect(json[:args]).to include('foo')
            expect(json[:binary]).to eq('/foo/bar')
            expect(json[:prefs]).to include(a: 1)
            expect(json[:extensions]).to include('bar')
            expect(json[:foo]).to eq(:bar)
            expect(json[:mobileEmulation]).to include(c: 3)
          end
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
