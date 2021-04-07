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

describe 'Navigation' do
  it 'should navigate back and forward' do
    form_title   = 'We Leave From Here'
    result_title = 'We Arrive Here'
    form_url     = url_for 'formPage.html'
    result_url   = url_for 'resultPage.html'

    driver.navigate.to form_url
    expect(driver.title).to eq(form_title)

    driver.find_element(id: 'imageButton').click
    wait.until { driver.title != form_title }

    expect(driver.current_url).to include(result_url)
    expect(driver.title).to eq(result_title)

    driver.navigate.back

    expect(driver.current_url).to include(form_url)
    expect(driver.title).to eq(form_title)

    driver.navigate.forward
    expect(driver.current_url).to include(result_url)
    expect(driver.title).to eq(result_title)
  end

  it 'should refresh the page' do
    changed_title = 'Changed'

    driver.navigate.to url_for('javascriptPage.html')
    driver.find_element(link_text: 'Change the page title!').click
    expect(driver.title).to eq(changed_title)

    driver.navigate.refresh
    wait.until { driver.title != changed_title }

    expect(driver.title).to eq('Testing Javascript')
  end
end
