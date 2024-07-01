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
    module DriverExtensions
      module HasFedCmDialog
        # Disables the promise rejection delay for FedCm.
        #
        # FedCm by default delays promise resolution in failure cases for privacy reasons.
        # This method allows turning it off to let tests run faster where this is not relevant.
        def enable_fedcm_delay=(enable)
          @bridge.fedcm_delay(enable)
        end

        # Resets the FedCm dialog cooldown.
        #
        # If a user agent triggers a cooldown when the account chooser is dismissed,
        # this method resets that cooldown so that the dialog can be triggered again immediately.
        def reset_fedcm_cooldown
          @bridge.reset_fedcm_cooldown
        end

        def fedcm_dialog
          @fedcm_dialog ||= FedCM::Dialog.new(@bridge)
        end

        def wait_for_fedcm_dialog(timeout: 5, interval: 0.2, message: nil, ignore: nil)
          wait = Wait.new(timeout: timeout, interval: interval, message: message, ignore: ignore)
          wait.until do
            fedcm_dialog if fedcm_dialog.type
          rescue Error::NoSuchAlertError
            nil
          end
        end
      end # HasFedCmDialog
    end # DriverExtensions
  end # WebDriver
end # Selenium
