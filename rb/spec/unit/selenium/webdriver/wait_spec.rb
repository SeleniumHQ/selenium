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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe Wait do
      def wait(*args)
        Wait.new(*args)
      end

      it 'should wait until the returned value is true' do
        returned = true
        expect(wait.until { returned = !returned }).to be true
      end

      it 'should raise a TimeoutError if the the timer runs out' do
        expect {
          wait(timeout: 0.1).until { false }
        }.to raise_error(Error::TimeoutError)
      end

      it 'should silently capture NoSuchElementErrors' do
        called = false
        block = lambda do
          if called
            true
          else
            called = true
            raise Error::NoSuchElementError
          end
        end

        expect(wait.until(&block)).to be true
      end

      it 'will use the message from any NoSuchElementError raised while waiting' do
        block = -> { raise Error::NoSuchElementError, 'foo' }

        expect {
          wait(timeout: 0.5).until(&block)
        }.to raise_error(Error::TimeoutError, /foo/)
      end

      it 'should let users configure what exceptions to ignore' do
        expect {
          wait(ignore: NoMethodError, timeout: 0.5).until { raise NoMethodError }
        }.to raise_error(Error::TimeoutError, /NoMethodError/)
      end
    end
  end # WebDriver
end # Selenium
