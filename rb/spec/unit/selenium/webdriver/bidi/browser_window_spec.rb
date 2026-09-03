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
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/browser/window', __dir__)

module Selenium
  module WebDriver
    class BiDi
      class Browser
        describe Window do
          let(:mock_bidi) { instance_double(BiDi, 'Bidi') }
          let(:handle) { 'window-1' }
          let(:window) do
            described_class.new(
              mock_bidi,
              handle: handle,
              active: true,
              height: 600,
              width: 800,
              x: 0,
              y: 0,
              state: 'normal'
            )
          end

          before { allow(mock_bidi).to receive(:send_cmd).and_return({}) }

          describe '#set_state' do
            it 'sends named-state payload for maximized' do
              window.set_state(state: :maximized)

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState', clientWindow: handle, state: 'maximized')
            end

            it 'sends rect-state payload with top-level width/height/x/y for normal' do
              window.set_state(state: :normal, width: 1024, height: 768, x: 100, y: 50)

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState',
                      clientWindow: handle, state: 'normal',
                      width: 1024, height: 768, x: 100, y: 50)
            end

            it 'omits nil rect fields' do
              window.set_state(state: :normal, width: 1024, height: 768)

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState',
                      clientWindow: handle, state: 'normal', width: 1024, height: 768)
            end

            it 'updates local attributes after send' do
              window.set_state(state: :normal, width: 1024, height: 768, x: 100, y: 50)

              expect(window.state).to eq(:normal)
              expect(window.width).to eq(1024)
              expect(window.height).to eq(768)
              expect(window.x).to eq(100)
              expect(window.y).to eq(50)
            end
          end

          describe '#maximize' do
            it 'sends state "maximized"' do
              window.maximize

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState', clientWindow: handle, state: 'maximized')
            end
          end

          describe '#minimize' do
            it 'sends state "minimized"' do
              window.minimize

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState', clientWindow: handle, state: 'minimized')
            end
          end

          describe '#fullscreen' do
            it 'sends state "fullscreen"' do
              window.fullscreen

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState', clientWindow: handle, state: 'fullscreen')
            end
          end

          describe '#resize' do
            it 'sends state "normal" with width/height at top level' do
              window.resize(width: 800, height: 600)

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState',
                      clientWindow: handle, state: 'normal', width: 800, height: 600)
            end

            it 'includes x/y when provided' do
              window.resize(width: 800, height: 600, x: 10, y: 20)

              expect(mock_bidi).to have_received(:send_cmd)
                .with('browser.setClientWindowState',
                      clientWindow: handle, state: 'normal',
                      width: 800, height: 600, x: 10, y: 20)
            end
          end
        end
      end
    end
  end
end
