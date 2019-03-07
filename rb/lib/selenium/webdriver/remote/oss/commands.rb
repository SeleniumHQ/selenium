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
            get_capabilities: [:get, 'session/:session_id'],
            status: [:get, 'status'],

            #
            # basic driver
            #

            get_current_url: [:get, 'session/:session_id/url'],
            get: [:post, 'session/:session_id/url'],
            go_forward: [:post, 'session/:session_id/forward'],
            go_back: [:post, 'session/:session_id/back'],
            refresh: [:post, 'session/:session_id/refresh'],
            quit: [:delete, 'session/:session_id'],
            close: [:delete, 'session/:session_id/window'],
            get_page_source: [:get, 'session/:session_id/source'],
            get_title: [:get, 'session/:session_id/title'],
            find_element: [:post, 'session/:session_id/element'],
            find_elements: [:post, 'session/:session_id/elements'],
            get_active_element: [:post, 'session/:session_id/element/active'],

            #
            # window handling
            #

            get_current_window_handle: [:get, 'session/:session_id/window_handle'],
            get_window_handles: [:get, 'session/:session_id/window_handles'],
            set_window_size: [:post, 'session/:session_id/window/:window_handle/size'],
            set_window_position: [:post, 'session/:session_id/window/:window_handle/position'],
            get_window_size: [:get, 'session/:session_id/window/:window_handle/size'],
            get_window_position: [:get, 'session/:session_id/window/:window_handle/position'],
            maximize_window: [:post, 'session/:session_id/window/:window_handle/maximize'],

            #
            # script execution
            #

            execute_script: [:post, 'session/:session_id/execute'],
            execute_async_script: [:post, 'session/:session_id/execute_async'],

            #
            # screenshot
            #

            screenshot: [:get, 'session/:session_id/screenshot'],

            #
            # alerts
            #

            dismiss_alert: [:post, 'session/:session_id/dismiss_alert'],
            accept_alert: [:post, 'session/:session_id/accept_alert'],
            get_alert_text: [:get, 'session/:session_id/alert_text'],
            set_alert_value: [:post, 'session/:session_id/alert_text'],
            set_authentication: [:post, 'session/:session_id/alert/credentials'],

            #
            # target locator
            #

            switch_to_frame: [:post, 'session/:session_id/frame'],
            switch_to_parent_frame: [:post, 'session/:session_id/frame/parent'],
            switch_to_window: [:post, 'session/:session_id/window'],

            #
            # options
            #

            get_cookies: [:get, 'session/:session_id/cookie'],
            add_cookie: [:post, 'session/:session_id/cookie'],
            delete_all_cookies: [:delete, 'session/:session_id/cookie'],
            delete_cookie: [:delete, 'session/:session_id/cookie/:name'],

            #
            # timeouts
            #

            implicitly_wait: [:post, 'session/:session_id/timeouts/implicit_wait'],
            set_script_timeout: [:post, 'session/:session_id/timeouts/async_script'],
            set_timeout: [:post, 'session/:session_id/timeouts'],

            #
            # element
            #

            describe_element: [:get, 'session/:session_id/element/:id'],
            find_child_element: [:post, 'session/:session_id/element/:id/element'],
            find_child_elements: [:post, 'session/:session_id/element/:id/elements'],
            click_element: [:post, 'session/:session_id/element/:id/click'],
            submit_element: [:post, 'session/:session_id/element/:id/submit'],
            get_element_value: [:get, 'session/:session_id/element/:id/value'],
            send_keys_to_element: [:post, 'session/:session_id/element/:id/value'],
            upload_file: [:post, 'session/:session_id/file'],
            get_element_tag_name: [:get, 'session/:session_id/element/:id/name'],
            clear_element: [:post, 'session/:session_id/element/:id/clear'],
            is_element_selected: [:get, 'session/:session_id/element/:id/selected'],
            is_element_enabled: [:get, 'session/:session_id/element/:id/enabled'],
            get_element_attribute: [:get, 'session/:session_id/element/:id/attribute/:name'],
            element_equals: [:get, 'session/:session_id/element/:id/equals/:other'],
            is_element_displayed: [:get, 'session/:session_id/element/:id/displayed'],
            get_element_location: [:get, 'session/:session_id/element/:id/location'],
            get_element_location_once_scrolled_into_view: [:get, 'session/:session_id/element/:id/location_in_view'],
            get_element_size: [:get, 'session/:session_id/element/:id/size'],
            drag_element: [:post, 'session/:session_id/element/:id/drag'],
            get_element_value_of_css_property: [:get, 'session/:session_id/element/:id/css/:property_name'],
            get_element_text: [:get, 'session/:session_id/element/:id/text'],

            #
            # rotatable
            #

            get_screen_orientation: [:get, 'session/:session_id/orientation'],
            set_screen_orientation: [:post, 'session/:session_id/orientation'],

            #
            # interactions API
            #

            click: [:post, 'session/:session_id/click'],
            double_click: [:post, 'session/:session_id/doubleclick'],
            mouse_down: [:post, 'session/:session_id/buttondown'],
            mouse_up: [:post, 'session/:session_id/buttonup'],
            mouse_move_to: [:post, 'session/:session_id/moveto'],
            send_modifier_key_to_active_element: [:post, 'session/:session_id/modifier'],
            send_keys_to_active_element: [:post, 'session/:session_id/keys'],

            #
            # html 5
            #

            execute_sql: [:post, 'session/:session_id/execute_sql'],

            get_location: [:get, 'session/:session_id/location'],
            set_location: [:post, 'session/:session_id/location'],

            get_app_cache: [:get, 'session/:session_id/application_cache'],
            get_app_cache_status: [:get, 'session/:session_id/application_cache/status'],
            clear_app_cache: [:delete, 'session/:session_id/application_cache/clear'],

            get_network_connection: [:get, 'session/:session_id/network_connection'],
            set_network_connection: [:post, 'session/:session_id/network_connection'],

            get_local_storage_item: [:get, 'session/:session_id/local_storage/key/:key'],
            remove_local_storage_item: [:delete, 'session/:session_id/local_storage/key/:key'],
            get_local_storage_keys: [:get, 'session/:session_id/local_storage'],
            set_local_storage_item: [:post, 'session/:session_id/local_storage'],
            clear_local_storage: [:delete, 'session/:session_id/local_storage'],
            get_local_storage_size: [:get, 'session/:session_id/local_storage/size'],

            get_session_storage_item: [:get, 'session/:session_id/session_storage/key/:key'],
            remove_session_storage_item: [:delete, 'session/:session_id/session_storage/key/:key'],
            get_session_storage_keys: [:get, 'session/:session_id/session_storage'],
            set_session_storage_item: [:post, 'session/:session_id/session_storage'],
            clear_session_storage: [:delete, 'session/:session_id/session_storage'],
            get_session_storage_size: [:get, 'session/:session_id/session_storage/size'],

            #
            # ime
            #

            ime_get_available_engines: [:get, 'session/:session_id/ime/available_engines'],
            ime_get_active_engine: [:get, 'session/:session_id/ime/active_engine'],
            ime_is_activated: [:get, 'session/:session_id/ime/activated'],
            ime_deactivate: [:post, 'session/:session_id/ime/deactivate'],
            ime_activate_engine: [:post, 'session/:session_id/ime/activate'],

            #
            # touch
            #

            touch_single_tap: [:post, 'session/:session_id/touch/click'],
            touch_double_tap: [:post, 'session/:session_id/touch/doubleclick'],
            touch_long_press: [:post, 'session/:session_id/touch/longclick'],
            touch_down: [:post, 'session/:session_id/touch/down'],
            touch_up: [:post, 'session/:session_id/touch/up'],
            touch_move: [:post, 'session/:session_id/touch/move'],
            touch_scroll: [:post, 'session/:session_id/touch/scroll'],
            touch_flick: [:post, 'session/:session_id/touch/flick'],

            #
            # logs
            #

            get_available_log_types: [:get, 'session/:session_id/log/types'],
            get_log: [:post, 'session/:session_id/log']
          }.freeze

        end # Bridge
      end # OSS
    end # Remote
  end # WebDriver
end # Selenium
