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

#ifndef WEBDRIVER_IE_TOGGLEELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_TOGGLEELEMENTCOMMANDHANDLER_H_

#include "Session.h"
#include "logging.h"

namespace webdriver {

class ToggleElementCommandHandler : public CommandHandler {
public:
	ToggleElementCommandHandler(void) {
	}

	virtual ~ToggleElementCommandHandler(void) {
	}

protected:
	void ToggleElementCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id = CA2W(id_parameter_iterator->second.c_str(), CP_UTF8);

			BrowserHandle browser_wrapper;
			int status_code = session.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				// It only makes sense to toggle check boxes or options in a multi-select
				CComBSTR tag_name;
				HRESULT hr = element_wrapper->element()->get_tagName(&tag_name);
				if (FAILED(hr)) {
					LOGHR(WARN, hr) << "Unable to get tag name";
					response->SetErrorResponse(ENOSUCHELEMENT, "Unable to get tag name");
					return;
				}

				if ((tag_name != L"OPTION") && !element_wrapper->IsCheckBox())  {
					response->SetErrorResponse(EELEMENTNOTENABLED, "cannot toggle element that is not an option or check box");
					return;
				}

				status_code = element_wrapper->Click();
				browser_wrapper->set_wait_required(true);
				if (status_code == SUCCESS || status_code != EELEMENTNOTDISPLAYED) {
					if (status_code == SUCCESS) {
						response->SetResponse(SUCCESS, element_wrapper->IsSelected());
					} else {
						response->SetErrorResponse(status_code, "cannot toggle element");
					}
					return;
				} 

				if (tag_name == L"OPTION") {
					CComQIPtr<IHTMLOptionElement> option(element_wrapper->element());
					if (!option) {
						LOG(ERROR) << "Cannot convert an element to an option, even though the tag name is right";
						response->SetErrorResponse(ENOSUCHELEMENT, "Cannot convert an element to an option, even though the tag name is right");
						return;
					}

					VARIANT_BOOL selected;
					hr = option->get_selected(&selected);
					if (FAILED(hr)) {
						LOGHR(WARN, hr) << "Cannot tell whether or not the element is selected";
						response->SetErrorResponse(ENOSUCHELEMENT, "Cannot tell whether or not the element is selected");
						return;
					}

					if (selected == VARIANT_TRUE) {
						hr = option->put_selected(VARIANT_FALSE);
					} else {
						hr = option->put_selected(VARIANT_TRUE);
					}

					if (FAILED(hr)) {
						LOGHR(WARN, hr) << "Failed to set selection";
						response->SetErrorResponse(EEXPECTEDERROR, "Failed to set selection");
						return;
					}

					//Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
					CComQIPtr<IHTMLDOMNode> node(element_wrapper->element());
					if (!node) {
						LOG(WARN) << "Current element is not an DOM node";
						response->SetErrorResponse(ENOSUCHELEMENT, "Current element is not an DOM node");
						return;
					}
					CComPtr<IHTMLDOMNode> parent;
					hr = node->get_parentNode(&parent);
					if (FAILED(hr)) {
						LOGHR(WARN, hr) << "Cannot get parent node";
						response->SetErrorResponse(ENOSUCHELEMENT, "cannot get parent node");
						return;
					}

					element_wrapper->FireEvent(parent, L"onchange");
					response->SetResponse(SUCCESS, element_wrapper->IsSelected());
				} else {
					// Element is not an OPTION element, and it's not visible.
					response->SetErrorResponse(status_code, "cannot toggle invisible element");
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_TOGGLEELEMENTCOMMANDHANDLER_H_
