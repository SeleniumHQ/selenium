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

          it 'sets passed profile' do
            opt = Options.new(profile: 'foo')
            expect(opt.profile).to eq('foo')
          end

          it 'sets passed log level' do
            opt = Options.new(log_level: 'debug')
            expect(opt.log_level).to eq('debug')
          end

          it 'sets passed options' do
            opt = Options.new(options: {foo: 'bar'})
            expect(opt.options[:foo]).to eq('bar')
          end
        end

        describe '#binary=' do
          it 'sets the binary path' do
            subject.binary = '/foo/bar'
            expect(subject.binary).to eq('/foo/bar')
          end
        end

        describe '#log_level=' do
          it 'sets the log level' do
            subject.log_level = :debug
            expect(subject.log_level).to eq(:debug)
          end
        end

        describe '#profile=' do
          it 'sets the profile' do
            profile = Profile.new
            subject.profile = profile
            expect(subject.profile).to eq(profile)
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

        describe '#as_json' do
          it 'converts to a json hash' do
            profile = Profile.new
            expect(profile).to receive(:encoded).and_return('foo')

            opts = Options.new(args: ['foo'],
                               binary: '/foo/bar',
                               prefs: {a: 1},
                               options: {foo: :bar},
                               profile: profile,
                               log_level: :debug)
            json = opts.as_json

            expect(json['moz:firefoxOptions'][:args]).to include('foo')
            expect(json['moz:firefoxOptions'][:binary]).to eq('/foo/bar')
            expect(json['moz:firefoxOptions'][:prefs]).to include(a: 1)
            expect(json['moz:firefoxOptions'][:foo]).to eq(:bar)
            expect(json['moz:firefoxOptions'][:profile]).to eq('foo')
            expect(json['moz:firefoxOptions'][:log]).to include(level: :debug)
          end
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
