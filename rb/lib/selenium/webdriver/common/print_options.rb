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
    class PrintOptions
      ORIENTATION_VALUES = ['portrait', 'landscape']

      PRINT_OPTIONS = %i[orientation]
      def initialize
        @print_options = {}
        @page = {}
        @margin = {}
      end

      def print_options
        @print_options.to_json
      end

      def orientation
        @print_options['orientation']
      end

      def orientation(value)
        raise ArgumentError.new(
            "Orientation values must be one of #{ORIENTATION_VALUES}"
          ) unless ORIENTATION_VALUES.include?(value)

        @print_options['orientation'] = value
      end

      def scale
        @print_options['scale']
      end

      def scale(value)
        validate_numeric_value("Scale", value)

        raise ArgumentError.new(
          "Scale value should be between 0.1 and 2"
        ) unless value > 0.1 && value < 2

        @print_options['scale'] = value
      end

      def background
        @print_options['background']
      end

      def background(value)
        raise ArgumentError.new(
          'Background value should be a boolean'
        ) unless value.is_a?(Boolean)

        @print_options['background'] = value
      end

      def page_width
        @page['width']
      end

      def page_width(value)
        validate_numeric_value('Page width', value)

        @page['width'] = value
        @print_options['page'] = @page
      end

      def page_height
        @page['height']
      end

      def page_height(value)
        validate_numeric_value('Page height', value)

        @page['height'] = value
        @print_options['page'] = @page
      end

      def margin_top
        @margin['top']
      end

      def margin_top(value)
        validate_numeric_value('Margin top', value)

        @margin['top'] = value
        @print_options['margin'] = @margin
      end

      def margin_left
        @margin['left']
      end

      def margin_left(value)
        validate_numeric_value('Margin left', value)

        @margin['left'] = value
        @print_options['margin'] = @margin
      end

      def margin_bottom
        @margin['bottom']
      end

      def margin_bottom(value)
        validate_numeric_value('Margin bottom', value)

        @margin['bottom'] = value
        @print_options['margin'] = @margin
      end

      def margin_right
        @margin['right']
      end

      def margin_right(value)
        validate_numeric_value('Margin right', value)

        @margin['right'] = value
        @print_options['margin'] = @margin
      end

      def shrink_to_fit
        @print_options['shrinkToFit']
      end

      def shrink_to_fit(value)
        raise ArgumentError.new(
          'Set shrink to fit value should be a boolean'
        ) unless value.is_a?(Boolean)

        @print_options['shrinkToFit'] = value
      end

      def page_ranges
        @print_options['pageRanges']
      end

      def page_ranges(value)
        raise ArgumentError.new(
          'Page ranges value should be an array'
        ) unless value.is_a?(Array)

        @print_options['pageRanges'] = value
      end

      private

      def validate_numeric_value(property_name, value)
        raise ArgumentError.new(
          "#{property_name} should be an integer or a float"
        ) unless value.is_a?(Integer) || value.is_a?(Float)

        raise ArgumentError.new(
          "#{property_name} cannot be less than 0"
        ) unless value > 0
      end
    end
  end
end
