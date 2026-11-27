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

require File.expand_path('../../../../../../lib/selenium/webdriver/bidi/protocol', __dir__)

module Selenium
  module WebDriver
    # What the network handler specs run the generated BiDi domains over: a recording connection, a bridge on it,
    # and the authRequired params a remote end sends
    module NetworkSpecSupport
      # Records the commands sent over it, answers them as a remote end would, and hands events to the connection's
      # dispatcher as the socket thread does
      class RecordingConnection
        RESULTS = {
          'network.addIntercept' => ->(n) { {'intercept' => "intercept-#{n}"} },
          'session.subscribe' => ->(n) { {'subscription' => "subscription-#{n}"} }
        }.freeze

        attr_reader :errors

        def initialize
          @sent = []
          @intercepts = []
          @errors = {}
          @mutex = Mutex.new
          @arrived = ConditionVariable.new
          @last_id = 0
        end

        def send_cmd(**payload)
          @mutex.synchronize do
            @sent << payload
            @arrived.broadcast
            error = errors[payload[:method]]
            next {'error' => error, 'message' => 'refused'} if error

            result = RESULTS.fetch(payload[:method], ->(_) { {} }).call(@last_id += 1)
            @intercepts << result['intercept'] if result.key?('intercept')
            {'result' => result}
          end
        end

        # The ids of the intercepts it has added, in order
        def intercepts
          @mutex.synchronize { @intercepts.dup }
        end

        def event_receiver(&factory)
          @mutex.synchronize { @event_receiver ||= factory&.call }
        end

        def emit(event, params)
          event_receiver.receive(event, params)
        end

        def sent(method = nil)
          @mutex.synchronize { @sent.select { |payload| method.nil? || payload[:method] == method }.dup }
        end

        # Listeners run on threads of their own, so a command they send arrives later
        def await(method, count: 1, timeout: 5)
          deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + timeout
          @mutex.synchronize do
            loop do
              found = @sent.select { |payload| payload[:method] == method }
              return found if found.size >= count

              remaining = deadline - Process.clock_gettime(Process::CLOCK_MONOTONIC)
              raise "#{method} was not sent #{count} time(s) within #{timeout} seconds: #{@sent}" if remaining <= 0

              @arrived.wait(@mutex, remaining)
            end
          end
        end
      end

      # The parts of a BiDi bridge the network handlers use
      RecordingBridge = Struct.new(:bidi_network, :bidi_session, :listener_errors, :bidi) do
        def self.over(connection, bidi: nil)
          new(BiDi::Protocol::Network.new(connection), BiDi::Protocol::Session.new(connection), ListenerErrors.new,
              bidi)
        end
      end

      TIMINGS = %w[timeOrigin requestTime redirectStart redirectEnd fetchStart dnsStart dnsEnd connectStart
                   connectEnd tlsStart requestStart responseStart responseEnd].to_h { |key| [key, 0] }.freeze

      def auth_required(intercepts: [], id: 'request-1', url: 'https://example.com/', blocked: true,
                        user_context: 'default')
        {'context' => 'window-1', 'isBlocked' => blocked, 'navigation' => nil, 'redirectCount' => 0,
         'request' => {'request' => id, 'url' => url, 'method' => 'GET', 'headers' => [], 'cookies' => [],
                       'headersSize' => 0, 'bodySize' => nil, 'destination' => '', 'initiatorType' => nil,
                       'timings' => TIMINGS},
         'timestamp' => 1, 'intercepts' => intercepts, 'userContext' => user_context,
         'response' => {'url' => url, 'protocol' => 'http/1.1', 'status' => 401, 'statusText' => 'Unauthorized',
                        'fromCache' => false, 'headers' => [], 'mimeType' => 'text/html', 'bytesReceived' => 0,
                        'headersSize' => 0, 'bodySize' => nil, 'content' => {'size' => 0},
                        'authChallenges' => [{'scheme' => 'basic', 'realm' => 'test'}]}}
      end

      def typed(event, params)
        BiDi::Protocol::Network::EVENT_TYPES.fetch(event).from_json(params)
      end
    end
  end
end
