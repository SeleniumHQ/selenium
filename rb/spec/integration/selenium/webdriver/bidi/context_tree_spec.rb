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

require_relative '../spec_helper'
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      describe ContextTree,
               pending_if: {browser_family: :safari,
                            exception: {class: Error::TimeoutError, message: /was announced/},
                            reason: 'Safari sends no BiDi events, so no new context is announced'},
               skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
        let(:tree) { driver.send(:bridge).context_tree }
        let!(:window) { driver.window_handle }

        after { reset_windows(keep: window) }

        def tree_under(context)
          contexts = Protocol::BrowsingContext.new(driver).get_tree(root: context).contexts
          flatten(contexts.first.children)
        end

        def flatten(infos)
          Array(infos).flat_map { |info| [info.context, *flatten(info.children)] }
        end

        def load_nested_frames
          driver.navigate.to url_for('blank.html')
          driver.execute_script(<<~JS, url_for('iframeWithIframe.html'))
            const frame = document.createElement('iframe');
            frame.id = 'outer';
            frame.src = arguments[0];
            document.body.appendChild(frame);
          JS
          wait.until { tree_under(window).size == 2 }
        end

        it 'traces every frame nested in the window to it' do
          load_nested_frames
          frames = tree_under(window)

          expect(frames.map { |frame| tree.top_level(frame) }).to all(eq(window))
        end

        it 'knows a window opened after the session started' do
          driver.switch_to.new_window(:tab)
          tab = driver.window_handle

          expect(tree.top_level(tab)).to eq(tab)
        end

        it 'still traces the frames a page removes to their window' do
          load_nested_frames
          frames = tree_under(window)

          driver.execute_script("document.getElementById('outer').remove()")
          wait.until { tree_under(window).empty? }

          expect(frames.map { |frame| tree.top_level(frame) }).to all(eq(window))
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
