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

    #
    # @api private
    #

    module FileReaper

      class << self
        def reap=(bool)
          @reap = bool
        end

        def reap?
          @reap = true unless defined?(@reap)
          !!@reap
        end

        def tmp_files
          @tmp_files ||= Hash.new { |hash, pid| hash[pid] = [] }
          @tmp_files[Process.pid]
        end

        def <<(file)
          tmp_files << file
        end

        def reap(file)
          return unless reap?

          unless tmp_files.include?(file)
            raise Error::WebDriverError, "file not added for reaping: #{file.inspect}"
          end

          FileUtils.rm_rf tmp_files.delete(file)
        end

        def reap!
          if reap?
            tmp_files.each { |file| FileUtils.rm_rf(file) }
            true
          else
            false
          end
        end
      end

      # we *do* want child process reaping, so not using Platform.exit_hook here.
      at_exit { reap! }

    end # FileReaper
  end # WebDriver
end # Selenium