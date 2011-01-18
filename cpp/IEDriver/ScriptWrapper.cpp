#include "StdAfx.h"
#include "ScriptWrapper.h"
#include "BrowserManager.h"

namespace webdriver {

ScriptWrapper::ScriptWrapper(std::wstring script, unsigned long argument_count) {
	this->script_ = script;
	this->argument_count_ = argument_count;
	this->current_arg_index_ = 0;

	SAFEARRAYBOUND argument_bounds;
	argument_bounds.lLbound = 0;
	argument_bounds.cElements = this->argument_count_;

	this->argument_array_ = ::SafeArrayCreate(VT_VARIANT, 1, &argument_bounds);

	::VariantInit(&this->result_);
}

ScriptWrapper::~ScriptWrapper(void) {
	::SafeArrayDestroy(this->argument_array_);
}

void ScriptWrapper::AddArgument(std::wstring argument) {
	CComVariant dest_argument(argument.c_str());
	this->AddArgument(dest_argument);
}

void ScriptWrapper::AddArgument(int argument) {
	CComVariant dest_argument((long)argument);
	this->AddArgument(dest_argument);
}

void ScriptWrapper::AddArgument(double argument) {
	CComVariant dest_argument(argument);
	this->AddArgument(dest_argument);
}

void ScriptWrapper::AddArgument(bool argument) {
	CComVariant dest_argument(argument);
	this->AddArgument(dest_argument);
}

void ScriptWrapper::AddArgument(ElementWrapper *argument) {
	this->AddArgument(argument->element());
}

void ScriptWrapper::AddArgument(IHTMLElement *argument) {
	CComVariant dest_argument(argument);
	this->AddArgument(dest_argument);
}

void ScriptWrapper::AddArgument(VARIANT argument) {
	::SafeArrayPutElement(this->argument_array_, &this->current_arg_index_, &argument);
	++this->current_arg_index_;
}

bool ScriptWrapper::ResultIsString() {
	return this->result_.vt == VT_BSTR;
}

bool ScriptWrapper::ResultIsInteger() {
	return this->result_.vt == VT_I4 || this->result_.vt == VT_I8;
}

bool ScriptWrapper::ResultIsDouble() {
	return this->result_.vt == VT_R4 || this->result_.vt == VT_R8;
}

bool ScriptWrapper::ResultIsBoolean() {
	return this->result_.vt == VT_BOOL;
}

bool ScriptWrapper::ResultIsEmpty() {
	return this->result_.vt == VT_EMPTY;
}

bool ScriptWrapper::ResultIsIDispatch() {
	return this->result_.vt == VT_DISPATCH;
}

bool ScriptWrapper::ResultIsElementCollection() {
	if (this->result_.vt == VT_DISPATCH) {
		CComQIPtr<IHTMLElementCollection> is_collection(this->result_.pdispVal);
		if (is_collection) {
			return true;
		}
	}
	return false;
}

bool ScriptWrapper::ResultIsElement() {
	if (this->result_.vt == VT_DISPATCH) {
		CComQIPtr<IHTMLElement> is_element(this->result_.pdispVal);
		if (is_element) {
			return true;
		}
	}
	return false;
}

bool ScriptWrapper::ResultIsArray() {
	if (this->result_.vt == VT_DISPATCH) {
		CComPtr<ITypeInfo> typeinfo;
		HRESULT get_type_info_result = this->result_.pdispVal->GetTypeInfo(0, LOCALE_USER_DEFAULT, &typeinfo);
		TYPEATTR* type_attr;
		CComBSTR name;
		if (SUCCEEDED(get_type_info_result) && SUCCEEDED(typeinfo->GetTypeAttr(&type_attr))
			&& SUCCEEDED(typeinfo->GetDocumentation(-1, &name, 0, 0, 0))) {
			// If the name is JScriptTypeInfo then *assume* this is a Javascript array.
			// Note that Javascript can return functions which will have the same
			// type - the only way to be sure is to run some more Javascript code to
			// see if this object has a length attribute. This does not seem necessary
			// now.
			// (For future reference, GUID is {C59C6B12-F6C1-11CF-8835-00A0C911E8B2})
			//
			// If the name is DispStaticNodeList, we can be pretty sure it's an array
			// (or at least has array semantics). It is unclear to what extent checking
			// for DispStaticNodeList is supported behaviour.
			typeinfo->ReleaseTypeAttr(type_attr);
			if (name == L"JScriptTypeInfo" || name == L"DispStaticNodeList") {
				return true;
			}
		}
	}
	return false;
}

int ScriptWrapper::ConvertResultToJsonValue(BrowserManager *manager, Json::Value *value) {
	int status_code = SUCCESS;
	if (this->ResultIsString()) { 
		std::string string_value;
		string_value = CW2A(this->result_.bstrVal, CP_UTF8);
		*value = string_value;
	} else if (this->ResultIsInteger()) {
		*value = this->result_.lVal;
	} else if (this->ResultIsDouble()) {
		*value = this->result_.dblVal;
	} else if (this->ResultIsBoolean()) {
		*value = this->result_.boolVal == VARIANT_TRUE;
	} else if (this->ResultIsEmpty()) {
		*value = Json::Value::null;
	} else if (this->ResultIsIDispatch()) {
		if (this->ResultIsArray() || this->ResultIsElementCollection()) {
			BrowserWrapper *browser_wrapper;
			manager->GetCurrentBrowser(&browser_wrapper);
			Json::Value result_array(Json::arrayValue);

			long length = 0;
			this->GetArrayLength(browser_wrapper, &length);

			for (long i = 0; i < length; ++i) {
				Json::Value array_item_result;
				int array_item_status = this->GetArrayItem(browser_wrapper, manager, i, &array_item_result);
				result_array[i] = array_item_result;
			}
			*value = result_array;
		} else {
			IHTMLElement *node = (IHTMLElement*) this->result_.pdispVal;
			ElementWrapper *element_wrapper;
			manager->AddManagedElement(node, &element_wrapper);
			*value = element_wrapper->ConvertToJson();
		}
	} else {
		status_code = EUNKNOWNSCRIPTRESULT;
	}
	return status_code;
}

int ScriptWrapper::GetArrayLength(BrowserWrapper *browser_wrapper, long *length) {
	// Prepare an array for the Javascript execution, containing only one
	// element - the original returned array from a JS execution.
	std::wstring get_length_script(L"(function(){return function() {return arguments[0].length;}})();");
	ScriptWrapper *get_length_script_wrapper = new ScriptWrapper(get_length_script, 1);
	get_length_script_wrapper->AddArgument(this->result_);
	int length_result = browser_wrapper->ExecuteScript(get_length_script_wrapper);

	if (length_result != SUCCESS) {
		return length_result;
	}

	// Expect the return type to be an integer. A non-integer means this was
	// not an array after all.
	if (!get_length_script_wrapper->ResultIsInteger()) {
		return EUNEXPECTEDJSERROR;
	}

	*length = get_length_script_wrapper->result().lVal;
	delete get_length_script_wrapper;
	return SUCCESS;
}

int ScriptWrapper::GetArrayItem(BrowserWrapper *browser_wrapper, BrowserManager *manager, long index, Json::Value *item){
	std::wstring get_array_item_script(L"(function(){return function() {return arguments[0][arguments[1]];}})();"); 
	ScriptWrapper *get_array_item_script_wrapper = new ScriptWrapper(get_array_item_script, 2);
	get_array_item_script_wrapper->AddArgument(this->result_);
	get_array_item_script_wrapper->AddArgument(index);
	int get_item_result = browser_wrapper->ExecuteScript(get_array_item_script_wrapper);
	if (get_item_result != SUCCESS) {
		return get_item_result;
	}

	Json::Value array_item_result;
	int array_item_status = get_array_item_script_wrapper->ConvertResultToJsonValue(manager, item);
	delete get_array_item_script_wrapper;
	return SUCCESS;
}

} // namespace webdriver