// Copyright 2013 Software Freedom Conservancy
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

#include "Script.h"
#include "AsyncScriptExecutor.h"
#include "IECommandExecutor.h"
#include "logging.h"

namespace webdriver {

Script::Script(IHTMLDocument2* document,
               std::string script_source,
               unsigned long argument_count) {
  std::wstring wide_script = StringUtilities::ToWString(script_source);
  this->Initialize(document, wide_script, argument_count);
}

Script::Script(IHTMLDocument2* document,
               std::wstring script_source,
               unsigned long argument_count) {
  this->Initialize(document, script_source, argument_count);
}

Script::~Script(void) {
  //this->argument_array_.Destroy();
}

void Script::Initialize(IHTMLDocument2* document,
                        const std::wstring& script_source,
                        const unsigned long argument_count) {
  LOG(TRACE) << "Entering Script::Initialize";

  this->script_engine_host_ = document;
  this->source_code_ = script_source;
  this->argument_count_ = argument_count;
  this->current_arg_index_ = 0;

  // Calling vector::resize() is okay here, because the vector
  // should be empty when Initialize() is called, and the
  // reallocation of variants shouldn't give us too much of a
  // negative impact.
  this->argument_array_.resize(this->argument_count_);
}

void Script::AddArgument(const std::string& argument) {
  LOG(TRACE) << "Entering Script::AddArgument(std::string)";
  std::wstring wide_argument = StringUtilities::ToWString(argument);
  this->AddArgument(wide_argument);
}

void Script::AddArgument(const std::wstring& argument) {
  LOG(TRACE) << "Entering Script::AddArgument(std::wstring)";
  CComVariant dest_argument(argument.c_str());
  this->AddArgument(dest_argument);
}

void Script::AddArgument(const int argument) {
  LOG(TRACE) << "Entering Script::AddArgument(int)";
  CComVariant dest_argument((long)argument);
  this->AddArgument(dest_argument);
}

void Script::AddArgument(const double argument) {
  LOG(TRACE) << "Entering Script::AddArgument(double)";
  CComVariant dest_argument(argument);
  this->AddArgument(dest_argument);
}

void Script::AddArgument(const bool argument) {
  LOG(TRACE) << "Entering Script::AddArgument(bool)";
  CComVariant dest_argument(argument);
  this->AddArgument(dest_argument);
}

void Script::AddArgument(ElementHandle argument) {
  LOG(TRACE) << "Entering Script::AddArgument(ElementHandle)";
  this->AddArgument(argument->element());
}

void Script::AddArgument(IHTMLElement* argument) {
  LOG(TRACE) << "Entering Script::AddArgument(IHTMLElement*)";
  CComVariant dest_argument(argument);
  this->AddArgument(dest_argument);
}

void Script::AddArgument(VARIANT argument) {
  LOG(TRACE) << "Entering Script::AddArgument(VARIANT)";
  CComVariant wrapped_argument(argument);
  this->argument_array_[this->current_arg_index_] = wrapped_argument;
  ++this->current_arg_index_;
}

void Script::AddNullArgument() {
  LOG(TRACE) << "Entering Script::AddNullArgument";
  CComVariant null_arg;
  null_arg.vt = VT_NULL;
  this->AddArgument(null_arg);
}

bool Script::ResultIsString() {
  LOG(TRACE) << "Entering Script::ResultIsString";
  return this->result_.vt == VT_BSTR;
}

bool Script::ResultIsInteger() {
  LOG(TRACE) << "Entering Script::ResultIsInteger";
  return this->result_.vt == VT_I4 || this->result_.vt == VT_I8;
}

bool Script::ResultIsDouble() {
  LOG(TRACE) << "Entering Script::ResultIsDouble";
  return this->result_.vt == VT_R4 || this->result_.vt == VT_R8;
}

bool Script::ResultIsBoolean() {
  LOG(TRACE) << "Entering Script::ResultIsBoolean";
  return this->result_.vt == VT_BOOL;
}

bool Script::ResultIsEmpty() {
  LOG(TRACE) << "Entering Script::ResultIsEmpty";
  return this->result_.vt == VT_EMPTY;
}

bool Script::ResultIsIDispatch() {
  LOG(TRACE) << "Entering Script::ResultIsIDispatch";
  return this->result_.vt == VT_DISPATCH;
}

bool Script::ResultIsElementCollection() {
  LOG(TRACE) << "Entering Script::ResultIsElementCollection";

  if (this->result_.vt == VT_DISPATCH) {
    CComPtr<IHTMLElementCollection> is_collection;
    this->result_.pdispVal->QueryInterface<IHTMLElementCollection>(&is_collection);
    if (is_collection) {
      return true;
    }
  }
  return false;
}

bool Script::ResultIsElement() {
  LOG(TRACE) << "Entering Script::ResultIsElement";

  if (this->result_.vt == VT_DISPATCH) {
    CComPtr<IHTMLElement> is_element;
    this->result_.pdispVal->QueryInterface<IHTMLElement>(&is_element);
    if (is_element) {
      return true;
    }
  }
  return false;
}

bool Script::ResultIsArray() {
  LOG(TRACE) << "Entering Script::ResultIsArray";

  std::wstring type_name = this->GetResultObjectTypeName();

  // If the name is DispStaticNodeList, we can be pretty sure it's an array
  // (or at least has array semantics). It is unclear to what extent checking
  // for DispStaticNodeList is supported behaviour.
  if (type_name == L"DispStaticNodeList") {
    LOG(DEBUG) << "Result type is DispStaticNodeList";
    return true;
  }

  // If the name is JScriptTypeInfo then this *may* be a Javascript array.
  // Note that strictly speaking, to determine if the result is *actually*
  // a JavaScript array object, we should also be testing to see if
  // propertyIsEnumerable('length') == false, but that does not find the
  // array-like objects returned by some of the calls we make to the Google
  // Closure library.
  // IMPORTANT: Using this script, user-defined objects with a length
  // property defined will be seen as arrays instead of objects.
  if (type_name == L"JScriptTypeInfo") {
    LOG(DEBUG) << "Result type is JScriptTypeInfo";
    const std::wstring script_source = L"(function() { return function(){ return arguments[0] && arguments[0].hasOwnProperty('length') && typeof arguments[0] === 'object' && typeof arguments[0].length === 'number';};})();";
    Script is_array_wrapper(this->script_engine_host_, script_source, 1);
    is_array_wrapper.AddArgument(this->result_);
    is_array_wrapper.Execute();
    return is_array_wrapper.result().boolVal == VARIANT_TRUE;
  }

  return false;
}

bool Script::ResultIsObject() {
  LOG(TRACE) << "Entering Script::ResultIsObject";

  std::wstring type_name = this->GetResultObjectTypeName();
  if (type_name == L"JScriptTypeInfo") {
    return true;
  }
  return false;
}

int Script::Execute() {
  LOG(TRACE) << "Entering Script::Execute";

  CComVariant result;

  if (this->script_engine_host_ == NULL) {
    LOG(WARN) << "Script engine host is NULL";
    return ENOSUCHDOCUMENT;
  }
  CComVariant temp_function;
  if (!this->CreateAnonymousFunction(&temp_function)) {
    LOG(WARN) << "Cannot create anonymous function";
    return EUNEXPECTEDJSERROR;
  }

  if (temp_function.vt != VT_DISPATCH) {
    LOG(DEBUG) << "No return value that we care about";
    return WD_SUCCESS;
  }

  // Grab the "call" method out of the returned function
  DISPID call_member_id;
  OLECHAR FAR* call_member_name = L"call";
  HRESULT hr = temp_function.pdispVal->GetIDsOfNames(IID_NULL,
                                                     &call_member_name,
                                                     1,
                                                     LOCALE_USER_DEFAULT,
                                                     &call_member_id);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Cannot locate call method on anonymous function";
    return EUNEXPECTEDJSERROR;
  }

