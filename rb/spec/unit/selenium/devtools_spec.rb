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

require File.expand_path('webdriver/spec_helper', __dir__)
require 'selenium/devtools'

module Selenium
  describe DevTools do
    describe '.load_version' do
      let(:current_version) { Gem::Version.new(Selenium::DevTools::VERSION).segments[1] }

      around do |example|
        described_class.version = version
        example.call
      ensure
        described_class.version = nil
      end

      context 'when the version is too high' do
        let(:version) { current_version + 1 }

        it 'can fall back to an older devtools if necessary' do
          msg1 = /Could not load selenium-devtools v#{version}. Trying older versions/
          msg2 = /Using selenium-devtools version v#{current_version}, some features may not work as expected/
          expect { described_class.load_version }.to output(match(msg1).and(match(msg2))).to_stdout_from_any_process
        end
      end
    end
  end # DevTools
end # Selenium
