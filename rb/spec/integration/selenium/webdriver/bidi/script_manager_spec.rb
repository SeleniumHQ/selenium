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

require_relative '../spec_helper'

module Selenium
  module WebDriver
    class BiDi
      describe ScriptManager, only: {browser: %i[chrome edge firefox]} do
        before { reset_driver!(web_socket_url: true) }
        after { quit_driver }

        it 'can call function with undefined argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_undefined_value]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==undefined)
                throw Error("Argument should be undefined, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('undefined')
        end

        it 'can call function with null argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_null_value]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==null)
                throw Error("Argument should be null, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('null')
        end

        it 'can call function with minus zero argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_special_number_value('-0')]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==-0)
                throw Error("Argument should be -0, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('number')
          expect(result.dig('result', 'value')).to eq('-0')
        end

        it 'can call function with infinity argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_special_number_value('Infinity')]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==Infinity)
                throw Error("Argument should be Infinity, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('number')
          expect(result.dig('result', 'value')).to eq('Infinity')
        end

        it 'can call function with minus infinity argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_special_number_value('-Infinity')]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==-Infinity)
                throw Error("Argument should be -Infinity, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('number')
          expect(result.dig('result', 'value')).to eq('-Infinity')
        end

        it 'can call function with number argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_number_value(1.4)]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==1.4)
                throw Error("Argument should be 1.4, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('number')
          expect(result.dig('result', 'value')).to eq(1.4)
        end

        it 'can call function with boolean argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_boolean_value(true)]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==true)
                throw Error("Argument should be true, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('boolean')
          expect(result.dig('result', 'value')).to be(true)
        end

        it 'can call function with big int argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_big_int_value('42')]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(arg!==42n)
                throw Error("Argument should be 42n, but was "+arg);
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('bigint')
          expect(result.dig('result', 'value')).to eq('42')
        end

        it 'can call function with array argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          array_value = [LocalValue.create_string_value('foobar')]
          argument_values = [LocalValue.create_array_value(array_value)]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(! (arg instanceof Array))
                throw Error("Argument should be Array, but was "+
                  Object.prototype.toString.call(arg));
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('array')

          result_value = result.dig('result', 'value')
          expect(result_value.length).to eq(1)
          expect(result_value.dig(0, 'type')).to eq('string')
          expect(result_value.dig(0, 'value')).to eq('foobar')
        end

        it 'can call function with set argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          set_value = [LocalValue.create_string_value('foobar')]
          argument_values = [LocalValue.create_set_value(set_value)]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(! (arg instanceof Set))
                throw Error("Argument should be Set, but was "+
                  Object.prototype.toString.call(arg));
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('set')

          result_value = result.dig('result', 'value')
          expect(result_value.length).to eq(1)
          expect(result_value.dig(0, 'type')).to eq('string')
          expect(result_value.dig(0, 'value')).to eq('foobar')
        end

        it 'can call function with date argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_date_value('2022-05-31T13:47:29.000Z')]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(! (arg instanceof Date))
                throw Error("Argument should be Date, but was "+
                  Object.prototype.toString.call(arg));
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('date')
          expect(result.dig('result', 'value')).to eq('2022-05-31T13:47:29.000Z')
        end

        it 'can call function with map argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          map_value = {'foobar' => LocalValue.create_string_value('foobar')}
          argument_values = [LocalValue.create_map_value(map_value)]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(! (arg instanceof Map))
                throw Error("Argument should be Map, but was "+
                  Object.prototype.toString.call(arg));
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('map')

          result_value = result.dig('result', 'value')
          expect(result_value.length).to eq(1)
          expect(result_value.dig(0, 1, 'type')).to eq('string')
          expect(result_value.dig(0, 1, 'value')).to eq('foobar')
        end

        it 'can call function with object argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          object_value = {'foobar' => LocalValue.create_string_value('foobar')}
          argument_values = [LocalValue.create_object_value(object_value)]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(! (arg instanceof Object))
                throw Error("Argument should be Object, but was "+
                  Object.prototype.toString.call(arg));
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('object')

          result_value = result.dig('result', 'value')
          expect(result_value.length).to eq(1)
          expect(result_value.dig(0, 1, 'type')).to eq('string')
        end

        it 'can call function with regex argument' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          argument_values = [LocalValue.create_regular_expression_value({pattern: 'foo', flags: 'g'})]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (arg) => {{
              if(! (arg instanceof RegExp))
                throw Error("Argument should be RegExp, but was "+
                  Object.prototype.toString.call(arg));
              return arg;
            }}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('regexp')

          result_value = result.dig('result', 'value')
          expect(result_value['pattern']).to eq('foo')
          expect(result_value['flags']).to eq('g')
        end

        it 'can call function with declaration' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.call_function_in_browsing_context(
            id,
            %(
            ()=>{return 1+2;}
          ),
            false
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('number')
          expect(result.dig('result', 'value')).to eq(3)
        end

        it 'can call function with arguments' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          value1 = LocalValue.create_string_value('ARGUMENT_STRING_VALUE')
          value2 = LocalValue.create_number_value(42)
          argument_values = [value1, value2]
          result = manager.call_function_in_browsing_context(
            id,
            %(
            (...args)=>{return args}
          ),
            false,
            argument_value_list: argument_values
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('array')
          expect(result.dig('result', 'value').length).to eq(2)
        end

        it 'can call function with await promise true' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.call_function_in_browsing_context(
            id,
            %(
            async function() {{
              await new Promise(r => setTimeout(() => r(), 0));
              return "SOME_DELAYED_RESULT";
            }}
          ),
            true
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('string')
          expect(result.dig('result', 'value')).to eq('SOME_DELAYED_RESULT')
        end

        it 'can call function with await promise false' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.call_function_in_browsing_context(
            id,
            %(
            async function() {{
              await new Promise(r => setTimeout(() => r(), 0));
              return "SOME_DELAYED_RESULT";
            }}
          ),
            false
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('promise')
          expect(result.dig('result', 'value')).to be_nil
        end

        it 'can call function with ownership root' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.call_function_in_browsing_context(
            id,
            %(
            async function(){return {a:1}}
          ),
            true,
            result_ownership: 'root'
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'handle')).not_to be_nil
          expect(result.dig('result', 'value')).not_to be_nil
        end

        it 'can call function with ownership none' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.call_function_in_browsing_context(
            id,
            %(
            async function(){return {a:1}}
          ),
            true,
            result_ownership: 'none'
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'handle')).to be_nil
          expect(result.dig('result', 'value')).not_to be_nil
        end

        it 'can call function that throws exception', only: {browser: %i[firefox]} do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.call_function_in_browsing_context(
            id,
            '))) !!@@## some invalid JS script (((',
            false
          )

          expect(result['type']).to eq('exception')
          expect(result['realm']).not_to be_nil
          expect(result.dig('exceptionDetails', 'exception', 'type')).to eq('error')
          expect(result.dig('exceptionDetails', 'text')).to eq("SyntaxError: expected expression, got ')'")
          expect(result.dig('exceptionDetails', 'columnNumber')).to eq 39
          expect(result.dig('exceptionDetails', 'stackTrace', 'callFrames').length).to eq 0
        end

        it 'can call function in a sandbox' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)

          # Make changes without sandbox
          manager.call_function_in_browsing_context(
            id,
            %(
              () => { window.foo = 1; }
            ),
            true
          )

          # Check changes are not present in the sandbox
          result_not_in_sandbox = manager.call_function_in_browsing_context(
            id,
            %(
              () => window.foo
            ),
            true,
            sandbox: 'sandbox'
          )

          expect(result_not_in_sandbox['type']).to eq('success')
          expect(result_not_in_sandbox.dig('result', 'type')).to eq 'undefined'

          # Make changes in the sandbox
          manager.call_function_in_browsing_context(
            id,
            %(
              () => { window.foo = 2; }
            ),
            true,
            sandbox: 'sandbox'
          )

          # Check if the changes are present in the sandbox
          result_in_sandbox = manager.call_function_in_browsing_context(
            id,
            %(
              () => window.foo
            ),
            true,
            sandbox: 'sandbox'
          )

          expect(result_in_sandbox['type']).to eq('success')
          expect(result_in_sandbox['realm']).not_to be_nil
          expect(result_in_sandbox.dig('result', 'type')).to eq 'number'
          expect(result_in_sandbox.dig('result', 'value')).to be 2
        end

        it 'can call function in a realm' do
          first_tab = driver.window_handle
          driver.switch_to.new_window(:tab)
          manager = described_class.new(driver: driver, browsing_context_id: first_tab)

          realms = manager.all_realms
          first_tab_realm_id = realms[0]['realm']
          second_tab_realm_id = realms[1]['realm']

          manager.call_function_in_realm(
            first_tab_realm_id,
            %(
              () => { window.foo = 3; }
            ),
            true
          )

          manager.call_function_in_realm(
            second_tab_realm_id,
            %(
              () => { window.foo = 5; }
            ),
            true
          )

          first_context_result = manager.call_function_in_realm(
            first_tab_realm_id,
            %(
              () => window.foo
            ),
            true
          )

          expect(first_context_result['type']).to eq('success')
          expect(first_context_result.dig('result', 'type')).to eq 'number'
          expect(first_context_result.dig('result', 'value')).to eq 3

          second_context_result = manager.call_function_in_realm(
            second_tab_realm_id,
            %(
              () => window.foo
            ),
            true
          )

          expect(second_context_result['type']).to eq('success')
          expect(second_context_result.dig('result', 'type')).to eq 'number'
          expect(second_context_result.dig('result', 'value')).to eq 5
        end

        it 'can evaluate script' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.evaluate_function_in_browsing_context(
            id,
            %(
              1 + 2
            ),
            true
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq 'number'
          expect(result.dig('result', 'value')).to eq 3
        end

        it 'can evaluate script that throws exception', only: {browser: %i[firefox]} do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.evaluate_function_in_browsing_context(
            id,
            '))) !!@@## some invalid JS script (((',
            false
          )

          expect(result['type']).to eq('exception')
          expect(result['realm']).not_to be_nil
          expect(result.dig('exceptionDetails', 'exception', 'type')).to eq('error')
          expect(result.dig('exceptionDetails', 'text')).to eq("SyntaxError: expected expression, got ')'")
          expect(result.dig('exceptionDetails', 'columnNumber')).to eq 39
          expect(result.dig('exceptionDetails', 'stackTrace', 'callFrames').length).to eq 0
        end

        it 'can evaluate script with result ownership' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          result = manager.evaluate_function_in_browsing_context(
            id,
            %(
              Promise.resolve({a:1})
            ),
            true,
            result_ownership: 'root'
          )

          expect(result['type']).to eq('success')
          expect(result['realm']).not_to be_nil
          expect(result.dig('result', 'type')).to eq('object')
          expect(result.dig('result', 'value')).not_to be_nil
          expect(result.dig('result', 'handle')).not_to be_nil
        end

        it 'can evaluate in a sandbox' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)

          # Make changes without sandbox
          manager.evaluate_function_in_browsing_context(
            id,
            %(
              window.foo = 1
            ),
            true
          )

          # Check changes are not present in the sandbox
          result_not_in_sandbox = manager.evaluate_function_in_browsing_context(
            id,
            %(
              window.foo
            ),
            true,
            sandbox: 'sandbox'
          )

          expect(result_not_in_sandbox['type']).to eq('success')
          expect(result_not_in_sandbox.dig('result', 'type')).to eq 'undefined'

          # Make changes in the sandbox
          manager.evaluate_function_in_browsing_context(
            id,
            %(
              window.foo = 2
            ),
            true,
            sandbox: 'sandbox'
          )

          # Check if the changes are present in the sandbox
          result_in_sandbox = manager.evaluate_function_in_browsing_context(
            id,
            %(
              window.foo
            ),
            true,
            sandbox: 'sandbox'
          )

          expect(result_in_sandbox['type']).to eq('success')
          expect(result_in_sandbox['realm']).not_to be_nil
          expect(result_in_sandbox.dig('result', 'type')).to eq 'number'
          expect(result_in_sandbox.dig('result', 'value')).to eq 2
        end

        it 'can evaluate in a realm' do
          first_tab = driver.window_handle
          driver.switch_to.new_window(:tab)
          manager = described_class.new(driver: driver, browsing_context_id: first_tab)

          realms = manager.all_realms
          first_tab_realm_id = realms[0]['realm']
          second_tab_realm_id = realms[1]['realm']

          manager.evaluate_function_in_realm(
            first_tab_realm_id,
            %(
              window.foo = 3
            ),
            true
          )

          manager.evaluate_function_in_realm(
            second_tab_realm_id,
            %(
              window.foo = 5
            ),
            true
          )

          first_context_result = manager.evaluate_function_in_realm(
            first_tab_realm_id,
            %(
              window.foo
            ),
            true
          )

          expect(first_context_result['type']).to eq('success')
          expect(first_context_result.dig('result', 'type')).to eq 'number'
          expect(first_context_result.dig('result', 'value')).to eq 3

          second_context_result = manager.evaluate_function_in_realm(
            second_tab_realm_id,
            %(
              window.foo
            ),
            true
          )

          expect(second_context_result['type']).to eq('success')
          expect(second_context_result.dig('result', 'type')).to eq 'number'
          expect(second_context_result.dig('result', 'value')).to eq 5
        end

        it 'can disown handles', only: {browser: %i[firefox]} do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          evaluate_result = manager.evaluate_function_in_browsing_context(
            id,
            %(
              ({a:1})
            ),
            false,
            result_ownership: 'root'
          )
          expect(evaluate_result['type']).to eq('success')
          expect(evaluate_result['realm']).not_to be_nil
          expect(evaluate_result.dig('result', 'handle')).not_to be_nil

          value_map = evaluate_result.dig('result', 'value')
          value1 = LocalValue.create_object_value(value_map)
          value2 = ReferenceValue.new(
            handle: evaluate_result.dig('result', 'handle')
          ).as_map
          argument_values = [value1, value2]

          manager.call_function_in_browsing_context(
            id,
            %(
              arg => arg.a
            ),
            false,
            argument_value_list: argument_values
          )

          expect(evaluate_result.dig('result', 'value')).not_to be_nil

          handles = [evaluate_result.dig('result', 'handle')]
          manager.disown_browsing_context_script(id, handles)

          expect {
            manager.call_function_in_browsing_context(
              id,
              %(
                arg => arg.a
              ),
              false,
              argument_value_list: argument_values
            )
          }.to raise_error(Error::WebDriverError)
        end

        it 'can disown handles in realm' do
          id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: id)
          evaluate_result = manager.evaluate_function_in_browsing_context(
            id,
            %(
              ({a:1})
            ),
            false,
            result_ownership: 'root'
          )
          expect(evaluate_result['type']).to eq('success')
          expect(evaluate_result['realm']).not_to be_nil
          expect(evaluate_result.dig('result', 'handle')).not_to be_nil

          value_map = evaluate_result.dig('result', 'value')
          value1 = LocalValue.create_object_value(value_map)
          value2 = ReferenceValue.new(
            handle: evaluate_result.dig('result', 'handle')
          ).as_map
          argument_values = [value1, value2]

          manager.call_function_in_browsing_context(
            id,
            %(
              arg => arg.a
            ),
            false,
            argument_value_list: argument_values
          )

          expect(evaluate_result.dig('result', 'value')).not_to be_nil

          handles = [evaluate_result.dig('result', 'handle')]
          manager.disown_realm_script(evaluate_result['realm'], handles)

          expect {
            manager.call_function_in_browsing_context(
              id,
              %(
                arg => arg.a
              ),
              false,
              argument_value_list: argument_values
            )
          }.to raise_error(Error::WebDriverError)
        end

        it 'can get all realms' do
          first_window = driver.window_handle
          driver.switch_to.new_window(:window)
          second_window = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: first_window)

          realms = manager.all_realms
          expect(realms.length).to eq 2

          first_window_realm = realms[0]

          expect(first_window_realm['type']).to eq('window')
          expect(first_window_realm['realm']).not_to be_nil
          expect(first_window_realm['context']).to eq first_window

          second_window_realm = realms[1]

          expect(second_window_realm['type']).to eq('window')
          expect(second_window_realm['realm']).not_to be_nil
          expect(second_window_realm['context']).to eq second_window
        end

        it 'can get realm by type' do
          first_window = driver.window_handle
          driver.switch_to.new_window(:window)
          second_window = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: first_window)

          realms = manager.realms_by_type('window')
          expect(realms.length).to eq 2

          first_window_realm = realms[0]

          expect(first_window_realm['type']).to eq('window')
          expect(first_window_realm['realm']).not_to be_nil
          expect(first_window_realm['context']).to eq first_window

          second_window_realm = realms[1]

          expect(second_window_realm['type']).to eq('window')
          expect(second_window_realm['realm']).not_to be_nil
          expect(second_window_realm['context']).to eq second_window
        end

        it 'can get realm in browsing context' do
          window_id = driver.window_handle
          driver.switch_to.new_window(:tab)
          tab_id = driver.window_handle
          manager = described_class.new(driver: driver, browsing_context_id: window_id)

          realms = manager.realms_in_browsing_context(tab_id)

          tab_realm = realms[0]

          expect(tab_realm['type']).to eq('window')
          expect(tab_realm['realm']).not_to be_nil
          expect(tab_realm['context']).to eq tab_id
        end

        it 'can get realm in browsing context by type' do
          window_id = driver.window_handle
          driver.switch_to.new_window(:tab)
          manager = described_class.new(driver: driver, browsing_context_id: window_id)

          realms = manager.realms_in_browsing_context_by_type(
            window_id,
            'window'
          )

          window_realm = realms[0]

          expect(window_realm['type']).to eq('window')
          expect(window_realm['realm']).not_to be_nil
          expect(window_realm['context']).to eq(window_id)
        end
      end #
    end # BiDi
  end # WebDriver
end # Selenium
