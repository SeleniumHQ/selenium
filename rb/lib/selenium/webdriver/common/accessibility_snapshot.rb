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
    #
    # One node of an accessibility snapshot (ADR 18205), as returned by
    # {Driver#accessibility_snapshot} and {Element#accessibility_snapshot}.
    #
    # The tree is computed in the page from the DOM following WAI-ARIA, html-aam and
    # accname. It is not the browser's own accessibility tree and can differ from it at
    # the edges.
    #

    class AccessibilityNode
      # The order the text form writes states in (ADR 18205 §1).
      STATE_ORDER = %w[checked pressed expanded selected level disabled focused].freeze

      # @return [String] the WAI-ARIA role token; 'text' for text leaves and 'iframe' for
      #   frames, under which the frame's own tree is attached
      attr_reader :role

      # @return [String] the computed accessible name, '' when there is none
      attr_reader :name

      # @return [String] the computed accessible description, '' when there is none
      attr_reader :description

      # @return [String, nil] the current value for textbox, searchbox, combobox and range
      #   roles; nil where the role has none. A password field's value is masked.
      attr_reader :value

      # @return [Hash{String => Boolean, Integer, String}] checked, pressed, expanded,
      #   selected, level, disabled and focused, each present only when it applies; new
      #   keys may be added in any release, so ignore keys you do not recognise
      attr_reader :states

      # @return [Element, nil] the element the node is backed by, usable for further
      #   commands, or nil for text leaves. An element inside a child frame can be used
      #   through classic commands only once the driver has switched to that frame.
      attr_reader :element

      # @return [Array<AccessibilityNode>] the child nodes, [] for leaves
      attr_accessor :children

      def initialize(role:, name:, description: '', value: nil, states: {}, element: nil, children: [])
        @role = role
        @name = name
        @description = description
        @value = value
        @states = states
        @element = element
        @children = children
      end

      #
      # Renders the tree as text, one node per line.
      #
      # The line grammar is <tt>- role "name" [state] [state=value]: value</tt>, children
      # indented two spaces, text leaves written as <tt>- text: content</tt>. An empty name
      # is left out, as is an absent or empty value; a true state is written bare, a false
      # one left out, any other value spelled. A line break or backslash in a value is
      # escaped so a node never spans two lines. The description and element references
      # are not rendered.
      #
      # @return [String] the text form, without a trailing newline
      #

      def to_text
        lines('').join("\n")
      end

      #
      # Builds the node tree from the atom's wire form: the parsed JSON of the tree, in
      # which +element+ is an index into +elements+ and, on a frame node, +frame+ an index
      # the block resolves to the frame's own tree (its document, or nothing when it
      # cannot be reached).
      #
      # @api private
      #

      def self.from_wire(data, elements, &frame_children)
        children = if data.key?('frame')
                     yield data['frame']
                   else
                     data.fetch('children').map { |child| from_wire(child, elements, &frame_children) }
                   end
        element_index = data['element']
        new(
          role: data.fetch('role'),
          name: data.fetch('name'),
          description: data.fetch('description', ''),
          value: data['value'],
          states: data.fetch('states').dup,
          element: element_index && elements.fetch(element_index),
          children: children
        )
      end

      # The BiDi remote value shapes the snapshotter reads around the JSON text.
      #
      # @api private
      module Wire
        module_function

        def object_fields(value)
          unless value['type'] == 'object'
            raise Error::WebDriverError,
                  "accessibility snapshot: expected an object remote value, got #{value['type'].inspect}"
          end

          # A property name is written as a plain string, or as a string remote value.
          value.fetch('value', []).to_h { |key, entry| [key.is_a?(String) ? key : string(key), entry] }
        end

        def string(value)
          value.fetch('value', '').to_s
        end

        def shared_id(node)
          shared_id = node['sharedId']
          unless node['type'] == 'node' && shared_id
            raise Error::WebDriverError, 'accessibility snapshot: expected a node reference in the elements list'
          end

          shared_id.to_s
        end

        # The browsing context id of a window remote value; nil for a frame with no reachable context.
        def context_of(window)
          return nil unless window['type'] == 'window'

          window.dig('value', 'context')
        end
      end

      protected

      def lines(indent)
        [indent + line] + children.flat_map { |child| child.lines("#{indent}  ") }
      end

      private

      def line
        return "- text: #{name}" if role == 'text'

        out = "- #{role}"
        out += " #{quote(name)}" unless name.empty?
        out += state_tokens
        out += ": #{one_line(value)}" if value && !value.empty?
        out
      end

      # A true state bare, a false one left out, any other value spelled.
      def state_tokens
        tokens = STATE_ORDER.filter_map do |key|
          next unless states.key?(key)

          state = states[key]
          next if state == false

          state == true ? " [#{key}]" : " [#{key}=#{state}]"
        end
        tokens.join
      end

      def quote(text)
        "\"#{text.gsub('\\') { '\\\\' }.gsub('"') { '\\"' }}\""
      end

      def one_line(text)
        text.gsub('\\') { '\\\\' }.gsub("\r") { '\\r' }.gsub("\n") { '\\n' }
      end
    end # AccessibilityNode

    #
    # Takes accessibility snapshots for one BiDi session: runs the atom's wire entry in
    # the sandbox realm of each document and stitches child frames into the tree.
    #
    # @api private
    #

    class AccessibilitySnapshotter
      include Atoms

      # The sandbox realm the atom runs in: page scripts cannot reach its prototypes.
      SANDBOX = 'selenium'
      SERIALIZATION_OPTIONS = {maxDomDepth: 0}.freeze
      STALE_MESSAGE = 'the snapshot root is no longer attached to a document'

      # The document of the targeted context does not own the root: the BiDi "no such node"
      # error, or the script's null answer to a root another document owns. Internal to the
      # search over the window's contexts, so it is not one of the registered BiDi errors.
      #
      # @api private
      class NotOwnedError < Error::WebDriverError; end

      def initialize(bridge)
        @bridge = bridge
        @bidi = bridge.bidi
      end

      #
      # Snapshots the whole page, or the subtree under +root+.
      #
      # @param root [Element, nil] the element whose subtree to snapshot, or nil for the
      #   page of the current window's top-level browsing context
      # @return [AccessibilityNode] the snapshot, with every reachable child frame's tree
      #   attached under its +iframe+ node
      # @raise [Error::StaleElementReferenceError] when +root+ no longer belongs to a document
      #

      def snapshot(root = nil)
        top = @bridge.window_handle
        if root.nil?
          node = snapshot_context(top, nil)
          raise Error::WebDriverError, 'accessibility snapshot: the script returned nothing' if node.nil?

          return node
        end

        # The element may live in any frame of the window. Chromium resolves its shared
        # id only in the document that owns it; Firefox resolves it in any document of
        # the browsing context group, so the atom checks ownership itself and each
        # context is tried until the owner is found.
        contexts(top).each do |context|
          node = snapshot_context(context, root.ref.last)
          return node unless node.nil?
        rescue NotOwnedError
          next
        end
        raise Error::StaleElementReferenceError, STALE_MESSAGE
      end

      private

      # The snapshot of +context+, or nil when another document owns the root.
      def snapshot_context(context, root_id)
        result = call(context, root_id ? [{sharedId: root_id}] : [])
        return nil if result['type'] == 'null'

        fields = AccessibilityNode::Wire.object_fields(result)
        # The only error the atom reports as data: the root left its document.
        raise Error::StaleElementReferenceError, STALE_MESSAGE if fields.key?('error')

        elements = fields.fetch('elements').fetch('value', []).map { |node| element(AccessibilityNode::Wire.shared_id(node)) }
        windows = fields.fetch('windows').fetch('value', []).map { |window| AccessibilityNode::Wire.context_of(window) }
        data = JSON.parse(AccessibilityNode::Wire.string(fields.fetch('json')))
        AccessibilityNode.from_wire(data, elements) { |index| stitch(windows.fetch(index)) }
      end

      # Runs the atom's wire entry in the sandbox of +context+ and returns the remote value of its result.
      def call(context, arguments)
        raw = @bidi.send_cmd('script.callFunction',
                             functionDeclaration: "(root) => (#{atom})(root)",
                             awaitPromise: false,
                             target: {context: context, sandbox: SANDBOX},
                             arguments: arguments,
                             resultOwnership: 'none',
                             serializationOptions: SERIALIZATION_OPTIONS)
        return raw['result'] || {} unless raw['type'] == 'exception'

        details = raw['exceptionDetails'] || {}
        raise Error::WebDriverError, "accessibility snapshot failed in the page: #{details['text'] || details}"
      rescue Error::WebDriverError => e
        # The BiDi "no such node" error: the document of this context does not own the
        # root's shared id, either because the root lives in another frame or because
        # its document is gone.
        raise NotOwnedError, e.message if e.message.include?('no such node')

        raise
      end

      # The document of a frame as the frame node's one child, or no children when unreachable.
      def stitch(context)
        return [] if context.nil?

        document = snapshot_context(context, nil)
        document.nil? ? [] : [document]
      rescue Error::WebDriverError => e
        # Gone between discovery and the call, or mid-navigation: the frame stays a
        # leaf (ADR §1). Anything else is a real failure.
        raise unless frame_unreachable?(e)

        WebDriver.logger.debug("accessibility snapshot: frame #{context} not reachable: #{e.message}",
                               id: :accessibility_snapshot)
        []
      end

      # Through the bridge's configured element class, as every other element lookup.
      def element(shared_id)
        Remote::Bridge.element_class.new(@bridge, shared_id)
      end

      # The window's browsing contexts, top-level first, then each frame depth-first.
      def contexts(top)
        tree = @bidi.send_cmd('browsingContext.getTree', root: top)
        contexts = [top]
        stack = tree['contexts'] || []
        until stack.empty?
          info = stack.shift
          contexts << info['context'] unless info['context'] == top
          stack = (info['children'] || []) + stack
        end
        contexts
      end

      # Whether an error says a frame or its document is gone, rather than that a command failed.
      def frame_unreachable?(error)
        return true if error.is_a?(NotOwnedError)

        error.message.include?('no such frame') || error.message.include?('no such node')
      end

      # The atom's wire entry, a JavaScript function expression, read once from the gem.
      def atom
        @atom ||= read_atom(:accessibilitySnapshot)
      end
    end # AccessibilitySnapshotter
  end # WebDriver
end # Selenium
