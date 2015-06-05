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

describe "Window Selection" do
  it "selects and close popup windows" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_select_window.html"
    page.click "popupPage", :wait_for => :popup, :window => "myPopupWindow", :select => true

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}
    page.title.should =~ /Select Window Popup/
    page.all_window_names.size.should eql(2)
    page.all_window_names.include?("myPopupWindow").should be true

    page.close
    page.select_window "null"

    page.location.should =~ %r{/tests/html/test_select_window.html}

    page.click "popupPage", :wait_for => :popup, :window => "myPopupWindow"
    page.select_window "title=Select Window Popup"

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}

    page.close
    page.select_window "null"
  end

  it "select an anonymous window (one that isn't assigned to a variable)" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_select_window.html"
    page.click "popupAnonymous", :wait_for => :popup, :window => "anonymouspopup", :select => true

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}

    page.click "closePage"
    page.select_window "null"
  end

  it "handles an onclick close handler" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_select_window.html"
    page.click "popupAnonymous", :wait_for => :popup, :window => "anonymouspopup", :select => true

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}

    page.click "closePage2"
    page.select_window "null"
  end
end
