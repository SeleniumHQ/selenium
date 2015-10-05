# encoding: utf-8
#
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
  module Client

    # Convenience methods not explicitly part of the protocol
    module Extensions

      # These for all Ajax request to finish (Only works if you are using prototype, the wait happens in the browser)
      def wait_for_ajax(options={})
        builder = JavascriptExpressionBuilder.new active_javascript_framework(options)
        wait_for_condition builder.no_pending_ajax_requests.script, options[:timeout_in_seconds]
      end

      # Wait for all Prototype effects to be processed (the wait happens in the browser).
      #
      # Credits to http://github.com/brynary/webrat/tree/master
      def wait_for_effects(options={})
        builder = JavascriptExpressionBuilder.new active_javascript_framework(options)
        wait_for_condition builder.no_pending_effects.script, options[:timeout_in_seconds]
      end

      # Wait for an element to be present (the wait happens in the browser).
      def wait_for_element(locator, options={})
        builder = JavascriptExpressionBuilder.new
        builder.find_element(locator).append("element != null;")
        wait_for_condition builder.script, options[:timeout_in_seconds]
      end

      # Wait for an element to NOT be present (the wait happens in the browser).
      def wait_for_no_element(locator, options={})
        builder = JavascriptExpressionBuilder.new
        builder.find_element(locator).append("element == null;")
        wait_for_condition builder.script, options[:timeout_in_seconds]
      end

      # Wait for some text to be present (the wait is happening browser side).
      #
      # wait_for_text will search for the given argument within the innerHTML
      # of the current DOM. Note that this method treats a single string
      # as a special case.
      #
      # ==== Parameters
      # wait_for_text accepts an optional hash of parameters:
      # * <tt>:element</tt> - a selenium locator for an element limiting
      #   the search scope.
      # * <tt>:timeout_in_seconds</tt> - duration in seconds after  which we
      #   time out if text cannot be found.
      #
      # ==== Regular Expressions
      # In addition to plain strings, wait_for_text accepts regular expressions
      # as the pattern specification.
      #
      # ==== Examples
      # The following are equivalent, and will match "some text" anywhere
      # within the document:
      #   wait_for_text "some text"
      #   wait_for_text /some text/
      #
      # This will match "some text" anywhere within the specified element:
      #   wait_for_text /some text/, :element => "container"
      #
      # This will match "some text" only if it exactly matches the complete
      # innerHTML of the specified element:
      #   wait_for_text "some text", :element => "container"
      #
      def wait_for_text(pattern, options={})
        builder = JavascriptExpressionBuilder.new
        builder.find_text(pattern, options).append("text_match == true;")
        wait_for_condition builder.script, options[:timeout_in_seconds]
      end

      # Wait for some text to NOT be present (the wait happens in the browser).
      #
      # See wait_for_text for usage details.
      def wait_for_no_text(pattern, options={})
        builder = JavascriptExpressionBuilder.new
        builder.find_text(pattern, options).append("text_match == false;")
        wait_for_condition builder.script, options[:timeout_in_seconds]
      end

      # Wait for a field to get a specific value (the wait happens in the browser).
      def wait_for_field_value(locator, expected_value, options={})
        builder = JavascriptExpressionBuilder.new
        builder.find_element(locator).element_value_is(expected_value)
        wait_for_condition builder.script, options[:timeout_in_seconds]
      end

      # Wait for a field to not have a specific value (the wait happens in the browser).
      def wait_for_no_field_value(locator, expected_value, options={})
        builder = JavascriptExpressionBuilder.new
        builder.find_element(locator).element_value_is_not(expected_value)
        wait_for_condition builder.script, options[:timeout_in_seconds]
      end

      # Wait for something to be visible (the wait happens in the browser).
      def wait_for_visible(locator, options={})
        builder = JavascriptExpressionBuilder.new
        wait_for_condition builder.visible(locator).script, options[:timeout_in_seconds]
      end

      # Wait for something to not be visible (the wait happens in the browser).
      def wait_for_not_visible(locator, options={})
        builder = JavascriptExpressionBuilder.new
        wait_for_condition builder.not_visible(locator).script, options[:timeout_in_seconds]
      end

      def active_javascript_framework(options)
        options[:javascript_framework] || default_javascript_framework
      end

    end

  end
end
