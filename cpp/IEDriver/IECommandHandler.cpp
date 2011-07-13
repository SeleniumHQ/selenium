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

#include "command_handler.h"
#include "IECommandHandler.h"
#include "IECommandExecutor.h"

namespace webdriver {

IECommandHandler::IECommandHandler() {
}

IECommandHandler::~IECommandHandler() {
}

void IECommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response* response) {
	response->SetErrorResponse(501, "Command not implemented");
}

int IECommandHandler::GetElement(const IECommandExecutor& executor, const std::wstring& element_id, ElementHandle* element_wrapper) {
	int status_code = EOBSOLETEELEMENT;
	ElementHandle candidate_wrapper;
	int result = executor.GetManagedElement(element_id, &candidate_wrapper);
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
			IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
			mutable_executor.RemoveManagedElement(element_id);
		}
	}

	return status_code;
}

std::wstring IECommandHandler::ConvertVariantToWString(VARIANT* to_convert) {
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