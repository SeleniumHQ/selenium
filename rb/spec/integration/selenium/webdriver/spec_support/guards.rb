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
    module SpecSupport
      module Guards
        class << self
          def print_env
            puts "\nRunning Ruby specs:\n\n"

            env = current_env.merge(ruby: defined?(RUBY_DESCRIPTION) ? RUBY_DESCRIPTION : "ruby-#{RUBY_VERSION}")

            just = current_env.keys.map { |e| e.to_s.size }.max
            env.each do |key, value|
              puts "#{key.to_s.rjust(just)}: #{value}"
            end

            puts "\n"
          end

          def guards
            @guards ||= Hash.new { |hash, key| hash[key] = [] }
          end

          def record(guard_name, options, data)
            options.each do |opts|
              opts = current_env.merge(opts)
              key = opts.values_at(*current_env.keys).join('.')
              guards[key] << [guard_name, data]
            end
          end

          def report
            key = [
              GlobalTestEnv.browser,
              GlobalTestEnv.driver,
              Platform.os,
              GlobalTestEnv.native_events?
            ].join('.')

            gs = guards[key]

            print "\n\nSpec guards for this implementation: "

            if gs.empty?
              puts 'none.'
            else
              puts
              gs.each do |guard_name, data|
                puts "\t#{guard_name.to_s.ljust(20)}: #{data.inspect}"
              end
            end
          end

          def current_env
            {
              browser: GlobalTestEnv.browser,
              driver: GlobalTestEnv.driver,
              platform: Platform.os,
              native: GlobalTestEnv.native_events?,
              ci: Platform.ci
            }
          end

          #
          # not_compliant_on :browser => [:firefox, :chrome]
          #   - guard this spec for both firefox and chrome
          #
          # not_compliant_on {:browser => :chrome, :platform => :macosx}, {:browser => :firefox}
          #   - guard this spec for Chrome on OSX and Firefox on any OS

          def env_matches?(opts)
            res = opts.any? do |env|
              env.all? do |key, value|
                if value.is_a?(Array)
                  value.include? current_env[key]
                else
                  value == current_env[key]
                end
              end
            end

            p res => [opts, current_env] if @debug_guard
            res
          end
        end

        def debug_guard
          @debug_guard = true
          yield
        ensure
          @debug_guard = false
        end

        def not_compliant_on(*opts)
          Guards.record(:not_compliant, opts, file: caller.first)
          yield if GlobalTestEnv.unguarded? || !Guards.env_matches?(opts)
        end

        def compliant_on(*opts)
          Guards.record(:compliant_on, opts, file: caller.first)
          yield if GlobalTestEnv.unguarded? || Guards.env_matches?(opts)
        end

        alias_method :not_compliant_when, :not_compliant_on
        alias_method :compliant_when,     :compliant_on
      end # Guards
    end # SpecSupport
  end # WebDriver
end # Selenium
