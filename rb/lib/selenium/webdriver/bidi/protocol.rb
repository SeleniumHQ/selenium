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

# serialization must load first (it defines the Serialization runtime the generated
# classes build on), then the Domain base the generated classes subclass. Add a require
# below when a new BiDi domain is generated.
require 'selenium/webdriver/common/error'
require 'selenium/webdriver/bidi/serialization'
require 'selenium/webdriver/bidi/transport'
require 'selenium/webdriver/bidi/protocol/domain'
require 'selenium/webdriver/bidi/protocol/error_code'
require 'selenium/webdriver/bidi/error'
require 'selenium/webdriver/bidi/protocol/bluetooth'
require 'selenium/webdriver/bidi/protocol/browser'
require 'selenium/webdriver/bidi/protocol/browsing_context'
require 'selenium/webdriver/bidi/protocol/emulation'
require 'selenium/webdriver/bidi/protocol/input'
require 'selenium/webdriver/bidi/protocol/log'
require 'selenium/webdriver/bidi/protocol/network'
require 'selenium/webdriver/bidi/protocol/permissions'
require 'selenium/webdriver/bidi/protocol/script'
require 'selenium/webdriver/bidi/protocol/session'
require 'selenium/webdriver/bidi/protocol/speculation'
require 'selenium/webdriver/bidi/protocol/storage'
require 'selenium/webdriver/bidi/protocol/user_agent_client_hints'
require 'selenium/webdriver/bidi/protocol/web_extension'
