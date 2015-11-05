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

require_relative '../spec_helper'

module Selenium
  module WebDriver

    describe Firefox do
      before(:each) do
        unless ENV['MARIONETTE_PATH']
          pending "Set ENV['MARIONETTE_PATH'] to test Marionette enabled Firefox installations"
        end
      end

      compliant_on({:driver => :remote, :browser => :firefox}, {:driver => :firefox}) do
        it "Does not use wires by default when designated binary includes Marionette" do
          temp_driver = Selenium::WebDriver.for :firefox
          expect(temp_driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to_not be_nil
          temp_driver.quit
        end

        it "Does not use wires by default when designated binary does not use Marionette" do
          marionette_path = ENV['MARIONETTE_PATH']
          ENV['MARIONETTE_PATH'] = nil
          Firefox::Binary.instance_variable_set(:"@path", nil)

          temp_driver = Selenium::WebDriver.for :firefox
          expect(temp_driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to_not be_nil
          temp_driver.quit
          ENV['MARIONETTE_PATH'] = marionette_path
        end
      end

      compliant_on({:driver => :remote, :browser => :marionette}, {:driver => :marionette}) do

        context "when designated firefox installation includes Marionette" do

          it "Uses Wires when initialized with W3C desired_capabilities" do
            caps = Selenium::WebDriver::Remote::W3CCapabilities.firefox
            expect do
              temp_driver = Selenium::WebDriver.for :firefox, :desired_capabilities => caps
              temp_driver.quit
            end.to_not raise_exception
          end

          it "Uses Wires when initialized with marionette option" do
            temp_driver = Selenium::WebDriver.for :firefox, {marionette: true}
            expect(temp_driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to be_nil
            temp_driver.quit
          end

          it_behaves_like "driver that can be started concurrently", :firefox, :marionette
        end
      end

      compliant_on({:driver => :remote, :browser => :marionette}, {:driver => :marionette}) do

        context "when designated firefox installation does not include Marionette" do
          before(:each) do
            @marionette_path = ENV['MARIONETTE_PATH']
            ENV['MARIONETTE_PATH'] = nil
            Firefox::Binary.instance_variable_set(:"@path", nil)
          end
          after(:each) {ENV['MARIONETTE_PATH'] = @marionette_path}
          let(:message) { /Firefox Version \d\d does not support W3CCapabilities/ }

          it "Raises Wires Exception when initialized with :desired_capabilities" do
            caps = Selenium::WebDriver::Remote::W3CCapabilities.firefox
            opt = {:desired_capabilities => caps}
            expect { Selenium::WebDriver.for :firefox, opt }.to raise_exception ArgumentError, message
          end

          it "Raises Wires Exception when initialized with marionette option" do
            expect{Selenium::WebDriver.for :firefox, {marionette: true}}.to raise_exception ArgumentError, message
          end
        end
      end
    end
  end # WebDriver
end # Selenium
