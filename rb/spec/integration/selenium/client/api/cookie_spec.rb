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

describe "Cookie Handling" do
  it "deletes all cookies" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/path1/cookie1.html"
    page.delete_all_visible_cookies

    page.cookies.should be_empty

    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/path2/cookie2.html"
    page.delete_all_visible_cookies

    page.cookies.should be_empty
  end

  it "can set cookies" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/path1/cookie1.html"
    page.create_cookie "addedCookieForPath1=new value1"
    page.create_cookie "addedCookieForPath2=new value2", :path => "/selenium-server/org/openqa/selenium/tests/html/path2/", :max_age => 60
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/path1/cookie1.html"
    page.cookies.should =~ /addedCookieForPath1=new value1/

    page.cookie?("addedCookieForPath1").should be true
    page.cookie("addedCookieForPath1").should eql("new value1")
    page.cookie?("testCookie").should be false
    page.cookie?("addedCookieForPath2").should be false

    page.delete_cookie "addedCookieForPath1", "/selenium-server/org/openqa/selenium/tests/html/path1/"
    page.cookies.should be_empty

    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/path2/cookie2.html"
    page.cookie("addedCookieForPath2").should eql("new value2")
    page.cookie?("addedCookieForPath1").should be false

    page.delete_cookie "addedCookieForPath2", "/selenium-server/org/openqa/selenium/tests/html/path2/"
    page.delete_cookie "addedCookieForPath2"
    page.cookies.should be_empty
  end
end
