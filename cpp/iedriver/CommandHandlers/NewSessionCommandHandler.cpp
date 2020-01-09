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
#include "../WebDriverConstants.h"

namespace webdriver {

NewSessionCommandHandler::NewSessionCommandHandler(void) {
}

NewSessionCommandHandler::~NewSessionCommandHandler(void) {
}

void NewSessionCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  Json::Value returned_capabilities;
  std::string error_message = "";

  // Find W3C capabilities first.
  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);

  ParametersMap::const_iterator it = command_parameters.find("capabilities");
  if (it != command_parameters.end()) {
    LOG(DEBUG) << "Found W3C capabilities structure";
    Json::Value validated_capabilities = this->ValidateArguments(it->second,
                                                                 &error_message);
    if (validated_capabilities.size() == 0) {
      // validated_capabilities returns an array with validated capabilities
      // in it. If there are no entries in the array, then something failed
      // validation. The error_message string will tell us what.
      mutable_executor.set_is_valid(false);
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT, error_message);
      return;
    }
    error_message = "";
    returned_capabilities = this->ProcessCapabilities(executor,
                                                      validated_capabilities,
                                                      &error_message);
  } else {
    error_message = "No property named 'capabilities' found in new session request body.";
    mutable_executor.set_is_valid(false);
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, error_message);
    return;
  }

  if (returned_capabilities.isNull()) {
    // The browser was not created successfully, therefore the
    // session must be marked as invalid so the server can
    // properly shut it down.
    mutable_executor.set_is_valid(false);
    response->SetErrorResponse(ERROR_SESSION_NOT_CREATED, error_message);
    return;
  }

  error_message = "";
  int result_code = mutable_executor.CreateNewBrowser(&error_message);
  if (result_code != WD_SUCCESS) {
    // The browser was not created successfully, therefore the
    // session must be marked as invalid so the server can
    // properly shut it down.
    mutable_executor.set_is_valid(false);
    response->SetErrorResponse(ERROR_SESSION_NOT_CREATED,
        "Unexpected error launching Internet Explorer. " + error_message);
    return;
  }
  Json::Value new_session_response_object;
  new_session_response_object["sessionId"] = executor.session_id();
  new_session_response_object["capabilities"] = returned_capabilities;
  response->SetSuccessResponse(new_session_response_object);
}

Json::Value NewSessionCommandHandler::GetCapability(
    const Json::Value& capabilities,
    const std::string& capability_name,
    const Json::ValueType& expected_capability_type,
    const Json::Value& default_value) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::GetCapability "
             << "for capability " << capability_name;
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
    const Json::ValueType& actual_type,
    const Json::ValueType& expected_type) {
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
    const Json::ValueType& type) {
  switch (type) {
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
  LOG(TRACE) << "Entering NewSessionCommandHandler::GetUnexpectedAlertBehaviorValue";
  std::string value = DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS;
  if (desired_value == DISMISS_UNEXPECTED_ALERTS ||
      desired_value == ACCEPT_UNEXPECTED_ALERTS ||
      desired_value == ACCEPT_AND_NOTIFY_UNEXPECTED_ALERTS ||
      desired_value == DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS ||
      desired_value == IGNORE_UNEXPECTED_ALERTS) {
    value = desired_value;
  } else {
    LOG(WARN) << "Desired value of " << desired_value << " for "
              << UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY << " is not"
              << " a valid value. Using default of " << value;
  }
  return value;
}

std::string NewSessionCommandHandler::GetPageLoadStrategyValue(
    const std::string& desired_value) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::GetPageLoadStrategyValue";
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

Json::Value NewSessionCommandHandler::ValidateArguments(const Json::Value& capabilities,
                                                        std::string* error_message) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::ValidateArguments";
  Json::Value validated_capabilities(Json::arrayValue);
  if (!capabilities.isObject()) {
    *error_message = "'capabilities' in new session request body is not a JSON object.";
    return validated_capabilities;
  }
  Json::Value always_match(Json::objectValue);
  if (capabilities.isMember("alwaysMatch")) {
    LOG(DEBUG) << "Found alwaysMatch in capabilities";
    always_match = capabilities["alwaysMatch"];
    if (!always_match.isObject()) {
      *error_message = "alwaysMatch must be a JSON object";
      return validated_capabilities;
    }
  }

  LOG(DEBUG) << "Validating alwaysMatch capability set";
  if (this->ValidateCapabilities(always_match, "alwaysMatch", error_message)) {
    Json::Value empty_capabilities(Json::objectValue);
    Json::Value first_match_candidates(Json::arrayValue);
    first_match_candidates.append(empty_capabilities);
    if (capabilities.isMember("firstMatch")) {
      first_match_candidates = capabilities["firstMatch"];
    }
    if (!first_match_candidates.isArray()) {
      *error_message = "firstMatch must be a JSON list";
      return validated_capabilities;
    } else {
      // If the user passed a "firstMatch" array, but it was empty,
      // seed the firstMatch array with an empty object for merging
      // purposes.
      if (first_match_candidates.size() == 0) {
        first_match_candidates.append(empty_capabilities);
      }
      bool first_match_validation_failure = false;
      Json::Value validated_first_match_candidates(Json::arrayValue);
      for (size_t i = 0; i < first_match_candidates.size(); ++i) {
        LOG(DEBUG) << "Validating firstMatch capability set with index " << i;
        std::string first_match_validation_error = "";
        Json::Value first_match_candidate = first_match_candidates[static_cast<int>(i)];
        if (this->ValidateCapabilities(first_match_candidate,
                                       "firstMatch element " + std::to_string(i),
                                       &first_match_validation_error)) {
          validated_first_match_candidates.append(first_match_candidate);
        } else {
          first_match_validation_failure = true;
          if (error_message->size() == 0) {
            error_message->append("All firstMatch elements failed validation\n");
          } else {
            error_message->append("\n");
          }
          error_message->append(first_match_validation_error);
        }
      }

      if (first_match_validation_failure) {
        return validated_capabilities;
      }

      // Because we seed the list of "firstMatch" values with an empty value
      // if none were passed in, we should always have at least one element
      // in the array of firstMatch candidates. If we don't then every one
      // has failed validation, and we need to return back out.
      if (validated_first_match_candidates.size() > 0) {
        // Reset the error message in the event any of the firstMatch
        // candidates failed validation.
        *error_message = "";

        for (size_t i = 0; i < validated_first_match_candidates.size(); ++i) {
          Json::Value merged_capabilities(Json::objectValue);
          Json::Value first_match = validated_first_match_candidates[static_cast<int>(i)];
          if (!this->MergeCapabilities(always_match,
                                       first_match,
                                       &merged_capabilities,
                                       error_message)) {
            // If any of the capabilities can't be merged, this is a failure
            // condition according to the spec, so we fail here, returning an
            // empty array.
            return Json::Value(Json::arrayValue);
          }
          validated_capabilities.append(merged_capabilities);
        }
      }
    }
  }
  return validated_capabilities;
}

