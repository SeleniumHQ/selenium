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
    module FedCM
      # Represents an account displayed in a FedCm account list.
      # See: https://w3c-fedid.github.io/FedCM/#dictdef-identityprovideraccount
      #      https://w3c-fedid.github.io/FedCM/#webdriver-accountlist
      class Account
        LOGIN_STATE_SIGNIN = 'SignIn'
        LOGIN_STATE_SIGNUP = 'SignUp'

        attr_reader :account_id, :email, :name, :given_name, :picture_url,
                    :idp_config_url, :login_state, :terms_of_service_url, :privacy_policy_url

        # Initializes a new account with the provided attributes.
        #
        # @param [Hash]
        def initialize(**args)
          @account_id = args['accountId']
          @email = args['email']
          @name = args['name']
          @given_name = args['givenName']
          @picture_url = args['pictureUrl']
          @idp_config_url = args['idpConfigUrl']
          @login_state = args['loginState']
          @terms_of_service_url = args['termsOfServiceUrl']
          @privacy_policy_url = args['privacyPolicyUrl']
        end
      end # Account
    end # FedCM
  end # WebDriver
end # Selenium
