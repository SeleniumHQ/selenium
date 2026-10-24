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

require File.expand_path('../spec_helper', __dir__)
require 'json'

module Selenium
  module WebDriver
    # The pure parts of the accessibility snapshot (ADR 18205): the text renderer is held
    # to the shared corpus, and the decoder to the BiDi wire shape.
    describe AccessibilityNode do
      def corpus(file)
        path = File.expand_path("../../../../../../common/src/web/accessibility/#{file}", __dir__)
        File.read(path, encoding: 'UTF-8')
      end

      # The corpus JSON as nodes; `element` holds the recorded id, which the text form never renders.
      def node_from_json(data)
        described_class.new(
          role: data['role'],
          name: data['name'],
          description: data['description'],
          value: data['value'],
          states: data['states'],
          element: data['element'],
          children: data['children'].map { |child| node_from_json(child) }
        )
      end

      def remote(type, value = nil, **extra)
        out = {'type' => type}
        out['value'] = value unless value.nil?
        out.merge(extra.transform_keys(&:to_s))
      end

      def remote_object(**fields)
        remote('object', fields.map { |key, value| [key.to_s, value] })
      end

      describe '#to_text' do
        # Every expected.txt is the reference renderer's output over its expected.json; the port must agree.
        pages = File.expand_path('../../../../../../common/src/web/accessibility/index.json', __dir__)
        JSON.parse(File.read(pages, encoding: 'UTF-8')).each do |page|
          it "renders #{page} as its recorded text" do
            tree = node_from_json(JSON.parse(corpus("#{page}.expected.json")))

            expect("#{tree.to_text}\n").to eq corpus("#{page}.expected.txt")
          end
        end

        it 'writes the line grammar with its escapes' do
          node = described_class.new(
            role: 'textbox',
            name: 'Say "hi" \\ bye',
            states: {'focused' => true, 'disabled' => true, 'level' => 2, 'selected' => false, 'pressed' => 'mixed'},
            value: "line one\nline two\\"
          )

          expected = '- textbox "Say \\"hi\\" \\\\ bye" [pressed=mixed] [level=2] [disabled] [focused]: ' \
                     'line one\\nline two\\\\'
          expect(node.to_text).to eq expected
          expect(described_class.new(role: 'list', name: '').to_text).to eq '- list'
          expect(described_class.new(role: 'text', name: 'plain words').to_text).to eq '- text: plain words'
          expect(described_class.new(role: 'textbox', name: 'Empty', value: '').to_text).to eq '- textbox "Empty"'
        end

        it 'indents children two spaces per level' do
          tree = described_class.new(
            role: 'list',
            name: '',
            children: [
              described_class.new(
                role: 'listitem',
                name: '',
                children: [
                  described_class.new(role: 'text', name: 'one'),
                  described_class.new(role: 'link', name: 'more')
                ]
              )
            ]
          )

          expect(tree.to_text).to eq "- list\n  - listitem\n    - text: one\n    - link \"more\""
        end
      end

      describe '.from_remote_value' do
        # A script.callFunction result: objects as key/value pairs, arrays, nodes with a sharedId.
        it 'decodes the wire shape' do
          wire = remote_object(
            role: remote('string', 'button'),
            name: remote('string', 'Save'),
            description: remote('string', 'Saves the form'),
            states: remote_object(pressed: remote('string', 'mixed'), disabled: remote('boolean', true)),
            element: remote('node', {'nodeType' => 1}, sharedId: 'f.1.e.42'),
            children: remote('array', [
                               remote_object(
                                 role: remote('string', 'text'),
                                 name: remote('string', 'Save'),
                                 description: remote('string', ''),
                                 states: remote_object,
                                 children: remote('array', [])
                               ),
                               remote_object(
                                 role: remote('string', 'heading'),
                                 name: remote('string', 'H'),
                                 description: remote('string', ''),
                                 value: remote('string', 'v'),
                                 states: remote_object(level: remote('number', 2)),
                                 element: remote('node', {'nodeType' => 1}, sharedId: 'f.1.e.43'),
                                 children: remote('array', [])
                               )
                             ])
          )
          made = []

          node = described_class.from_remote_value(wire) do |shared_id|
            made << shared_id
            "element:#{shared_id}"
          end

          expect(node.role).to eq 'button'
          expect(node.name).to eq 'Save'
          expect(node.description).to eq 'Saves the form'
          expect(node.value).to be_nil
          expect(node.states).to eq('pressed' => 'mixed', 'disabled' => true)
          expect(node.element).to eq 'element:f.1.e.42'
          text, heading = node.children
          expect(text.role).to eq 'text'
          expect(text.element).to be_nil
          expect(text.children).to be_empty
          expect(heading.value).to eq 'v'
          expect(heading.states).to eq('level' => 2)
          expect(heading.states['level']).to be_an(Integer)
          expect(made).to eq %w[f.1.e.42 f.1.e.43]
        end

        it 'rejects a result that is not an object' do
          expect { described_class.from_remote_value(remote('string', 'x')) { |id| id } }
            .to raise_error(Error::WebDriverError, /expected an object remote value/)
        end
      end
    end

    describe Remote::Bridge, '#accessibility_snapshot' do
      it 'needs a BiDi session' do
        bridge = described_class.new(http_client: instance_double(Remote::Http::Default))

        expect { bridge.accessibility_snapshot }
          .to raise_error(Error::UnsupportedOperationError, /BiDi.*web_socket_url/)
      end
    end

    describe AccessibilitySnapshotter do
      # A stand-in for the BiDi connection of a window with one child frame: the top-level
      # document answers "no such node" for the root, as Chromium does for a shared id another
      # document owns, and the documents in `owners` answer with a generic node.
      let(:connection) do
        Class.new do
          attr_reader :calls

          attr_accessor :preload_fails

          def initialize(owners)
            @owners = owners
            @calls = []
            @preload_fails = false
          end

          def send_cmd(method, **params)
            @calls << [method, params]
            case method
            when 'script.addPreloadScript'
              raise Error::WebDriverError, 'unknown command: script.addPreloadScript' if preload_fails

              {'script' => 'preload'}
            when 'browsingContext.getTree'
              {'contexts' => [{'context' => 'top', 'children' => [{'context' => 'child', 'children' => []}]}]}
            when 'script.callFunction' then call_function(params)
            end
          end

          private

          def call_function(params)
            raise Error::WebDriverError, 'no such node: unknown node' unless @owners.include?(params[:target][:context])

            {'type' => 'success',
             'result' => {'type' => 'object',
                          'value' => [['role', {'type' => 'string', 'value' => 'generic'}],
                                      ['name', {'type' => 'string', 'value' => ''}],
                                      ['description', {'type' => 'string', 'value' => ''}],
                                      ['states', {'type' => 'object', 'value' => []}],
                                      ['element', {'type' => 'node', 'sharedId' => 'shared-1'}],
                                      ['children', {'type' => 'array', 'value' => []}]]}}
          end
        end
      end

      def bridge_over(connection)
        instance_double(Remote::BiDiBridge, bidi: connection, window_handle: 'top')
      end

      it 'tries each browsing context of the window until one owns the root' do
        connection = self.connection.new(%w[child])
        bridge = bridge_over(connection)

        tree = described_class.new(bridge).snapshot(Element.new(bridge, 'shared-1'))

        expect(tree.role).to eq 'generic'
        calls = connection.calls.select { |call| call.first == 'script.callFunction' }
        contexts = calls.map { |_, params| params[:target][:context] }
        expect(contexts).to eq %w[top child]
      end

      it 'tries a failed preload again on the next snapshot' do
        connection = self.connection.new(%w[top])
        connection.preload_fails = true
        snapshotter = described_class.new(bridge_over(connection))
        preloads = -> { connection.calls.count { |method, _| method == 'script.addPreloadScript' } }

        snapshotter.snapshot
        snapshotter.snapshot
        expect(preloads.call).to eq(2), 'a failure must not count as preloaded'

        connection.preload_fails = false
        snapshotter.snapshot
        snapshotter.snapshot
        expect(preloads.call).to eq(3), 'a success is remembered'
      end

      it 'builds element references with the configured element class' do
        custom = Class.new(Element)
        Remote::Bridge.element_class = custom
        bridge = bridge_over(connection.new(%w[top]))

        tree = described_class.new(bridge).snapshot

        expect(tree.element).to be_an_instance_of(custom)
        expect(tree.element.ref).to eq [:element, 'shared-1']
      ensure
        Remote::Bridge.element_class = nil
      end

      it 'raises the stale element error when no context owns the root' do
        bridge = bridge_over(connection.new([]))

        expect { described_class.new(bridge).snapshot(Element.new(bridge, 'shared-1')) }
          .to raise_error(Error::StaleElementReferenceError)
      end
    end
  end
end
