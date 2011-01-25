#ifndef WEBDRIVER_IE_SCRIPTWRAPPER_H_
#define WEBDRIVER_IE_SCRIPTWRAPPER_H_

#include <string>
#include "json.h"

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class BrowserWrapper;
class ElementWrapper;
class BrowserManager;

class ScriptWrapper
{
public:
	ScriptWrapper(BrowserWrapper *browser, std::wstring script, unsigned long argument_count);
	~ScriptWrapper(void);

	std::wstring script() { return this->script_; }
	unsigned long argument_count() { return this->argument_count_; }
	SAFEARRAY* arguments() { return this->argument_array_; }
	VARIANT result() { return this->result_; }
	void set_result(VARIANT value) { ::VariantCopy(&this->result_, &value); }

	void AddArgument(std::wstring argument);
	void AddArgument(int argument);
	void AddArgument(double argument);
	void AddArgument(bool argument);
	void AddArgument(ElementWrapper *argument);
	void AddArgument(IHTMLElement *argument);
	void AddArgument(VARIANT argument);

	bool ResultIsEmpty(void);
	bool ResultIsString(void);
	bool ResultIsInteger(void);
	bool ResultIsBoolean(void);
	bool ResultIsDouble(void);
	bool ResultIsArray(void);
	bool ResultIsElement(void);
	bool ResultIsElementCollection(void);
	bool ResultIsIDispatch(void);

	int Execute(void);
	int ConvertResultToJsonValue(BrowserManager *manager, Json::Value *value);

private:
	int GetArrayLength(BrowserWrapper *browser_wrapper, long *length);
	int GetArrayItem(BrowserWrapper *browser_wrapper, BrowserManager *manager, long index, Json::Value *item);
	std::wstring GetObjectTypeName(void);
	bool GetEvalMethod(IHTMLDocument2* doc, DISPID* eval_id, bool* added);
	void RemoveScript(IHTMLDocument2* doc);
	bool CreateAnonymousFunction(IDispatch* script_engine, DISPID eval_id, const std::wstring *script, VARIANT* result);

	BrowserWrapper *browser_;
	unsigned long argument_count_;
	std::wstring script_;
	long current_arg_index_;
	SAFEARRAY *argument_array_;
	VARIANT result_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SCRIPTWRAPPER_H_
