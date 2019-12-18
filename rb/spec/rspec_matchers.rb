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

RSpec::Matchers.define :have_deprecated do |deprecation|
  match do |actual|
    # Suppresses logging output to stdout while ensuring that it is still happening
    default_output = Selenium::WebDriver.logger.io
    tempfile = Tempfile.new
    Selenium::WebDriver.logger.output = tempfile

    actual.call

    Selenium::WebDriver.logger.output = default_output
    @deprecations_found = (tempfile.rewind && tempfile.read).scan(/DEPRECATION\] \[:([^\]]*)\]/).flatten.map(&:to_sym)
    expect(Array(deprecation).sort).to eq(@deprecations_found.sort)
  end

  failure_message do
    but_message = if @deprecations_found.nil? || @deprecations_found.empty?
                    'no deprecations were found'
                  else
                    "instead these deprecations were found: [#{@deprecations_found.join(', ')}]"
                  end
    "expected :#{deprecation} to have been deprecated, but #{but_message}"
  end

  failure_message_when_negated do
    but_message = "it was found among these deprecations: [#{@deprecations_found.join(', ')}]"
    "expected :#{deprecation} not to have been deprecated, but #{but_message}"
  end

  def supports_block_expectations?
    true
  end
end
