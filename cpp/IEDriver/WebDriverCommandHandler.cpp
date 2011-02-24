#include "StdAfx.h"
#include "WebDriverCommandHandler.h"
#include "BrowserManager.h"

namespace webdriver {

WebDriverCommandHandler::WebDriverCommandHandler() {
}

WebDriverCommandHandler::~WebDriverCommandHandler() {
}

void WebDriverCommandHandler::Execute(BrowserManager* manager, WebDriverCommand& command, WebDriverResponse* response) {
	this->ExecuteInternal(manager, command.locator_parameters(), command.command_parameters(), response);
}

void WebDriverCommandHandler::ExecuteInternal(BrowserManager* manager, std::map<std::string,std::string> locatorParameters, std::map<std::string, Json::Value> commandParameters, WebDriverResponse* response) {
}

int WebDriverCommandHandler::GetElement(BrowserManager* manager, std::wstring element_id, ElementWrapper** element_wrapper) {
	int status_code = EOBSOLETEELEMENT;
	ElementWrapper* candidate_wrapper;
	int result = manager->GetManagedElement(element_id, &candidate_wrapper);
	if (result != SUCCESS) {
		status_code = 404;
	} else {
		// Verify that the element is still valid by walking up the
		// DOM tree until we find no parent or the html tag
		CComPtr<IHTMLElement> parent(candidate_wrapper->element());
		while (parent) {
			CComQIPtr<IHTMLHtmlElement> html(parent);
			if (html) {
				status_code = SUCCESS;
				*element_wrapper = candidate_wrapper;
				break;
			}

			CComPtr<IHTMLElement> next;
			HRESULT hr = parent->get_parentElement(&next);
			if (FAILED(hr)) {
				//std::cout << hr << " [" << (_bstr_t(_com_error((DWORD) hr).ErrorMessage())) << "]";
			}

			if (next == NULL) {
				BSTR tag;
				parent->get_tagName(&tag);
				//std::cout << "Found null parent of element with tag " << _bstr_t(tag);
			}
			parent = next;
		}

		if (status_code != SUCCESS) {
			manager->RemoveManagedElement(element_id);
		}
	}

	return status_code;
}

} // namespace webdriver