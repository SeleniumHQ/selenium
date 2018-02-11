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

require 'selenium/webdriver/common/error'
require 'selenium/webdriver/common/platform'
require 'selenium/webdriver/common/proxy'
require 'selenium/webdriver/common/log_entry'
require 'selenium/webdriver/common/file_reaper'
require 'selenium/webdriver/common/service'
require 'selenium/webdriver/common/socket_lock'
require 'selenium/webdriver/common/socket_poller'
require 'selenium/webdriver/common/port_prober'
require 'selenium/webdriver/common/zipper'
require 'selenium/webdriver/common/wait'
require 'selenium/webdriver/common/alert'
require 'selenium/webdriver/common/mouse'
require 'selenium/webdriver/common/keyboard'
require 'selenium/webdriver/common/touch_screen'
require 'selenium/webdriver/common/target_locator'
require 'selenium/webdriver/common/navigation'
require 'selenium/webdriver/common/timeouts'
require 'selenium/webdriver/common/window'
require 'selenium/webdriver/common/logger'
require 'selenium/webdriver/common/logs'
require 'selenium/webdriver/common/options'
require 'selenium/webdriver/common/w3c_options'
require 'selenium/webdriver/common/search_context'
require 'selenium/webdriver/common/action_builder'
require 'selenium/webdriver/common/interactions/key_actions'
require 'selenium/webdriver/common/interactions/pointer_actions'
require 'selenium/webdriver/common/w3c_action_builder'
require 'selenium/webdriver/common/touch_action_builder'
require 'selenium/webdriver/common/html5/shared_web_storage'
require 'selenium/webdriver/common/html5/local_storage'
require 'selenium/webdriver/common/html5/session_storage'
require 'selenium/webdriver/common/driver_extensions/takes_screenshot'
require 'selenium/webdriver/common/driver_extensions/rotatable'
require 'selenium/webdriver/common/driver_extensions/has_web_storage'
require 'selenium/webdriver/common/driver_extensions/has_location'
require 'selenium/webdriver/common/driver_extensions/has_session_id'
require 'selenium/webdriver/common/driver_extensions/has_touch_screen'
require 'selenium/webdriver/common/driver_extensions/has_remote_status'
require 'selenium/webdriver/common/driver_extensions/has_network_conditions'
require 'selenium/webdriver/common/driver_extensions/has_network_connection'
require 'selenium/webdriver/common/driver_extensions/uploads_files'
require 'selenium/webdriver/common/driver_extensions/has_addons'
require 'selenium/webdriver/common/interactions/interactions'
require 'selenium/webdriver/common/interactions/input_device'
require 'selenium/webdriver/common/interactions/interaction'
require 'selenium/webdriver/common/interactions/none_input'
require 'selenium/webdriver/common/interactions/key_input'
require 'selenium/webdriver/common/interactions/pointer_input'
require 'selenium/webdriver/common/keys'
require 'selenium/webdriver/common/bridge_helper'
require 'selenium/webdriver/common/profile_helper'
require 'selenium/webdriver/common/driver'
require 'selenium/webdriver/common/element'
