#include "StdAfx.h"

#include "DataMarshaller.h"

DataMarshaller::DataMarshaller(void)
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
}

void DataMarshaller::resetOutputs()
{
	output_long_ = -1;
	output_html_element_ = NULL;
	output_string_ = L"";
	output_bool_ = true;
	output_list_html_element_.clear();
	output_variant_.Clear();
}

EventHandler::EventHandler(void)
{
	sync = CreateEvent(NULL, TRUE, TRUE, NULL);
}

EventHandler::~EventHandler(void)
{
	CloseHandle(sync);
}

