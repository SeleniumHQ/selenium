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
      around do |example|
        debug = $DEBUG
        $DEBUG = false
        example.call
        $DEBUG = debug
        WebDriver.instance_variable_set(:@logger, nil) # reset cache
      end

      it 'logs warnings by default' do
        expect(WebDriver.logger.level).to eq(2)
        expect(WebDriver.logger).to be_warn
      end

      it 'logs everything if $DEBUG is set to true' do
        $DEBUG = true
        expect(WebDriver.logger.level).to eq(0)
        expect(WebDriver.logger).to be_debug
      end

      it 'allows to change level during execution' do
        WebDriver.logger.level = :info
        expect(WebDriver.logger.level).to eq(1)
        expect(WebDriver.logger).to be_info
      end

      it 'outputs to stdout by default' do
        expect { WebDriver.logger.warn('message') }.to output(/WARN Selenium message/).to_stdout
      end

      it 'allows to output to file' do
        begin
          WebDriver.logger.output = 'test.log'
          WebDriver.logger.warn('message')
          expect(File.read('test.log')).to include('WARN Selenium message')
        ensure
          WebDriver.logger.close
          File.delete('test.log')
        end
      end

      it 'allows to deprecate functionality with replacement' do
        message = /WARN Selenium \[DEPRECATION\] #old is deprecated\. Use #new instead\./
        expect { WebDriver.logger.deprecate('#old', '#new') }.to output(message).to_stdout
      end

      it 'allows to deprecate functionality without replacement' do
        message = /WARN Selenium \[DEPRECATION\] #old is deprecated and will be removed in the next releases\./
        expect { WebDriver.logger.deprecate('#old') }.to output(message).to_stdout
      end
    end
  end # WebDriver
end # Selenium
