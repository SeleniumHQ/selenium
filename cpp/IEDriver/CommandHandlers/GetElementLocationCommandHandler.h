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
#ifndef WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "../Generated/atoms.h"

namespace webdriver {

class GetElementLocationCommandHandler : public IECommandHandler {
public:
	GetElementLocationCommandHandler(void) {
	}

	virtual ~GetElementLocationCommandHandler(void) {
	}

protected:
	void GetElementLocationCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::string element_id = id_parameter_iterator->second;

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
				script_source += atoms::asString(atoms::GET_LOCATION);
				script_source += L")})();";

				CComPtr<IHTMLDocument2> doc;
				browser_wrapper->GetDocument(&doc);

				Json::Value location_array;
				Script script_wrapper(doc, script_source, 1);
				script_wrapper.AddArgument(element_wrapper);
				status_code = script_wrapper.Execute();

				// TODO (JimEvans): Find a way to collapse this and the atom
				// call into a single JS function.
				std::wstring location_script = L"(function() { return function(){ return [arguments[0].x, arguments[0].y];};})();";
				Script location_script_wrapper(doc, location_script, 1);
				location_script_wrapper.AddArgument(script_wrapper.result());
				status_code = location_script_wrapper.Execute();

				location_script_wrapper.ConvertResultToJsonValue(executor, &location_array);

				Json::UInt index = 0;
				Json::Value response_value;
				response_value["x"] = location_array[index];
				++index;
				response_value["y"] = location_array[index];
				response->SetSuccessResponse(response_value);
				return;
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_
