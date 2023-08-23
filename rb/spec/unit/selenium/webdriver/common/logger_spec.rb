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
    describe Logger do
      subject(:logger) { described_class.new('Selenium', default_level: :info, ignored: [:logger_info]) }

      around do |example|
        debug = $DEBUG
        $DEBUG = false
        example.call
        $DEBUG = debug
      end

      describe '#new' do
        it 'allows creating a logger with a different progname' do
          other_logger = described_class.new('NotSelenium')
          msg = /WARN NotSelenium message/
          expect { other_logger.warn('message') }.to output(msg).to_stdout_from_any_process
        end

        it 'does not log info from constructor' do
          expect {
            described_class.new('Selenium')
          }.not_to output(/.+/).to_stdout_from_any_process
        end
      end

      describe '#level' do
        it 'logs at warn level by default' do
          expect(logger.level).to eq(1)
          expect(logger).to be_info
        end

        it 'logs at debug level if $DEBUG is set to true' do
          $DEBUG = true
          logger = described_class.new('Selenium')
          $DEBUG = nil
          expect(logger.level).to eq(0)
          expect(logger).to be_debug
        end

        it 'allows changing level by name during execution' do
          logger.level = :error
          expect(logger.level).to eq(3)
          expect(logger).to be_error
        end

        it 'allows changing level by integer during execution' do
          logger.level = 1
          expect(logger).to be_info
        end
      end

      describe '#output' do
        it 'outputs to stdout by default' do
          expect { logger.warn('message') }.to output(/WARN Selenium message/).to_stdout_from_any_process
        end

        it 'allows output to file' do
          logger.output = 'test.log'
          logger.warn('message')
          expect(File.read('test.log')).to include('WARN Selenium message')
        ensure
          logger.close
          File.delete('test.log')
        end
      end

      describe '#debug' do
        before { logger.level = :debug }

        it 'logs message' do
          expect { logger.debug 'String Value' }.to output(/DEBUG Selenium String Value/).to_stdout_from_any_process
        end

        it 'logs single id when set' do
          msg = /DEBUG Selenium \[:foo\] debug message/
          expect { logger.debug('debug message', id: :foo) }.to output(msg).to_stdout_from_any_process
        end

        it 'logs multiple ids when set' do
          msg = /DEBUG Selenium \[:foo, :bar\] debug message/
          expect { logger.debug('debug message', id: %i[foo bar]) }.to output(msg).to_stdout_from_any_process
        end
      end

      describe '#info' do
        it 'logs info on first displayed logging only' do
          logger = described_class.new('Selenium', default_level: :info)

          logger.debug('first')
          expect { logger.info('first') }.to output(/:logger_info/).to_stdout_from_any_process
          expect { logger.info('second') }.not_to output(/:logger_info/).to_stdout_from_any_process
        end

        it 'logs message' do
          expect { logger.info 'String Value' }.to output(/INFO Selenium String Value/).to_stdout_from_any_process
        end

        it 'logs single id when set' do
          msg = /INFO Selenium \[:foo\] info message/
          expect { logger.info('info message', id: :foo) }.to output(msg).to_stdout_from_any_process
        end

        it 'logs multiple ids when set' do
          msg = /INFO Selenium \[:foo, :bar\] info message/
          expect { logger.info('info message', id: %i[foo bar]) }.to output(msg).to_stdout_from_any_process
        end
      end

      describe '#warn' do
        it 'logs message' do
          expect { logger.warn 'String Value' }.to output(/WARN Selenium String Value/).to_stdout_from_any_process
        end

        it 'logs single id when set' do
          msg = /WARN Selenium \[:foo\] warning message/
          expect { logger.warn('warning message', id: :foo) }.to output(msg).to_stdout_from_any_process
        end

        it 'logs multiple ids when set' do
          msg = /WARN Selenium \[:foo, :bar\] warning message/
          expect { logger.warn('warning message', id: %i[foo bar]) }.to output(msg).to_stdout_from_any_process
        end
      end

      describe '#deprecate' do
        it 'allows to deprecate functionality with replacement' do
          message = /WARN Selenium \[DEPRECATION\] #old is deprecated\. Use #new instead\./
          expect { logger.deprecate('#old', '#new') }.to output(message).to_stdout_from_any_process
        end

        it 'allows to deprecate functionality without replacement' do
          message = /WARN Selenium \[DEPRECATION\] #old is deprecated and will be removed in a future release\./
          expect { logger.deprecate('#old') }.to output(message).to_stdout_from_any_process
        end

        it 'allows to deprecate functionality with a reference message' do
          ref_url = 'https://selenium.dev'
          warn_msg = 'WARN Selenium \[DEPRECATION\] #old is deprecated\. Use #new instead\.'
          message = /#{warn_msg} See explanation for this deprecation: #{ref_url}/
          expect { logger.deprecate('#old', '#new', reference: ref_url) }.to output(message).to_stdout_from_any_process
        end

        it 'appends deprecation message with provided block' do
          message = /WARN Selenium \[DEPRECATION\] #old is deprecated\. Use #new instead\. More Details\./
          expect { logger.deprecate('#old', '#new') { 'More Details.' } }.to output(message).to_stdout_from_any_process
        end

        it 'logs single id when set' do
          msg = /WARN Selenium \[:foo\] warning message/
          expect { logger.warn('warning message', id: :foo) }.to output(msg).to_stdout_from_any_process
        end

        it 'logs multiple ids when set' do
          msg = /WARN Selenium \[:foo, :bar\] warning message/
          expect { logger.warn('warning message', id: %i[foo bar]) }.to output(msg).to_stdout_from_any_process
        end
      end

      describe '#ignore' do
        it 'prevents logging when id' do
          logger.ignore(:foo)
          expect { logger.deprecate('#old', '#new', id: :foo) }.not_to output.to_stdout_from_any_process
        end

        it 'prevents logging when ignoring multiple ids' do
          logger.ignore(:foo)
          logger.ignore(:bar)
          expect { logger.deprecate('#old', '#new', id: :foo) }.not_to output.to_stdout_from_any_process
          expect { logger.deprecate('#old', '#new', id: :bar) }.not_to output.to_stdout_from_any_process
        end

        it 'prevents logging when ignoring Array of ids' do
          logger.ignore(%i[foo bar])
          expect { logger.deprecate('#old', '#new', id: %i[foo foobar]) }.not_to output.to_stdout_from_any_process
        end

        it 'prevents logging any deprecation when ignoring :deprecations' do
          logger.ignore(:deprecations)
          expect { logger.deprecate('#old', '#new') }.not_to output.to_stdout_from_any_process
        end
      end

      describe '#allow' do
        it 'logs only allowed ids from method' do
          logger.allow(:foo)
          logger.allow(:bar)
          expect { logger.deprecate('#old', '#new', id: :foo) }.to output(/foo/).to_stdout_from_any_process
          expect { logger.deprecate('#old', '#new', id: :bar) }.to output(/bar/).to_stdout_from_any_process
          expect { logger.deprecate('#old', '#new', id: :foobar) }.not_to output.to_stdout_from_any_process
        end

        it 'logs only allowed ids from Array' do
          logger.allow(%i[foo bar])
          expect { logger.deprecate('#old', '#new', id: :foo) }.to output(/foo/).to_stdout_from_any_process
          expect { logger.deprecate('#old', '#new', id: :bar) }.to output(/bar/).to_stdout_from_any_process
          expect { logger.deprecate('#old', '#new', id: :foobar) }.not_to output.to_stdout_from_any_process
        end

        it 'prevents logging any deprecation when ignoring :deprecations' do
          logger.allow(:deprecations)
          expect { logger.deprecate('#old', '#new') }.to output(/new/).to_stdout_from_any_process
        end
      end
    end
  end # WebDriver
end # Selenium
