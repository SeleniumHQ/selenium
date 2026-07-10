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

require File.expand_path('../../spec_helper', __dir__)
require File.expand_path('../../../../../../lib/selenium/webdriver/bidi/support/bidi_generate', __dir__)

module BiDiGenerate
  describe '.camel_to_snake' do
    it 'splits camelCase on word boundaries' do
      expect(BiDiGenerate.camel_to_snake('browsingContext')).to eq('browsing_context')
    end

    it 'keeps acronym runs together' do
      expect(BiDiGenerate.camel_to_snake('setBypassCSP')).to eq('set_bypass_csp')
    end
  end

  describe '.enum_key' do
    it 'maps a leading minus before a word to neg_' do
      expect(BiDiGenerate.enum_key('-Infinity')).to eq('neg_infinity')
    end

    it 'maps a leading minus before a digit to neg (no underscore, stays normalcase)' do
      expect(BiDiGenerate.enum_key('-0')).to eq('neg0')
    end

    it 'collapses punctuation' do
      expect(BiDiGenerate.enum_key('dedicated-worker')).to eq('dedicated_worker')
    end
  end
end
