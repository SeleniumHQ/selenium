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

#include "response.h"
#include "errorcodes.h"
#include "logging.h"

namespace webdriver {

Response::Response(void) : status_code_(0), session_id_(""), value_(Json::Value::null) {
}

Response::Response(const std::string& session_id) {
  this->session_id_ = session_id;
  this->status_code_ = 0;
  this->value_ = Json::Value::null;
}

Response::~Response(void) {
}

void Response::Deserialize(const std::string& json) {
  LOG(TRACE) << "Entering Response::Deserialize";

  Json::Value response_object;
  Json::Reader reader;
  reader.parse(json, response_object);
  if (response_object["status"].isString()) {
    this->status_code_ = this->ConvertStatusToCode(response_object["status"].asString());
  } else {
    this->status_code_ = response_object["status"].asInt();
  }
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

void Response::SetNewSessionResponse(const std::string& new_session_id,
                                     const Json::Value& response_value) {
  LOG(TRACE) << "Entering Response::SetNewSessionResponse";
  this->session_id_ = new_session_id;
  this->SetResponse(0, response_value);
}

// TODO: This method will be rendered unnecessary once all implementations
// move to string status codes instead of integer status codes. This mapping
// is not entirely correct; it's merely intended as a stopgap.
int Response::ConvertStatusToCode(const std::string& status_string) {
  if (status_string == "success") {
    // Special case success to return early.
    return WD_SUCCESS;
  }

  if (status_string == "element not selectable") {
    return EELEMENTNOTSELECTED;
  }

  if (status_string == "element not visible") {
    return EELEMENTNOTDISPLAYED;
  }

  if (status_string == "invalid cookie domain") {
    return EINVALIDCOOKIEDOMAIN;
  }

  if (status_string == "invalid element coordinates") {
    return EINVALIDCOORDINATES;
  }

  if (status_string == "invalid element state") {
    return EELEMENTNOTENABLED;
  }

  if (status_string == "invalid selector") {
    return EINVALIDSELECTOR;
  }

  if (status_string == "javascript error") {
    return EUNEXPECTEDJSERROR;
  }

  if (status_string == "no such alert") {
    return ENOSUCHALERT;
  }

  if (status_string == "no such element") {
    return ENOSUCHELEMENT;
  }

  if (status_string == "no such frame") {
    return ENOSUCHFRAME;
  }

  if (status_string == "no such window") {
    return ENOSUCHWINDOW;
  }

  if (status_string == "script timeout") {
    return ESCRIPTTIMEOUT;
  }

  if (status_string == "stale element reference") {
    return EOBSOLETEELEMENT;
  }

  if (status_string == "timeout") {
    return ETIMEOUT;
  }

  if (status_string == "unable to set cookie") {
    return EUNABLETOSETCOOKIE;
  }

  if (status_string == "unexpected alert open") {
    return EUNEXPECTEDALERTOPEN;
  }

  if (status_string == "unknown command") {
    return ENOTIMPLEMENTED;
  }

  if (status_string == "unknown error") {
    return EUNHANDLEDERROR;
  }

  return EUNHANDLEDERROR;
}

}  // namespace webdriver
