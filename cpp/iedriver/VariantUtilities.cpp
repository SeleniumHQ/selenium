// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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

#include "VariantUtilities.h"

#include "errorcodes.h"
#include "json.h"
#include "logging.h"

#include "Element.h"
#include "IECommandExecutor.h"
#include "StringUtilities.h"

namespace webdriver {
VariantUtilities::VariantUtilities(void) {
}

VariantUtilities::~VariantUtilities(void) {
}

bool VariantUtilities::VariantIsString(VARIANT value) {
  return value.vt == VT_BSTR;
}

bool VariantUtilities::VariantIsInteger(VARIANT value) {
  return value.vt == VT_I4 || value.vt == VT_I8;
}

bool VariantUtilities::VariantIsDouble(VARIANT value) {
  return value.vt == VT_R4 || value.vt == VT_R8;
}

bool VariantUtilities::VariantIsBoolean(VARIANT value) {
  return value.vt == VT_BOOL;
}

bool VariantUtilities::VariantIsEmpty(VARIANT value) {
  return value.vt == VT_EMPTY;
}

bool VariantUtilities::VariantIsIDispatch(VARIANT value) {
  return value.vt == VT_DISPATCH;
}

bool VariantUtilities::VariantIsElementCollection(VARIANT value) {
  if (value.vt == VT_DISPATCH) {
    CComPtr<IHTMLElementCollection> is_collection;
    value.pdispVal->QueryInterface<IHTMLElementCollection>(&is_collection);
    if (is_collection) {
      return true;
    }
  }
  return false;
}

bool VariantUtilities::VariantIsElement(VARIANT value) {
  if (value.vt == VT_DISPATCH) {
    CComPtr<IHTMLElement> is_element;
    value.pdispVal->QueryInterface<IHTMLElement>(&is_element);
    if (is_element) {
      return true;
    }
  }
  return false;
}

bool VariantUtilities::VariantIsArray(VARIANT value) {
  std::wstring type_name = GetVariantObjectTypeName(value);

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
    LPOLESTR length_property_name = L"length";
    DISPID dispid_length = 0;
    HRESULT hr = value.pdispVal->GetIDsOfNames(IID_NULL,
                                               &length_property_name,
                                               1,
                                               LOCALE_USER_DEFAULT,
                                               &dispid_length);
    if (SUCCEEDED(hr)) {
      return true;
    }
  }

  return false;
}

bool VariantUtilities::VariantIsObject(VARIANT value) {
  std::wstring type_name = GetVariantObjectTypeName(value);
  if (type_name == L"JScriptTypeInfo") {
    return true;
  }
  return false;
}

bool VariantUtilities::ConvertVariantToString(VARIANT variant_value,
                                             std::string* value) {
  VARTYPE type = variant_value.vt;
  switch (type) {

  case VT_BOOL:
    LOG(DEBUG) << "Result type is boolean";
    *value = variant_value.boolVal == VARIANT_TRUE ? "true" : "false";
    return true;

  case VT_BSTR:
    LOG(DEBUG) << "Result type is string";
    if (!variant_value.bstrVal) {
      *value = "";
    }
    else {
      std::wstring str_value = variant_value.bstrVal;
      *value = StringUtilities::ToString(str_value);
    }
    return true;

  case VT_I4:
    LOG(DEBUG) << "Result type is int";
    *value = std::to_string(static_cast<long long>(variant_value.lVal));
    return true;

  case VT_R4:
    LOG(DEBUG) << "Result type is real";
    *value = std::to_string(variant_value.dblVal);
    return true;

  case VT_EMPTY:
  case VT_NULL:
    LOG(DEBUG) << "Result type is empty";
    *value = "";
    return false;

    // This is lame
  case VT_DISPATCH:
    LOG(DEBUG) << "Result type is dispatch";
    *value = "";
    return true;

  default:
    LOG(DEBUG) << "Result type is unknown: " << type;
  }
  return false;
}

