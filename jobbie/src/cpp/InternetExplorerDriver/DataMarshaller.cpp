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

#include "StdAfx.h"

#include "DataMarshaller.h"
#include "errorcodes.h"

DataMarshaller::DataMarshaller(void) : output_safe_array_(NULL)
{
	resetInputs();
	resetOutputs();
}

void DataMarshaller::resetInputs()
{
	input_long_ = -1;
	input_html_element_ = NULL;
	input_string_ = NULL;
	input_safe_array_ = NULL;
	scope_caller_ = NULL;
	input_variant_ = NULL;
}

void DataMarshaller::resetOutputs()
{
	output_long_ = -1;
	output_html_element_ = NULL;
	output_string_ = L"";
	output_bool_ = true;
	output_list_html_element_.clear();
	output_list_string_.clear();
	output_variant_.Clear();
	error_code = SUCCESS;
	if (output_safe_array_) {
		SafeArrayDestroy(output_safe_array_);
	}
	output_safe_array_ = NULL;
	exception_caught_ = false;
}

EventHandler::EventHandler(void)
{
	sync = CreateEvent(NULL, TRUE, TRUE, NULL);
}

EventHandler::~EventHandler(void)
{
	CloseHandle(sync);
}

