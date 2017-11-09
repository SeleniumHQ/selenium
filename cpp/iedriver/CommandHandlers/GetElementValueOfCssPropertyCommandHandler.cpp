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

#include "GetElementValueOfCssPropertyCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../IECommandExecutor.h"

namespace webdriver {

GetElementValueOfCssPropertyCommandHandler::GetElementValueOfCssPropertyCommandHandler(void) {
  this->colour_names_hex_code_map_["aqua"] = "#00ffff";
  this->colour_names_hex_code_map_["black"] = "#000000";
  this->colour_names_hex_code_map_["blue"] = "#0000ff";
  this->colour_names_hex_code_map_["fuchsia"] = "#ff00ff";
  this->colour_names_hex_code_map_["gray"] = "#808080";
  this->colour_names_hex_code_map_["green"] = "#008000";
  this->colour_names_hex_code_map_["lime"] = "#00ff00";
  this->colour_names_hex_code_map_["maroon"] = "#800000";
  this->colour_names_hex_code_map_["navy"] = "#000080";
  this->colour_names_hex_code_map_["olive"] = "#808000";
  this->colour_names_hex_code_map_["purple"] = "#800080";
  this->colour_names_hex_code_map_["red"] = "#ff0000";
  this->colour_names_hex_code_map_["silver"] = "#c0c0c0";
  this->colour_names_hex_code_map_["teal"] = "#008080";
  this->colour_names_hex_code_map_["white"] = "#ffffff";
  this->colour_names_hex_code_map_["yellow"] = "#ffff00";
}

GetElementValueOfCssPropertyCommandHandler::~GetElementValueOfCssPropertyCommandHandler(void) {
}

void GetElementValueOfCssPropertyCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  ParametersMap::const_iterator property_name_parameter_iterator = command_parameters.find("propertyName");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  } else if (property_name_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                               "Missing parameter in URL: propertyName");
    return;
  } else {
    std::string element_id = id_parameter_iterator->second.asString();
    std::string name = property_name_parameter_iterator->second.asString();

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Unable to get browser");
      return;
    }

    ElementHandle element_wrapper;
    status_code = this->GetElement(executor, element_id, &element_wrapper);
    if (status_code == WD_SUCCESS) {
      std::string raw_value = "";
      status_code = element_wrapper->GetCssPropertyValue(name, &raw_value);
      if (status_code == WD_SUCCESS) {
        std::string style_value = this->MangleColour(name, raw_value);
        response->SetSuccessResponse(style_value);
        return;
      } else {
        response->SetErrorResponse(status_code,
                                    "Unable to get element style value");
        return;
      }
    } else if (status_code == ENOSUCHELEMENT) {
      response->SetErrorResponse(ERROR_NO_SUCH_ELEMENT, "Invalid internal element ID requested: " + element_id);
      return;
    } else {
      response->SetErrorResponse(ERROR_STALE_ELEMENT_REFERENCE, "Element is no longer valid");
      return;
    }
  }
}

std::string GetElementValueOfCssPropertyCommandHandler::MangleColour(
    const std::string& property_name,
    const std::string& to_mangle) {
  if (property_name.find("color") == std::string::npos) {
    return to_mangle;
  }

  std::map<std::string, std::string>::const_iterator it = this->colour_names_hex_code_map_.find(to_mangle);
  if (it != this->colour_names_hex_code_map_.end()) {
    return it->second;
  }

  return to_mangle;
}

} // namespace webdriver
