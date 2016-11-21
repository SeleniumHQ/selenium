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
      class Bridge
        #
        # https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#command-reference
        #

        command :new_session, :post, 'session'
        command :get_capabilities, :get, 'session/:session_id'
        command :status, :get, 'status'

        #
        # basic driver
        #

        command :get_current_url, :get, 'session/:session_id/url'
        command :get, :post, 'session/:session_id/url'
        command :go_forward, :post, 'session/:session_id/forward'
        command :go_back, :post, 'session/:session_id/back'
        command :refresh, :post, 'session/:session_id/refresh'
        command :quit, :delete, 'session/:session_id'
        command :close, :delete, 'session/:session_id/window'
        command :get_page_source, :get, 'session/:session_id/source'
        command :get_title, :get, 'session/:session_id/title'
        command :find_element, :post, 'session/:session_id/element'
        command :find_elements, :post, 'session/:session_id/elements'
        command :get_active_element, :post, 'session/:session_id/element/active'

        #
        # window handling
        #

        command :get_current_window_handle, :get, 'session/:session_id/window_handle'
        command :get_window_handles, :get, 'session/:session_id/window_handles'
        command :set_window_size, :post, 'session/:session_id/window/:window_handle/size'
        command :set_window_position, :post, 'session/:session_id/window/:window_handle/position'
        command :get_window_size, :get, 'session/:session_id/window/:window_handle/size'
        command :get_window_position, :get, 'session/:session_id/window/:window_handle/position'
        command :maximize_window, :post, 'session/:session_id/window/:window_handle/maximize'

        #
        # script execution
        #

        command :execute_script, :post, 'session/:session_id/execute'
        command :execute_async_script, :post, 'session/:session_id/execute_async'

        #
        # screenshot
        #

        command :screenshot, :get, 'session/:session_id/screenshot'

        #
        # alerts
        #

        command :dismiss_alert, :post, 'session/:session_id/dismiss_alert'
        command :accept_alert, :post, 'session/:session_id/accept_alert'
        command :get_alert_text, :get, 'session/:session_id/alert_text'
        command :set_alert_value, :post, 'session/:session_id/alert_text'
        command :set_authentication, :post, 'session/:session_id/alert/credentials'

        #
        # target locator
        #

        command :switch_to_frame, :post, 'session/:session_id/frame'
        command :switch_to_parent_frame, :post, 'session/:session_id/frame/parent'
        command :switch_to_window, :post, 'session/:session_id/window'

        #
        # options
        #

        command :get_cookies, :get, 'session/:session_id/cookie'
        command :add_cookie, :post, 'session/:session_id/cookie'
        command :delete_all_cookies, :delete, 'session/:session_id/cookie'
        command :delete_cookie, :delete, 'session/:session_id/cookie/:name'

        #
        # timeouts
        #

        command :implicitly_wait, :post, 'session/:session_id/timeouts/implicit_wait'
        command :set_script_timeout, :post, 'session/:session_id/timeouts/async_script'
        command :set_timeout, :post, 'session/:session_id/timeouts'

        #
        # element
        #

        command :describe_element, :get, 'session/:session_id/element/:id'
        command :find_child_element, :post, 'session/:session_id/element/:id/element'
        command :find_child_elements, :post, 'session/:session_id/element/:id/elements'
        command :click_element, :post, 'session/:session_id/element/:id/click'
        command :submit_element, :post, 'session/:session_id/element/:id/submit'
        command :get_element_value, :get, 'session/:session_id/element/:id/value'
        command :send_keys_to_element, :post, 'session/:session_id/element/:id/value'
        command :upload_file, :post, 'session/:session_id/file'
        command :get_element_tag_name, :get, 'session/:session_id/element/:id/name'
        command :clear_element, :post, 'session/:session_id/element/:id/clear'
        command :is_element_selected, :get, 'session/:session_id/element/:id/selected'
        command :is_element_enabled, :get, 'session/:session_id/element/:id/enabled'
        command :get_element_attribute, :get, 'session/:session_id/element/:id/attribute/:name'
        command :element_equals, :get, 'session/:session_id/element/:id/equals/:other'
        command :is_element_displayed, :get, 'session/:session_id/element/:id/displayed'
        command :get_element_location, :get, 'session/:session_id/element/:id/location'
        command :get_element_location_once_scrolled_into_view, :get, 'session/:session_id/element/:id/location_in_view'
        command :get_element_size, :get, 'session/:session_id/element/:id/size'
        command :drag_element, :post, 'session/:session_id/element/:id/drag'
        command :get_element_value_of_css_property, :get, 'session/:session_id/element/:id/css/:property_name'
        command :get_element_text, :get, 'session/:session_id/element/:id/text'

        #
        # rotatable
        #

        command :get_screen_orientation, :get, 'session/:session_id/orientation'
        command :set_screen_orientation, :post, 'session/:session_id/orientation'

        #
        # interactions API
        #

        command :click, :post, 'session/:session_id/click'
        command :double_click, :post, 'session/:session_id/doubleclick'
        command :mouse_down, :post, 'session/:session_id/buttondown'
        command :mouse_up, :post, 'session/:session_id/buttonup'
        command :mouse_move_to, :post, 'session/:session_id/moveto'
        command :send_modifier_key_to_active_element, :post, 'session/:session_id/modifier'
        command :send_keys_to_active_element, :post, 'session/:session_id/keys'

        #
        # html 5
        #

        command :execute_sql, :post, 'session/:session_id/execute_sql'

        command :get_location, :get, 'session/:session_id/location'
        command :set_location, :post, 'session/:session_id/location'

        command :get_app_cache, :get, 'session/:session_id/application_cache'
        command :get_app_cache_status, :get, 'session/:session_id/application_cache/status'
        command :clear_app_cache, :delete, 'session/:session_id/application_cache/clear'

        command :get_network_connection, :get, 'session/:session_id/network_connection'
        command :set_network_connection, :post, 'session/:session_id/network_connection'

        command :get_local_storage_item, :get, 'session/:session_id/local_storage/key/:key'
        command :remove_local_storage_item, :delete, 'session/:session_id/local_storage/key/:key'
        command :get_local_storage_keys, :get, 'session/:session_id/local_storage'
        command :set_local_storage_item, :post, 'session/:session_id/local_storage'
        command :clear_local_storage, :delete, 'session/:session_id/local_storage'
        command :get_local_storage_size, :get, 'session/:session_id/local_storage/size'

        command :get_session_storage_item, :get, 'session/:session_id/session_storage/key/:key'
        command :remove_session_storage_item, :delete, 'session/:session_id/session_storage/key/:key'
        command :get_session_storage_keys, :get, 'session/:session_id/session_storage'
        command :set_session_storage_item, :post, 'session/:session_id/session_storage'
        command :clear_session_storage, :delete, 'session/:session_id/session_storage'
        command :get_session_storage_size, :get, 'session/:session_id/session_storage/size'

        #
        # ime
        #

        command :ime_get_available_engines, :get, 'session/:session_id/ime/available_engines'
        command :ime_get_active_engine, :get, 'session/:session_id/ime/active_engine'
        command :ime_is_activated, :get, 'session/:session_id/ime/activated'
        command :ime_deactivate, :post, 'session/:session_id/ime/deactivate'
        command :ime_activate_engine, :post, 'session/:session_id/ime/activate'

        #
        # touch
        #

        command :touch_single_tap, :post, 'session/:session_id/touch/click'
        command :touch_double_tap, :post, 'session/:session_id/touch/doubleclick'
        command :touch_long_press, :post, 'session/:session_id/touch/longclick'
        command :touch_down, :post, 'session/:session_id/touch/down'
        command :touch_up, :post, 'session/:session_id/touch/up'
        command :touch_move, :post, 'session/:session_id/touch/move'
        command :touch_scroll, :post, 'session/:session_id/touch/scroll'
        command :touch_flick, :post, 'session/:session_id/touch/flick'

        #
        # logs
        #

        command :get_available_log_types, :get, 'session/:session_id/log/types'
        command :get_log, :post, 'session/:session_id/log'
      end
    end # Remote
  end # WebDriver
end # Selenium
