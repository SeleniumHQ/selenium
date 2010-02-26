/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#ifndef JOBBIE_DATAMARSHALLER_H_
#define JOBBIE_DATAMARSHALLER_H_

#include <mshtml.h>
#include <vector>

using namespace std;

class CScopeCaller;

class EventHandler
{
private:
	HANDLE				sync;
public:
	EventHandler(void);
	~EventHandler(void);
	operator HANDLE() const {return sync;}
};

class DataMarshaller
{
public:
	DataMarshaller(void);

	// WARNING can only be set by calling thread. Do not copy or reference these variables
	// use them only from this class in place.
	LPCWSTR			input_string_;
	long			input_long_;
	IHTMLElement	*input_html_element_;
	SAFEARRAY		*input_safe_array_;
	CComVariant  *input_variant_;

	// WARNING can only be set by worker thread
	std::wstring	output_string_;
	long			output_long_;
	bool			output_bool_;
	IHTMLElement	*output_html_element_;
	std::vector<IHTMLElement*> output_list_html_element_;
	std::vector<std::wstring> output_list_string_;
	CComVariant		output_variant_;
	SAFEARRAY		*output_safe_array_;
	int				error_code;

	// Error handling and synchronization
	bool			exception_caught_;
	CScopeCaller	*scope_caller_;
	EventHandler	synchronization_flag_;

public:

	void resetInputs();
	void resetOutputs();
};

#endif // JOBBIE_DATAMARSHALLER_H_
