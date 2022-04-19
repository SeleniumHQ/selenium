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
    module Support
      describe Color do
        it 'converts rgb to rgb' do
          str = 'rgb(1, 2, 3)'
          expect(Color.from_string(str).rgb).to eq(str)
        end

        it 'converts rgb to rgba' do
          str = 'rgb(1, 2, 3)'
          expect(Color.from_string(str).rgba).to eq('rgba(1, 2, 3, 1)')
        end

        it 'converts rgb percent to rgba' do
          str = 'rgb(10%, 20%, 30%)'
          expect(Color.from_string(str).rgba).to eq('rgba(25, 51, 76, 1)')
        end

        it 'allows whitespace in rgb string' do
          str = "rgb(\t1,   2    , 3)"
          expect(Color.from_string(str).rgb).to eq('rgb(1, 2, 3)')
        end

        it 'converts rgba to rgba' do
          str = 'rgba(1, 2, 3, 0.5)'
          expect(Color.from_string(str).rgba).to eq(str)
        end

        it 'converts rgba percent to rgba' do
          str = 'rgba(10%, 20%, 30%, 0.5)'
          expect(Color.from_string(str).rgba).to eq('rgba(25, 51, 76, 0.5)')
        end

        it 'converts hex to hex' do
          str = '#ff00a0'
          expect(Color.from_string(str).hex).to eq(str)
        end

        it 'converts hex to rgb' do
          hex = '#01Ff03'
          rgb = 'rgb(1, 255, 3)'

          expect(Color.from_string(hex).rgb).to eq(rgb)
        end

        it 'converts hex to rgba' do
          hex = '#01Ff03'
          rgba = 'rgba(1, 255, 3, 1)'

          expect(Color.from_string(hex).rgba).to eq(rgba)

          hex = '#00ff33'
          rgba = 'rgba(0, 255, 51, 1)'

          expect(Color.from_string(hex).rgba).to eq(rgba)
        end

        it 'converts rgb to hex' do
          expect(Color.from_string('rgb(1, 255, 3)').hex).to eq('#01ff03')
        end

        it 'converts hex3 to rgba' do
          expect(Color.from_string('#0f3').rgba).to eq('rgba(0, 255, 51, 1)')
        end

        it 'converts hsl to rgba' do
          hsl = 'hsl(120, 100%, 25%)'
          rgba = 'rgba(0, 128, 0, 1)'

          expect(Color.from_string(hsl).rgba).to eq(rgba)

          hsl = 'hsl(100, 0%, 50%)'
          rgba = 'rgba(128, 128, 128, 1)'

          expect(Color.from_string(hsl).rgba).to eq(rgba)
        end

        it 'converts hsla to rgba' do
          hsla = 'hsla(120, 100%, 25%, 1)'
          rgba = 'rgba(0, 128, 0, 1)'

          expect(Color.from_string(hsla).rgba).to eq(rgba)

          hsla = 'hsla(100, 0%, 50%, 0.5)'
          rgba = 'rgba(128, 128, 128, 0.5)'

          expect(Color.from_string(hsla).rgba).to eq(rgba)
        end

        it 'is equal to a color with the same values' do
          rgba  = 'rgba(30, 30, 30, 0.2)'
          other = 'rgba(30, 30, 30, 1)'

          expect(Color.from_string(rgba)).not_to eq(Color.from_string(other))
        end

        it 'implements #hash correctly' do
          a = Color.from_string('#000')
          b = Color.from_string('#001')
          c = Color.from_string('#000')

          h = {}
          h[a] = 1
          h[b] = 2
          h[c] = 3

          expect(h.values.sort).to eq([2, 3])
        end
      end
    end # Support
  end # WebDriver
end # Selenium