Json::Value NewSessionCommandHandler::ProcessCapabilities(const IECommandExecutor& executor,
                                                          const Json::Value& capabilities,
                                                          std::string* error_message) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::ProcessCapabilities";
  for (size_t i = 0; i < capabilities.size(); ++i) {
    std::string match_error = "";
    Json::Value merged_capabilities = capabilities[static_cast<int>(i)];
    if (this->MatchCapabilities(executor, merged_capabilities, &match_error)) {
      LOG(DEBUG) << "Processing matched capability set with index " << i;
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);

      Json::Value unexpected_alert_behavior = this->GetCapability(merged_capabilities,
                                                                  UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY,
                                                                  Json::stringValue,
                                                                  Json::Value(Json::stringValue));
      mutable_executor.set_unexpected_alert_behavior(unexpected_alert_behavior.asString());

      Json::Value page_load_strategy = this->GetCapability(merged_capabilities,
                                                           PAGE_LOAD_STRATEGY_CAPABILITY,
                                                           Json::stringValue,
                                                           NORMAL_PAGE_LOAD_STRATEGY);
      mutable_executor.set_page_load_strategy(this->GetPageLoadStrategyValue(page_load_strategy.asString()));

      Json::Value use_strict_file_interactability = this->GetCapability(merged_capabilities,
                                                                        STRICT_FILE_INTERACTABILITY_CAPABILITY,
                                                                        Json::booleanValue,
                                                                        false);
      mutable_executor.set_use_strict_file_interactability(use_strict_file_interactability.asBool());

      Json::Value timeouts = this->GetCapability(merged_capabilities,
                                                 TIMEOUTS_CAPABILITY,
                                                 Json::objectValue,
                                                 Json::Value());
      this->SetTimeoutSettings(executor, timeouts);

      Json::Value ie_options(Json::objectValue);
      if (merged_capabilities.isMember(IE_DRIVER_EXTENSIONS_CAPABILITY)) {
        ie_options = merged_capabilities[IE_DRIVER_EXTENSIONS_CAPABILITY];
      }

      this->SetBrowserFactorySettings(executor, ie_options);

      this->SetInputSettings(executor, ie_options);

      if (merged_capabilities.isMember(PROXY_CAPABILITY)) {
        Json::Value use_per_process_proxy_capability = this->GetCapability(ie_options,
                                                                           USE_PER_PROCESS_PROXY_CAPABILITY,
                                                                           Json::booleanValue,
                                                                           false);
        bool use_per_process_proxy = use_per_process_proxy_capability.asBool();
        this->SetProxySettings(executor,
                               merged_capabilities[PROXY_CAPABILITY],
                               use_per_process_proxy);
      }

      // Use CreateReturnedCapabilities to fill in unspecified capabilities values.
      return this->CreateReturnedCapabilities(executor);
    } else {
      if (error_message->size() == 0) {
        error_message->append("No matching capability sets found.\n");
      } else {
        error_message->append("\n");
      }
      error_message->append("Unable to match capability set ");
      error_message->append(std::to_string(i));
      error_message->append(": ");
      error_message->append(match_error);
    }
  }
  return Json::Value(Json::nullValue);
}

