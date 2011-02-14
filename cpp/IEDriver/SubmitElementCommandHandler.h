#ifndef WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_

#include "atoms.h"
#include "BrowserManager.h"

namespace webdriver {

class SubmitElementCommandHandler : public WebDriverCommandHandler {
public:
	SubmitElementCommandHandler(void) {
	}

	virtual ~SubmitElementCommandHandler(void) {
	}

protected:
	void SubmitElementCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				// Use native events if we can. If not, use the automation atom.
				bool handled_with_native_events(false);
				CComQIPtr<IHTMLInputElement> input(element_wrapper->element());
				if (input) {
					CComBSTR type_name;
					input->get_type(&type_name);

					std::wstring type((BSTR)type_name);

					if (_wcsicmp(L"submit", type.c_str()) == 0 || _wcsicmp(L"image", type.c_str()) == 0) {
						element_wrapper->Click();
						browser_wrapper->set_wait_required(true);
						handled_with_native_events = true;
					}
				}

				if (!handled_with_native_events) {
					// The atom is just the definition of an anonymous
					// function: "function() {...}"; Wrap it in another function so we can
					// invoke it with our arguments without polluting the current namespace.
					std::wstring script(L"(function() { return (");
					script += atoms::SUBMIT;
					script += L")})();";

					CComPtr<IHTMLDocument2> doc;
					browser_wrapper->GetDocument(&doc);
					ScriptWrapper *script_wrapper = new ScriptWrapper(doc, script, 1);
					script_wrapper->AddArgument(element_wrapper);
					int status_code = script_wrapper->Execute();
					delete script_wrapper;

					if (status_code != SUCCESS) {
						response->SetErrorResponse(status_code, "Error submitting when not using native events");
						return;
					}
				}
				response->SetResponse(SUCCESS, Json::Value::null);
				return;
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}

private:
	void SubmitElementCommandHandler::FindParentForm(IHTMLElement *element, IHTMLFormElement **form_element) {
		CComQIPtr<IHTMLElement> current(element);

		while (current) {
			CComQIPtr<IHTMLFormElement> form(current);
			if (form) {
				*form_element = form.Detach();
				return;
			}

			CComPtr<IHTMLElement> temp;
			current->get_parentElement(&temp);
			current = temp;
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_
