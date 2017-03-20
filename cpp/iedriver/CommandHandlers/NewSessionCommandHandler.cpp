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

#include "NewSessionCommandHandler.h"
#include "errorcodes.h"
#include "logging.h"
#include "../Alert.h"
#include "../Browser.h"
#include "../BrowserFactory.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"
#include "../ProxyManager.h"

namespace webdriver {

NewSessionCommandHandler::NewSessionCommandHandler(void) {
}

NewSessionCommandHandler::~NewSessionCommandHandler(void) {
}

void NewSessionCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
  ParametersMap::const_iterator it = command_parameters.find("desiredCapabilities");
  if (it != command_parameters.end()) {
    Json::Value unexpected_alert_behavior = this->GetCapability(it->second, UNEXPECTED_ALERT_BEHAVIOR_CAPABILITY, Json::stringValue, DISMISS_UNEXPECTED_ALERTS);
    mutable_executor.set_unexpected_alert_behavior(this->GetUnexpectedAlertBehaviorValue(unexpected_alert_behavior.asString()));

    Json::Value page_load_strategy = this->GetCapability(it->second, PAGE_LOAD_STRATEGY_CAPABILITY, Json::stringValue, NORMAL_PAGE_LOAD_STRATEGY);
    mutable_executor.set_page_load_strategy(this->GetPageLoadStrategyValue(page_load_strategy.asString()));

    std::vector<std::string> property_names = it->second.getMemberNames();
    bool has_ie_options = it->second.isMember(IE_DRIVER_EXTENSIONS_CAPABILITY);

    Json::Value ie_specific_options = it->second.get(IE_DRIVER_EXTENSIONS_CAPABILITY, Json::nullValue);
    if (ie_specific_options.isNull()) {
      ie_specific_options = it->second;
    }

    this->SetBrowserFactorySettings(executor, ie_specific_options);
    this->SetInputSettings(executor, ie_specific_options);

    Json::Value resize_on_screenshot = this->GetCapability(ie_specific_options, ENABLE_FULL_PAGE_SCREENSHOT_CAPABILITY, Json::booleanValue, true);
    mutable_executor.set_enable_full_page_screenshot(resize_on_screenshot.asBool());

    Json::Value enable_element_cache_cleanup = this->GetCapability(ie_specific_options, ENABLE_ELEMENT_CACHE_CLEANUP_CAPABILITY, Json::booleanValue, true);
    mutable_executor.set_enable_element_cache_cleanup(enable_element_cache_cleanup.asBool());

    Json::Value use_per_process_proxy_capability = this->GetCapability(ie_specific_options, USE_PER_PROCESS_PROXY_CAPABILITY, Json::booleanValue, false);
    bool use_per_process_proxy = use_per_process_proxy_capability.asBool();
    Json::Value proxy = it->second.get(PROXY_CAPABILITY, Json::nullValue);
    this->SetProxySettings(executor, proxy, use_per_process_proxy);
  }

  std::string create_browser_error_message = "";
  int result_code = mutable_executor.CreateNewBrowser(&create_browser_error_message);
  if (result_code != WD_SUCCESS) {
    // The browser was not created successfully, therefore the
    // session must be marked as invalid so the server can
    // properly shut it down.
    mutable_executor.set_is_valid(false);
    response->SetErrorResponse(result_code,
                               "Unexpected error launching Internet Explorer. " + create_browser_error_message);
    return;
  }
  
  Json::Value returned_capabilities = this->CreateReturnedCapabilities(executor);
  response->SetNewSessionResponse(executor.session_id(), returned_capabilities);
}

