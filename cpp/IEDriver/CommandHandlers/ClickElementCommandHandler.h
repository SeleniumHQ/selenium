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

#ifndef WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "logging.h"

namespace webdriver {

class ClickElementCommandHandler : public IECommandHandler {
public:
	ClickElementCommandHandler(void) {
	}

	virtual ~ClickElementCommandHandler(void) {
	}

protected:
	void ClickElementCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			int status_code = SUCCESS;
			std::wstring element_id = CA2W(id_parameter_iterator->second.c_str(), CP_UTF8);

			BrowserHandle browser_wrapper;
			status_code = executor.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(executor, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				if (element_wrapper->IsOption()) {
					this->SimulateOptionElementClick(element_wrapper, response);
					return;
				} else {
					status_code = element_wrapper->Click();
					browser_wrapper->set_wait_required(true);
					if (status_code != SUCCESS) {
						response->SetErrorResponse(status_code, "Cannot click on element");
						return;
					}
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}

			response->SetSuccessResponse(Json::Value::null);
		}
	}

private:
	void SimulateOptionElementClick(ElementHandle element_wrapper, Response* response) {
		// This is a simulated click. There may be issues if there are things like
		// alert() messages in certain events. A potential way to handle these
		// problems is to marshal the select element onto a separate thread and
		// perform the operation there.
		bool currently_selected = element_wrapper->IsSelected();
		CComQIPtr<IHTMLOptionElement> option(element_wrapper->element());

		CComPtr<IHTMLElement> parent_element;
		HRESULT hr = element_wrapper->element()->get_parentElement(&parent_element);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot get parent element";
			response->SetErrorResponse(ENOSUCHELEMENT, "cannot get parent element");
			return;
		}

		CComQIPtr<IHTMLSelectElement> select(parent_element);
		if (!select) {
			LOG(WARN) << "Parent element is not a select element";
			response->SetErrorResponse(ENOSUCHELEMENT, "Parent element is not a select element");
			return;
		}

		VARIANT_BOOL multiple;
		hr = select->get_multiple(&multiple);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot determine if parent element supports multiple selection";
			response->SetErrorResponse(ENOSUCHELEMENT, "Cannot determine if parent element supports multiple selection");
			return;
		}

		bool parent_is_multiple = multiple == VARIANT_TRUE;
		if (parent_is_multiple || (!parent_is_multiple && !currently_selected)) {
			if (currently_selected) {
				hr = option->put_selected(VARIANT_FALSE);
			} else {
				hr = option->put_selected(VARIANT_TRUE);
			}

			if (FAILED(hr)) {
				LOGHR(WARN, hr) << "Failed to set selection";
				response->SetErrorResponse(EEXPECTEDERROR, "Failed to set selection");
				return;
			}

			// Looks like we'll need to fire the event on the select element and not the option. 
			// Assume for now that the parent node is a select. Which is dumb.
			CComQIPtr<IHTMLDOMNode> parent(parent_element);
			if (!parent) {
				LOG(WARN) << "Parent element is not a DOM node";
				response->SetErrorResponse(ENOSUCHELEMENT, "Parent element is not a DOM node");
				return;
			}
			element_wrapper->FireEvent(parent, L"onchange");
		}
		response->SetSuccessResponse(Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