void NewSessionCommandHandler::SetTimeoutSettings(const IECommandExecutor& executor,
                                                  const Json::Value& capabilities) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::SetTimeoutSettings";
  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
  if (capabilities.isMember(IMPLICIT_WAIT_TIMEOUT_NAME)) {
    mutable_executor.set_implicit_wait_timeout(capabilities[IMPLICIT_WAIT_TIMEOUT_NAME].asUInt64());
  }
  if (capabilities.isMember(PAGE_LOAD_TIMEOUT_NAME)) {
    mutable_executor.set_page_load_timeout(capabilities[PAGE_LOAD_TIMEOUT_NAME].asUInt64());
  }
  if (capabilities.isMember(SCRIPT_TIMEOUT_NAME)) {
    if (capabilities[SCRIPT_TIMEOUT_NAME].isNull()) {
      mutable_executor.set_async_script_timeout(-1);
    } else {
      mutable_executor.set_async_script_timeout(capabilities[SCRIPT_TIMEOUT_NAME].asInt64());
    }
  }
}

void NewSessionCommandHandler::SetBrowserFactorySettings(const IECommandExecutor& executor,
                                                         const Json::Value& capabilities) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::SetBrowserFactorySettings";
  std::string default_initial_url = "http://localhost:" + std::to_string(static_cast<long long>(executor.port())) + "/";
  if (!capabilities.isNull()) {
    BrowserFactorySettings factory_settings;
    Json::Value ignore_protected_mode_settings = this->GetCapability(capabilities,
                                                                     IGNORE_PROTECTED_MODE_CAPABILITY,
                                                                     Json::booleanValue,
                                                                     false);
    factory_settings.ignore_protected_mode_settings = ignore_protected_mode_settings.asBool();

    Json::Value ignore_zoom_setting = this->GetCapability(capabilities,
                                                          IGNORE_ZOOM_SETTING_CAPABILITY,
                                                          Json::booleanValue,
                                                          false);
    factory_settings.ignore_zoom_setting = ignore_zoom_setting.asBool();

    Json::Value browser_attach_timeout = this->GetCapability(capabilities,
                                                             BROWSER_ATTACH_TIMEOUT_CAPABILITY,
                                                             Json::intValue,
                                                             Json::Value(Json::intValue));
    factory_settings.browser_attach_timeout = browser_attach_timeout.asInt();

    Json::Value initial_url = this->GetCapability(capabilities,
                                                  INITIAL_BROWSER_URL_CAPABILITY,
                                                  Json::stringValue, default_initial_url);
    factory_settings.initial_browser_url = initial_url.asString();

    Json::Value force_create_process_api = this->GetCapability(capabilities,
                                                               FORCE_CREATE_PROCESS_API_CAPABILITY,
                                                               Json::booleanValue,
                                                               false);
    factory_settings.force_create_process_api = force_create_process_api.asBool();

    Json::Value force_shell_windows_api = this->GetCapability(capabilities,
                                                              FORCE_SHELL_WINDOWS_API_CAPABILITY,
                                                              Json::booleanValue,
                                                              false);
    factory_settings.force_shell_windows_api = force_shell_windows_api.asBool();

    Json::Value browser_command_line_switches = this->GetCapability(capabilities,
                                                                    BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY,
                                                                    Json::stringValue,
                                                                    Json::Value(Json::stringValue));
    factory_settings.browser_command_line_switches = browser_command_line_switches.asString();

    Json::Value ensure_clean_session = this->GetCapability(capabilities,
                                                           ENSURE_CLEAN_SESSION_CAPABILITY,
                                                           Json::booleanValue,
                                                           false);
    factory_settings.clear_cache_before_launch = ensure_clean_session.asBool();

    // By default, we should not be attaching to edge_ie
    factory_settings.attach_to_edge_ie = false;
    Json::Value attach_to_edgechrome = this->GetCapability(capabilities,
                                                           ATTACH_TO_EDGE_CHROME,
                                                           Json::booleanValue,
                                                           false);
    factory_settings.attach_to_edge_ie = attach_to_edgechrome.asBool();

    Json::Value edge_executable_path = this->GetCapability(capabilities,
                                                           EDGE_EXECUTABLE_PATH,
                                                           Json::stringValue,
                                                           Json::Value(Json::stringValue));
    factory_settings.edge_executable_path = edge_executable_path.asString();

    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    mutable_executor.browser_factory()->Initialize(factory_settings);
    mutable_executor.set_is_edge_mode(factory_settings.attach_to_edge_ie);
    mutable_executor.set_edge_executable_path(factory_settings.edge_executable_path);
  }
}

