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

module Selenium
  module WebDriver
    module Remote
      class W3CBridge
        #
        # http://www.w3.org/TR/2015/WD-webdriver-20150918/#list-of-endpoints
        #

        #
        # session handling
        #

        command :new_session, :post, 'session'
        command :delete_session, :delete, 'session/:session_id'

        #
        # basic driver
        #

        command :get, :post, 'session/:session_id/url'
        command :get_current_url, :get, 'session/:session_id/url'
        command :back, :post, 'session/:session_id/back'
        command :forward, :post, 'session/:session_id/forward'
        command :refresh, :post, 'session/:session_id/refresh'
        command :get_title, :get, 'session/:session_id/title'

        #
        # window and Frame handling
        #

        command :get_window_handle, :get, 'session/:session_id/window'
        command :close_window, :delete, 'session/:session_id/window'
        command :switch_to_window, :post, 'session/:session_id/window'
        command :get_window_handles, :get, 'session/:session_id/window/handles'
        command :fullscreen_window, :post, 'session/:session_id/window/fullscreen'
        command :maximize_window, :post, 'session/:session_id/window/maximize'
        command :set_window_size, :post, 'session/:session_id/window/size'
        command :get_window_size, :get, 'session/:session_id/window/size'
        command :switch_to_frame, :post, 'session/:session_id/frame'
        command :switch_to_parent_frame, :post, 'session/:session_id/frame/parent'

        #
        # element
        #

        command :find_element, :post, 'session/:session_id/element'
        command :find_elements, :post, 'session/:session_id/elements'
        command :find_child_element, :post, 'session/:session_id/element/:id/element'
        command :find_child_elements, :post, 'session/:session_id/element/:id/elements'
        command :get_active_element, :get, 'session/:session_id/element/active'
        command :is_element_selected, :get, 'session/:session_id/element/:id/selected'
        command :get_element_attribute, :get, 'session/:session_id/element/:id/attribute/:name'
        command :get_element_property, :get, 'session/:session_id/element/:id/property/:name'
        command :get_element_css_value, :get, 'session/:session_id/element/:id/css/:property_name'
        command :get_element_text, :get, 'session/:session_id/element/:id/text'
        command :get_element_tag_name, :get, 'session/:session_id/element/:id/name'
        command :get_element_rect, :get, 'session/:session_id/element/:id/rect'
        command :is_element_enabled, :get, 'session/:session_id/element/:id/enabled'

        #
        # document handling
        #

        command :get_page_source, :get, '/session/:session_id/source'
        command :execute_script, :post, 'session/:session_id/execute/sync'
        command :execute_async_script, :post, 'session/:session_id/execute/async'

        #
        # cookies
        #

        command :get_all_cookies, :get, 'session/:session_id/cookie'
        command :get_cookie, :get, 'session/:session_id/cookie/:name'
        command :add_cookie, :post, 'session/:session_id/cookie'
        command :delete_cookie, :delete, 'session/:session_id/cookie/:name'
        command :delete_all_cookies, :delete, 'session/:session_id/cookie'

        #
        # timeouts
        #

        command :set_timeout, :post, 'session/:session_id/timeouts'

        #
        # actions
        #

        command :actions, :post, 'session/:session_id/actions'

        #
        # Element Operations
        #

        command :element_click, :post, 'session/:session_id/element/:id/click'
        command :element_tap, :post, 'session/:session_id/element/:id/tap'
        command :element_clear, :post, 'session/:session_id/element/:id/clear'
        command :element_send_keys, :post, 'session/:session_id/element/:id/value'

        #
        # alerts
        #

        command :dismiss_alert, :post, 'session/:session_id/alert/dismiss'
        command :accept_alert, :post, 'session/:session_id/alert/accept'
        command :get_alert_text, :get, 'session/:session_id/alert/text'
        command :send_alert_text, :post, 'session/:session_id/alert/text'

        #
        # screenshot
        #

        command :take_screenshot, :get, 'session/:session_id/screenshot'
        command :take_element_screenshot, :get, 'session/:session_id/element/:id/screenshot'
      end
    end # Remote
  end # WebDriver
end # Selenium
