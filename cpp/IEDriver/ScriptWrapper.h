#ifndef WEBDRIVER_IE_SCRIPTWRAPPER_H_
#define WEBDRIVER_IE_SCRIPTWRAPPER_H_

#include <string>
#include "ElementWrapper.h"

using namespace std;

namespace webdriver {

class ScriptWrapper
{
public:
	ScriptWrapper(std::wstring script, unsigned long argument_count);
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

	bool ResultIsEmpty();
	bool ResultIsString();
	bool ResultIsInteger();
	bool ResultIsBoolean();
	bool ResultIsDouble();
	bool ResultIsArray();
	bool ResultIsElement();
	bool ResultIsElementCollection();
	bool ResultIsIDispatch();

private:
	unsigned long argument_count_;
	std::wstring script_;
	long current_arg_index_;
	SAFEARRAY *argument_array_;
	VARIANT result_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SCRIPTWRAPPER_H_