void NewSessionCommandHandler::SetProxySettings(const IECommandExecutor& executor,
                                                const Json::Value& proxy_capability,
                                                const bool use_per_process_proxy) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::SetProxySettings";
  ProxySettings proxy_settings = { false, "", "", "", "", "", "", "", "", "" };
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

    Json::Value proxy_bypass_list = proxy_capability.get("noProxy", Json::Value::null);
    if (!proxy_bypass_list.isNull() && proxy_bypass_list.isArray()) {
      std::string no_proxy = "";
      for (size_t i = 0; i < proxy_bypass_list.size(); ++i) {
        if (no_proxy.size() > 0) {
          no_proxy.append(";");
        }
        no_proxy.append(proxy_bypass_list[static_cast<int>(i)].asString());
      }
      proxy_settings.proxy_bypass = no_proxy;
    }

    proxy_settings.use_per_process_proxy = use_per_process_proxy;

    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    mutable_executor.proxy_manager()->Initialize(proxy_settings);
  }
}

void NewSessionCommandHandler::SetInputSettings(const IECommandExecutor& executor,
                                                const Json::Value& capabilities) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::SetInputSettings";
  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
  InputManagerSettings input_manager_settings;
  input_manager_settings.element_repository = mutable_executor.element_manager();

  Json::Value enable_native_events = this->GetCapability(capabilities,
                                                         NATIVE_EVENTS_CAPABILITY,
                                                         Json::booleanValue,
                                                         true);
  input_manager_settings.use_native_events = enable_native_events.asBool();

  Json::Value scroll_behavior = this->GetCapability(capabilities,
                                                    ELEMENT_SCROLL_BEHAVIOR_CAPABILITY,
                                                    Json::intValue,
                                                    Json::Value(Json::intValue));
  input_manager_settings.scroll_behavior = static_cast<ElementScrollBehavior>(scroll_behavior.asInt());

  Json::Value require_window_focus = this->GetCapability(capabilities,
                                                         REQUIRE_WINDOW_FOCUS_CAPABILITY,
                                                         Json::booleanValue,
                                                         false);
  input_manager_settings.require_window_focus = require_window_focus.asBool();

  Json::Value file_upload_dialog_timeout = this->GetCapability(capabilities,
                                                               FILE_UPLOAD_DIALOG_TIMEOUT_CAPABILITY,
                                                               Json::intValue,
                                                               Json::Value(Json::intValue));
  if (file_upload_dialog_timeout.asInt() > 0) {
    mutable_executor.set_file_upload_dialog_timeout(file_upload_dialog_timeout.asInt());
  }

  Json::Value enable_persistent_hover = this->GetCapability(capabilities,
                                                            ENABLE_PERSISTENT_HOVER_CAPABILITY,
                                                            Json::booleanValue,
                                                            true);
  if (require_window_focus.asBool() || !enable_native_events.asBool()) {
    // Setting "require_window_focus" implies SendInput() API, and does not
    // therefore require persistent hover. Likewise, not using native events
    // requires no persistent hover either.
    input_manager_settings.enable_persistent_hover = false;
  } else {
    input_manager_settings.enable_persistent_hover = enable_persistent_hover.asBool();
  }
  mutable_executor.input_manager()->Initialize(input_manager_settings);
}

