#include "StdAfx.h"
#include "ScriptWrapper.h"

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
			typeinfo->ReleaseTypeAttr(type_attr);
			if (name == L"JScriptTypeInfo") {
				return true;
			}
		}
	}
	return false;
}

} // namespace webdriver