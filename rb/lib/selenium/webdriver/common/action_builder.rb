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

module Selenium
  module WebDriver
    class ActionBuilder
      include KeyActions # Actions specific to key inputs
      include PointerActions # Actions specific to pointer inputs
      include WheelActions # Actions specific to wheel inputs

      attr_reader :devices

      #
      # Initialize a W3C Action Builder. Differs from previous by requiring a bridge and allowing asynchronous actions.
      # The W3C implementation allows asynchronous actions per device. e.g. A key can be pressed at the same time that
      # the mouse is moving. Keep in mind that pauses must be added for other devices in order to line up the actions
      # correctly when using asynchronous.
      #
      # @param [Selenium::WebDriver::Remote::Bridge] bridge the bridge for the current driver instance.
      # @param [Boolean] deprecated_async Whether to perform the actions asynchronously per device.
      #   Defaults to false for backwards compatibility.
      # @param [Array<Selenium::WebDriver::Interactions::InputDevices>] devices list of valid sources of input.
      # @param [Boolean] async Whether to perform the actions asynchronously per device.
      # @return [ActionBuilder] A self reference.
      #

      def initialize(bridge, devices: [], async: false, duration: 250)
        @bridge = bridge
        @duration = duration
        @async = async
        @devices = []

        Array(devices).each { |device| add_input(device) }
      end

      #
      # Adds a PointerInput device of the given kind
      #
      # @example Add a touch pointer input device
      #
      #    builder = device.action
      #    builder.add_pointer_input('touch', :touch)
      #
      # @param [String] name name for the device
      # @param [Symbol] kind kind of pointer device to create
      # @return [Interactions::PointerInput] The pointer input added
      #
      #

      def add_pointer_input(kind, name)
        add_input(Interactions.pointer(kind, name: name))
      end

      #
      # Adds a KeyInput device
      #
      # @example Add a key input device
      #
      #    builder = device.action
      #    builder.add_key_input('keyboard2')
      #
      # @param [String] name name for the device
      # @return [Interactions::KeyInput] The key input added
      #

      def add_key_input(name)
        add_input(Interactions.key(name))
      end

      #
      # Adds a WheelInput device
      #
      # @example Add a wheel input device
      #
      #    builder = device.action
      #    builder.add_wheel_input('wheel2')
      #
      # @param [String] name name for the device
      # @return [Interactions::WheelInput] The wheel input added
      #

      def add_wheel_input(name)
        add_input(Interactions.wheel(name))
      end

      #
      # Retrieves the input device for the given name or type
      #
      # @param [String] name name of the input device
      # @param [String] type name of the input device
      # @return [Selenium::WebDriver::Interactions::InputDevice] input device with given name or type
      #

      def device(name: nil, type: nil)
        input = @devices.find { |device| (device.name == name.to_s || name.nil?) && (device.type == type || type.nil?) }

        raise(ArgumentError, "Can not find device: #{name}") if name && input.nil?

        input
      end

      #
      # Retrieves the current PointerInput devices
      #
      # @return [Array] array of current PointerInput devices
      #

      def pointer_inputs
        @devices.select { |device| device.type == Interactions::POINTER }
      end

      #
      # Retrieves the current KeyInput device
      #
      # @return [Selenium::WebDriver::Interactions::InputDevice] current KeyInput device
      #

      def key_inputs
        @devices.select { |device| device.type == Interactions::KEY }
      end

      #
      # Retrieves the current WheelInput device
      #
      # @return [Selenium::WebDriver::Interactions::InputDevice] current WheelInput devices
      #

      def wheel_inputs
        @devices.select { |device| device.type == Interactions::WHEEL }
      end

      #
      # Creates a pause for the given device of the given duration. If no duration is given, the pause will only wait
      # for all actions to complete in that tick.
      #
      # @example Send keys to an element
      #
      #   action_builder = driver.action
      #   keyboard = action_builder.key_input
      #   el = driver.find_element(id: "some_id")
      #   driver.action.click(el).pause(keyboard).pause(keyboard).pause(keyboard).send_keys('keys').perform
      #
      # @param [InputDevice] device Input device to pause
      # @param [Float] duration Duration to pause
      # @return [ActionBuilder] A self reference.
      #

      def pause(device: nil, duration: 0)
        device ||= pointer_input
        device.create_pause(duration)
        self
      end

      #
      # Creates multiple pauses for the given device of the given duration.
      #
      # @example Send keys to an element
      #
      #   action_builder = driver.action
      #   keyboard = action_builder.key_input
      #   el = driver.find_element(id: "some_id")
      #   driver.action.click(el).pauses(keyboard, 3).send_keys('keys').perform
      #
      # @param [InputDevice] device Input device to pause
      # @param [Integer] number of pauses to add for the device
      # @param [Float] duration Duration to pause
      # @return [ActionBuilder] A self reference.
      #

      def pauses(device: nil, number: nil, duration: 0)
        number ||= 2
        device ||= pointer_input
        duration ||= 0

        number.times { device.create_pause(duration) }
        self
      end

      #
      # Executes the actions added to the builder.
      #

      def perform
        @bridge.send_actions @devices.filter_map(&:encode)
        clear_all_actions
        nil
      end

      #
      # Clears all actions from the builder.
      #

      def clear_all_actions
        @devices.each(&:clear_actions)
      end

      #
      # Releases all action states from the browser.
      #

      def release_actions
        @bridge.release_actions
      end

      private

      #
      # Adds pauses for all devices but the given devices
      #
      # @param [Array[InputDevice]] action_devices Array of Input Devices performing an action in this tick.
      #

      def tick(*action_devices)
        return if @async

        @devices.each { |device| device.create_pause unless action_devices.include? device }
      end

      #
      # Adds an InputDevice
      #

      def add_input(device)
        device = Interactions.send(device) if device.is_a?(Symbol) && Interactions.respond_to?(device)

        raise TypeError, "#{device.inspect} is not a valid InputDevice" unless device.is_a?(Interactions::InputDevice)

        unless @async
          max_device = @devices.max { |a, b| a.actions.length <=> b.actions.length }
          pauses(device: device, number: max_device.actions.length) if max_device
        end
        @devices << device
        device
      end
    end # ActionBuilder
  end # WebDriver
end # Selenium