void NewSessionCommandHandler::SetBrowserFactorySettings(const IECommandExecutor& executor, const Json::Value& capabilities) {
  std::string default_initial_url = "http://localhost:" + std::to_string(static_cast<long long>(executor.port())) + "/";
  if (!capabilities.isNull()) {
    BrowserFactorySettings factory_settings;
    Json::Value ignore_protected_mode_settings = this->GetCapability(capabilities, IGNORE_PROTECTED_MODE_CAPABILITY, Json::booleanValue, false);
    factory_settings.ignore_protected_mode_settings = ignore_protected_mode_settings.asBool();

    Json::Value ignore_zoom_setting = this->GetCapability(capabilities, IGNORE_ZOOM_SETTING_CAPABILITY, Json::booleanValue, false);
    factory_settings.ignore_zoom_setting = ignore_zoom_setting.asBool();

    Json::Value browser_attach_timeout = this->GetCapability(capabilities, BROWSER_ATTACH_TIMEOUT_CAPABILITY, Json::intValue, 0);
    factory_settings.browser_attach_timeout = browser_attach_timeout.asInt();

    Json::Value initial_url = this->GetCapability(capabilities, INITIAL_BROWSER_URL_CAPABILITY, Json::stringValue, default_initial_url);
    factory_settings.initial_browser_url = initial_url.asString();

    Json::Value force_create_process_api = this->GetCapability(capabilities, FORCE_CREATE_PROCESS_API_CAPABILITY, Json::booleanValue, false);
    factory_settings.force_create_process_api = force_create_process_api.asBool();

    Json::Value force_shell_windows_api = this->GetCapability(capabilities, FORCE_SHELL_WINDOWS_API_CAPABILITY, Json::booleanValue, false);
    factory_settings.force_shell_windows_api = force_shell_windows_api.asBool();

    Json::Value browser_command_line_switches = this->GetCapability(capabilities, BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY, Json::stringValue, "");
    factory_settings.browser_command_line_switches = browser_command_line_switches.asString();

    Json::Value ensure_clean_session = this->GetCapability(capabilities, ENSURE_CLEAN_SESSION_CAPABILITY, Json::booleanValue, false);
    factory_settings.clear_cache_before_launch = ensure_clean_session.asBool();

    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    mutable_executor.browser_factory()->Initialize(factory_settings);
  }
}

void NewSessionCommandHandler::SetInputSettings(const IECommandExecutor& executor, const Json::Value& capabilities) {
  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);

  Json::Value enable_native_events = this->GetCapability(capabilities, NATIVE_EVENTS_CAPABILITY, Json::booleanValue, true);
  mutable_executor.input_manager()->set_enable_native_events(enable_native_events.asBool());

  Json::Value scroll_behavior = this->GetCapability(capabilities, ELEMENT_SCROLL_BEHAVIOR_CAPABILITY, Json::intValue, 0);
  mutable_executor.input_manager()->set_scroll_behavior(static_cast<ElementScrollBehavior>(scroll_behavior.asInt()));

  Json::Value require_window_focus = this->GetCapability(capabilities, REQUIRE_WINDOW_FOCUS_CAPABILITY, Json::booleanValue, false);
  mutable_executor.input_manager()->set_require_window_focus(require_window_focus.asBool());

  Json::Value file_upload_dialog_timeout = this->GetCapability(capabilities, FILE_UPLOAD_DIALOG_TIMEOUT_CAPABILITY, Json::intValue, 0);
  if (file_upload_dialog_timeout.asInt() > 0) {
    mutable_executor.set_file_upload_dialog_timeout(file_upload_dialog_timeout.asInt());
  }

  Json::Value enable_persistent_hover = this->GetCapability(capabilities, ENABLE_PERSISTENT_HOVER_CAPABILITY, Json::booleanValue, true);
  if (require_window_focus.asBool() || !enable_native_events.asBool()) {
    // Setting "require_window_focus" implies SendInput() API, and does not therefore require
    // persistent hover. Likewise, not using native events requires no persistent hover either.
    mutable_executor.set_enable_persistent_hover(false);
  }
  else {
    mutable_executor.set_enable_persistent_hover(enable_persistent_hover.asBool());
  }
}

