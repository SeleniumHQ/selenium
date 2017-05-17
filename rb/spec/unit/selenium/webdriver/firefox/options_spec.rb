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
    module Firefox
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

          it 'should set passed profile' do
            opt = Options.new(profile: 'foo')
            expect(opt.profile).to eq('foo')
          end

          it 'should set passed log level' do
            opt = Options.new(log_level: 'debug')
            expect(opt.log_level).to eq('debug')
          end

          it 'should set passed options' do
            opt = Options.new(options: {foo: 'bar'})
            expect(opt.options[:foo]).to eq('bar')
          end
        end # when initializing

        it 'should set the binary path' do
          options.binary = '/foo/bar'
          expect(options.binary).to eq('/foo/bar')
        end

        it 'should set the log level' do
          options.log_level = :debug
          expect(options.log_level).to eq(:debug)
        end

        it 'should set the profile' do
          profile = Profile.new
          options.profile = profile
          expect(options.profile).to eq(profile)
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

        it 'should encode the profile if it is an instance of Profile' do
          profile = Profile.new
          expect(profile).to receive(:encoded)

          opts = Options.new(profile: profile)
          opts.as_json
        end

        it 'should convert to a json hash' do
          opts = Options.new(args: ['foo'],
                             binary: '/foo/bar',
                             prefs: {a: 1},
                             options: {foo: :bar},
                             profile: :profile,
                             log_level: :debug)
          json = opts.as_json
          expect(json[:args]).to include('foo')
          expect(json[:binary]).to eq('/foo/bar')
          expect(json[:prefs]).to include(a: 1)
          expect(json[:foo]).to eq(:bar)
          expect(json[:profile]).to eq(:profile)
          expect(json[:log]).to include(level: :debug)
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
