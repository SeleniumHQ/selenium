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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    module SpecSupport
      # This is for example purposes to describe behavior, it requires tests to fail and should only be run manually
      xdescribe Guards do
        context 'chrome' do
          context 'only' do
            it 'guards failing test as pending when only excludes', only: {browser: :not_chrome} do
              fail
            end

            it 'fails failing test when only includes', only: {browser: :chrome} do
              fail
            end

            it 'fails passing test when only excludes', only: {browser: :not_chrome} do
              # do not fail me
            end

            it 'passes passing test when only includes', only: {browser: :chrome} do
              # do not fail me
            end

          end

          context 'except' do
            it 'guards failing test as pending when except includes', except: {browser: :chrome} do
              fail
            end

            it 'fails failing test when except excludes', except: {browser: :not_chrome} do
              fail
            end

            it 'fails passing test as fixed when except includes', except: {browser: :chrome} do
              # do not fail me
            end

            it 'passes passing test when except excludes', except: {browser: :not_chrome} do
              # do not fail me
            end
          end

          context 'mixed' do
            it 'guards failing test when both exclude', only: {browser: :not_chrome}, except: {browser: :not_chrome} do
              # :only overrides :except
              fail
            end

            it 'guards failing test when both includes', only: {browser: :chrome}, except: {browser: :chrome} do
              # :except overrides :only
              fail
            end

            it 'fails passing test as fixed when both exclude', only: {browser: :not_chrome}, except: {browser: :not_chrome} do
              # :only overrides :except
              # do not fail me
            end

            it 'fails passing test as fixed when both includes', only: {browser: :chrome}, except: {browser: :chrome} do
              # :except overrides :only
              # do not fail me
            end
          end

          context 'order independent' do
            it 'guards failing test when both exclude', except: {browser: :not_chrome}, only: {browser: :not_chrome} do
              # :only overrides :except
              fail
            end

            it 'guards failing test when both includes', except: {browser: :chrome}, only: {browser: :chrome} do
              # :except overrides :only
              fail
            end

            it 'fails passing test as fixed when both exclude', except: {browser: :not_chrome}, only: {browser: :not_chrome} do
              # :only overrides :except
              # do not fail me
            end

            it 'fails passing test as fixed when both includes', except: {browser: :chrome}, only: {browser: :chrome} do
              # :except overrides :only
              # do not fail me
            end
          end

          context 'multiple' do
            # Throws warning when two parameters of same keyword are used
            # Only recognizes the second one
          end

          context 'arrays' do
            it 'guards failing test if any only exclude in an array', only: [{browser: :chrome}, {browser: :not_chrome}] do
              fail
            end

            it 'guards failing test if any except include in an array', except: [{browser: :chrome}, {browser: :not_chrome}] do
              fail
            end

            it 'fails passing test as fixed if any only exclude in an array', only: [{browser: :chrome}, {browser: :not_chrome}] do
              # do not fail me
            end

            it 'fails passing test as fixed if any except include in an array', except: [{browser: :chrome}, {browser: :not_chrome}] do
              # do not fail me
            end
          end

          context 'guard messages on failing tests' do
            before { fail }

            it 'gives correct message with single only excludes', only: {browser: :not_chrome}, message: 'w3c implementation' do
            end

            it 'uses default if no message is passed', only: {browser: :not_chrome} do
            end

            it 'gives correct message with single except includes', except: {browser: :chrome}, message: 'chrome bug' do
            end

            it 'gives only applicable message when multiple excludes',  except: {browser: :not_chrome}, only: {browser: :not_chrome}, message: ['not_chrome bug', 'w3c implementation'] do
            end

            it 'gives only applicable message with multiple includes', except: {browser: :chrome}, only: {browser: :chrome}, message: ['chrome bug', 'limited to chrome'] do
            end

            it 'gives only applicable message with multiple exclude in an array', only: [{browser: :chrome}, {browser: :not_chrome}], message: ['limited to chrome', 'w3c implementation'] do
            end

            it 'gives only applicable message with multiple include in an array', except: [{browser: :chrome}, {browser: :not_chrome}], message: ['chrome bug', 'not_chrome bug'] do
            end

            it 'gives all applicable messages with mixed include and except', except: {browser: :chrome}, only: {browser: :not_chrome}, message: ['chrome bug', 'w3c implementation'] do
            end
          end
        end
      end
    end # SpecSupport
  end # WebDriver
end # Selenium