  CComPtr<IHTMLWindow2> win;
  hr = this->script_engine_host_->get_parentWindow(&win);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Cannot get parent window, IHTMLDocument2::get_parentWindow failed";
    return EUNEXPECTEDJSERROR;
  }

  // IDispatch::Invoke() expects the arguments to be passed into it
  // in reverse order. To accomplish this, we create a new variant
  // array of size n + 1 where n is the number of arguments we have.
  // we copy each element of arguments_array_ into the new array in
  // reverse order, and add an extra argument, the window object,
  // to the end of the array to use as the "this" parameter for the
  // function invocation.
  size_t arg_count = this->argument_array_.size();
  vector<CComVariant> argument_array_copy(arg_count + 1);
  CComVariant window_variant(win);
  argument_array_copy[arg_count].Copy(&window_variant);

  for (size_t index = 0; index < arg_count; ++index) {
    argument_array_copy[arg_count - 1 - index].Copy(&this->argument_array_[index]);
  }

  DISPPARAMS call_parameters = { 0 };
  memset(&call_parameters, 0, sizeof call_parameters);
  call_parameters.cArgs = static_cast<unsigned int>(argument_array_copy.size());
  call_parameters.rgvarg = &argument_array_copy[0];

  int return_code = WD_SUCCESS;
  EXCEPINFO exception;
  memset(&exception, 0, sizeof exception);
  hr = temp_function.pdispVal->Invoke(call_member_id,
                                      IID_NULL,
                                      LOCALE_USER_DEFAULT,
                                      DISPATCH_METHOD,
                                      &call_parameters, 
                                      &result,
                                      &exception,
                                      0);

  if (FAILED(hr)) {
    CComBSTR error_description = L"";
    if (DISP_E_EXCEPTION == hr) {
      error_description = exception.bstrDescription ? exception.bstrDescription : L"EUNEXPECTEDJSERROR";
      CComBSTR error_source(exception.bstrSource ? exception.bstrSource : L"EUNEXPECTEDJSERROR");
      LOG(INFO) << "Exception message was: '" << error_description << "'";
      LOG(INFO) << "Exception source was: '" << error_source << "'";
    } else {
      LOGHR(DEBUG, hr) << "Failed to execute anonymous function, no exception information retrieved";
    }

    result.Clear();
    result.vt = VT_BSTR;
    result.bstrVal = error_description;
    return_code = EUNEXPECTEDJSERROR;
  }

  this->result_.Copy(&result);

  return return_code;
}

