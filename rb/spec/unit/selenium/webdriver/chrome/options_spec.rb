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
        let(:options) { Options.new }

        context 'when initializing' do
          it 'should set passed args' do
            opt = Options.new(args: %w[foo bar])
            expect(opt.args).to eq(%w[foo bar])
          end

          it 'should set passed prefs' do
            opt = Options.new(prefs: {foo: 'bar'})
            expect(opt.prefs[:foo]).to eq('bar')
          end

          it 'should set passed binary value' do
            opt = Options.new(binary: '/foo/bar')
            expect(opt.binary).to eq('/foo/bar')
          end

          it 'should set passed extensions' do
            opt = Options.new(extensions: ['foo.crx', 'bar.crx'])
            expect(opt.extensions).to eq(['foo.crx', 'bar.crx'])
          end

          it 'should set passed options' do
            opt = Options.new(options: {foo: 'bar'})
            expect(opt.options[:foo]).to eq('bar')
          end

          it 'should set passed emulation options' do
            opt = Options.new(emulation: {foo: 'bar'})
            expect(opt.emulation[:foo]).to eq('bar')
          end
        end # when initializing

        it 'should raise an Error::WebDriverError when the extension file is missing' do
          allow(File).to receive(:file?).with('/foo/bar').and_return false

          expect { options.add_extension('/foo/bar') }.to raise_error(Error::WebDriverError)
        end

        it 'should raise an Error::WebDriverError when the extension file is not .crx' do
          allow(File).to receive(:file?).with('/foo/bar').and_return true

          expect { options.add_extension('/foo/bar') }.to raise_error(Error::WebDriverError)
        end

        it 'should add an extension' do
          allow(File).to receive(:file?).with('/foo/bar.crx').and_return true

          options.add_extension('/foo/bar.crx')
          expect(options.extensions).to include('/foo/bar.crx')
        end

        it 'should add an encoded extension' do
          options.add_encoded_extension('foo')
          expect(options.instance_variable_get(:@encoded_extensions)).to include('foo')
        end

        it 'should set the binary path' do
          options.binary = '/foo/bar'
          expect(options.binary).to eq('/foo/bar')
        end

        it 'should add a command-line argument' do
          options.add_argument('foo')
          expect(options.args).to include('foo')
        end

        it 'should add an option' do
          options.add_option(:foo, 'bar')
          expect(options.options[:foo]).to eq('bar')
        end

        it 'should add a preference' do
          options.add_preference(:foo, 'bar')
          expect(options.prefs[:foo]).to eq('bar')
        end

        it 'should add an emulation option' do
          options.add_emulation_option(:foo, 'bar')
          expect(options.emulation[:foo]).to eq('bar')
        end

        it 'should add an emulated device by name' do
          options.add_emulated_device('Google Nexus 6')
          expect(options.emulation[:deviceName]).to eq('Google Nexus 6')
        end

        it 'should add emulated device metrics' do
          options.add_emulated_device(width: 400)
          expect(options.emulation[:deviceMetrics][:width]).to eq(400)
        end

        let(:file) { instance_double(File) }
        it 'should Base64 encode extensions' do
          allow(File).to receive(:file?).and_return(true)
          allow(File).to receive(:open).with('/foo.crx', 'rb').and_yield(file)
          allow(file).to receive(:read).and_return(:foo)
          expect(Base64).to receive(:strict_encode64).with(:foo)

          options.add_extension('/foo.crx')
          options.as_json
        end

        it 'should convert to a json hash' do
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
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
