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

module Selenium
  module WebDriver
    module KeyActions
      #
      # Performs a key press. Does not release the key - subsequent interactions may assume it's kept pressed.
      # Note that the key is never released implicitly - either W3CActionBuilder#key_up(key) or W3CActionBuilder#release_actions
      # must be called to release the key.
      #
      # @example Press a key
      #
      #    driver.action.key_down(:control).perform
      #
      # @example Press a key on an element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.key_down(el, :shift).perform
      #
      # @overload key_down(key, device: nil)
      #   @param [Symbol, String] key The key to press
      #   @param [Symbol, String] device Optional name of the KeyInput device to press the key on
      # @overload key_down(element, key, device: nil)
      #   @param [Element] element An optional element to move to first
      #   @param [Symbol, String] key The key to press
      #   @param [Symbol, String] device Optional name of the KeyInput device to press the key on
      # @return [W3CActionBuilder] A self reference
      #

      def key_down(*args, device: nil)
        key_action(*args, action: :create_key_down, device: device)
      end

      #
      # Performs a key release.
      # Releasing a non-depressed key will yield undefined behaviour.
      #
      # @example Release a key
      #
      #   driver.action.key_up(:shift).perform
      #
      # @example Release a key from an element
      #
      #   el = driver.find_element(id: "some_id")
      #   driver.action.key_up(el, :alt).perform
      #
      # @overload key_up(key, device: nil)
      #   @param [Symbol, String] key The key to press
      #   @param [Symbol, String] device Optional name of the KeyInput device to press the key on
      # @overload key_up(element, key, device: nil)
      #   @param [Element] element An optional element to move to first
      #   @param [Symbol, String] key The key to release
      #   @param [Symbol, String] device Optional name of the KeyInput device to release the key on
      # @return [W3CActionBuilder] A self reference
      #

      def key_up(*args, device: nil)
        key_action(*args, action: :create_key_up, device: device)
      end

      #
      # Sends keys to the active element. This differs from calling
      # Element#send_keys(keys) on the active element in two ways:
      #
      # * The modifier keys included in this call are not released.
      # * There is no attempt to re-focus the element - so send_keys(:tab) for switching elements should work.
      #
      # @example Send the text "help" to an element
      #
      #   el = driver.find_element(id: "some_id")
      #   driver.action.send_keys(el, "help").perform
      #
      # @example Send the text "help" to the currently focused element
      #
      #   driver.action.send_keys("help").perform
      #
      # @overload send_keys(keys, device: nil)
      #   @param [Array, Symbol, String] keys The key(s) to press and release
      #   @param [Symbol, String] device Optional name of the KeyInput device to press and release the keys on
      # @overload send_keys(element, keys, device: nil)
      #   @param [Element] element An optional element to move to first
      #   @param [Array, Symbol, String] keys The key(s) to press and release
      #   @param [Symbol, String] device Optional name of the KeyInput device to press and release the keys on
      # @return [W3CActionBuilder] A self reference
      #

      def send_keys(*args, device: nil)
        click(args.shift) if args.first.is_a? Element
        args.map { |x| x.is_a?(String) ? x.chars : x }.flatten.each do |arg|
          key_down(arg, device: device)
          key_up(arg, device: device)
        end
        self
      end

      private

      #
      # @api private
      #
      # @overload key_down(key, action: nil, device: nil)
      #   @param [Symbol, String] key The key to press
      #   @param [Symbol] action The name of the key action to perform
      #   @param [Symbol, String] device Optional name of the KeyInput device to press the key on
      # @overload key_down(element, key, action: nil, device: nil)
      #   @param [Element] element An optional element to move to first
      #   @param [Symbol, String] key The key to press
      #   @param [Symbol] action The name of the key action to perform
      #   @param [Symbol, String] device Optional name of the KeyInput device to press the key on
      #
      # @param [Array] args
      # @option args [Element] element An optional element to move to first
      # @option args [Symbol, String] key The key to perform the action with
      # @param [Symbol] action The name of the key action to perform
      # @param [Symbol, String] device optional name of the KeyInput device to press the key on
      # @return [W3CActionBuilder] A self reference
      #

      def key_action(*args, action: nil, device: nil)
        key_input = get_device(device) || key_inputs.first
        click(args.shift) if args.first.is_a? Element
        key_input.send(action, args.last)
        tick(key_input)
        self
      end
    end # KeyActions
  end # WebDriver
end # Selenium