Json::Value NewSessionCommandHandler::CreateReturnedCapabilities(const IECommandExecutor& executor) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::CreateReturnedCapabilities";
  Json::Value capabilities;
  capabilities[BROWSER_NAME_CAPABILITY] = "internet explorer";
  capabilities[BROWSER_VERSION_CAPABILITY] = std::to_string(static_cast<long long>(executor.browser_factory()->browser_version()));
  capabilities[PLATFORM_NAME_CAPABILITY] = "windows";
  capabilities[ACCEPT_INSECURE_CERTS_CAPABILITY] = false;
  capabilities[PAGE_LOAD_STRATEGY_CAPABILITY] = executor.page_load_strategy();
  capabilities[STRICT_FILE_INTERACTABILITY_CAPABILITY] = executor.use_strict_file_interactability();
  capabilities[SET_WINDOW_RECT_CAPABILITY] = true;

  if (executor.unexpected_alert_behavior().size() > 0) {
    capabilities[UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY] = executor.unexpected_alert_behavior();
  } else {
    capabilities[UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY] = DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS;
  }

  Json::Value timeouts;
  timeouts[IMPLICIT_WAIT_TIMEOUT_NAME] = executor.implicit_wait_timeout();
  timeouts[PAGE_LOAD_TIMEOUT_NAME] = executor.page_load_timeout();
  long long script_timeout = executor.async_script_timeout();
  if (script_timeout < 0) {
    timeouts[SCRIPT_TIMEOUT_NAME] = Json::Value::null;
  } else {
    timeouts[SCRIPT_TIMEOUT_NAME] = script_timeout;
  }
  capabilities[TIMEOUTS_CAPABILITY] = timeouts;

  Json::Value ie_options;
  ie_options[IGNORE_PROTECTED_MODE_CAPABILITY] = executor.browser_factory()->ignore_protected_mode_settings();
  ie_options[IGNORE_ZOOM_SETTING_CAPABILITY] = executor.browser_factory()->ignore_zoom_setting();
  ie_options[INITIAL_BROWSER_URL_CAPABILITY] = executor.browser_factory()->initial_browser_url();
  ie_options[BROWSER_ATTACH_TIMEOUT_CAPABILITY] = executor.browser_factory()->browser_attach_timeout();
  ie_options[BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY] = executor.browser_factory()->browser_command_line_switches();
  ie_options[FORCE_CREATE_PROCESS_API_CAPABILITY] = executor.browser_factory()->force_createprocess_api();
  ie_options[ENSURE_CLEAN_SESSION_CAPABILITY] = executor.browser_factory()->clear_cache();
  ie_options[NATIVE_EVENTS_CAPABILITY] = executor.input_manager()->enable_native_events();
  ie_options[ENABLE_PERSISTENT_HOVER_CAPABILITY] = executor.input_manager()->use_persistent_hover();
  ie_options[ELEMENT_SCROLL_BEHAVIOR_CAPABILITY] = executor.input_manager()->scroll_behavior();
  ie_options[REQUIRE_WINDOW_FOCUS_CAPABILITY] = executor.input_manager()->require_window_focus();
  ie_options[FILE_UPLOAD_DIALOG_TIMEOUT_CAPABILITY] = executor.file_upload_dialog_timeout();
  ie_options[ATTACH_TO_EDGE_CHROME] = executor.is_edge_mode();
  ie_options[EDGE_EXECUTABLE_PATH] = executor.edge_executable_path();

  if (executor.proxy_manager()->is_proxy_set()) {
    ie_options[USE_PER_PROCESS_PROXY_CAPABILITY] = executor.proxy_manager()->use_per_process_proxy();
    capabilities[PROXY_CAPABILITY] = executor.proxy_manager()->GetProxyAsJson();
  } else {
    capabilities[PROXY_CAPABILITY] = Json::Value(Json::objectValue);
  }

  capabilities[IE_DRIVER_EXTENSIONS_CAPABILITY] = ie_options;
  return capabilities;
}

bool NewSessionCommandHandler::MatchCapabilities(const IECommandExecutor& executor,
                                                 const Json::Value& merged_capabilities,
                                                 std::string* error_message) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::MatchCapabilities";
  std::vector<std::string> capability_names = merged_capabilities.getMemberNames();
  std::vector<std::string>::const_iterator name_iterator = capability_names.begin();
  for (; name_iterator != capability_names.end(); ++name_iterator) {
    std::string capability_name = *name_iterator;
    if (capability_name == BROWSER_NAME_CAPABILITY && 
        merged_capabilities[BROWSER_NAME_CAPABILITY].asString() != "internet explorer") {
      *error_message = "browserName must be 'internet explorer', but was '" +
                       merged_capabilities[BROWSER_NAME_CAPABILITY].asString() +
                       "'";
      return false;
    }

    if (capability_name == PLATFORM_NAME_CAPABILITY &&
        merged_capabilities[PLATFORM_NAME_CAPABILITY].asString() != "windows") {
      *error_message = "platformName must be 'windows', but was '" +
                       merged_capabilities[PLATFORM_NAME_CAPABILITY].asString() +
                       "'";
      return false;
    }

    if (capability_name == BROWSER_VERSION_CAPABILITY) {
      // TODO: Support string version comparisons with '<', '>', '<=', and '>='
      std::string requested_browser_version_value = merged_capabilities[BROWSER_VERSION_CAPABILITY].asString();
      int available_browser_version = executor.browser_factory()->browser_version();
      int requested_browser_version = atoi(requested_browser_version_value.c_str());
      if (available_browser_version != requested_browser_version) {
        *error_message = "requested browserVersion value was '" +
                         requested_browser_version_value +
                         "', but the installed version of IE is " +
                         std::to_string(available_browser_version) +
                         " (note: only exact matches on major version " +
                         "number are supported)";
        return false;
      }
    }

    if (capability_name == ACCEPT_INSECURE_CERTS_CAPABILITY &&
        merged_capabilities[ACCEPT_INSECURE_CERTS_CAPABILITY].asBool()) {
      *error_message = "acceptInsecureCerts was 'true', but the IE driver does not allow bypassing insecure (self-signed) SSL certificates";
      return false;
    }

    if (capability_name.find(":") != std::string::npos &&
        (capability_name != IE_DRIVER_EXTENSIONS_CAPABILITY &&
        capability_name.find("test:") == std::string::npos)) {
      *error_message = capability_name + " is an unknown extension capability for IE";
      return false;
    }
  }

  return true;
}