int Script::ExecuteAsync(int timeout_in_milliseconds) {
  LOG(TRACE) << "Entering Script::ExecuteAsync";
  int return_code = WD_SUCCESS;
  CComVariant result;
  AsyncScriptExecutorThreadContext thread_context;
  thread_context.script_source = this->source_code_.c_str();
  thread_context.script_argument_count = this->argument_count_;

  // We need exclusive access to this event. If it's already created,
  // OpenEvent returns non-NULL, so we need to wait a bit and retry
  // until OpenEvent returns NULL.
  int retry_counter = 50;
  HANDLE event_handle = ::OpenEvent(SYNCHRONIZE, FALSE, ASYNC_SCRIPT_EVENT_NAME);
  if (event_handle != NULL && --retry_counter > 0) {
    ::CloseHandle(event_handle);
    ::Sleep(50);
    event_handle = ::OpenEvent(SYNCHRONIZE, FALSE, ASYNC_SCRIPT_EVENT_NAME);
  }

  // Failure condition here.
  if (event_handle != NULL) {
    ::CloseHandle(event_handle);
    LOG(WARN) << "OpenEvent() returned non-NULL, event already exists.";
    result.Clear();
    result.vt = VT_BSTR;
    result.bstrVal = L"Couldn't create an event for synchronizing the creation of the thread. This generally means that you were trying to click on an option in two different instances.";
    this->result_.Copy(&result);
    return EUNEXPECTEDJSERROR;
  }

  LOG(DEBUG) << "Creating synchronization event for new thread";
  event_handle = ::CreateEvent(NULL, TRUE, FALSE, ASYNC_SCRIPT_EVENT_NAME);
  if (event_handle == NULL) {
    LOG(WARN) << "CreateEvent() failed.";
    result.Clear();
    result.vt = VT_BSTR;
    result.bstrVal = L"Couldn't create an event for synchronizing the creation of the thread. This is an internal failure at the Windows OS level, and is generally not due to an error in the IE driver.";
    this->result_.Copy(&result);
    return EUNEXPECTEDJSERROR;
  }

  // Start the thread and wait up to 1 second to be signaled that it is ready
  // to receive messages, then close the event handle.
  LOG(DEBUG) << "Starting new thread";
  unsigned int thread_id = 0;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                  0,
                                                  AsyncScriptExecutor::ThreadProc,
                                                  reinterpret_cast<void*>(&thread_context),
                                                  0,
                                                  &thread_id));

  LOG(DEBUG) << "Waiting for new thread to be ready for messages";
  DWORD event_wait_result = ::WaitForSingleObject(event_handle, 5000);
  if (event_wait_result != WAIT_OBJECT_0) {
    LOG(WARN) << "Waiting for event to be signaled returned unexpected value: " << event_wait_result;
  }
  ::CloseHandle(event_handle);

  if (thread_handle == NULL) {
    LOG(WARN) << "_beginthreadex() failed.";
    result.Clear();
    result.vt = VT_BSTR;
    result.bstrVal = L"Couldn't create the thread for executing JavaScript asynchronously.";
    this->result_.Copy(&result);
    return EUNEXPECTEDJSERROR;
  }

  HWND executor_handle = thread_context.hwnd;

  // Marshal the document and the element to click to streams for use in another thread.
  LOG(DEBUG) << "Marshaling document to stream to send to new thread";
  LPSTREAM document_stream;
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IHTMLDocument2, this->script_engine_host_, &document_stream);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "CoMarshalInterfaceThreadInStream() for document failed";
    result.Clear();
    result.vt = VT_BSTR;
    result.bstrVal = L"Couldn't marshal the IHTMLDocument2 interface to a stream. This is an internal COM error.";
    this->result_.Copy(&result);
    return EUNEXPECTEDJSERROR;
  }

  ::SendMessage(executor_handle, WD_ASYNC_SCRIPT_SET_DOCUMENT, NULL, reinterpret_cast<LPARAM>(document_stream));
  for (size_t index = 0; index < this->argument_array_.size(); ++index) {
    CComVariant arg = this->argument_array_[index];
    WPARAM wparam = static_cast<WPARAM>(arg.vt);
    LPARAM lparam = NULL;
    switch (arg.vt) {
      case VT_DISPATCH: {
        LPSTREAM dispatch_stream;
        hr = ::CoMarshalInterThreadInterfaceInStream(IID_IDispatch, arg.pdispVal, &dispatch_stream);
        if (FAILED(hr)) {
          LOGHR(WARN, hr) << "CoMarshalInterfaceThreadInStream() for IDispatch argument failed";
          result.Clear();
          result.vt = VT_BSTR;
          result.bstrVal = L"Couldn't marshal the IDispatch interface to a stream. This is an internal COM error.";
          this->result_.Copy(&result);
          return EUNEXPECTEDJSERROR;
        }
        lparam = reinterpret_cast<LPARAM>(dispatch_stream);
        break;
      }
      default: {
        // TODO: Marshal arguments of types other than VT_DISPATCH. At present,
        // the asynchronous execution of JavaScript is only used for Automation
        // Atoms on an element which take a single argument, an IHTMLElement
        // object, which is represented as an IDispatch. This case statement
        // will get much more complex should the need arise to execute
        // arbitrary scripts in an asynchronous manner.
      }
    }
    ::SendMessage(executor_handle, WD_ASYNC_SCRIPT_SET_ARGUMENT, wparam, lparam);
  }
  ::PostMessage(executor_handle, WD_EXECUTE_ASYNC_SCRIPT, NULL, NULL);
  // We will wait a short bit and poll for the execution of the script to be
  // complete. This will allow us to say synchronous for short-running scripts
  // like clearing an input element, yet still be able to continue processing
  // when the script is blocked, as when an alert() window is present.
  retry_counter = static_cast<int>(timeout_in_milliseconds / 10);
  bool is_execution_finished = ::SendMessage(executor_handle, WD_ASYNC_SCRIPT_IS_EXECUTION_COMPLETE, NULL, NULL) != 0;
  while(!is_execution_finished && --retry_counter > 0) {
    ::Sleep(10);
    is_execution_finished = ::SendMessage(executor_handle, WD_ASYNC_SCRIPT_IS_EXECUTION_COMPLETE, NULL, NULL) != 0;
  }

  if (is_execution_finished) {
    // TODO: Marshal the actual result from the AsyncScriptExecutor window
    // thread to this one. At present, the asynchronous execution of JavaScript
    // is only used for Automation Atoms on an element which could cause an
    // alert to appear (e.g., clear, click, or submit), and do not return any
    // return values back to the caller. In this case, the return code of the
    // execution method is sufficent. Marshaling the return will require two
    // more messages, one for determining the variant type of the return value,
    // and another for actually retrieving that value from the worker window's
    // thread.
    int status_code = static_cast<int>(::SendMessage(executor_handle, WD_ASYNC_SCRIPT_GET_RESULT, NULL, NULL));
    return status_code;
  } else {
    ::SendMessage(executor_handle, WD_ASYNC_SCRIPT_DETACH_LISTENTER, NULL, NULL);
  }
  return WD_SUCCESS;
}

