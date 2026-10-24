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

      describe '.from_wire' do
        # The atom's wire form: element indices into the elements list, a frame index for frame nodes.
        it 'builds the tree and resolves the indices' do
          data = {
            'role' => 'generic', 'name' => '', 'description' => '', 'states' => {}, 'element' => 0,
            'children' => [
              {'role' => 'text', 'name' => 'Intro', 'description' => '', 'states' => {}, 'children' => []},
              {'role' => 'textbox', 'name' => 'Email', 'description' => 'Where to write', 'value' => 'a@b.c',
               'states' => {'focused' => true, 'level' => 2, 'pressed' => 'mixed', 'selected' => false},
               'element' => 1, 'children' => []},
              {'role' => 'iframe', 'name' => 'Embedded', 'description' => '', 'states' => {}, 'element' => 2,
               'frame' => 0, 'children' => []}
            ]
          }
          stitched = []

          node = described_class.from_wire(data, %w[element:0 element:1 element:2]) do |index|
            stitched << index
            [described_class.new(role: 'document', name: 'Inner')]
          end

          expect(node.role).to eq 'generic'
          expect(node.element).to eq 'element:0'
          text, textbox, frame = node.children
          expect(text.role).to eq 'text'
          expect(text.element).to be_nil
          expect(text.children).to be_empty
          expect(textbox.element).to eq 'element:1'
          expect(textbox.value).to eq 'a@b.c'
          expect(textbox.description).to eq 'Where to write'
          expect(textbox.states).to eq('focused' => true, 'level' => 2, 'pressed' => 'mixed', 'selected' => false)
          expect(frame.element).to eq 'element:2'
          expect(frame.children.map(&:name)).to eq(['Inner']), "the frame's children come from the binding"
          expect(stitched).to eq [0]
        end

        it 'keeps absent fields absent' do
          node = described_class.from_wire({'role' => 'list', 'name' => '', 'states' => {}, 'children' => []}, []) do
            []
          end

          expect(node.description).to eq ''
          expect(node.value).to be_nil
          expect(node.element).to be_nil
          expect(node.children).to be_empty
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

          def initialize(owners)
            @owners = owners
            @calls = []
          end

          def send_cmd(method, **params)
            @calls << [method, params]
            case method
            when 'browsingContext.getTree'
              {'contexts' => [{'context' => 'top', 'children' => [{'context' => 'child', 'children' => []}]}]}
            when 'script.callFunction' then call_function(params)
            end
          end

          private

          def call_function(params)
            raise Error::WebDriverError, 'no such node: unknown node' unless @owners.include?(params[:target][:context])

            json = {'role' => 'generic', 'name' => '', 'description' => '', 'states' => {}, 'element' => 0,
                    'children' => []}.to_json
            {'type' => 'success',
             'result' => {'type' => 'object',
                          'value' => [['json', {'type' => 'string', 'value' => json}],
                                      ['elements',
                                       {'type' => 'array', 'value' => [{'type' => 'node', 'sharedId' => 'shared-1'}]}],
                                      ['windows', {'type' => 'array', 'value' => []}]]}}
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

      it 'reads a root another document owns as nil and a detached root as the stale error' do
        answers = []
        connection = Class.new {
          def initialize(answers)
            @answers = answers
          end

          def send_cmd(_method, **_params)
            {'type' => 'success', 'result' => @answers.shift}
          end
        }.new(answers)
        snapshotter = described_class.new(bridge_over(connection))

        answers << {'type' => 'null'}
        expect(snapshotter.send(:snapshot_context, 'ctx', 'shared-1')).to be_nil

        answers << {'type' => 'object', 'value' => [['error', {'type' => 'string', 'value' => 'detached'}]]}
        expect { snapshotter.send(:snapshot_context, 'ctx', 'shared-1') }
          .to raise_error(Error::StaleElementReferenceError)
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
