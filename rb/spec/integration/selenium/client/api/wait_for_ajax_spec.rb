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

require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Wait For Ajax" do
  describe "Prototype" do
    it "blocks until AJAX request is complete" do
      page.open "http://localhost:4567/prototype.html"
      expect(page.text("calculator-result")).to be_empty
      page.type "calculator-expression", "2 + 2"
      page.click "calculator-button", :wait_for => :ajax

      expect(page.value("calculator-result")).to eql("4")
    end
  end

  describe "jQuery" do
    it "blocks until AJAX request is complete" do
      page.open "http://localhost:4567/jquery.html"

      expect(page.text("calculator-result")).to be_empty

      page.type "calculator-expression", "2 + 2"
      page.click "calculator-button" , :wait_for => :ajax, :javascript_framework => :jquery

      expect(page.value("calculator-result")).to eql("4")
    end
  end
end
