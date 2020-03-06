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

#ifndef WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_

#include "../IECommandHandler.h"

namespace webdriver {

class NewSessionCommandHandler : public IECommandHandler {
 public:
  NewSessionCommandHandler(void);
  virtual ~NewSessionCommandHandler(void);

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const ParametersMap& command_parameters,
                       Response* response);

 private:
  Json::Value GetCapability(const Json::Value& capabilities,
                            const std::string& capability_name,
                            const Json::ValueType& expected_capability_type,
                            const Json::Value& default_value);

  bool IsEquivalentType(const Json::ValueType& actual_type,
                        const Json::ValueType& expected_type);

  std::string GetJsonTypeDescription(const Json::ValueType& type);

  std::string GetUnexpectedAlertBehaviorValue(const std::string& desired_value);

  std::string GetPageLoadStrategyValue(const std::string& desired_value);

  void SetBrowserFactorySettings(const IECommandExecutor& executor,
                                 const Json::Value& capabilities);
  void SetInputSettings(const IECommandExecutor& executor,
                        const Json::Value& capabilities);
  void SetTimeoutSettings(const IECommandExecutor& executor,
                          const Json::Value& capabilities);
  void SetProxySettings(const IECommandExecutor& executor,
                        const Json::Value& proxy_capability,
                        const bool use_per_process_proxy);

  Json::Value ProcessCapabilities(const IECommandExecutor& executor,
                                  const Json::Value& capabilities,
                                  std::string* error_message);

  Json::Value ValidateArguments(const Json::Value& capabilities,
                                std::string* error_message);

  bool ValidateCapabilities(const Json::Value& capabilities,
                            const std::string& capability_set_name,
                            std::string* error_message);
  bool ValidateCapabilityType(const Json::Value& capabilities,
                              const std::string& capability_name,
                              const Json::ValueType& expected_capability_type,
                              std::string* error_message);
  bool MergeCapabilities(const Json::Value& primary_capabilities,
                         const Json::Value& secondary_capabilities,
                         Json::Value* merged_capabilities,
                         std::string* error_message);
  bool MatchCapabilities(const IECommandExecutor& executor,
                         const Json::Value& merged_capabilities,
                         std::string* error_message);

  Json::Value CreateReturnedCapabilities(const IECommandExecutor& executor);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
