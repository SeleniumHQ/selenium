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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe BiDi, exclusive: {browser: %i[chrome firefox]} do
      it 'gets session status' do
        reset_driver!(web_socket_url: true) do |driver|
          status = driver.bidi.session.status
          expect(status).to respond_to(:ready)
          expect(status.message).not_to be_empty
        end
      end

      it 'gets console log events' do
        reset_driver!(web_socket_url: true) do |driver|
          logs = []
          # driver.bidi.add_listener("log.entryAdded") { |log| logs.push(log) }
          driver.bidi.log.on_log_event(:console) { |log| logs.push(log) }
          driver.navigate.to url_for('javascriptPage.html')

          driver.execute_script("console.log('I like cheese');")
          sleep 0.5
          driver.execute_script("console.log(true);")
          sleep 0.5
          driver.execute_script("console.log(null);")
          sleep 0.5
          driver.execute_script("console.log(undefined);")
          sleep 0.5
          driver.execute_script("console.log(document);")
          sleep 0.5

          expect(logs).to include(
            an_object_having_attributes(method: "log", args: [{"type" => "string", "value" => "I like cheese"}]),
            an_object_having_attributes(method: "log", args: [{"type" => "boolean", "value" => true}]),
            an_object_having_attributes(method: "log", args: [{"type" => "null"}]),
            an_object_having_attributes(method: "log", args: [{"type" => "undefined"}])
          )
        end
      end

      it 'gets javascript log events' do
        reset_driver!(web_socket_url: true) do |driver|
          exceptions = []
          driver.bidi.log.on_log_event(:javascript) { |exception| exceptions.push(exception) }
          driver.navigate.to url_for('javascriptPage.html')

          driver.find_element(id: 'throwing-mouseover').click
          wait.until { exceptions.any? }

          exception = exceptions.first
          puts "exception = \n", exception.inspect
          expect(exception.text).to include('Error: I like cheese')
          expect(exception.type).to eq("javascript")
        end
      end
    end
  end
end
