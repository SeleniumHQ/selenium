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
    class BiDi
      describe Browser do
        before { allow(WebDriver.logger).to receive(:deprecate) }

        it 'deprecates construction once in favor of BiDi::Protocol::Browser' do
          described_class.new(instance_double(BiDi))

          expect(WebDriver.logger).to have_received(:deprecate)
            .with('BiDi::Browser',
                  'BiDi::Protocol::Browser.new(driver)',
                  id: :bidi_browser,
                  reference: 'https://www.selenium.dev/documentation/warnings/bidi-implementation/')
            .once
        end
      end
    end
  end
end
