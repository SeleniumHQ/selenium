#ifndef WEBDRIVER_IE_SCRIPTWRAPPER_H_
#define WEBDRIVER_IE_SCRIPTWRAPPER_H_

#include <string>
#include "json.h"
#include "ElementWrapper.h"

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class Browser;
class Session;

class ScriptWrapper
{
public:
	ScriptWrapper(IHTMLDocument2* document, std::wstring script_source, unsigned long argument_count);
	~ScriptWrapper(void);

	std::wstring source_code() const { return this->source_code_; }
	unsigned long argument_count() const { return this->argument_count_; }
	SAFEARRAY* arguments() { return this->argument_array_; }
	VARIANT result() { return this->result_; }
	void set_result(VARIANT value) { ::VariantCopy(&this->result_, &value); }

	void AddArgument(const std::wstring& argument);
	void AddArgument(const int argument);
	void AddArgument(const double argument);
	void AddArgument(const bool argument);
	void AddArgument(ElementHandle argument);
	void AddArgument(IHTMLElement* argument);
	void AddArgument(VARIANT argument);

	bool ResultIsEmpty(void);
	bool ResultIsString(void);
	bool ResultIsInteger(void);
	bool ResultIsBoolean(void);
	bool ResultIsDouble(void);
	bool ResultIsArray(void);
	bool ResultIsObject(void);
	bool ResultIsElement(void);
	bool ResultIsElementCollection(void);
	bool ResultIsIDispatch(void);

	int Execute(void);
	int ConvertResultToJsonValue(const Session& session, Json::Value* value);

private:
	int GetArrayLength(long* length);
	int GetArrayItem(const Session& session, long index, Json::Value* item);
	int GetPropertyNameList(std::wstring* property_names);
	int GetPropertyValue(const Session& session, const std::wstring& property_name, Json::Value* property_value);
	std::wstring GetResultObjectTypeName(void);
	bool CreateAnonymousFunction(VARIANT* result);

	CComPtr<IHTMLDocument2> script_engine_host_;
	unsigned long argument_count_;
	std::wstring source_code_;
	long current_arg_index_;
	SAFEARRAY* argument_array_;
	VARIANT result_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SCRIPTWRAPPER_H_
