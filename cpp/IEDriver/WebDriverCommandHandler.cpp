#include "StdAfx.h"
#include "WebDriverCommandHandler.h"
#include "Session.h"

namespace webdriver {

WebDriverCommandHandler::WebDriverCommandHandler() {
}

WebDriverCommandHandler::~WebDriverCommandHandler() {
}

void WebDriverCommandHandler::Execute(const Session& session, const WebDriverCommand& command, WebDriverResponse* response) {
	this->ExecuteInternal(session, command.locator_parameters(), command.command_parameters(), response);
}

void WebDriverCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse* response) {
}

int WebDriverCommandHandler::GetElement(const Session& session, const std::wstring& element_id, ElementHandle* element_wrapper) {
	int status_code = EOBSOLETEELEMENT;
	ElementHandle candidate_wrapper;
	int result = session.GetManagedElement(element_id, &candidate_wrapper);
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
			Session& mutable_session = const_cast<Session&>(session);
			mutable_session.RemoveManagedElement(element_id);
		}
	}

	return status_code;
}

std::wstring WebDriverCommandHandler::ConvertVariantToWString(VARIANT* to_convert) {
	VARTYPE type = to_convert->vt;

	switch(type) {
		case VT_BOOL:
			return to_convert->boolVal == VARIANT_TRUE ? L"true" : L"false";

		case VT_BSTR:
			if (!to_convert->bstrVal) {
				return L"";
			}
			
			return to_convert->bstrVal;
	
		case VT_I4:
			{
				wchar_t* buffer = reinterpret_cast<wchar_t*>(malloc(sizeof(wchar_t) * MAX_DIGITS_OF_NUMBER));
				if (buffer != NULL) {
					_i64tow_s(to_convert->lVal, buffer, MAX_DIGITS_OF_NUMBER, BASE_TEN_BASE);
				}
				return buffer;
			}

		case VT_EMPTY:
			return L"";

		case VT_NULL:
			// TODO(shs96c): This should really return NULL.
			return L"";

		// This is lame
		case VT_DISPATCH:
			return L"";
	}
	return L"";
}

} // namespace webdriver