int VariantUtilities::ConvertVariantToJsonValue(const IECommandExecutor& executor,
                                                VARIANT variant_value,
                                                Json::Value* value) {
  int status_code = WD_SUCCESS;
  if (VariantIsString(variant_value)) { 
    std::string string_value = "";
    if (variant_value.bstrVal) {
      std::wstring bstr_value = variant_value.bstrVal;
      string_value = StringUtilities::ToString(bstr_value);
    }
    *value = string_value;
  } else if (VariantIsInteger(variant_value)) {
    *value = variant_value.lVal;
  } else if (VariantIsDouble(variant_value)) {
    *value = variant_value.dblVal;
  } else if (VariantIsBoolean(variant_value)) {
    *value = variant_value.boolVal == VARIANT_TRUE;
  } else if (VariantIsEmpty(variant_value)) {
    *value = Json::Value::null;
  } else if (variant_value.vt == VT_NULL) {
    *value = Json::Value::null;
  } else if (VariantIsIDispatch(variant_value)) {
    if (VariantIsArray(variant_value) ||
        VariantIsElementCollection(variant_value)) {
      Json::Value result_array(Json::arrayValue);

      long length = 0;
      status_code = GetArrayLength(variant_value.pdispVal, &length);

      for (long i = 0; i < length; ++i) {
        Json::Value array_item_result;
        int array_item_status = GetArrayItem(executor,
                                             variant_value.pdispVal,
                                             i,
                                             &array_item_result);
        result_array[i] = array_item_result;
      }
      *value = result_array;
    } else if (VariantIsObject(variant_value)) {
      Json::Value result_object;
      std::vector<std::wstring> property_names;
      status_code = GetPropertyNameList(variant_value.pdispVal,
                                        &property_names);

      for (size_t i = 0; i < property_names.size(); ++i) {
        CComVariant property_value_variant;
        GetVariantObjectPropertyValue(variant_value.pdispVal,
                                      property_names[i],
                                      &property_value_variant);

        Json::Value property_value;
        ConvertVariantToJsonValue(executor,
                                  property_value_variant,
                                  &property_value);

        std::string name = StringUtilities::ToString(property_names[i]);
        result_object[name] = property_value;
      }
      *value = result_object;
    } else {
      LOG(INFO) << "Unknown type of dispatch is found in result, assuming IHTMLElement";
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      CComPtr<IHTMLElement> node;
      variant_value.pdispVal->QueryInterface<IHTMLElement>(&node);
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

bool VariantUtilities::GetVariantObjectPropertyValue(IDispatch* variant_object_dispatch,
                                                     std::wstring property_name,
                                                     VARIANT* property_value) {
  LPOLESTR property_name_pointer = reinterpret_cast<LPOLESTR>(const_cast<wchar_t*>(property_name.data()));
  DISPID dispid_property;
  HRESULT hr = variant_object_dispatch->GetIDsOfNames(IID_NULL,
                                                      &property_name_pointer,
                                                      1,
                                                      LOCALE_USER_DEFAULT,
                                                      &dispid_property);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get dispatch ID (dispid) for property "
                    << StringUtilities::ToString(property_name);
    return false;
  }

  // get the value of eval result
  DISPPARAMS no_args_dispatch_parameters = { 0 };
  hr = variant_object_dispatch->Invoke(dispid_property,
                                       IID_NULL,
                                       LOCALE_USER_DEFAULT,
                                       DISPATCH_PROPERTYGET,
                                       &no_args_dispatch_parameters,
                                       property_value,
                                       NULL,
                                       NULL);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get result for property "
                    << StringUtilities::ToString(property_name);
    return false;
  }
  return true;
}

std::wstring VariantUtilities::GetVariantObjectTypeName(VARIANT value) {
  std::wstring name = L"";
  if (value.vt == VT_DISPATCH && value.pdispVal) {
    CComPtr<ITypeInfo> typeinfo;
    HRESULT get_type_info_result = value.pdispVal->GetTypeInfo(0,
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

int VariantUtilities::GetPropertyNameList(IDispatch* object_dispatch,
                                          std::vector<std::wstring>* property_names) {
  LOG(TRACE) << "Entering Script::GetPropertyNameList";

  CComPtr<IDispatchEx> dispatchex;
  HRESULT hr = object_dispatch->QueryInterface<IDispatchEx>(&dispatchex);
  DISPID current_disp_id;
  hr = dispatchex->GetNextDispID(fdexEnumAll, DISPID_STARTENUM, &current_disp_id);
  while (hr == S_OK) {
    CComBSTR member_name_bstr;
    dispatchex->GetMemberName(current_disp_id, &member_name_bstr);
    std::wstring member_name = member_name_bstr;
    property_names->push_back(member_name);
    hr = dispatchex->GetNextDispID(fdexEnumAll, current_disp_id, &current_disp_id);
  }
  return WD_SUCCESS;
}

int VariantUtilities::GetArrayLength(IDispatch* array_dispatch, long* length) {
  LOG(TRACE) << "Entering Script::GetArrayLength";
  CComVariant length_result;
  bool get_length_success = GetVariantObjectPropertyValue(array_dispatch,
                                                          L"length",
                                                          &length_result);
  if (!get_length_success) {
    // Failure already logged by GetVariantObjectPropertyValue
    return EUNEXPECTEDJSERROR;
  }

  *length = length_result.lVal;
  return WD_SUCCESS;
}

int VariantUtilities::GetArrayItem(const IECommandExecutor& executor,
                         IDispatch* array_dispatch,
                         long index,
                         Json::Value* item){
  LOG(TRACE) << "Entering Script::GetArrayItem";
  std::wstring index_string = std::to_wstring(static_cast<long long>(index));
  CComVariant array_item_variant;
  bool get_array_item_success = GetVariantObjectPropertyValue(array_dispatch,
                                                              index_string,
                                                              &array_item_variant);

  if (!get_array_item_success) {
    // Failure already logged by GetVariantObjectPropertyValue
    return EUNEXPECTEDJSERROR;
  }
  
  int array_item_status = ConvertVariantToJsonValue(executor,
                                                    array_item_variant,
                                                    item);
  return WD_SUCCESS;
}

} // namespace webdriver