void NewSessionCommandHandler::SetProxySettings(const IECommandExecutor& executor, const Json::Value& proxy_capability, const bool use_per_process_proxy) {
  ProxySettings proxy_settings = { false, "", "", "", "", "", "", "", "" };
  if (!proxy_capability.isNull()) {
    // TODO(JimEvans): Validate the members of the proxy JSON object.
    std::string proxy_type = proxy_capability.get("proxyType", "").asString();
    proxy_settings.proxy_type = proxy_type;
    std::string http_proxy = proxy_capability.get("httpProxy", "").asString();
    proxy_settings.http_proxy = http_proxy;
    std::string ftp_proxy = proxy_capability.get("ftpProxy", "").asString();
    proxy_settings.ftp_proxy = ftp_proxy;
    std::string ssl_proxy = proxy_capability.get("sslProxy", "").asString();
    proxy_settings.ssl_proxy = ssl_proxy;
    std::string socks_proxy = proxy_capability.get("socksProxy", "").asString();
    proxy_settings.socks_proxy = socks_proxy;
    if (socks_proxy.length() > 0) {
      // SOCKS proxy user name and password capabilities are ignored if the
      // SOCKS proxy is unset.
      std::string socks_user_name = proxy_capability.get("socksUsername", "").asString();
      proxy_settings.socks_user_name = socks_user_name;
      std::string socks_password = proxy_capability.get("socksPassword", "").asString();
      proxy_settings.socks_password = socks_password;
    }
    std::string autoconfig_url = proxy_capability.get("proxyAutoconfigUrl", "").asString();
    proxy_settings.proxy_autoconfig_url = autoconfig_url;

    proxy_settings.use_per_process_proxy = use_per_process_proxy;

    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    mutable_executor.proxy_manager()->Initialize(proxy_settings);
  }
}

Json::Value NewSessionCommandHandler::CreateReturnedCapabilities(const IECommandExecutor& executor) {
  Json::Value capabilities;
  capabilities[BROWSER_NAME_CAPABILITY] = "internet explorer";
  capabilities[BROWSER_VERSION_CAPABILITY] = std::to_string(static_cast<long long>(executor.browser_factory()->browser_version()));
  capabilities[PLATFORM_CAPABILITY] = "WINDOWS";
  capabilities[JAVASCRIPT_ENABLED_CAPABILITY] = true;
  capabilities[PAGE_LOAD_STRATEGY_CAPABILITY] = executor.page_load_strategy();

  if (executor.unexpected_alert_behavior().size() > 0) {
    capabilities[UNEXPECTED_ALERT_BEHAVIOR_CAPABILITY] = executor.unexpected_alert_behavior();
  }

  Json::Value ie_options;
  ie_options[IGNORE_PROTECTED_MODE_CAPABILITY] = executor.browser_factory()->ignore_protected_mode_settings();
  ie_options[IGNORE_ZOOM_SETTING_CAPABILITY] = executor.browser_factory()->ignore_zoom_setting();
  ie_options[INITIAL_BROWSER_URL_CAPABILITY] = executor.browser_factory()->initial_browser_url();
  ie_options[BROWSER_ATTACH_TIMEOUT_CAPABILITY] = executor.browser_factory()->browser_attach_timeout();
  ie_options[BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY] = executor.browser_factory()->browser_command_line_switches();
  ie_options[FORCE_CREATE_PROCESS_API_CAPABILITY] = executor.browser_factory()->force_createprocess_api();
  ie_options[FORCE_SHELL_WINDOWS_API_CAPABILITY] = executor.browser_factory()->force_shell_windows_api();
  ie_options[ENSURE_CLEAN_SESSION_CAPABILITY] = executor.browser_factory()->clear_cache();
  ie_options[NATIVE_EVENTS_CAPABILITY] = executor.input_manager()->enable_native_events();
  ie_options[ENABLE_PERSISTENT_HOVER_CAPABILITY] = executor.enable_persistent_hover();
  ie_options[ELEMENT_SCROLL_BEHAVIOR_CAPABILITY] = executor.input_manager()->scroll_behavior();
  ie_options[REQUIRE_WINDOW_FOCUS_CAPABILITY] = executor.input_manager()->require_window_focus();
  ie_options[FILE_UPLOAD_DIALOG_TIMEOUT_CAPABILITY] = executor.file_upload_dialog_timeout();
  ie_options[ENABLE_ELEMENT_CACHE_CLEANUP_CAPABILITY] = executor.enable_element_cache_cleanup();
  ie_options[ENABLE_FULL_PAGE_SCREENSHOT_CAPABILITY] = executor.enable_full_page_screenshot();

  if (executor.proxy_manager()->is_proxy_set()) {
    ie_options[USE_PER_PROCESS_PROXY_CAPABILITY] = executor.proxy_manager()->use_per_process_proxy();
    capabilities[PROXY_CAPABILITY] = executor.proxy_manager()->GetProxyAsJson();
  }

  capabilities[IE_DRIVER_EXTENSIONS_CAPABILITY] = ie_options;
  return capabilities;
}

