#ifndef WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetElementLocationCommandHandler : public WebDriverCommandHandler {
public:
	GetElementLocationCommandHandler(void) {
	}

	virtual ~GetElementLocationCommandHandler(void) {
	}

protected:
	void GetElementLocationCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
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
			//HWND window_handle = browser_wrapper->GetWindowHandle();

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				CComQIPtr<IHTMLElement2> element2(element_wrapper->element());
				if (!element2) {
					response->SetErrorResponse(EUNHANDLEDERROR, "Unable to unwrap element");
					return;
				}

				// TODO: Check HRESULT return codes for errors.
				CComPtr<IHTMLRect> rect;
				element2->getBoundingClientRect(&rect);

				long x, y;
				rect->get_left(&x);
				rect->get_top(&y);

				CComQIPtr<IHTMLDOMNode2> node(element2);
				CComPtr<IDispatch> owner_document_dispatch;
				node->get_ownerDocument(&owner_document_dispatch);
				CComQIPtr<IHTMLDocument3> owner_doc(owner_document_dispatch);

				CComPtr<IHTMLElement> temp_doc;
				owner_doc->get_documentElement(&temp_doc);

				CComQIPtr<IHTMLElement2> document_element(temp_doc);
				long left = 0, top = 0;
				document_element->get_scrollLeft(&left);
				document_element->get_scrollTop(&top);

				x += left;
				y += top;

				Json::Value response_value;
				response_value["x"] = x;
				response_value["y"] = y;
				response->SetResponse(SUCCESS, response_value);
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
