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

#include "command.h"
#include "command_types.h"
#include "logging.h"

namespace webdriver {

Command::Command() : command_type_(webdriver::CommandType::NoCommand),
                     session_id_("") {
}

Command::~Command() {
}

void Command::Deserialize(const std::string& json) {
  LOG(TRACE) << "Entering Command::Deserialize";

  // Clear the existing maps.
  this->command_parameters_.clear();

  LOG(DEBUG) << "Raw JSON command: " << json;

  Json::Value root;
  std::string parse_errors;
  std::stringstream json_stream;
  json_stream.str(json);
  bool successful_parse = Json::parseFromStream(Json::CharReaderBuilder(),
                                                json_stream,
                                                &root,
                                                &parse_errors);

  if (!successful_parse) {
    // report to the user the failure and their locations in the document.
    LOG(WARN) << "Failed to parse configuration due to "
              << parse_errors << std::endl
              << "JSON command: '" << json << "'";
  }

  this->command_type_ = root.get("name", webdriver::CommandType::NoCommand).asString();
  if (this->command_type_ != webdriver::CommandType::NoCommand) {
    Json::Value locator_parameter_object = root["locator"];
    Json::Value::iterator it = locator_parameter_object.begin();
    Json::Value::iterator end = locator_parameter_object.end();
    for (; it != end; ++it) {
      std::string key = it.key().asString();
      std::string value = locator_parameter_object[key].asString();
      if (key == "sessionid") {
        this->session_id_ = value;
      } else {
        this->command_parameters_[key] = value;
      }
    }

    this->is_valid_parameters_ = true;
    Json::Value command_parameter_object = root["parameters"];
    if (!command_parameter_object.isObject()) {
      LOG(WARN) << "The value of the 'parameters' attribute is not a JSON "
                << "object. This is invalid for the WebDriver JSON Wire "
                << "Protocol.";
      this->is_valid_parameters_ = false;
    } else {
      it = command_parameter_object.begin();
      end = command_parameter_object.end();
      for (; it != end; ++it) {
        std::string key = it.key().asString();
        Json::Value value = command_parameter_object[key];
        this->command_parameters_[key] = value;
      }
    }
  } else {
    LOG(DEBUG) << "Command type is zero, no 'name' attribute in JSON object";
  }
}

std::string Command::Serialize() {
  LOG(TRACE) << "Entering Command::Serialize";
  Json::Value json_object;
  json_object["name"] = this->command_type_;
  if (this->session_id_.length() == 0) {
    json_object["sessionId"] = Json::nullValue;
  } else {
    json_object["sessionId"] = this->session_id_;
  }
  Json::Value parameters_object(Json::objectValue);
  ParametersMap::const_iterator it = this->command_parameters_.begin();
  ParametersMap::const_iterator end = this->command_parameters_.end();
  for (; it != end; ++it) {
    parameters_object[it->first] = it->second;
  }
  json_object["parameters"] = parameters_object;
  Json::StreamWriterBuilder writer;
  std::string output(Json::writeString(writer, json_object));
  return output;
}

void Command::Copy(const Command& source) {
  this->command_type_ = source.command_type_;
  this->command_parameters_ = source.command_parameters_;
  this->is_valid_parameters_ = source.is_valid_parameters_;
  this->session_id_ = source.session_id_;
}

void Command::Reset() {
  this->command_type_ = CommandType::NoCommand;
  this->session_id_ = "";
  this->command_parameters_.clear();
  this->is_valid_parameters_ = false;
}

}  // namespace webdriver
