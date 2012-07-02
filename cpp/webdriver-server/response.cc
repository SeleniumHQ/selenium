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

#include "response.h"
#include "logging.h"

namespace webdriver {

Response::Response(void) : status_code_(0), session_id_("") {
}

Response::Response(const std::string& session_id) {
  this->session_id_ = session_id;
  this->status_code_ = 0;
}

Response::~Response(void) {
}

void Response::Deserialize(const std::string& json) {
  LOG(TRACE) << "Entering Response::Deserialize";

  Json::Value response_object;
  Json::Reader reader;
  reader.parse(json, response_object);
  this->status_code_ = response_object["status"].asInt();
  this->session_id_ = response_object["sessionId"].asString();
  this->value_ = response_object["value"];
}

std::string Response::Serialize(void) {
  LOG(TRACE) << "Entering Response::Serialize";

  Json::Value json_object;
  json_object["status"] = this->status_code_;
  json_object["sessionId"] = this->session_id_;
  json_object["value"] = this->value_;
  Json::FastWriter writer;
  std::string output(writer.write(json_object));
  return output;
}

void Response::SetSuccessResponse(const Json::Value& response_value) {
  LOG(TRACE) << "Entering Response::SetSuccessResponse";
  this->SetResponse(0, response_value);
}

void Response::SetResponse(const int status_code,
                           const Json::Value& response_value) {
  LOG(TRACE) << "Entering Response::SetResponse";
  this->status_code_ = status_code;
  this->value_ = response_value;
}

void Response::SetErrorResponse(const int status_code,
                                const std::string& message) {
  LOG(TRACE) << "Entering Response::SetErrorResponse";
  LOG(WARN) << "Error response has status code " << status_code << " and message '" << message << "' message";
  this->status_code_ = status_code;
  this->value_["message"] = message;
}

}  // namespace webdriver
