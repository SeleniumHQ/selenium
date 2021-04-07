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

Response::Response(void) : error_(""), value_(Json::Value::null), additional_data_(Json::Value::null) {
}

Response::~Response(void) {
}

void Response::Deserialize(const std::string& json) {
  LOG(TRACE) << "Entering Response::Deserialize";

  Json::Value response_object;
  std::string parse_errors;
  std::stringstream json_stream;
  json_stream.str(json);
  Json::parseFromStream(Json::CharReaderBuilder(),
                        json_stream,
                        &response_object,
                        &parse_errors);

  Json::Value value_object;
  if (response_object.isMember("value")) {
    value_object = response_object["value"];
    if (value_object.isObject() && value_object.isMember("error")) {
      this->error_ = value_object["error"].asString();
      this->value_ = value_object["message"].asString();
      if (value_object.isMember("data")) {
        this->additional_data_ = value_object["data"];
      }
    } else {
      this->error_ = "";
      this->value_ = value_object;
    }
  } else {
    this->value_ = Json::Value::null;
  }
}

std::string Response::Serialize(void) {
  LOG(TRACE) << "Entering Response::Serialize";

  Json::Value json_object;
  if (this->error_.size() > 0) {
    Json::Value error_object;
    error_object["error"] = this->error_;
    error_object["message"] = this->value_.asString();
    error_object["stacktrace"] = "";
    if (!this->value_.isNull() && !this->additional_data_.isNull()) {
      error_object["data"] = this->additional_data_;
    }
    json_object["value"] = error_object;
  } else {
    json_object["value"] = this->value_;
  }
  Json::StreamWriterBuilder writer;
  std::string output(Json::writeString(writer, json_object));
  return output;
}

void Response::SetSuccessResponse(const Json::Value& response_value) {
  LOG(TRACE) << "Entering Response::SetSuccessResponse";
  this->SetResponse("", response_value);
}

void Response::SetResponse(const std::string& error,
                          const Json::Value& response_value) {
  LOG(TRACE) << "Entering Response::SetResponse";
  this->error_ = error;
  this->value_ = response_value;
}

void Response::SetErrorResponse(const std::string& error,
                                const std::string& message) {
  LOG(TRACE) << "Entering Response::SetErrorResponse";
  this->SetResponse(error, message);
}

void Response::SetErrorResponse(const int status_code,
                                const std::string& message) {
  LOG(TRACE) << "Entering Response::SetErrorResponse";
  LOG(WARN) << "Error response has status code " << status_code << " and message '" << message << "' message";
  this->SetErrorResponse(ConvertErrorCode(status_code), message);
}

void Response::AddAdditionalData(const std::string& data_name,
                                 const std::string& data_value) {
  LOG(TRACE) << "Entering Response::AddAdditionalData";
  if (this->additional_data_.isNull()) {
    Json::Value new_data;
    this->additional_data_ = new_data;
  }
  this->additional_data_[data_name] = data_value;
}

std::string Response::GetSessionId(void) {
  if (this->error_.size() == 0) {
    return this->value_.get("sessionId", "").asString();
  }
  return "";
}

