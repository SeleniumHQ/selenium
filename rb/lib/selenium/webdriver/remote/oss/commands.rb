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
      module OSS

        #
        # https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#command-reference
        # @api private
        #

        class Bridge

          COMMANDS = {
            get_capabilities: [:get, 'session/:session_id'.freeze],
            status: [:get, 'status'.freeze],

            #
            # basic driver
            #

            get_current_url: [:get, 'session/:session_id/url'.freeze],
            get: [:post, 'session/:session_id/url'.freeze],
            go_forward: [:post, 'session/:session_id/forward'.freeze],
            go_back: [:post, 'session/:session_id/back'.freeze],
            refresh: [:post, 'session/:session_id/refresh'.freeze],
            quit: [:delete, 'session/:session_id'.freeze],
            close: [:delete, 'session/:session_id/window'.freeze],
            get_page_source: [:get, 'session/:session_id/source'.freeze],
            get_title: [:get, 'session/:session_id/title'.freeze],
            find_element: [:post, 'session/:session_id/element'.freeze],
            find_elements: [:post, 'session/:session_id/elements'.freeze],
            get_active_element: [:post, 'session/:session_id/element/active'.freeze],

            #
            # window handling
            #

            get_current_window_handle: [:get, 'session/:session_id/window_handle'.freeze],
            get_window_handles: [:get, 'session/:session_id/window_handles'.freeze],
            set_window_size: [:post, 'session/:session_id/window/:window_handle/size'.freeze],
            set_window_position: [:post, 'session/:session_id/window/:window_handle/position'.freeze],
            get_window_size: [:get, 'session/:session_id/window/:window_handle/size'.freeze],
            get_window_position: [:get, 'session/:session_id/window/:window_handle/position'.freeze],
            maximize_window: [:post, 'session/:session_id/window/:window_handle/maximize'.freeze],

            #
            # script execution
            #

            execute_script: [:post, 'session/:session_id/execute'.freeze],
            execute_async_script: [:post, 'session/:session_id/execute_async'.freeze],

            #
            # screenshot
            #

            screenshot: [:get, 'session/:session_id/screenshot'.freeze],

            #
            # alerts
            #

            dismiss_alert: [:post, 'session/:session_id/dismiss_alert'.freeze],
            accept_alert: [:post, 'session/:session_id/accept_alert'.freeze],
            get_alert_text: [:get, 'session/:session_id/alert_text'.freeze],
            set_alert_value: [:post, 'session/:session_id/alert_text'.freeze],
            set_authentication: [:post, 'session/:session_id/alert/credentials'.freeze],

            #
            # target locator
            #

            switch_to_frame: [:post, 'session/:session_id/frame'.freeze],
            switch_to_parent_frame: [:post, 'session/:session_id/frame/parent'.freeze],
            switch_to_window: [:post, 'session/:session_id/window'.freeze],

            #
            # options
            #

            get_cookies: [:get, 'session/:session_id/cookie'.freeze],
            add_cookie: [:post, 'session/:session_id/cookie'.freeze],
            delete_all_cookies: [:delete, 'session/:session_id/cookie'.freeze],
            delete_cookie: [:delete, 'session/:session_id/cookie/:name'.freeze],

            #
            # timeouts
            #

            implicitly_wait: [:post, 'session/:session_id/timeouts/implicit_wait'.freeze],
            set_script_timeout: [:post, 'session/:session_id/timeouts/async_script'.freeze],
            set_timeout: [:post, 'session/:session_id/timeouts'.freeze],

            #
            # element
            #

            describe_element: [:get, 'session/:session_id/element/:id'.freeze],
            find_child_element: [:post, 'session/:session_id/element/:id/element'.freeze],
            find_child_elements: [:post, 'session/:session_id/element/:id/elements'.freeze],
            click_element: [:post, 'session/:session_id/element/:id/click'.freeze],
            submit_element: [:post, 'session/:session_id/element/:id/submit'.freeze],
            get_element_value: [:get, 'session/:session_id/element/:id/value'.freeze],
            send_keys_to_element: [:post, 'session/:session_id/element/:id/value'.freeze],
            upload_file: [:post, 'session/:session_id/file'.freeze],
            get_element_tag_name: [:get, 'session/:session_id/element/:id/name'.freeze],
            clear_element: [:post, 'session/:session_id/element/:id/clear'.freeze],
            is_element_selected: [:get, 'session/:session_id/element/:id/selected'.freeze],
            is_element_enabled: [:get, 'session/:session_id/element/:id/enabled'.freeze],
            get_element_attribute: [:get, 'session/:session_id/element/:id/attribute/:name'.freeze],
            element_equals: [:get, 'session/:session_id/element/:id/equals/:other'.freeze],
            is_element_displayed: [:get, 'session/:session_id/element/:id/displayed'.freeze],
            get_element_location: [:get, 'session/:session_id/element/:id/location'.freeze],
            get_element_location_once_scrolled_into_view: [:get, 'session/:session_id/element/:id/location_in_view'.freeze],
            get_element_size: [:get, 'session/:session_id/element/:id/size'.freeze],
            drag_element: [:post, 'session/:session_id/element/:id/drag'.freeze],
            get_element_value_of_css_property: [:get, 'session/:session_id/element/:id/css/:property_name'.freeze],
            get_element_text: [:get, 'session/:session_id/element/:id/text'.freeze],

            #
            # rotatable
            #

            get_screen_orientation: [:get, 'session/:session_id/orientation'.freeze],
            set_screen_orientation: [:post, 'session/:session_id/orientation'.freeze],

            #
            # interactions API
            #

            click: [:post, 'session/:session_id/click'.freeze],
            double_click: [:post, 'session/:session_id/doubleclick'.freeze],
            mouse_down: [:post, 'session/:session_id/buttondown'.freeze],
            mouse_up: [:post, 'session/:session_id/buttonup'.freeze],
            mouse_move_to: [:post, 'session/:session_id/moveto'.freeze],
            send_modifier_key_to_active_element: [:post, 'session/:session_id/modifier'.freeze],
            send_keys_to_active_element: [:post, 'session/:session_id/keys'.freeze],

            #
            # html 5
            #

            execute_sql: [:post, 'session/:session_id/execute_sql'.freeze],

            get_location: [:get, 'session/:session_id/location'.freeze],
            set_location: [:post, 'session/:session_id/location'.freeze],

            get_app_cache: [:get, 'session/:session_id/application_cache'.freeze],
            get_app_cache_status: [:get, 'session/:session_id/application_cache/status'.freeze],
            clear_app_cache: [:delete, 'session/:session_id/application_cache/clear'.freeze],

            get_network_connection: [:get, 'session/:session_id/network_connection'.freeze],
            set_network_connection: [:post, 'session/:session_id/network_connection'.freeze],

            get_local_storage_item: [:get, 'session/:session_id/local_storage/key/:key'.freeze],
            remove_local_storage_item: [:delete, 'session/:session_id/local_storage/key/:key'.freeze],
            get_local_storage_keys: [:get, 'session/:session_id/local_storage'.freeze],
            set_local_storage_item: [:post, 'session/:session_id/local_storage'.freeze],
            clear_local_storage: [:delete, 'session/:session_id/local_storage'.freeze],
            get_local_storage_size: [:get, 'session/:session_id/local_storage/size'.freeze],

            get_session_storage_item: [:get, 'session/:session_id/session_storage/key/:key'.freeze],
            remove_session_storage_item: [:delete, 'session/:session_id/session_storage/key/:key'.freeze],
            get_session_storage_keys: [:get, 'session/:session_id/session_storage'.freeze],
            set_session_storage_item: [:post, 'session/:session_id/session_storage'.freeze],
            clear_session_storage: [:delete, 'session/:session_id/session_storage'.freeze],
            get_session_storage_size: [:get, 'session/:session_id/session_storage/size'.freeze],

            #
            # ime
            #

            ime_get_available_engines: [:get, 'session/:session_id/ime/available_engines'.freeze],
            ime_get_active_engine: [:get, 'session/:session_id/ime/active_engine'.freeze],
            ime_is_activated: [:get, 'session/:session_id/ime/activated'.freeze],
            ime_deactivate: [:post, 'session/:session_id/ime/deactivate'.freeze],
            ime_activate_engine: [:post, 'session/:session_id/ime/activate'.freeze],

            #
            # touch
            #

            touch_single_tap: [:post, 'session/:session_id/touch/click'.freeze],
            touch_double_tap: [:post, 'session/:session_id/touch/doubleclick'.freeze],
            touch_long_press: [:post, 'session/:session_id/touch/longclick'.freeze],
            touch_down: [:post, 'session/:session_id/touch/down'.freeze],
            touch_up: [:post, 'session/:session_id/touch/up'.freeze],
            touch_move: [:post, 'session/:session_id/touch/move'.freeze],
            touch_scroll: [:post, 'session/:session_id/touch/scroll'.freeze],
            touch_flick: [:post, 'session/:session_id/touch/flick'.freeze],

            #
            # logs
            #

            get_available_log_types: [:get, 'session/:session_id/log/types'.freeze],
            get_log: [:post, 'session/:session_id/log'.freeze]
          }.freeze

        end # Bridge
      end # OSS
    end # Remote
  end # WebDriver
end # Selenium
