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
    describe Error do
      context 'backwards compatibility' do
        it 'aliases StaleElementReferenceError as ObsoleteElementError' do
          expect {
            raise Error::StaleElementReferenceError
          }.to raise_error(Error::ObsoleteElementError)
        end

        it 'aliases UnknownError as UnhandledError' do
          expect {
            raise Error::UnknownError
          }.to raise_error(Error::UnhandledError)
        end

        it 'aliases JavascriptError as UnexpectedJavascriptError' do
          expect {
            raise Error::JavascriptError
          }.to raise_error(Error::UnexpectedJavascriptError)
        end

        it 'aliases NoAlertPresentError as NoAlertOpenError' do
          expect {
            raise Error::NoAlertPresentError
          }.to raise_error(Error::NoAlertOpenError)
        end

        it 'aliases ElementNotVisibleError as ElementNotDisplayedError' do
          expect {
            raise Error::ElementNotVisibleError
          }.to raise_error(Error::ElementNotDisplayedError)
        end
      end
    end
  end # WebDriver
end # Selenium