int Script::ConvertResultToJsonValue(const IECommandExecutor& executor,
                                     Json::Value* value) {
  LOG(TRACE) << "Entering Script::ConvertResultToJsonValue";

  int status_code = WD_SUCCESS;
  if (this->ResultIsString()) { 
    std::string string_value = "";
    if (this->result_.bstrVal) {
      std::wstring bstr_value = this->result_.bstrVal;
      string_value = StringUtilities::ToString(bstr_value);
    }
    *value = string_value;
  } else if (this->ResultIsInteger()) {
    *value = this->result_.lVal;
  } else if (this->ResultIsDouble()) {
    *value = this->result_.dblVal;
  } else if (this->ResultIsBoolean()) {
    *value = this->result_.boolVal == VARIANT_TRUE;
  } else if (this->ResultIsEmpty()) {
    *value = Json::Value::null;
  } else if (this->result_.vt == VT_NULL) {
    *value = Json::Value::null;
  } else if (this->ResultIsIDispatch()) {
    if (this->ResultIsArray() || this->ResultIsElementCollection()) {
      Json::Value result_array(Json::arrayValue);

      long length = 0;
      status_code = this->GetArrayLength(&length);

      for (long i = 0; i < length; ++i) {
        Json::Value array_item_result;
        int array_item_status = this->GetArrayItem(executor,
                                                   i,
                                                   &array_item_result);
        result_array[i] = array_item_result;
      }
      *value = result_array;
    } else if (this->ResultIsObject()) {
      Json::Value result_object;

      std::wstring property_name_list = L"";
      status_code = this->GetPropertyNameList(&property_name_list);

      std::vector<std::wstring> property_names;
      size_t end_position(0);
      size_t start_position(0);
      while (true) {
        std::wstring property_name = L"";
        end_position = property_name_list.find_first_of(L",", start_position);
        if(end_position == std::wstring::npos) {
          property_names.push_back(property_name_list.substr(start_position,
                                                             property_name_list.size() - start_position));
          break;
        } else {
          property_names.push_back(property_name_list.substr(start_position,
                                                             end_position - start_position));
          start_position = end_position + 1;
        }
      }

      for (size_t i = 0; i < property_names.size(); ++i) {
        Json::Value property_value_result;
        int property_value_status = this->GetPropertyValue(executor,
                                                           property_names[i],
                                                           &property_value_result);
        std::string name = StringUtilities::ToString(property_names[i]);
        result_object[name] = property_value_result;
      }
      *value = result_object;
    } else {
      LOG(INFO) << "Unknown type of dispatch is found in result, assuming IHTMLElement";
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      CComPtr<IHTMLElement> node;
      this->result_.pdispVal->QueryInterface<IHTMLElement>(&node);
      ElementHandle element_wrapper;
      mutable_executor.AddManagedElement(node, &element_wrapper);
      *value = element_wrapper->ConvertToJson();
    }
  } else {
    LOG(WARN) << "Unknown type of result is found";
    status_code = EUNKNOWNSCRIPTRESULT;
  }
  return status_code;
}

