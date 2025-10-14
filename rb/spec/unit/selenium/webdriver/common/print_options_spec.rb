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
require 'selenium/webdriver/common/print_options'

module Selenium
  module WebDriver
    describe PrintOptions do
      let(:options) { described_class.new }

      it 'has default values' do
        expect(options.orientation).to eq('portrait')
        expect(options.scale).to eq(1.0)
        expect(options.background).to be(false)
        expect(options.page_size).to eq({width: 21.0, height: 29.7})
        expect(options.margins).to eq({top: 1.0, bottom: 1.0, left: 1.0, right: 1.0})
      end

      it 'can set custom page size' do
        custom_size = {width: 25.0, height: 30.0}
        options.page_size = custom_size
        expect(options.page_size).to eq(custom_size)
      end

      it 'can set predefined page sizes using symbols' do
        options.page_size = :a4
        expect(options.page_size).to eq({width: 21.0, height: 29.7})

        options.page_size = :legal
        expect(options.page_size).to eq({width: 21.59, height: 35.56})

        options.page_size = :tabloid
        expect(options.page_size).to eq({width: 27.94, height: 43.18})

        options.page_size = :letter
        expect(options.page_size).to eq({width: 21.59, height: 27.94})
      end

      it 'raises an error for unsupported predefined page size symbols' do
        expect { options.page_size = :invalid }.to raise_error(ArgumentError, /Invalid page size/)
      end

      it 'can convert to a hash' do
        options.scale = 0.5
        options.background = true
        options.page_ranges = '1-3'
        hash = options.to_h

        expect(hash).to eq(
          {
            orientation: 'portrait',
            scale: 0.5,
            background: true,
            pageRanges: '1-3',
            paperWidth: 21.0,
            paperHeight: 29.7,
            marginTop: 1.0,
            marginBottom: 1.0,
            marginLeft: 1.0,
            marginRight: 1.0
          }
        )
      end
    end
  end
end
