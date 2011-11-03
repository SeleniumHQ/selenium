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

#ifndef WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class GetElementValueOfCssPropertyCommandHandler : public IECommandHandler {
 public:
  GetElementValueOfCssPropertyCommandHandler(void) {
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

  virtual ~GetElementValueOfCssPropertyCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
    LocatorMap::const_iterator property_name_parameter_iterator = locator_parameters.find("propertyName");
    if (id_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: id");
      return;
    } else if (property_name_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400,
                                 "Missing parameter in URL: propertyName");
      return;
    } else {
      std::string element_id = id_parameter_iterator->second;
      std::string name = property_name_parameter_iterator->second;

      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }

      ElementHandle element_wrapper;
      status_code = this->GetElement(executor, element_id, &element_wrapper);
      if (status_code == SUCCESS) {
        // The atom is just the definition of an anonymous
        // function: "function() {...}"; Wrap it in another function so we can
        // invoke it with our arguments without polluting the current namespace.
        std::wstring script_source = L"(function() { return (";
        script_source += atoms::asString(atoms::GET_EFFECTIVE_STYLE);
        script_source += L")})();";

        CComPtr<IHTMLDocument2> doc;
        browser_wrapper->GetDocument(&doc);
        Script script_wrapper(doc, script_source, 2);
        script_wrapper.AddArgument(element_wrapper);
        script_wrapper.AddArgument(name);
        status_code = script_wrapper.Execute();

        if (status_code == SUCCESS) {
          std::string raw_value = "";
          script_wrapper.ConvertResultToString(&raw_value);
          std::transform(raw_value.begin(),
                         raw_value.end(),
                         raw_value.begin(),
                         tolower);
          std::string style_value = this->MangleColour(name, raw_value);
          response->SetSuccessResponse(style_value);
          return;
        } else {
          response->SetErrorResponse(status_code,
                                     "Unable to get element style value");
          return;
        }
      } else {
        response->SetErrorResponse(status_code, "Element is no longer valid");
        return;
      }
    }
  }

 private:
  std::string MangleColour(const std::string& property_name,
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

  std::map<std::string, std::string> colour_names_hex_code_map_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_
