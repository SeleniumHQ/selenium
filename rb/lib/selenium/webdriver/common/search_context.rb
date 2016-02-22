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
  module WebDriver
    module SearchContext

      # @api private
      FINDERS = {
        :class             => 'class name',
        :class_name        => 'class name',
        :css               => 'css selector',
        :id                => 'id',
        :link              => 'link text',
        :link_text         => 'link text',
        :name              => 'name',
        :partial_link_text => 'partial link text',
        :tag_name          => 'tag name',
        :xpath             => 'xpath',
      }

      #
      # Find the first element matching the given arguments.
      #
      # When using Element#find_element with :xpath, be aware that webdriver
      # follows standard conventions: a search prefixed with "//" will search
      # the entire document, not just the children of this current node. Use
      # ".//" to limit your search to the children of the receiving Element.
      #
      # @param [:class, :class_name, :css, :id, :link_text, :link, :partial_link_text, :name, :tag_name, :xpath] how
      # @param [String] what
      # @return [Element]
      #
      # @raise [Error::NoSuchElementError] if the element doesn't exist
      #
      #

      def find_element(*args)
        how, what = extract_args(args)

        unless by = FINDERS[how.to_sym]
          raise ArgumentError, "cannot find element by #{how.inspect}"
        end

        bridge.find_element_by by, what.to_s, ref
      rescue Selenium::WebDriver::Error::TimeOutError
        # Implicit Wait times out in Edge
        raise Selenium::WebDriver::Error::NoSuchElementError
      end

      #
      # Find all elements matching the given arguments
      #
      # @see SearchContext#find_element
      #
      # @param [:class, :class_name, :css, :id, :link_text, :link, :partial_link_text, :name, :tag_name, :xpath] how
      # @param [String] what
      # @return [Array<Element>]
      #

      def find_elements(*args)
        how, what = extract_args(args)

        unless by = FINDERS[how.to_sym]
          raise ArgumentError, "cannot find elements by #{how.inspect}"
        end

        bridge.find_elements_by by, what.to_s, ref
      rescue Selenium::WebDriver::Error::TimeOutError
        # Implicit Wait times out in Edge
        []
      end

      private

      def extract_args(args)
        case args.size
        when 2
          args
        when 1
          arg = args.first

          unless arg.respond_to?(:shift)
            raise ArgumentError, "expected #{arg.inspect}:#{arg.class} to respond to #shift"
          end

          # this will be a single-entry hash, so use #shift over #first or #[]
          arr = arg.dup.shift
          unless arr.size == 2
            raise ArgumentError, "expected #{arr.inspect} to have 2 elements"
          end

          arr
        else
          raise ArgumentError, "wrong number of arguments (#{args.size} for 2)"
        end
      end

    end # SearchContext
  end # WebDriver
end # Selenium
