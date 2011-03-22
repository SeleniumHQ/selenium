#include "StdAfx.h"
#include "WebDriverCommandHandler.h"
#include "Session.h"

namespace webdriver {

WebDriverCommandHandler::WebDriverCommandHandler() {
}

WebDriverCommandHandler::~WebDriverCommandHandler() {
}

void WebDriverCommandHandler::Execute(Session* session, const WebDriverCommand& command, WebDriverResponse* response) {
	this->ExecuteInternal(session, command.locator_parameters(), command.command_parameters(), response);
}

void WebDriverCommandHandler::ExecuteInternal(Session* session, const std::map<std::string,std::string>& locatorParameters, const std::map<std::string, Json::Value>& commandParameters, WebDriverResponse* response) {
}

int WebDriverCommandHandler::GetElement(Session* session, const std::wstring& element_id, std::tr1::shared_ptr<ElementWrapper>* element_wrapper) {
	int status_code = EOBSOLETEELEMENT;
	std::tr1::shared_ptr<ElementWrapper> candidate_wrapper;
	int result = session->GetManagedElement(element_id, &candidate_wrapper);
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
			session->RemoveManagedElement(element_id);
		}
	}

	return status_code;
}

} // namespace webdriver