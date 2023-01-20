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
    describe ActionBuilder do
      after { driver.action.clear_all_actions }

      describe '#send_keys' do
        it 'sends keys to the active element', except: {browser: %i[safari safari_preview]} do
          driver.navigate.to url_for('bodyTypingTest.html')
          keylogger = driver.find_element(id: 'body_result')

          driver.find_element(css: 'body').click
          driver.action.send_keys('ab').perform

          wait.until { keylogger.text.split.length == 2 }
          expect(keylogger.text.strip).to eq('keypress keypress')

          expect(driver.find_element(id: 'result').text.strip).to be_empty
        end

        it 'sends keys to element' do
          driver.navigate.to url_for('formPage.html')

          input = driver.find_element(css: '#working')

          driver.action.send_keys(input, 'abcd').perform
          wait.until { input.attribute(:value).length == 4 }
          expect(input.attribute(:value)).to eq('abcd')
        end

        it 'sends keys with multiple arguments' do
          driver.navigate.to url_for('formPage.html')

          input = driver.find_element(css: '#working')
          input.click

          driver.action.send_keys('abcd', 'dcba').perform
          wait.until { input.attribute(:value).length == 8 }
          expect(input.attribute(:value)).to eq('abcddcba')
        end

        it 'sends non-ASCII keys' do
          driver.navigate.to url_for('formPage.html')

          input = driver.find_element(css: '#working')
          input.click

          driver.action.send_keys('abcd', :left, 'a').perform
          wait.until { input.attribute(:value).length == 5 }
          expect(input.attribute(:value)).to eq('abcad')
        end
      end

      describe 'multiple key presses' do
        it 'sends keys with shift pressed', except: {browser: %i[safari safari_preview]} do
          driver.navigate.to url_for('javascriptPage.html')

          event_input = driver.find_element(id: 'theworks')
          keylogger = driver.find_element(id: 'result')

          event_input.click

          driver.action.key_down(:shift).send_keys('ab').key_up(:shift).perform
          wait.until { event_input.attribute(:value).length == 2 }

          expect(event_input.attribute(:value)).to eq('AB')
          expected = keylogger.text.strip
          expect(expected).to match(/^(focus )?keydown keydown keypress keyup keydown keypress keyup keyup$/)
        end

        it 'press and release modifier keys' do
          driver.navigate.to url_for('javascriptPage.html')

          event_input = driver.find_element(id: 'theworks')
          keylogger = driver.find_element(id: 'result')

          event_input.click

          driver.action.key_down(:shift).perform
          wait.until { keylogger.text.include? 'down' }
          expect(keylogger.text).to match(/keydown *$/)

          driver.action.key_up(:shift).perform
          wait.until { keylogger.text.include? 'up' }
          expect(keylogger.text).to match(/keyup *$/)
        end
      end

      describe '#release_actions' do
        it 'releases pressed keys' do
          driver.navigate.to url_for('javascriptPage.html')

          event_input = driver.find_element(id: 'theworks')
          keylogger = driver.find_element(id: 'result')

          event_input.click

          driver.action.key_down(:shift).perform
          wait.until { keylogger.text.include? 'down' }
          expect(keylogger.text).to match(/keydown *$/)

          driver.action.release_actions
          wait.until { keylogger.text.include? 'up' }
          expect(keylogger.text).to match(/keyup *$/)
        end

        it 'releases pressed buttons', except: [{browser: %i[safari safari_preview]},
                                                {driver: :remote, browser: :ie}] do
          driver.navigate.to url_for('javascriptPage.html')

          event_input = driver.find_element(id: 'clickField')

          driver.action.click_and_hold(event_input).perform
          expect(event_input.attribute(:value)).to eq('Hello')

          driver.action.release_actions
          expect(event_input.attribute(:value)).to eq('Clicked')
        end
      end

      describe '#click' do
        it 'clicks provided element' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'clickField')
          driver.action.click(element).perform
          expect(element.attribute(:value)).to eq('Clicked')
        end

        it 'executes with equivalent pointer methods' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'clickField')
          driver.action.move_to(element).pointer_down(:left).pointer_up(:left).perform
          expect(element.attribute(:value)).to eq('Clicked')
        end
      end

      describe '#double_click' do
        it 'presses pointer twice', except: {browser: %i[safari safari_preview]} do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'doubleClickField')

          driver.action.double_click(element).perform
          expect(element.attribute(:value)).to eq('DoubleClicked')
        end

        it 'executes with equivalent pointer methods' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'doubleClickField')

          driver.action.move_to(element)
                .pointer_down(:left).pointer_up(:left)
                .pointer_down(:left).pointer_up(:left)
                .perform
          expect(element.attribute(:value)).to eq('DoubleClicked')
        end
      end

      describe '#context_click' do
        it 'right clicks an element' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'doubleClickField')

          driver.action.context_click(element).perform
          expect(element.attribute(:value)).to eq('ContextClicked')
        end

        it 'executes with equivalent pointer methods' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'doubleClickField')

          driver.action.move_to(element).pointer_down(:right).pointer_up(:right).perform
          expect(element.attribute(:value)).to eq('ContextClicked')
        end
      end

      describe '#move_to' do
        it 'moves to element' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'clickField')
          driver.action.move_to(element).click.perform

          expect(element.attribute(:value)).to eq('Clicked')
        end

        it 'moves to element with offset', except: {browser: :firefox,
                                                    ci: :github,
                                                    platform: :windows,
                                                    reason: 'Some issues with resolution?'} do
          driver.navigate.to url_for('javascriptPage.html')
          origin = driver.find_element(id: 'keyUpArea')
          destination = driver.find_element(id: 'clickField')
          origin_rect = origin.rect
          destination_rect = destination.rect
          x_offset = (destination_rect.x - origin_rect.x).ceil
          y_offset = (destination_rect.y - origin_rect.y).ceil

          driver.action.move_to(origin, x_offset, y_offset).click.perform
          expect(destination.attribute(:value)).to eq('Clicked')
        end
      end

      describe '#drag_and_drop' do
        it 'moves one element to another' do
          driver.navigate.to url_for('droppableItems.html')

          draggable = long_wait.until do
            driver.find_element(id: 'draggable')
          end

          droppable = driver.find_element(id: 'droppable')

          driver.action.drag_and_drop(draggable, droppable).perform

          text = droppable.find_element(tag_name: 'p').text
          expect(text).to eq('Dropped!')
        end
      end

      describe '#drag_and_drop_by' do
        it 'moves one element a provided distance' do
          driver.navigate.to url_for('droppableItems.html')

          draggable = long_wait.until do
            driver.find_element(id: 'draggable')
          end

          driver.action.drag_and_drop_by(draggable, 138, 50).perform

          droppable = driver.find_element(id: 'droppable')
          text = droppable.find_element(tag_name: 'p').text
          expect(text).to eq('Dropped!')
        end
      end

      describe '#move_to_location' do
        it 'moves pointer to specified coordinates' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'clickField')
          rect = element.rect
          driver.action.move_to_location(rect.x.ceil, rect.y.ceil).click.perform

          expect(element.attribute(:value)).to eq('Clicked')
        end
      end

      describe 'pen stylus', except: {browser: :firefox, reason: 'Unknown pointerType'} do
        it 'sets pointer event properties' do
          driver.navigate.to url_for('pointerActionsPage.html')
          pointer_area = driver.find_element(id: 'pointerArea')
          rect = pointer_area.rect
          x_val = rect.x
          y_val = rect.y

          pointer_options = {pressure: 0.8, tilt_x: -40, tilt_y: -10, twist: 177}
          actions = driver.action(devices: :pen)
                          .move_by(x_val + 5, y_val + 5)
                          .pointer_down
                          .move_by(2, 2, duration: 0.8, **pointer_options)
                          .pointer_up

          start = Time.now
          actions.perform
          expect(Time.now - start).to be > 0.8

          moves = driver.find_elements(class: 'pointermove')
          move_to = properties(moves[0])
          down = properties(driver.find_element(class: 'pointerdown'))
          move_by = properties(moves[1])
          up = properties(driver.find_element(class: 'pointerup'))

          expect(move_to).to include('button' => '-1',
                                     'pageX' => (x_val + 5).to_s,
                                     'pageY' => (y_val + 5).floor.to_s)
          expect(down).to include('button' => '0')
          expect(move_by).to include('button' => '-1',
                                     'pageX' => (x_val + 5 + 2).to_s,
                                     'pageY' => (y_val + 5 + 2).floor.to_s,
                                     'tiltX' => '-40',
                                     'tiltY' => '-10',
                                     'twist' => '177')
          expect(up).to include('button' => '0',
                                'pageX' => (x_val + 5 + 2).to_s,
                                'pageY' => (y_val + 5 + 2).floor.to_s)
        end
      end

      describe '#scroll_to', only: {browser: %i[chrome edge firefox]} do
        it 'scrolls to element',
           except: {browser: :firefox, reason: 'incorrect MoveTargetOutOfBoundsError'} do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html')
          iframe = driver.find_element(tag_name: 'iframe')

          expect(in_viewport?(iframe)).to be false

          driver.action.scroll_to(iframe).perform

          expect(in_viewport?(iframe)).to be true
        end
      end

      describe '#scroll_by', only: {browser: %i[chrome edge firefox]} do
        it 'scrolls by given amount', except: {browser: :firefox,
                                               platform: :macosx,
                                               headless: false,
                                               reason: 'scrolls insufficient number of pixels'} do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html')
          footer = driver.find_element(tag_name: 'footer')
          delta_y = footer.rect.y.round

          driver.action.scroll_by(0, delta_y).perform
          sleep 0.5

          expect(in_viewport?(footer)).to be true
        end
      end

      describe '#scroll_from', only: {browser: %i[chrome edge firefox]} do
        it 'scrolls from element by given amount',
           except: {browser: :firefox, reason: 'incorrect MoveTargetOutOfBoundsError'} do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html')
          iframe = driver.find_element(tag_name: 'iframe')
          scroll_origin = WheelActions::ScrollOrigin.element(iframe)

          driver.action.scroll_from(scroll_origin, 0, 200).perform

          driver.switch_to.frame(iframe)
          sleep 0.5
          checkbox = driver.find_element(name: 'scroll_checkbox')
          expect(in_viewport?(checkbox)).to be true
        end

        it 'scrolls from element by given amount with offset',
           except: {browser: :firefox, reason: 'incorrect MoveTargetOutOfBoundsError'} do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html')
          footer = driver.find_element(tag_name: 'footer')
          scroll_origin = WheelActions::ScrollOrigin.element(footer, 0, -50)

          driver.action.scroll_from(scroll_origin, 0, 200).perform
          sleep 0.5

          iframe = driver.find_element(tag_name: 'iframe')
          driver.switch_to.frame(iframe)
          checkbox = driver.find_element(name: 'scroll_checkbox')
          expect(in_viewport?(checkbox)).to be true
        end

        it 'raises MoveTargetOutOfBoundsError when origin offset from element is out of viewport' do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html')
          footer = driver.find_element(tag_name: 'footer')
          scroll_origin = WheelActions::ScrollOrigin.element(footer, 0, 50)

          expect {
            driver.action.scroll_from(scroll_origin, 0, 200).perform
          }.to raise_error(Error::MoveTargetOutOfBoundsError)
        end

        it 'scrolls by given amount with offset' do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame.html')
          scroll_origin = WheelActions::ScrollOrigin.viewport(10, 10)

          driver.action.scroll_from(scroll_origin, 0, 200).perform

          iframe = driver.find_element(tag_name: 'iframe')
          driver.switch_to.frame(iframe)
          checkbox = driver.find_element(name: 'scroll_checkbox')
          sleep 0.5
          expect(in_viewport?(checkbox)).to be true
        end

        it 'raises MoveTargetOutOfBoundsError when origin offset is out of viewport' do
          driver.navigate.to url_for('scrolling_tests/frame_with_nested_scrolling_frame.html')
          scroll_origin = WheelActions::ScrollOrigin.viewport(-10, -10)

          expect {
            driver.action.scroll_from(scroll_origin, 0, 200).perform
          }.to raise_error(Error::MoveTargetOutOfBoundsError)
        end
      end

      def properties(element)
        element.text.sub(/.*?\s/, '').split(',').to_h { |item| item.lstrip.split(/\s*:\s*/) }
      end

      def in_viewport?(element)
        in_viewport = <<~IN_VIEWPORT
          for(var e=arguments[0],f=e.offsetTop,t=e.offsetLeft,o=e.offsetWidth,n=e.offsetHeight;
          e.offsetParent;)f+=(e=e.offsetParent).offsetTop,t+=e.offsetLeft;
          return f<window.pageYOffset+window.innerHeight&&t<window.pageXOffset+window.innerWidth&&f+n>
          window.pageYOffset&&t+o>window.pageXOffset
        IN_VIEWPORT

        driver.execute_script(in_viewport, element)
      end
    end # ActionBuilder
  end # WebDriver
end # Selenium
