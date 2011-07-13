// Copyright 2011 WebDriver committers
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
		this->colour_names_hex_code_map_[L"aqua"] = L"#00ffff";
		this->colour_names_hex_code_map_[L"black"] = L"#000000";
		this->colour_names_hex_code_map_[L"blue"] = L"#0000ff";
		this->colour_names_hex_code_map_[L"fuchsia"] = L"#ff00ff";
		this->colour_names_hex_code_map_[L"gray"] = L"#808080";
		this->colour_names_hex_code_map_[L"green"] = L"#008000";
		this->colour_names_hex_code_map_[L"lime"] = L"#00ff00";
		this->colour_names_hex_code_map_[L"maroon"] = L"#800000";
		this->colour_names_hex_code_map_[L"navy"] = L"#000080";
		this->colour_names_hex_code_map_[L"olive"] = L"#808000";
		this->colour_names_hex_code_map_[L"purple"] = L"#800080";
		this->colour_names_hex_code_map_[L"red"] = L"#ff0000";
		this->colour_names_hex_code_map_[L"silver"] = L"#c0c0c0";
		this->colour_names_hex_code_map_[L"teal"] = L"#008080";
		this->colour_names_hex_code_map_[L"white"] = L"#ffffff";
		this->colour_names_hex_code_map_[L"yellow"] = L"#ffff00";
	}

	virtual ~GetElementValueOfCssPropertyCommandHandler(void) {
	}

protected:
	void GetElementValueOfCssPropertyCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		LocatorMap::const_iterator property_name_parameter_iterator = locator_parameters.find("propertyName");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (property_name_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: propertyName");
			return;
		} else {
			std::wstring element_id = CA2W(id_parameter_iterator->second.c_str(), CP_UTF8);
			std::wstring name = CA2W(property_name_parameter_iterator->second.c_str(), CP_UTF8);

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
				script_source += atoms::GET_EFFECTIVE_STYLE;
				script_source += L")})();";

				CComPtr<IHTMLDocument2> doc;
				browser_wrapper->GetDocument(&doc);
				Script script_wrapper(doc, script_source, 2);
				script_wrapper.AddArgument(element_wrapper);
				script_wrapper.AddArgument(name);
				status_code = script_wrapper.Execute();

				CComVariant style_value_variant;
				if (status_code == SUCCESS) {
					HRESULT hr = ::VariantCopy(&style_value_variant, &script_wrapper.result());
				}

				if (status_code == SUCCESS) {
					std::wstring raw_value = this->ConvertVariantToWString(&style_value_variant);
					std::transform(raw_value.begin(), raw_value.end(), raw_value.begin(), tolower);
					std::wstring style_value = this->MangleColour(name, raw_value);
					std::string style_value_str = CW2A(style_value.c_str(), CP_UTF8);
					response->SetSuccessResponse(style_value_str);
					return;
				} else {
					response->SetErrorResponse(status_code, "Unable to get element style value");
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}

private:
	std::wstring MangleColour(const std::wstring& property_name, const std::wstring& to_mangle) {
		if (property_name.find(L"color") == std::wstring::npos) {
			return to_mangle;
		}

		std::map<std::wstring, std::wstring>::const_iterator it = this->colour_names_hex_code_map_.find(to_mangle);
		if (it != this->colour_names_hex_code_map_.end()) {
			return it->second;
		}

		return to_mangle;
	}

	std::map<std::wstring, std::wstring> colour_names_hex_code_map_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_
