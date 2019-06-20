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
    module Safari
      describe Options do
        describe '#as_json' do
          it 'returns JSON hash' do
            options = Options.new(automatic_inspection: true,
                                  automatic_profiling: false)

            json = options.as_json
            expect(json).to eq('safari:automaticInspection' => true,
                               'safari:automaticProfiling' => false)
          end

          it 'accepts a non-documented value' do
            options = Options.new
            options.options['safari:fooBar'] = true

            json = options.as_json
            expect(json).to eq('safari:fooBar' => true)
          end
        end
      end # Options
    end # Safari
  end # WebDriver
end # Selenium
