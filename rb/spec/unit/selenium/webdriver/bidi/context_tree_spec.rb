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

module Selenium
  module WebDriver
    class BiDi
      # Runs over a real WebSocketConnection, socket thread included, whose socket is a remote end that
      # answers each command, emits events on request, and can emit events before it replies.
      describe ContextTree do
        let(:remote_end_class) do
          Class.new do
            attr_reader :sent
            attr_accessor :tree

            def initialize
              @sent = []
              @tree = []
              @before_reply = {}
              @errors = {}
              @inbound = Queue.new
              @commands = WebSocket::Frame::Incoming::Server.new(version: 13)
              @write_mtx = Mutex.new
            end

            def before_reply(method, &block)
              @before_reply[method] = block
            end

            def refuse(method)
              @errors[method] = true
            end

            def write(data)
              @write_mtx.synchronize do
                @commands << data
                while (frame = @commands.next)
                  command = JSON.parse(frame.to_s)
                  @sent << command
                  reply(command)
                end
              end
            end

            def emit(method, params)
              push(type: 'event', method: method, params: params)
            end

            def readpartial(_size)
              @inbound.pop || raise(EOFError)
            end

            def close
              @inbound.close
            end

            private

            def reply(command)
              method = command['method']
              @before_reply[method]&.call
              if @errors[method]
                push(id: command['id'], type: 'error', error: 'unknown command', message: "#{method} refused")
              else
                push(id: command['id'], type: 'success', result: result_for(method))
              end
            end

            def result_for(method)
              case method
              when 'browsingContext.getTree' then {contexts: tree}
              when 'session.subscribe' then {subscription: 'sub-1'}
              else {}
              end
            end

            def push(message)
              @inbound << WebSocket::Frame::Outgoing::Server.new(version: 13, data: JSON.generate(message),
                                                                 type: 'text').to_s
            end
          end
        end

        let(:remote_end) { remote_end_class.new }

        let(:connection) do
          WebSocketConnection.allocate.tap do |connection|
            allow(connection).to receive(:process_handshake)
            connection.instance_variable_set(:@socket, remote_end)
            connection.send(:initialize, url: 'ws://localhost:9222/session')
          end
        end

        let(:tree) { described_class.new(connection) }

        after { connection.close }

        def info(context, parent: nil, children: nil)
          {context: context, parent: parent, children: children, clientWindow: 'client-1', originalOpener: nil,
           url: 'about:blank', userContext: 'default'}
        end

        def emit_created(context, parent: nil)
          remote_end.emit('browsingContext.contextCreated', info(context, parent: parent))
        end

        def window_with_frames
          [info('window', children: [info('frame', parent: 'window', children: [info('nested', parent: 'frame')]),
                                     info('sibling', parent: 'window')])]
        end

        # The socket thread handles messages in order, so a reply means every earlier event was handed to listeners.
        def await_dispatch
          Protocol::BrowsingContext.new(connection).get_tree
        end

        describe '.new' do
          it 'subscribes to context creation before reading the tree' do
            tree

            expect(remote_end.sent.map { |command| command['method'] })
              .to eq(%w[session.subscribe browsingContext.getTree])
            expect(remote_end.sent.first['params']).to eq('events' => %w[browsingContext.contextCreated])
          end

          it 'learns the contexts that exist from the tree' do
            remote_end.tree = window_with_frames

            expect(%w[window frame nested sibling].map { |context| tree.top_level(context) }).to all(eq('window'))
          end

          it 'listens before reading the tree, so a context created meanwhile is kept' do
            remote_end.before_reply('browsingContext.getTree') { emit_created('popup') }

            expect(tree.top_level('popup')).to eq('popup')
          end

          it 'warns instead of raising when the remote end refuses to subscribe' do
            remote_end.refuse('session.subscribe')

            expect { tree }.to have_warning(:bidi_context_tree, /not tracked.*session\.subscribe refused/)
            expect { tree.top_level('window') }.to raise_error(Error::WebDriverError, /not tracked/)
          end
        end

        describe '#top_level' do
          before do
            remote_end.tree = [info('window')]
            tree
          end

          it 'traces a nested frame to its window' do
            emit_created('frame', parent: 'window')
            emit_created('nested', parent: 'frame')

            expect(tree.top_level('nested')).to eq('window')
            expect(tree.top_level('frame')).to eq('window')
          end

          it 'traces a frame whose creation is handled before its parent\'s' do
            emit_created('nested', parent: 'frame')
            await_dispatch
            emit_created('frame', parent: 'window')

            expect(tree.top_level('nested')).to eq('window')
          end

          it 'waits for a context announced after it is asked about' do
            asked = Thread.new { tree.top_level('late') }
            Wait.new(timeout: 5).until { asked.status == 'sleep' }

            emit_created('late', parent: 'window')

            expect(asked.value).to eq('window')
          end

          it 'raises for a context that is never announced' do
            expect { tree.top_level('unknown') }.to raise_error(Error::TimeoutError, /unknown was announced/)
          end
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
