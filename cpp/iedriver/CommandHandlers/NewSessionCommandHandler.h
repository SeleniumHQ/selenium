// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
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

#ifndef WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_

#include "../Alert.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class NewSessionCommandHandler : public IECommandHandler {
 public:
  NewSessionCommandHandler(void) {
  }

  virtual ~NewSessionCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    std::string default_initial_url = "http://localhost:" + std::to_string(static_cast<long long>(executor.port())) + "/";
    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    ParametersMap::const_iterator it = command_parameters.find("desiredCapabilities");
    if (it != command_parameters.end()) {
      BrowserFactorySettings factory_settings;
      Json::Value ignore_protected_mode_settings = it->second.get(IGNORE_PROTECTED_MODE_CAPABILITY, false);
      factory_settings.ignore_protected_mode_settings = ignore_protected_mode_settings.asBool();
      Json::Value ignore_zoom_setting = it->second.get(IGNORE_ZOOM_SETTING_CAPABILITY, false);
      factory_settings.ignore_zoom_setting = ignore_zoom_setting.asBool();
      Json::Value browser_attach_timeout = it->second.get(BROWSER_ATTACH_TIMEOUT_CAPABILITY, 0);
      factory_settings.browser_attach_timeout = browser_attach_timeout.asInt();
      Json::Value initial_url = it->second.get(INITIAL_BROWSER_URL_CAPABILITY, default_initial_url);
      factory_settings.initial_browser_url = initial_url.asString();
      Json::Value force_create_process_api = it->second.get(FORCE_CREATE_PROCESS_API_CAPABILITY, false);
      factory_settings.force_create_process_api = force_create_process_api.asBool();
      Json::Value force_shell_windows_api = it->second.get(FORCE_SHELL_WINDOWS_API_CAPABILITY, false);
      factory_settings.force_shell_windows_api = force_shell_windows_api.asBool();
      Json::Value browser_command_line_switches = it->second.get(BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY, "");
      factory_settings.browser_command_line_switches = browser_command_line_switches.asString();
      Json::Value ensure_clean_session = it->second.get(ENSURE_CLEAN_SESSION_CAPABILITY, false);
      factory_settings.clear_cache_before_launch = ensure_clean_session.asBool();
      mutable_executor.browser_factory()->Initialize(factory_settings);

      Json::Value enable_native_events = it->second.get(NATIVE_EVENTS_CAPABILITY, true);
      mutable_executor.input_manager()->set_enable_native_events(enable_native_events.asBool());
      Json::Value scroll_behavior = it->second.get(ELEMENT_SCROLL_BEHAVIOR_CAPABILITY, 0);
      mutable_executor.input_manager()->set_scroll_behavior(static_cast<ELEMENT_SCROLL_BEHAVIOR>(scroll_behavior.asInt()));
      Json::Value require_window_focus = it->second.get(REQUIRE_WINDOW_FOCUS_CAPABILITY, false);
      mutable_executor.input_manager()->set_require_window_focus(require_window_focus.asBool());

      Json::Value unexpected_alert_behavior = it->second.get(UNEXPECTED_ALERT_BEHAVIOR_CAPABILITY, DISMISS_UNEXPECTED_ALERTS);
      mutable_executor.set_unexpected_alert_behavior(unexpected_alert_behavior.asString());
      Json::Value enable_element_cache_cleanup = it->second.get(ENABLE_ELEMENT_CACHE_CLEANUP_CAPABILITY, true);
      mutable_executor.set_enable_element_cache_cleanup(enable_element_cache_cleanup.asBool());
      Json::Value enable_persistent_hover = it->second.get(ENABLE_PERSISTENT_HOVER_CAPABILITY, true);
      if (require_window_focus.asBool() || !enable_native_events.asBool()) {
        // Setting "require_window_focus" implies SendInput() API, and does not therefore require
        // persistent hover. Likewise, not using native events requires no persistent hover either.
        mutable_executor.set_enable_persistent_hover(false);
      } else {
        mutable_executor.set_enable_persistent_hover(enable_persistent_hover.asBool());
      }
      ProxySettings proxy_settings = { false, "", "", "", "" };
      Json::Value proxy = it->second.get(PROXY_CAPABILITY, Json::nullValue);
      if (!proxy.isNull()) {
        std::string proxy_type = proxy.get("proxyType", "").asString();
        proxy_settings.proxy_type = proxy_type;
        std::string http_proxy = proxy.get("httpProxy", "").asString();
        proxy_settings.http_proxy = http_proxy;
        std::string ftp_proxy = proxy.get("ftpProxy", "").asString();
        proxy_settings.ftp_proxy = ftp_proxy;
        std::string ssl_proxy = proxy.get("sslProxy", "").asString();
        proxy_settings.ssl_proxy = ssl_proxy;
        std::string autoconfig_url = proxy.get("proxyAutoconfigUrl", "").asString();
        proxy_settings.proxy_autoconfig_url = autoconfig_url;
        Json::Value use_per_process_proxy = it->second.get(USE_PER_PROCESS_PROXY_CAPABILITY, false);
        proxy_settings.use_per_process_proxy = use_per_process_proxy.asBool();
      }
      mutable_executor.proxy_manager()->Initialize(proxy_settings);
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
    std::string id = executor.session_id();
    response->SetResponse(303, "/session/" + id);
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
