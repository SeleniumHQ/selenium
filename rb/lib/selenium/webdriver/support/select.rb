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
    module Support
      class Select

        #
        # @param [Element] element The select element to use
        #

        def initialize(element)
          tag_name = element.tag_name

          unless tag_name.downcase == "select"
            raise ArgumentError, "unexpected tag name #{tag_name.inspect}"
          end

          @element = element
          @multi   = ![nil, "false"].include?(element.attribute(:multiple))
        end

        #
        # Does this select element support selecting multiple options?
        #
        # @return [Boolean]
        #

        def multiple?
          @multi
        end

        #
        # Get all options for this select element
        #
        # @return [Array<Element>]
        #

        def options
          @element.find_elements :tag_name, 'option'
        end

        #
        # Get all selected options for this select element
        #
        # @return [Array<Element>]
        #

        def selected_options
          options.select { |e| e.selected? }
        end

        #
        # Get the first selected option in this select element
        #
        # @raise [Error::NoSuchElementError] if no options are selected
        # @return [Element]
        #

        def first_selected_option
          option = options.find { |e| e.selected? }
          option or raise Error::NoSuchElementError, 'no options are selected'
        end

        #
        # Select options by visible text, index or value.
        #
        # When selecting by :text, selects options that display text matching the argument. That is, when given "Bar" this
        # would select an option like:
        #
        #     <option value="foo">Bar</option>
        #
        # When slecting by :value, selects all options that have a value matching the argument. That is, when given "foo" this
        # would select an option like:
        #
        #     <option value="foo">Bar</option>
        #
        # When selecting by :index, selects the option at the given index. This is done by examining the "index" attribute of an
        # element, and not merely by counting.
        #
        # @param [:text, :index, :value] how How to find the option
        # @param [String] what What value to find the option by.
        #

        def select_by(how, what)
          case how
          when :text
            select_by_text what
          when :index
            select_by_index what
          when :value
            select_by_value what
          else
            raise ArgumentError, "can't select options by #{how.inspect}"
          end
        end

        #
        # Deselect options by visible text, index or value.
        #
        # @param [:text, :index, :value] how How to find the option
        # @param [String] what What value to find the option by.
        # @raise [Error::UnsupportedOperationError] if the element does not support multiple selections.
        #
        # @see Select#select_by
        #

        def deselect_by(how, what)
          case how
          when :text
            deselect_by_text what
          when :value
            deselect_by_value what
          when :index
            deselect_by_index what
          else
            raise ArgumentError, "can't deselect options by #{how.inspect}"
          end
        end

        #
        # Select all unselected options. Only valid if the element supports multiple selections.
        #
        # @raise [Error::UnsupportedOperationError] if the element does not support multiple selections.
        #

        def select_all
          unless multiple?
            raise Error::UnsupportedOperationError, 'you may only select all options of a multi-select'
          end

          options.each { |e| select_option e }
        end

        #
        # Deselect all selected options. Only valid if the element supports multiple selections.
        #
        # @raise [Error::UnsupportedOperationError] if the element does not support multiple selections.
        #

        def deselect_all
          unless multiple?
            raise Error::UnsupportedOperationError, 'you may only deselect all options of a multi-select'
          end

          options.each { |e| deselect_option e }
        end

        private

        def select_by_text(text)
          opts = find_by_text text

          if opts.empty?
            raise Error::NoSuchElementError, "cannot locate element with text: #{text.inspect}"
          end

          select_options opts
        end

        def select_by_index(index)
          opts = find_by_index index

          if opts.empty?
            raise Error::NoSuchElementError, "cannot locate element with index: #{index.inspect}"
          end

          select_option opts.first
        end

        def select_by_value(value)
          opts = find_by_value value

          if opts.empty?
            raise Error::NoSuchElementError, "cannot locate option with value: #{value.inspect}"
          end

          select_options opts
        end

        def deselect_by_text(text)
          unless multiple?
            raise Error::UnsupportedOperationError, 'you may only deselect option of a multi-select'
          end
          opts = find_by_text text

          if opts.empty?
            raise Error::NoSuchElementError, "cannot locate element with text: #{text.inspect}"
          end

          deselect_options opts
        end

        def deselect_by_value(value)
          unless multiple?
            raise Error::UnsupportedOperationError, 'you may only deselect option of a multi-select'
          end
          opts = find_by_value value

          if opts.empty?
            raise Error::NoSuchElementError, "cannot locate option with value: #{value.inspect}"
          end

          deselect_options opts
        end

        def deselect_by_index(index)
          unless multiple?
            raise Error::UnsupportedOperationError, 'you may only deselect option of a multi-select'
          end
          opts = find_by_index index

          if opts.empty?
            raise Error::NoSuchElementError, "cannot locate option with index: #{index}"
          end

          deselect_option opts.first
        end

        private

        def select_option(option)
          option.click unless option.selected?
        end

        def deselect_option(option)
          option.click if option.selected?
        end

        def select_options(opts)
          if multiple?
            opts.each { |o| select_option o }
          else
            select_option opts.first
          end
        end

        def deselect_options(opts)
          if multiple?
            opts.each { |o| deselect_option o }
          else
            deselect_option opts.first
          end
        end

        def find_by_text(text)
          xpath = ".//option[normalize-space(.) = #{Escaper.escape text}]"
          opts = @element.find_elements(:xpath, xpath)

          if opts.empty? && text =~ /\s+/
            longest_word = text.split(/\s+/).max_by { |item| item.length }

            if longest_word.empty?
              candidates = options
            else
              xpath = ".//option[contains(., #{Escaper.escape longest_word})]"
              candidates = @element.find_elements(:xpath, xpath)
            end

            if multiple?
              candidates.select { |option| text == option.text }
            else
              Array(candidates.find { |option| text == option.text })
            end
          else
            opts
          end
        end

        def find_by_index(index)
          index = index.to_s
          options.select { |option| option.attribute(:index) == index }
        end

        def find_by_value(value)
          @element.find_elements(:xpath, ".//option[@value = #{Escaper.escape value}]")
        end

        #
        # @api private
        #

        module Escaper
          def self.escape(str)
            if str.include?('"') && str.include?("'")
              parts = str.split('"', -1).map { |part| %{"#{part}"} }

              quoted = parts.join(%{, '"', }).
                             gsub(/^"", |, ""$/, '')

              "concat(#{quoted})"
            elsif str.include?('"')
              # escape string with just a quote into being single quoted: f"oo -> 'f"oo'
              "'#{str}'"
            else
              # otherwise return the quoted string
              %{"#{str}"}
            end
          end

        end # Escaper
      end # Select
    end # Support
  end # WebDriver
end # Selenium