int Response::GetHttpResponseCode(void) {
  int response_code = 200;
  if (this->error_ == ERROR_ELEMENT_CLICK_INTERCEPTED ||
      this->error_ == ERROR_ELEMENT_NOT_SELECTABLE ||
      this->error_ == ERROR_ELEMENT_NOT_INTERACTABLE ||
      this->error_ == ERROR_INSECURE_CERTIFICATE ||
      this->error_ == ERROR_INVALID_ARGUMENT ||
      this->error_ == ERROR_INVALID_COOKIE_DOMAIN ||
      this->error_ == ERROR_INVALID_COORDINATES ||
      this->error_ == ERROR_INVALID_ELEMENT_STATE ||
      this->error_ == ERROR_INVALID_SELECTOR) {
    response_code = 400;
  } else if (this->error_ == ERROR_INVALID_SESSION_ID ||
             this->error_ == ERROR_NO_SUCH_COOKIE ||
             this->error_ == ERROR_NO_SUCH_ALERT ||
             this->error_ == ERROR_NO_SUCH_ELEMENT ||
             this->error_ == ERROR_NO_SUCH_FRAME ||
             this->error_ == ERROR_NO_SUCH_WINDOW ||
             this->error_ == ERROR_STALE_ELEMENT_REFERENCE ||
             this->error_ == ERROR_UNKNOWN_COMMAND) {
    response_code = 404;
  } else if (this->error_ == ERROR_UNKNOWN_METHOD) {
    response_code = 405;
  } else if (this->error_ == ERROR_JAVASCRIPT_ERROR ||
             this->error_ == ERROR_MOVE_TARGET_OUT_OF_BOUNDS ||
             this->error_ == ERROR_SCRIPT_TIMEOUT ||
             this->error_ == ERROR_SESSION_NOT_CREATED ||
             this->error_ == ERROR_UNABLE_TO_SET_COOKIE ||
             this->error_ == ERROR_UNABLE_TO_CAPTURE_SCREEN ||
             this->error_ == ERROR_UNEXPECTED_ALERT_OPEN ||
             this->error_ == ERROR_UNKNOWN_ERROR ||
             this->error_ == ERROR_UNSUPPORTED_OPERATION ||
             this->error_ == ERROR_WEBDRIVER_TIMEOUT) {
    response_code = 500;
  } else {
    response_code = 200;
  }

  return response_code;
}

std::string Response::ConvertErrorCode(const int error_code) {
  if (error_code == WD_SUCCESS) {
    return "";
  } else if (error_code == ENOSUCHFRAME) {
    return ERROR_NO_SUCH_FRAME;
  } else if (error_code == ENOSUCHWINDOW) {
    return ERROR_NO_SUCH_WINDOW;
  } else if (error_code == EOBSOLETEELEMENT) {
    return ERROR_STALE_ELEMENT_REFERENCE;
  } else if (error_code == EINVALIDSELECTOR) {
    return ERROR_INVALID_SELECTOR;
  } else if (error_code == ENOSUCHALERT) {
    return ERROR_NO_SUCH_ALERT;
  } else if (error_code == EUNEXPECTEDALERTOPEN) {
    return ERROR_UNEXPECTED_ALERT_OPEN;
  } else if (error_code == ENOSUCHCOOKIE) {
    return ERROR_NO_SUCH_COOKIE;
  } else if (error_code == EELEMENTNOTENABLED) {
    return ERROR_INVALID_ELEMENT_STATE;
  } else if (error_code == EELEMENTNOTDISPLAYED) {
    return ERROR_ELEMENT_NOT_INTERACTABLE;
  } else if (error_code == EUNEXPECTEDJSERROR) {
    return ERROR_JAVASCRIPT_ERROR;
  } else if (error_code == EINVALIDCOOKIEDOMAIN) {
    return ERROR_INVALID_COOKIE_DOMAIN;
  } else if (error_code == ESCRIPTTIMEOUT) {
    return ERROR_SCRIPT_TIMEOUT;
  } else if (error_code == EMOVETARGETOUTOFBOUNDS) {
    return ERROR_MOVE_TARGET_OUT_OF_BOUNDS;
  } else if (error_code == EINVALIDARGUMENT) {
    return ERROR_INVALID_ARGUMENT;
  } else if (error_code == ENOSUCHELEMENT) {
    return ERROR_NO_SUCH_ELEMENT;
  } else if (error_code == EUNSUPPORTEDOPERATION) {
    return ERROR_UNSUPPORTED_OPERATION;
  }

  return "";
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

  if (status_string == "unsupported operation") {
    return EUNSUPPORTEDOPERATION;
  }

  return EUNHANDLEDERROR;
}

}  // namespace webdriver