bool Script::ConvertResultToString(std::string* value) {
  LOG(TRACE) << "Entering Script::ConvertResultToString";

  VARTYPE type = this->result_.vt;
  switch(type) {

    case VT_BOOL:
      LOG(DEBUG) << "result type is boolean";
      *value = this->result_.boolVal == VARIANT_TRUE ? "true" : "false";
      return true;

    case VT_BSTR:
      LOG(DEBUG) << "result type is string";
      if (!this->result_.bstrVal) {
        *value = "";
      } else {
        std::wstring str_value = this->result_.bstrVal;
        *value = StringUtilities::ToString(str_value);
      }
      return true;
  
    case VT_I4:
      LOG(DEBUG) << "result type is int";
      {
        char* buffer = reinterpret_cast<char*>(malloc(sizeof(char) * MAX_DIGITS_OF_NUMBER));
        if (buffer != NULL) {
          _i64toa_s(this->result_.lVal, buffer, MAX_DIGITS_OF_NUMBER, BASE_TEN_BASE);
        }
        *value = buffer;
      }
      return true;

    case VT_EMPTY:
    case VT_NULL:
      LOG(DEBUG) << "result type is empty";
      *value = "";
      return false;

    // This is lame
    case VT_DISPATCH:
      LOG(DEBUG) << "result type is dispatch";
      *value = "";
      return true;

    default:
      LOG(DEBUG) << "result type is unknown: " << type;
  }
  return false;
}