Json::Value NewSessionCommandHandler::GetCapability(
    Json::Value capabilities,
    std::string capability_name,
    Json::ValueType expected_capability_type,
    Json::Value default_value) {
  Json::Value capability_value = capabilities.get(capability_name, default_value);
  if (!this->IsEquivalentType(capability_value.type(), expected_capability_type)) {
    LOG(WARN) << "Invalid capability setting: " << capability_name
              << " is type " << this->GetJsonTypeDescription(capability_value.type())
              << " instead of " << this->GetJsonTypeDescription(expected_capability_type)
              << ". Default value will be used: " << default_value.toStyledString();
    return default_value;
  }
  return capability_value;
}

bool NewSessionCommandHandler::IsEquivalentType(
    Json::ValueType actual_type,
    Json::ValueType expected_type) {
  if (expected_type == actual_type) {
    return true;
  }
  if ((expected_type == Json::intValue || expected_type == Json::uintValue || expected_type == Json::realValue) &&
      (actual_type == Json::intValue || actual_type == Json::uintValue || actual_type == Json::realValue)) {
    // All numeric types are equivalent for our purposes.
    return true;
  }
  return false;
}

std::string NewSessionCommandHandler::GetJsonTypeDescription(
    Json::ValueType type) {
  switch(type) {
    case Json::booleanValue:
      return "boolean";
    case Json::intValue:
    case Json::uintValue:
    case Json::realValue:
      return "number";
    case Json::objectValue:
      return "object";
    case Json::arrayValue:
      return "array";
    case Json::stringValue:
      return "string";
  }
  return "null";
}

std::string NewSessionCommandHandler::GetUnexpectedAlertBehaviorValue(
    const std::string& desired_value) {
  std::string value = DISMISS_UNEXPECTED_ALERTS;
  if (desired_value == DISMISS_UNEXPECTED_ALERTS ||
      desired_value == ACCEPT_UNEXPECTED_ALERTS ||
      desired_value == IGNORE_UNEXPECTED_ALERTS) {
    value = desired_value;
  } else {
    LOG(WARN) << "Desired value of " << desired_value << " for "
              << UNEXPECTED_ALERT_BEHAVIOR_CAPABILITY << " is not"
              << " a valid value. Using default of " << value;
  }
  return value;
}

std::string NewSessionCommandHandler::GetPageLoadStrategyValue(
    const std::string& desired_value) {
  std::string value = NORMAL_PAGE_LOAD_STRATEGY;
  if (desired_value == NORMAL_PAGE_LOAD_STRATEGY ||
      desired_value == EAGER_PAGE_LOAD_STRATEGY ||
      desired_value == NONE_PAGE_LOAD_STRATEGY) {
    value = desired_value;
  } else {
    LOG(WARN) << "Desired value of " << desired_value << " for "
              << PAGE_LOAD_STRATEGY_CAPABILITY << " is not"
              << " a valid value. Using default of " << value;
  }
  return value;
}

} // namespace webdriver
