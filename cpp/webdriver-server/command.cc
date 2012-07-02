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

#include "command.h"
#include "logging.h"

namespace webdriver {

Command::Command() : command_type_(0) {
}

Command::~Command() {
}

void Command::Populate(const std::string& json_command) {
  LOG(TRACE) << "Entering Command::Populate";

  // Clear the existing maps.
  this->command_parameters_.clear();
  this->locator_parameters_.clear();

  LOG(DEBUG) << "Raw JSON command: " << json_command;

  Json::Value root;
  Json::Reader reader;
  bool successful_parse = reader.parse(json_command, root);
  if (!successful_parse) {
    // report to the user the failure and their locations in the document.
    LOG(WARN) << "Failed to parse configuration due "
              << reader.getFormatedErrorMessages() << std::endl
              << "JSON command: '" << json_command << "'";
  }

  this->command_type_ = root.get("command", 0).asInt();
  if (this->command_type_ != 0) {
    Json::Value locator_parameter_object = root["locator"];
    Json::Value::iterator it = locator_parameter_object.begin();
    Json::Value::iterator end = locator_parameter_object.end();
    for (; it != end; ++it) {
      std::string key = it.key().asString();
      std::string value = locator_parameter_object[key].asString();
      this->locator_parameters_[key] = value;
    }

    Json::Value command_parameter_object = root["parameters"];
    it = command_parameter_object.begin();
    end = command_parameter_object.end();
    for (; it != end; ++it) {
      std::string key = it.key().asString();
      Json::Value value = command_parameter_object[key];
      this->command_parameters_[key] = value;
    }
  } else {
    LOG(DEBUG) << "Command type is zero, no 'command' attribute in JSON object";
  }
}

}  // namespace webdriver
