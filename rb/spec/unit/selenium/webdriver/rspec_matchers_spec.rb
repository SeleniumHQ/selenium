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
    describe 'log matchers (spec/rspec_matchers.rb)' do
      it 'matches a single id' do
        expect { WebDriver.logger.warn('m', id: :solo) }.to have_warning(:solo)
      end

      it 'matches an entry tagged with multiple ids' do
        expect { WebDriver.logger.warn('m', id: %i[general specific]) }.to have_warning(%i[general specific])
      end

      it 'matches several ids logged across separate calls' do
        expect {
          WebDriver.logger.warn('a', id: :first)
          WebDriver.logger.warn('b', id: :second)
        }.to have_warning(%i[first second])
      end

      it 'asserts message content with a Regexp' do
        expect { WebDriver.logger.error('boom: kaboom', id: :err) }.to have_error(:err, /kaboom/)
      end

      it 'asserts message content on an entry with multiple ids' do
        expect { WebDriver.logger.warn('boom happened', id: %i[general specific]) }
          .to have_warning(%i[general specific], /boom/)
      end

      it 'only matches at the named severity' do
        expect { WebDriver.logger.warn('m', id: :warned) }.not_to have_info(:warned)
      end
    end
  end
end
