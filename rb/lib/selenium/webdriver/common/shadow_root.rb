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
    class ShadowRoot
      ROOT_KEY = 'shadow-6066-11e4-a52e-4f735466cecf'

      include SearchContext

      #
      # Creates a new shadow root
      #
      # @api private
      #

      def initialize(bridge, id)
        @bridge = bridge
        @id = id
      end

      def inspect
        format '#<%<class>s:0x%<hash>x id=%<id>s>', class: self.class, hash: hash * 2, id: @id.inspect
      end

      def ==(other)
        other.is_a?(self.class) && ref == other.ref
      end
      alias eql? ==

      def hash
        [@id, @bridge].hash
      end

      #
      # @api private
      # @see SearchContext
      #

      def ref
        [:shadow_root, @id]
      end

      #
      # Convert to a ShadowRoot JSON Object for transmission over the wire.
      # @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#basic-terms-and-concepts
      #
      # @api private
      #

      def to_json(*)
        JSON.generate as_json
      end

      #
      # For Rails 3 - http://jonathanjulian.com/2010/04/rails-to_json-or-as_json/
      #
      # @api private
      #

      def as_json(*)
        {ROOT_KEY => @id}
      end

      private

      attr_reader :bridge
    end # ShadowRoot
  end # WebDriver
end # Selenium