bool NewSessionCommandHandler::MergeCapabilities(
    const Json::Value& primary_capabilities,
    const Json::Value& secondary_capabilities,
    Json::Value* merged_capabilities,
    std::string* error_message) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::MergeCapabilities";
  std::vector<std::string> primary_property_names = primary_capabilities.getMemberNames();
  for (size_t i = 0; i < primary_property_names.size(); ++i) {
    std::string property_name = primary_property_names[i];
    (*merged_capabilities)[property_name] = primary_capabilities[property_name];
  }

  std::vector<std::string> secondary_property_names = secondary_capabilities.getMemberNames();
  for (size_t i = 0; i < secondary_property_names.size(); ++i) {
    std::string property_name = secondary_property_names[i];
    if (merged_capabilities->isMember(property_name)) {
      *error_message = "Cannot merge capabilities: " +
                       property_name + " is already specified";
      return false;
    }
    (*merged_capabilities)[property_name] = secondary_capabilities[property_name];
  }
  return true;
}

bool NewSessionCommandHandler::ValidateCapabilities(
    const Json::Value& capabilities,
    const std::string& capability_set_name,
    std::string* error_message) {
  LOG(TRACE) << "Entering NewSessionCommandHandler::ValidateCapabilities";
  LOG(DEBUG) << "Validating capabilities object";
  if (!capabilities.isObject() && !capabilities.isNull()) {
    *error_message = capability_set_name + " is not a JSON object.";
    return false;
  }

  if (capabilities.isNull()) {
    return true;
  }

  std::vector<std::string> capability_names = capabilities.getMemberNames();
  std::vector<std::string>::const_iterator name_iterator = capability_names.begin();
  for (; name_iterator != capability_names.end(); ++name_iterator) {
    std::string capability_name = *name_iterator;
    std::string capability_error_message;
    if (capabilities[capability_name].isNull()) {
      // Cast away the const modifier only in this case.
      const_cast<Json::Value&>(capabilities).removeMember(capability_name);
      continue;
    }
    if (capability_name == ACCEPT_INSECURE_CERTS_CAPABILITY) {
      LOG(DEBUG) << "Found " << ACCEPT_INSECURE_CERTS_CAPABILITY << " capability."
                 << " Validating value type is boolean.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::booleanValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      }
      continue;
    }

    if (capability_name == STRICT_FILE_INTERACTABILITY_CAPABILITY) {
      LOG(DEBUG) << "Found " << STRICT_FILE_INTERACTABILITY_CAPABILITY << " capability."
        << " Validating value type is boolean.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::booleanValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      }
      continue;
    }

    if (capability_name == BROWSER_NAME_CAPABILITY) {
      LOG(DEBUG) << "Found " << BROWSER_NAME_CAPABILITY << " capability."
                 << " Validating value type is string.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::stringValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      }
      continue;
    }

    if (capability_name == BROWSER_VERSION_CAPABILITY) {
      LOG(DEBUG) << "Found " << BROWSER_VERSION_CAPABILITY << " capability."
                 << " Validating value type is string.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::stringValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                          capability_set_name + ": " +
                          capability_error_message;
        return false;
      }
      continue;
    }

    if (capability_name == PLATFORM_NAME_CAPABILITY) {
      LOG(DEBUG) << "Found " << PLATFORM_NAME_CAPABILITY << " capability."
                 << " Validating value type is string.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::stringValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      }
      continue;
    }

    if (capability_name == UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY) {
      LOG(DEBUG) << "Found " << UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY << " capability."
                 << " Validating value type is string.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::stringValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      } else {
        LOG(DEBUG) << "Validating " << UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY << " capability"
                   << " is a valid value.";
        std::string unhandled_prompt_behavior = capabilities[capability_name].asString();
        if (unhandled_prompt_behavior != ACCEPT_UNEXPECTED_ALERTS &&
            unhandled_prompt_behavior != DISMISS_UNEXPECTED_ALERTS &&
            unhandled_prompt_behavior != ACCEPT_AND_NOTIFY_UNEXPECTED_ALERTS &&
            unhandled_prompt_behavior != DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS &&
            unhandled_prompt_behavior != IGNORE_UNEXPECTED_ALERTS) {
          *error_message = "Invalid capabilities in " +
                           capability_set_name + ": " + 
                           "unhandledPromptBehavior is " + 
                           unhandled_prompt_behavior + 
                           " but must be 'accept' or 'dismiss'";
          return false;
        }
      }

      continue;
    }

    if (capability_name == PAGE_LOAD_STRATEGY_CAPABILITY) {
      std::string page_load_strategy = "";
      LOG(DEBUG) << "Found " << PAGE_LOAD_STRATEGY_CAPABILITY << " capability."
                 << " Validating value type is string.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::stringValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      } else {
        LOG(DEBUG) << "Validating " << PAGE_LOAD_STRATEGY_CAPABILITY << " capability"
                   << " is a valid value.";
        page_load_strategy = capabilities[capability_name].asString();
        if (page_load_strategy != NONE_PAGE_LOAD_STRATEGY &&
            page_load_strategy != EAGER_PAGE_LOAD_STRATEGY &&
            page_load_strategy != NORMAL_PAGE_LOAD_STRATEGY) {
          *error_message = "Invalid capabilities in " +
                           capability_set_name + ": " +
                           "pageLoadStrategy is " + page_load_strategy +
                           " but must be 'none', 'eager', or 'normal'";
          return false;
        }
      }
      continue;
    }

    if (capability_name == TIMEOUTS_CAPABILITY) {
      LOG(DEBUG) << "Found " << TIMEOUTS_CAPABILITY << " capability."
                 << " Validating value type is object.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::objectValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " + capability_error_message;
        return false;
      } else {
        LOG(DEBUG) << "Validating " << TIMEOUTS_CAPABILITY << " capability"
                   << " object contains correct property names.";
        Json::Value timeouts = capabilities[capability_name];
        std::vector<std::string> timeout_names = timeouts.getMemberNames();
        std::vector<std::string>::const_iterator timeout_name_iterator = timeout_names.begin();
        for (; timeout_name_iterator != timeout_names.end(); ++timeout_name_iterator) {
          std::string timeout_name = *timeout_name_iterator;
          if (timeout_name != PAGE_LOAD_TIMEOUT_NAME &&
              timeout_name != IMPLICIT_WAIT_TIMEOUT_NAME &&
              timeout_name != SCRIPT_TIMEOUT_NAME) {
            *error_message = "Invalid capabilities in " +
                             capability_set_name + ": " +
                             "a timeout named " + timeout_name +
                             " is specified, but timeout names must be " +
                             "'implicit', 'pageLoad', or 'script'";
            return false;
          }
          std::string timeout_error = "";
          Json::Value timeout_value = timeouts[timeout_name];
          // Special case: script timeout may be null.
          if (timeout_name != SCRIPT_TIMEOUT_NAME || !timeout_value.isNull()) {
            if (!timeout_value.isNumeric() || !timeout_value.isIntegral()) {
              *error_message = "Invalid capabilities in " +
                               capability_set_name + ": " +
                               "timeout " + timeout_name +
                               "must be an integer";
              return false;
            }
            if (!timeout_value.isInt64()) {
              *error_message = "Invalid capabilities in " +
                               capability_set_name + ": " +
                               "timeout " + timeout_name +
                               "must be an integer between 0 and 2^53 - 1";
              return false;
            }
            long long timeout = timeout_value.asInt64();
            if (timeout < 0 || timeout > MAX_SAFE_INTEGER) {
              *error_message = "Invalid capabilities in " +
                               capability_set_name + ": " +
                               "timeout " + timeout_name +
                               "must be an integer between 0 and 2^53 - 1";
              return false;
            }
          }
        }
      }
      continue;
    }

    if (capability_name == PROXY_CAPABILITY) {
      LOG(DEBUG) << "Found " << PROXY_CAPABILITY << " capability."
                 << " Validating value type is object.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::objectValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " +
                         capability_set_name + ": " +
                         capability_error_message;
        return false;
      } else {
        LOG(DEBUG) << "Validating " << PROXY_CAPABILITY << "capability"
                   << " object structure.";
        Json::Value proxy = capabilities[capability_name];
        std::vector<std::string> proxy_setting_names = proxy.getMemberNames();
        std::vector<std::string>::const_iterator proxy_setting_iterator = proxy_setting_names.begin();
        for (; proxy_setting_iterator != proxy_setting_names.end(); ++proxy_setting_iterator) {
          std::string proxy_error = "";
          std::string proxy_setting = *proxy_setting_iterator;
          if (proxy_setting == "proxyType") {
            if (!this->ValidateCapabilityType(proxy,
                                              proxy_setting,
                                              Json::ValueType::stringValue,
                                              &proxy_error)) {
              *error_message = "Invalid capabilities in " + 
                               capability_set_name + ": " + 
                               "proxy setting " + proxy_error;
              return false;
            }
            std::string proxy_type = proxy[proxy_setting].asString();
            if (proxy_type != "pac" && 
                proxy_type != "direct" && 
                proxy_type != "autodetect" && 
                proxy_type != "system" && 
                proxy_type != "manual") {
              *error_message = "Invalid capabilities in " + 
                               capability_set_name + ": " + 
                               "a proxy type named " + proxy_type + 
                               " is specified, but proxy type must be " +
                               "'pac', 'direct', 'autodetect', 'system', " +
                               "or 'manual'";
              return false;
            }
            continue;
          }

          if (proxy_setting == "proxyAutoconfigUrl" ||
              proxy_setting == "ftpProxy" ||
              proxy_setting == "httpProxy" ||
              proxy_setting == "sslProxy" ||
              proxy_setting == "socksProxy") {
            if (!this->ValidateCapabilityType(proxy, 
                                              proxy_setting,
                                              Json::ValueType::stringValue,
                                              &proxy_error)) {
              *error_message = "Invalid capabilities in " + 
                               capability_set_name + ": " + 
                               "proxy setting " + proxy_error;
              return false;
            }
            continue;
          }

          if (proxy_setting == "noProxy") {
            if (!this->ValidateCapabilityType(proxy,
                                              proxy_setting,
                                              Json::ValueType::arrayValue,
                                              &proxy_error)) {
              *error_message = "Invalid capabilities in " +
                                capability_set_name + ": " +
                                "proxy setting " + proxy_error;
              return false;
            }
            continue;
          }

          if (proxy_setting == "socksVersion") {
            if (!this->ValidateCapabilityType(proxy, proxy_setting,
                                              Json::ValueType::intValue,
                                              &proxy_error)) {
              *error_message = "Invalid capabilities in " + 
                               capability_set_name + ": " + 
                               "proxy setting " + proxy_error;
              return false;
            }
            int socks_version = proxy[proxy_setting].asInt();
            if (socks_version < 0 || socks_version > 255) {
              *error_message = "Invalid capabilities in " +
                                capability_set_name + ": " +
                                "SOCKS version must be between 0 and 255.";
              return false;
            }
            continue;
          }

          *error_message = "Invalid capabilities in " + 
                           capability_set_name + ": " + 
                           "unknown proxy setting named " + proxy_error;
          return false;
        }
      }
      continue;
    }

    if (capability_name == IE_DRIVER_EXTENSIONS_CAPABILITY) {
      LOG(DEBUG) << "Found " << IE_DRIVER_EXTENSIONS_CAPABILITY << " capability."
                 << " Validating value type is object.";
      if (!this->ValidateCapabilityType(capabilities,
                                        capability_name,
                                        Json::ValueType::objectValue,
                                        &capability_error_message)) {
        *error_message = "Invalid capabilities in " + 
                         capability_set_name + ": " +
                         capability_error_message;
        return false;
      }
      continue;
    }

    if (capability_name.find(":") != std::string::npos) {
      LOG(DEBUG) << "Found extension capability named " << capability_name << "."
                 << " Nothing further to validate.";
      continue;
    }

    *error_message = "Invalid capabilities in " + capability_set_name + ": " +
                     "unknown capability named " + capability_name;
    return false;
  }

  return true;
}

bool NewSessionCommandHandler::ValidateCapabilityType(
    const Json::Value& capabilities,
    const std::string& capability_name, 
    const Json::ValueType& expected_capability_type, 
    std::string* error_message) {
  Json::Value capability_value = capabilities[capability_name];
  if (!this->IsEquivalentType(capability_value.type(),
                              expected_capability_type)) {
    *error_message = capability_name + " is type " +
                     this->GetJsonTypeDescription(capability_value.type()) +
                     " instead of " +
                     this->GetJsonTypeDescription(expected_capability_type);
    return false;
  }
  return true;
}

} // namespace webdriver
