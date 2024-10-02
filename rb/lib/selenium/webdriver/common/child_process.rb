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
    # @api private
    #

    class ChildProcess
      TimeoutError = Class.new(StandardError)

      SIGTERM = 'TERM'
      SIGKILL = 'KILL'

      POLL_INTERVAL = 0.1

      attr_accessor :detach
      attr_writer :io

      def self.build(*command)
        new(*command)
      end

      def initialize(*command)
        @command = command
        @detach = false
        @pid = nil
        @status = nil
      end

      def io
        @io ||= Platform.null_device
      end

      def start
        options = {%i[out err] => io}
        options[:pgroup] = true unless Platform.windows? # NOTE: this is a bug only in Windows 7

        WebDriver.logger.debug("Starting process: #{@command} with #{options}", id: :process)
        @pid = Process.spawn(*@command, options)
        WebDriver.logger.debug("  -> pid: #{@pid}", id: :process)

        Process.detach(@pid) if detach
      end

      def stop(timeout = 3)
        return unless @pid
        return if exited?

        WebDriver.logger.debug("Sending TERM to process: #{@pid}", id: :process)
        terminate(@pid)
        poll_for_exit(timeout)

        WebDriver.logger.debug("  -> stopped #{@pid}", id: :process)
      rescue TimeoutError, Errno::EINVAL
        WebDriver.logger.debug("    -> sending KILL to process: #{@pid}", id: :process)
        kill(@pid)
        wait
        WebDriver.logger.debug("      -> killed #{@pid}", id: :process)
      end

      def alive?
        @pid && !exited?
      end

      def exited?
        return false unless @pid

        WebDriver.logger.debug("Checking if #{@pid} is exited:", id: :process)
        _, @status = waitpid2(@pid, Process::WNOHANG | Process::WUNTRACED) if @status.nil?
        return false if @status.nil?

        exit_code = @status.exitstatus || @status.termsig
        WebDriver.logger.debug("  -> exit code is #{exit_code.inspect}", id: :process)

        !!exit_code
      end

      def poll_for_exit(timeout)
        WebDriver.logger.debug("Polling #{timeout} seconds for exit of #{@pid}", id: :process)

        end_time = Time.now + timeout
        sleep POLL_INTERVAL until exited? || Time.now > end_time

        raise TimeoutError, "  ->  #{@pid} still alive after #{timeout} seconds" unless exited?
      end

      def wait
        return if exited?

        _, @status = waitpid2(@pid)
      end

      private

      def terminate(pid)
        Process.kill(SIGTERM, pid)
      end

      def kill(pid)
        Process.kill(SIGKILL, pid)
      rescue Errno::ECHILD, Errno::ESRCH
        # already dead
      end

      def waitpid2(pid, flags = 0)
        Process.waitpid2(pid, flags)
      rescue Errno::ECHILD
        # already dead
      end
    end # ChildProcess
  end # WebDriver
end # Selenium