std::wstring Script::GetResultObjectTypeName() {
  LOG(TRACE) << "Entering Script::GetResultObjectTypeName";

  std::wstring name = L"";
  if (this->result_.vt == VT_DISPATCH && this->result_.pdispVal) {
    CComPtr<ITypeInfo> typeinfo;
    HRESULT get_type_info_result = this->result_.pdispVal->GetTypeInfo(0,
                                                                       LOCALE_USER_DEFAULT,
                                                                       &typeinfo);
    TYPEATTR* type_attr;
    CComBSTR name_bstr;
    if (SUCCEEDED(get_type_info_result) &&
        SUCCEEDED(typeinfo->GetTypeAttr(&type_attr)) &&
        SUCCEEDED(typeinfo->GetDocumentation(-1, &name_bstr, 0, 0, 0))) {
      typeinfo->ReleaseTypeAttr(type_attr);
      name = name_bstr.Copy();
    } else {
      LOG(WARN) << "Unable to get object type";
    }
  } else {
    LOG(DEBUG) << "Unable to get object type for non-object result, result is not IDispatch or IDispatch pointer is NULL";
  }
  return name;
}

int Script::GetPropertyNameList(std::wstring* property_names) {
  LOG(TRACE) << "Entering Script::GetPropertyNameList";

  // Loop through the properties, appending the name of each one to the string.
  std::wstring get_names_script = L"(function(){return function() { var name_list = ''; for (var name in arguments[0]) { if (name_list.length > 0) name_list += ','; name_list += name } return name_list;}})();";
  Script get_names_script_wrapper(this->script_engine_host_,
                                  get_names_script,
                                  1);
  get_names_script_wrapper.AddArgument(this->result_);
  int get_names_result = get_names_script_wrapper.Execute();

  if (get_names_result != WD_SUCCESS) {
    LOG(WARN) << "Unable to get property name list, script execution returned error code";
    return get_names_result;
  }

  // Expect the return type to be an string. A non-string means ... (what?)
  if (!get_names_script_wrapper.ResultIsString()) {
    LOG(WARN) << "Result properties are not string";
    return EUNEXPECTEDJSERROR;
  }

  *property_names = get_names_script_wrapper.result().bstrVal;
  return WD_SUCCESS;
}

