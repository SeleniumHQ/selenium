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

describe "Element API" do
  it "can detect element presence" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_element_present.html"
    page.element?('aLink').should be true

    page.click 'removeLinkAfterAWhile', :wait_for => :no_element, :element => "aLink"
    page.element?('aLink').should be false

    page.click 'addLinkAfterAWhile', :wait_for => :element, :element => "aLink"
    page.element?('aLink').should be true
  end
end
