# frozen_string_literal: true

# frozen_string_literal = true

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

require_relative './script/evaluate_result/exception_details'
require_relative './script/evaluate_result/evaluate_result_exception'
require_relative './script/evaluate_result/evaluate_result_success'
require_relative './script/evaluate_result/evaluate_result_type'
require_relative './script/protocol_value/local_value'
require_relative './script/protocol_value/reference_value'
require_relative './script/protocol_value/remote_value'
require_relative './script/protocol_value/reg_exp_value'
require_relative './script/realm_info/realm_info'

module Selenium
  module WebDriver
    class BiDi
      class ScriptManager
        def initialize(driver:, browsing_context_id:)
          unless driver.capabilities.web_socket_url
            raise Error::WebDriverError,
                  'WebDriver instance must support BiDi protocol'
          end

          @bidi = driver.bidi
          @browsing_context_id = browsing_context_id
        end

        def disown_realm_script(realm_id, handles)
          @bidi.send_cmd('script.disown', handles: handles, target: {realm: realm_id})
        end

        def disown_browsing_context_script(browsing_context_id, handles, sandbox: nil)
          @bidi.send_cmd('script.disown', handles: handles, target: {context: browsing_context_id, sandbox: sandbox})
        end

        def call_function_in_realm(realm_id, function_declaration, await_promise, argument_value_list: nil,
                                   this_parameter: nil, result_ownership: nil)
          params = get_call_function_params('realm', realm_id, nil, function_declaration, await_promise,
                                            argument_value_list, this_parameter, result_ownership)
          response = @bidi.send_cmd(
            'script.callFunction',
            functionDeclaration: params[:function_declaration],
            awaitPromise: params[:await_promise],
            target: params[:target],
            arguments: params[:arguments],
            this: params[:this],
            resultOwnership: params[:result_ownership]
          )

          create_evaluate_result(response)
        end

        def call_function_in_browsing_context(browsing_context_id, function_declaration, await_promise,
                                              argument_value_list: nil, this_parameter: nil, result_ownership: nil,
                                              sandbox: nil)
          params = get_call_function_params('contextTarget', browsing_context_id, sandbox, function_declaration,
                                            await_promise, argument_value_list, this_parameter, result_ownership)
          response = @bidi.send_cmd(
            'script.callFunction',
            functionDeclaration: params[:function_declaration],
            awaitPromise: params[:await_promise],
            target: params[:target],
            arguments: params[:arguments],
            this: params[:this],
            resultOwnership: params[:result_ownership]
          )

          create_evaluate_result(response)
        end

        def evaluate_function_in_realm(realm_id, expression, await_promise, result_ownership: nil)
          params = get_evaluate_params('realm', realm_id, nil, expression, await_promise, result_ownership)

          response = @bidi.send_cmd(
            'script.evaluate',
            expression: params[:expression],
            awaitPromise: params[:await_promise],
            target: params[:target],
            resultOwnership: params[:result_ownership]
          )

          create_evaluate_result(response)
        end

        def evaluate_function_in_browsing_context(browsing_context_id, expression, await_promise,
                                                  result_ownership: nil, sandbox: nil)
          params = get_evaluate_params('contextTarget', browsing_context_id, sandbox, expression, await_promise,
                                       result_ownership)

          response = @bidi.send_cmd(
            'script.evaluate',
            expression: params[:expression],
            awaitPromise: params[:await_promise],
            target: params[:target],
            resultOwnership: params[:result_ownership]
          )

          create_evaluate_result(response)
        end

        def all_realms
          response = @bidi.send_cmd('script.getRealms')
          realm_info_mapper(response['realms'])
        end

        def realms_by_type(type)
          response = @bidi.send_cmd(
            'script.getRealms',
            type: type
          )
          realm_info_mapper(response['realms'])
        end

        def realms_in_browsing_context(browsing_context)
          response = @bidi.send_cmd(
            'script.getRealms',
            context: browsing_context
          )
          realm_info_mapper(response['realms'])
        end

        def realms_in_browsing_context_by_type(browsing_context, type)
          response = @bidi.send_cmd(
            'script.getRealms',
            context: browsing_context,
            type: type
          )
          realm_info_mapper(response['realms'])
        end

        private

        def get_call_function_params(target_type, id, sandbox, function_declaration, await_promise,
                                     argument_value_list = nil, this_parameter = nil, result_ownership = nil)
          params = {
            function_declaration: function_declaration,
            await_promise: await_promise
          }

          params[:target] = if target_type.eql? 'contextTarget'
                              sandbox.nil? ? {'context' => id} : {'context' => id, 'sandbox' => sandbox}
                            else
                              {'realm' => id}
                            end

          unless argument_value_list.nil?
            params[:arguments] = argument_value_list # .map { |val| val.as_map }
          end

          params[:this] = this_parameter unless this_parameter.nil?

          params[:result_ownership] = result_ownership unless result_ownership.nil?

          params
        end

        def get_evaluate_params(target_type, id, sandbox, expression, await_promise, result_ownership = nil)
          params = {
            expression: expression,
            await_promise: await_promise
          }

          params[:target] = if target_type.eql? 'contextTarget'
                              sandbox.nil? ? {context: id} : {context: id, sandbox: sandbox}
                            else
                              {realm: id}
                            end

          params[:result_ownership] = result_ownership unless result_ownership.nil?

          params
        end

        def create_evaluate_result(response)
          type = response['type']
          realm_id = response['realm']

          if type.eql? EvaluateResultType::SUCCESS
            result = response['result']
            evaluate_result = EvaluateResultSuccess.new(
              realm_id,
              RemoteValue.new(result)
            )
          else
            exception_details = response['exceptionDetails']
            evaluate_result = EvaluateResultException.new(
              realm_id,
              ExceptionDetails.new(exception_details)
            )
          end

          evaluate_result
        end

        def realm_info_mapper(realms)
          realms.map { |val| RealmInfo.from_json(val) }
        end
      end
    end
  end
end
