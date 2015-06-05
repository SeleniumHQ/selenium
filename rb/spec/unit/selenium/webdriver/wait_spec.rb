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

require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Wait do

      def wait(*args) Wait.new(*args) end

      it 'should wait until the returned value is true' do
        returned = true
        wait.until { returned = !returned }.should be true
      end

      it 'should raise a TimeOutError if the the timer runs out' do
        lambda {
          wait(:timeout => 0.1).until { false }
        }.should raise_error(Error::TimeOutError)
      end

      it "should silently capture NoSuchElementErrors" do
        called = false
        block = lambda {
          if called
            true
          else
            called = true
            raise Error::NoSuchElementError
          end
        }

        wait.until(&block).should be true
      end

      it "will use the message from any NoSuchElementError raised while waiting" do
        block = lambda { raise Error::NoSuchElementError, "foo" }

        lambda {
          wait(:timeout => 0.5).until(&block)
        }.should raise_error(Error::TimeOutError, /foo/)
      end

      it "should let users configure what exceptions to ignore" do
        lambda {
          wait(:ignore => NoMethodError, :timeout => 0.5).until { raise NoMethodError }
        }.should raise_error(Error::TimeOutError, /NoMethodError/)
      end
    end
  end
end