int Script::GetPropertyValue(const IECommandExecutor& executor,
                             const std::wstring& property_name,
                             Json::Value* property_value){
  LOG(TRACE) << "Entering Script::GetPropertyValue";

  std::wstring get_value_script = L"(function(){return function() {return arguments[0][arguments[1]];}})();";
  Script get_value_script_wrapper(this->script_engine_host_,
                                  get_value_script,
                                  2);
  get_value_script_wrapper.AddArgument(this->result_);
  get_value_script_wrapper.AddArgument(property_name);
  int get_value_result = get_value_script_wrapper.Execute();
  if (get_value_result != WD_SUCCESS) {
    LOG(WARN) << "Unable to get property value, script execution returned error code";
    return get_value_result;
  }

  int property_value_status = get_value_script_wrapper.ConvertResultToJsonValue(executor, property_value);
  return WD_SUCCESS;
}

int Script::GetArrayLength(long* length) {
  LOG(TRACE) << "Entering Script::GetArrayLength";

  // Prepare an array for the Javascript execution, containing only one
  // element - the original returned array from a JS execution.
  std::wstring get_length_script = L"(function(){return function() {return arguments[0].length;}})();";
  Script get_length_script_wrapper(this->script_engine_host_,
                                   get_length_script,
                                   1);
  get_length_script_wrapper.AddArgument(this->result_);
  int length_result = get_length_script_wrapper.Execute();

  if (length_result != WD_SUCCESS) {
    LOG(WARN) << "Unable to get array length, script execution returned error code";
    return length_result;
  }

  // Expect the return type to be an integer. A non-integer means this was
  // not an array after all.
  if (!get_length_script_wrapper.ResultIsInteger()) {
    LOG(WARN) << "Array length is not integer";
    return EUNEXPECTEDJSERROR;
  }

  *length = get_length_script_wrapper.result().lVal;
  return WD_SUCCESS;
}

int Script::GetArrayItem(const IECommandExecutor& executor,
                         long index,
                         Json::Value* item){
  LOG(TRACE) << "Entering Script::GetArrayItem";

  std::wstring get_array_item_script = L"(function(){return function() {return arguments[0][arguments[1]];}})();";
  Script get_array_item_script_wrapper(this->script_engine_host_,
                                       get_array_item_script,
                                       2);
  get_array_item_script_wrapper.AddArgument(this->result_);
  get_array_item_script_wrapper.AddArgument(index);
  int get_item_result = get_array_item_script_wrapper.Execute();
  if (get_item_result != WD_SUCCESS) {
    LOG(WARN) << "Unable to get array item, script execution returned error";
    return get_item_result;
  }

  int array_item_status = get_array_item_script_wrapper.ConvertResultToJsonValue(executor, item);
  return WD_SUCCESS;
}

bool Script::CreateAnonymousFunction(VARIANT* result) {
  LOG(TRACE) << "Entering Script::CreateAnonymousFunction";

  std::wstring function_eval_script = L"window.document.__webdriver_script_fn = ";
  function_eval_script.append(this->source_code_.c_str());
  CComBSTR code(function_eval_script.c_str());
  CComBSTR lang(L"JScript");
  CComVariant exec_script_result;

  CComPtr<IHTMLWindow2> window;
  HRESULT hr = this->script_engine_host_->get_parentWindow(&window);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get parent window, call to IHTMLDocument2::get_parentWindow failed";
    return false;
  }

  hr = window->execScript(code, lang, &exec_script_result);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to execute code, call to IHTMLWindow2::execScript failed";
    return false;
  }

  OLECHAR FAR* function_object_name = L"__webdriver_script_fn";
  DISPID dispid_function_object;
  hr = this->script_engine_host_->GetIDsOfNames(IID_NULL,
                                                &function_object_name,
                                                1,
                                                LOCALE_USER_DEFAULT,
                                                &dispid_function_object);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get id of name __webdriver_script_fn";
    return false;
  }

  // get the value of eval result
  DISPPARAMS no_args_dispatch_parameters = { NULL, NULL, 0, 0 };
  hr = this->script_engine_host_->Invoke(dispid_function_object,
                                         IID_NULL,
                                         LOCALE_USER_DEFAULT,
                                         DISPATCH_PROPERTYGET,
                                         &no_args_dispatch_parameters,
                                         result,
                                         NULL,
                                         NULL);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get value of eval result";
    return false;
  }
  return true;
}
} // namespace webdriver