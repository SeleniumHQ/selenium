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

require_relative 'navigate_result'
require_relative 'browsing_context_info'

module Selenium
  module WebDriver
    class BiDi
      class BrowsingContext
        attr_accessor :id

        READINESS_STATE = {
          none: 'none',
          interactive: 'interactive',
          complete: 'complete'
        }.freeze

        def initialize(driver:, browsing_context_id: nil, type: nil, reference_context: nil)
          unless driver.capabilities.web_socket_url
            raise Error::WebDriverError,
                  'WebDriver instance must support BiDi protocol'
          end

          unless type.nil? || %i[window tab].include?(type)
            raise ArgumentError,
                  "Valid types are :window & :tab. Received: #{type.inspect}"
          end

          @bidi = driver.bidi
          @id = browsing_context_id.nil? ? create(type, reference_context)['context'] : browsing_context_id
        end

        def navigate(url:, readiness_state: nil)
          unless readiness_state.nil? || READINESS_STATE.key?(readiness_state)
            raise ArgumentError,
                  "Valid readiness states are :none, :interactive & :complete. Received: #{readiness_state.inspect}"
          end

          navigate_result = @bidi.send_cmd('browsingContext.navigate', context: @id, url: url,
                                                                       wait: READINESS_STATE[readiness_state])

          NavigateResult.new(
            url: navigate_result['url'],
            navigation_id: navigate_result['navigation']
          )
        end

        def get_tree(max_depth: nil)
          result = @bidi.send_cmd('browsingContext.getTree', root: @id, maxDepth: max_depth).dig('contexts', 0)

          BrowsingContextInfo.new(
            id: result['context'],
            url: result['url'],
            children: result['children'],
            parent_context: result['parent']
          )
        end

        # Organising margin and page parameters in a struct for print command
        Margin = Struct.new(:bottom, :top, :left, :right, keyword_init: true) do
          def initialize(bottom: 1.0, top: 1.0, left: 1.0, right: 1.0)
            super
          end
        end

        Page = Struct.new(:height, :width, keyword_init: true) do
          def initialize(height: 27.94, width: 21.59)
            super
          end
        end

        def print_page(background: false, margin: Margin.new, orientation: 'portrait', page: Page.new, page_ranges: [],
                       scale: 1.0, shrink_to_fit: true, path: nil)
          print_result = @bidi.send_cmd('browsingContext.print',
                                        context: @id,
                                        background: background,
                                        margin: {bottom: margin.bottom, top: margin.top, left: margin.left,
                                                 right: margin.right},
                                        orientation: orientation,
                                        page: {height: page.height, width: page.width},
                                        pageRanges: page_ranges,
                                        scale: scale,
                                        shrinkToFit: shrink_to_fit)

          return File.write(path, Base64.decode64(print_result['data']), mode: 'wb') unless path.nil?

          print_result['data']
        end

        def close
          @bidi.send_cmd('browsingContext.close', context: @id)
        end

        private

        def create(type, reference_context)
          @bidi.send_cmd('browsingContext.create', type: type.to_s, referenceContext: reference_context)
        end
      end # BrowsingContext
    end # BiDi
  end # WebDriver
end # Selenium
