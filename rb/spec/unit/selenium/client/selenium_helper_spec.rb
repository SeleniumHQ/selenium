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

require_relative 'spec_helper'

describe Selenium::Client::SeleniumHelper do
  class SeleniumHelperClass
    include Selenium::Client::SeleniumHelper
    attr_accessor :selenium
  end

  let :object do
    @object ||= (
      o = SeleniumHelperClass.new
      o.selenium = double("selenium")

      o
    )
  end

  it "delegates open to @selenium" do
    expect(object.selenium).to receive(:open).with(:the_url).and_return(:the_result)

    expect(object.open(:the_url)).to eq(:the_result)
  end

  it "delegates type to @selenium" do
    expect(object.selenium).to receive(:type).with(:the_locator, :the_value) \
                   .and_return(:the_result)

    expect(object.type(:the_locator, :the_value)).to eq(:the_result)
  end

  it "delegates select to @selenium" do
    expect(object.selenium).to receive(:type).with(:the_input_locator,
                                        :the_option_locator) \
                                  .and_return(:the_result)

    expect(object.type(:the_input_locator, :the_option_locator)).to eq(:the_result)
  end

  it "delegates to any no-arg method defined on @selenium" do
    expect(object.selenium).to receive(:a_noarg_method).with(no_args).and_return(:the_result)

    expect(object.a_noarg_method).to eq(:the_result)
  end

  it "delegates to any arg method defined on @selenium" do
    expect(object.selenium).to receive(:a_method).with(:alpha, :beta)\
                   .and_return(:the_result)

    expect(object.a_method(:alpha, :beta)).to eq(:the_result)
  end

  it "calls default method_missing when a method is not defined on @selenium" do
    expect { object.a_method(:alpha, :beta) }.to raise_error(NoMethodError)
  end

end
