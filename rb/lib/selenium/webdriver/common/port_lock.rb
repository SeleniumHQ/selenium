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

require 'tmpdir'

module Selenium
  module WebDriver
    #
    # Holds a lock on a starting port so that two processes probing for a free port
    # cannot both claim it. The lock lives in a file rather than on a TCP port, so it
    # needs no port of its own and is released even if the process is killed.
    #
    # @api private
    #

    class PortLock
      def initialize(port, timeout)
        @path = File.join(Dir.tmpdir, "selenium-port-#{port}.lock")
        @timeout = timeout
      end

      #
      # Attempt to acquire the lock. Control is yielded to an execution block once it
      # is held, and the lock is released when the block finishes.
      #

      def locked
        file = lock

        begin
          yield
        ensure
          release(file)
        end
      end

      private

      def lock
        max_time = current_time + @timeout

        loop do
          file = open_lock_file
          return file if file&.flock(File::LOCK_EX | File::LOCK_NB)

          file&.close
          break if current_time >= max_time

          sleep 0.1
        end

        raise Error::WebDriverError, "unable to acquire #{@path} within #{@timeout} seconds"
      end

      # nil means the lock is not available yet: Windows refuses to open a file another
      # process has locked. The handle outlives this method when it is returned, since it
      # holds the lock until #locked closes it.
      def open_lock_file
        file = File.open(@path, File::RDWR | File::CREAT) # rubocop:disable Style/FileOpen
        file.close_on_exec = true
        file
      rescue Errno::EACCES, Errno::EROFS => e
        WebDriver.logger.debug("#{self}: #{e.message}", id: :driver_service)
        nil
      end

      def release(file)
        file.flock(File::LOCK_UN)
        file.close
      end

      def current_time
        Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end
    end # PortLock
  end # WebDriver
end # Selenium
