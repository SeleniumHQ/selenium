#include "StdAfx.h"
#include "atoms.h"
#include "BrowserManager.h"

namespace webdriver {

ElementFinder::ElementFinder(std::wstring locator) {
	this->locator_ = locator;
}

ElementFinder::~ElementFinder(void) {
}

int ElementFinder::FindElement(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, Json::Value *found_element) {
	BrowserWrapper *browser;
	int status_code = manager->GetCurrentBrowser(&browser);
	if (status_code == SUCCESS) {
		std::wstring criteria_object_script = L"(function() { return function(){ return  { " + this->locator_ + L" : \"" + criteria + L"\" }; };})();";
		CComPtr<IHTMLDocument2> doc;
		browser->GetDocument(&doc);

		ScriptWrapper criteria_wrapper(doc, criteria_object_script, 0);
		status_code = criteria_wrapper.Execute();
		if (status_code == SUCCESS) {
			CComVariant criteria_object;
			::VariantCopy(&criteria_object, &criteria_wrapper.result());

			// The atom is just the definition of an anonymous
			// function: "function() {...}"; Wrap it in another function so we can
			// invoke it with our arguments without polluting the current namespace.
			std::wstring script(L"(function() { return (");
			script += atoms::FIND_ELEMENT;
			script += L")})();";

			ScriptWrapper script_wrapper(doc, script, 2);
			script_wrapper.AddArgument(criteria_object);
			if (parent_wrapper) {
				script_wrapper.AddArgument(parent_wrapper->element());
			}

			status_code = script_wrapper.Execute();
			if (status_code == SUCCESS && script_wrapper.ResultIsElement()) {
				script_wrapper.ConvertResultToJsonValue(manager, found_element);
			} else {
				status_code = ENOSUCHELEMENT;
			}
		} else {
			status_code = ENOSUCHELEMENT;
		}
	}
	return status_code;
}

int ElementFinder::FindElements(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, Json::Value *found_elements) {
	BrowserWrapper *browser;
	int status_code = manager->GetCurrentBrowser(&browser);
	if (status_code == SUCCESS) {
		std::wstring criteria_object_script = L"(function() { return function(){ return  { " + this->locator_ + L" : \"" + criteria + L"\" }; };})();";
		CComPtr<IHTMLDocument2> doc;
		browser->GetDocument(&doc);

		ScriptWrapper criteria_wrapper(doc, criteria_object_script, 0);
		status_code = criteria_wrapper.Execute();
		if (status_code == SUCCESS) {
			CComVariant criteria_object;
			::VariantCopy(&criteria_object, &criteria_wrapper.result());

			// The atom is just the definition of an anonymous
			// function: "function() {...}"; Wrap it in another function so we can
			// invoke it with our arguments without polluting the current namespace.
			std::wstring script(L"(function() { return (");
			script += atoms::FIND_ELEMENTS;
			script += L")})();";

			ScriptWrapper script_wrapper(doc, script, 2);
			script_wrapper.AddArgument(criteria_object);
			if (parent_wrapper) {
				script_wrapper.AddArgument(parent_wrapper->element());
			}

			status_code = script_wrapper.Execute();
			if (status_code == SUCCESS) {
				if (script_wrapper.ResultIsArray() || script_wrapper.ResultIsElementCollection()) {
					script_wrapper.ConvertResultToJsonValue(manager, found_elements);
				}
			}
		}
	}
	return status_code;
}

} // namespace webdriver