#ifndef WEBDRIVER_IE_CLEARELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLEARELEMENTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class ClearElementCommandHandler : public WebDriverCommandHandler {
public:
	ClearElementCommandHandler(void) {
	}

	virtual ~ClearElementCommandHandler(void) {
	}

protected:
	void ClearElementCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring text(L"");
			int status_code = SUCCESS;
			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}
			HWND window_handle = browser_wrapper->GetWindowHandle();

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS)
			{
				CComQIPtr<IHTMLElement2> element2(element_wrapper->element());
				if (!element2) {
					response->SetErrorResponse(EUNHANDLEDERROR, "Cannot cast element to IHTMLElement2");
					return;
				} else {
					// TODO: Check HRESULT values for errors.
					HRESULT hr = S_OK;
					CComQIPtr<IHTMLTextAreaElement> text_area(element_wrapper->element());
					CComQIPtr<IHTMLInputElement> input_element(element_wrapper->element());
					CComBSTR v;
					if (text_area) {
						hr = text_area->get_value(&v);
					}
					if (input_element) {
						hr = input_element->get_value(&v);
					}
					bool fire_change = v.Length() > 0;

					hr = element2->focus();

					CComBSTR empty_value(L"");
					if (text_area) hr = text_area->put_value(empty_value);
					if (input_element) hr = input_element->put_value(empty_value);
					
					if (fire_change) {
						CComQIPtr<IHTMLDOMNode> node(element_wrapper->element());
						element_wrapper->FireEvent(node, L"onchange");
					}

					hr = element2->blur();
					browser_wrapper->AttachToWindowInputQueue();

					LRESULT lr;
					::SendMessageTimeoutW(window_handle, WM_SETTEXT, 0, (LPARAM) L"", SMTO_ABORTIFHUNG, 3000, (PDWORD_PTR)&lr);
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}

			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLEARELEMENTCOMMANDHANDLER_H_
