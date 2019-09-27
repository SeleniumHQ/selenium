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

// Defines a response for use in the JSON Wire Protocol. The protocol is
// defined at http://code.google.com/p/selenium/wiki/JsonWireProtocol.

#ifndef WEBDRIVER_SERVER_RESPONSE_H_
#define WEBDRIVER_SERVER_RESPONSE_H_

#include <string>
#include "json.h"

namespace webdriver {

class Response {
 public:
  Response(void);
  virtual ~Response(void);
  std::string Serialize(void);
  void Deserialize(const std::string& json);

  Json::Value value(void) const { return this->value_; }

  std::string error(void) const { return this->error_; }

  Json::Value additional_data(void) const { return this->additional_data_; }

  int GetHttpResponseCode(void);
  std::string GetSessionId(void);
  void SetResponse(const std::string& error, const Json::Value& response_value);
  void SetSuccessResponse(const Json::Value& response_value);
  void SetErrorResponse(const int error_code, const std::string& message);
  void SetErrorResponse(const std::string& error, const std::string& message);
  void AddAdditionalData(const std::string& data_name, const std::string& data_value);

 private:
  std::string ConvertErrorCode(const int error_code);
  int ConvertStatusToCode(const std::string& status_string);

  // The error of the response, if any.
  std::string error_;
  // A JSON object that represents the value of the response.
  Json::Value value_;
  Json::Value additional_data_;

  DISALLOW_COPY_AND_ASSIGN(Response);
};

}  // namespace webdriver

#endif  // WEBDRIVER_SERVER_RESPONSE_H_
