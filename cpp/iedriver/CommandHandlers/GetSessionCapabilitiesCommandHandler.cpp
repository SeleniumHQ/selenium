// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "GetSessionCapabilitiesCommandHandler.h"
#include "../Browser.h"
#include "../BrowserFactory.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"
#include "../ProxyManager.h"
#include "../WebDriverConstants.h"

namespace webdriver {

GetSessionCapabilitiesCommandHandler::GetSessionCapabilitiesCommandHandler(void) {
}

GetSessionCapabilitiesCommandHandler::~GetSessionCapabilitiesCommandHandler(void) {
}

void GetSessionCapabilitiesCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  Json::Value capabilities;
  capabilities[BROWSER_NAME_CAPABILITY] = "internet explorer";
  capabilities[BROWSER_VERSION_CAPABILITY] = std::to_string(static_cast<long long>(executor.browser_factory()->browser_version()));
  capabilities[PLATFORM_NAME_CAPABILITY] = "windows";
  capabilities[NATIVE_EVENTS_CAPABILITY] = executor.input_manager()->enable_native_events();
  if (executor.proxy_manager()->is_proxy_set()) {
    capabilities[PROXY_CAPABILITY] = executor.proxy_manager()->GetProxyAsJson();
  }
  capabilities[ENABLE_PERSISTENT_HOVER_CAPABILITY] = executor.input_manager()->use_persistent_hover();
  capabilities[UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY] = executor.unexpected_alert_behavior();
  capabilities[PAGE_LOAD_STRATEGY_CAPABILITY] = executor.page_load_strategy();
  capabilities[ELEMENT_SCROLL_BEHAVIOR_CAPABILITY] = executor.input_manager()->scroll_behavior();
  capabilities[IGNORE_PROTECTED_MODE_CAPABILITY] = executor.browser_factory()->ignore_protected_mode_settings();
  capabilities[IGNORE_ZOOM_SETTING_CAPABILITY] = executor.browser_factory()->ignore_zoom_setting();
  capabilities[INITIAL_BROWSER_URL_CAPABILITY] = executor.browser_factory()->initial_browser_url();
  capabilities[REQUIRE_WINDOW_FOCUS_CAPABILITY] = executor.input_manager()->require_window_focus();
  capabilities[BROWSER_ATTACH_TIMEOUT_CAPABILITY] = executor.browser_factory()->browser_attach_timeout();
  capabilities[BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY] = executor.browser_factory()->browser_command_line_switches();
  capabilities[FORCE_CREATE_PROCESS_API_CAPABILITY] = executor.browser_factory()->force_createprocess_api();
  capabilities[ENSURE_CLEAN_SESSION_CAPABILITY] = executor.browser_factory()->clear_cache();
  capabilities[USE_PER_PROCESS_PROXY_CAPABILITY] = executor.proxy_manager()->use_per_process_proxy();
  capabilities[FILE_UPLOAD_DIALOG_TIMEOUT_CAPABILITY] = executor.file_upload_dialog_timeout();
  response->SetSuccessResponse(capabilities);
}

} // namespace webdriver
