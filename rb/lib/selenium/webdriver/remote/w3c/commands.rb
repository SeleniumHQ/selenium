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
      module W3C

        #
        # http://www.w3.org/TR/2015/WD-webdriver-20150918/#list-of-endpoints
        # @api private
        #

        class Bridge
          COMMANDS = {

            #
            # session handling
            #

            new_session: [:post, 'session'.freeze],
            delete_session: [:delete, 'session/:session_id'.freeze],

            #
            # basic driver
            #

            get: [:post, 'session/:session_id/url'.freeze],
            get_current_url: [:get, 'session/:session_id/url'.freeze],
            back: [:post, 'session/:session_id/back'.freeze],
            forward: [:post, 'session/:session_id/forward'.freeze],
            refresh: [:post, 'session/:session_id/refresh'.freeze],
            get_title: [:get, 'session/:session_id/title'.freeze],

            #
            # window and Frame handling
            #

            get_window_handle: [:get, 'session/:session_id/window'.freeze],
            close_window: [:delete, 'session/:session_id/window'.freeze],
            switch_to_window: [:post, 'session/:session_id/window'.freeze],
            get_window_handles: [:get, 'session/:session_id/window/handles'.freeze],
            fullscreen_window: [:post, 'session/:session_id/window/fullscreen'.freeze],
            minimize_window: [:post, 'session/:session_id/window/minimize'.freeze],
            maximize_window: [:post, 'session/:session_id/window/maximize'.freeze],
            set_window_size: [:post, 'session/:session_id/window/size'.freeze],
            get_window_size: [:get, 'session/:session_id/window/size'.freeze],
            set_window_position: [:post, 'session/:session_id/window/position'.freeze],
            get_window_position: [:get, 'session/:session_id/window/position'.freeze],
            set_window_rect: [:post, 'session/:session_id/window/rect'.freeze],
            get_window_rect: [:get, 'session/:session_id/window/rect'.freeze],
            switch_to_frame: [:post, 'session/:session_id/frame'.freeze],
            switch_to_parent_frame: [:post, 'session/:session_id/frame/parent'.freeze],

            #
            # element
            #

            find_element: [:post, 'session/:session_id/element'.freeze],
            find_elements: [:post, 'session/:session_id/elements'.freeze],
            find_child_element: [:post, 'session/:session_id/element/:id/element'.freeze],
            find_child_elements: [:post, 'session/:session_id/element/:id/elements'.freeze],
            get_active_element: [:get, 'session/:session_id/element/active'.freeze],
            is_element_selected: [:get, 'session/:session_id/element/:id/selected'.freeze],
            get_element_attribute: [:get, 'session/:session_id/element/:id/attribute/:name'.freeze],
            get_element_property: [:get, 'session/:session_id/element/:id/property/:name'.freeze],
            get_element_css_value: [:get, 'session/:session_id/element/:id/css/:property_name'.freeze],
            get_element_text: [:get, 'session/:session_id/element/:id/text'.freeze],
            get_element_tag_name: [:get, 'session/:session_id/element/:id/name'.freeze],
            get_element_rect: [:get, 'session/:session_id/element/:id/rect'.freeze],
            is_element_enabled: [:get, 'session/:session_id/element/:id/enabled'.freeze],

            #
            # document handling
            #

            get_page_source: [:get, 'session/:session_id/source'.freeze],
            execute_script: [:post, 'session/:session_id/execute/sync'.freeze],
            execute_async_script: [:post, 'session/:session_id/execute/async'.freeze],

            #
            # cookies
            #

            get_all_cookies: [:get, 'session/:session_id/cookie'.freeze],
            get_cookie: [:get, 'session/:session_id/cookie/:name'.freeze],
            add_cookie: [:post, 'session/:session_id/cookie'.freeze],
            delete_cookie: [:delete, 'session/:session_id/cookie/:name'.freeze],
            delete_all_cookies: [:delete, 'session/:session_id/cookie'.freeze],

            #
            # timeouts
            #

            set_timeout: [:post, 'session/:session_id/timeouts'.freeze],

            #
            # actions
            #

            actions: [:post, 'session/:session_id/actions'.freeze],
            release_actions: [:delete, 'session/:session_id/actions'.freeze],

            #
            # Element Operations
            #

            element_click: [:post, 'session/:session_id/element/:id/click'.freeze],
            element_tap: [:post, 'session/:session_id/element/:id/tap'.freeze],
            element_clear: [:post, 'session/:session_id/element/:id/clear'.freeze],
            element_send_keys: [:post, 'session/:session_id/element/:id/value'.freeze],

            #
            # alerts
            #

            dismiss_alert: [:post, 'session/:session_id/alert/dismiss'.freeze],
            accept_alert: [:post, 'session/:session_id/alert/accept'.freeze],
            get_alert_text: [:get, 'session/:session_id/alert/text'.freeze],
            send_alert_text: [:post, 'session/:session_id/alert/text'.freeze],

            #
            # screenshot
            #

            take_screenshot: [:get, 'session/:session_id/screenshot'.freeze],
            take_element_screenshot: [:get, 'session/:session_id/element/:id/screenshot'.freeze],

            #
            # server extensions
            #

            upload_file: [:post, 'session/:session_id/se/file'.freeze]
          }.freeze

        end # Bridge
      end # W3C
    end # Remote
  end # WebDriver
end # Selenium
