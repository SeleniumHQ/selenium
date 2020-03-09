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
#include "Script.h"
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
  if (value.vt != VT_DISPATCH) {
    return false;
  }

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
  if (type_name == L"JScriptTypeInfo" || type_name == L"") {
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
  if (value.vt != VT_DISPATCH) {
    return false;
  }
  std::wstring type_name = GetVariantObjectTypeName(value);
  if (type_name == L"JScriptTypeInfo") {
    return true;
  }
  return false;
}

int VariantUtilities::VariantAsJsonValue(IElementManager* element_manager,
                                         VARIANT variant_value,
                                         Json::Value* value) {
  std::vector<IDispatch*> visited;
  if (HasSelfReferences(variant_value, &visited)) {
    return EUNEXPECTEDJSERROR;
  }
  return ConvertVariantToJsonValue(element_manager, variant_value, value);
}

bool VariantUtilities::HasSelfReferences(VARIANT current_object,
                                         std::vector<IDispatch*>* visited) {
  int status_code = WD_SUCCESS;
  bool has_self_references = false;
  if (VariantIsArray(current_object) || VariantIsObject(current_object)) {
    std::vector<std::wstring> property_names;
    if (VariantIsArray(current_object)) {
      long length = 0;
      status_code = GetArrayLength(current_object.pdispVal, &length);
      for (long index = 0; index < length; ++index) {
        std::wstring index_string = std::to_wstring(static_cast<long long>(index));
        property_names.push_back(index_string);
      }
    } else {
      status_code = GetPropertyNameList(current_object.pdispVal,
                                        &property_names);
    }

    visited->push_back(current_object.pdispVal);
    for (size_t i = 0; i < property_names.size(); ++i) {
      CComVariant property_value;
      GetVariantObjectPropertyValue(current_object.pdispVal,
                                    property_names[i],
                                    &property_value);
      if (VariantIsIDispatch(property_value)) {
        for (size_t i = 0; i < visited->size(); ++i) {
          CComPtr<IDispatch> visited_dispatch((*visited)[i]);
          if (visited_dispatch.IsEqualObject(property_value.pdispVal)) {
            return true;
          }
        }
        has_self_references = has_self_references || HasSelfReferences(property_value, visited);
        if (has_self_references) {
          break;
        }
      }
    }
    visited->pop_back();
  }
  return has_self_references;
}

int VariantUtilities::ConvertVariantToJsonValue(IElementManager* element_manager,
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
    double int_part;
    if (std::modf(variant_value.dblVal, &int_part) == 0.0) {
      // This bears some explaining. Due to inconsistencies between versions
      // of the JSON serializer we use, if the value is floating-point, but
      // has no fractional part, convert it to a 64-bit integer so that it
      // will be serialized in a way consistent with language bindings'
      // expectations.
      *value = static_cast<long long>(int_part);
    } else {
      *value = variant_value.dblVal;
    }
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
      if (status_code != WD_SUCCESS) {
        LOG(WARN) << "Did not successfully get array length.";
        return EUNEXPECTEDJSERROR;
      }

      for (long i = 0; i < length; ++i) {
        CComVariant array_item;
        int array_item_status = GetArrayItem(variant_value.pdispVal,
                                             i,
                                             &array_item);
        if (array_item_status != WD_SUCCESS) {
          LOG(WARN) << "Did not successfully get item with index "
                    << i << " from array.";
          return EUNEXPECTEDJSERROR;
        }
        Json::Value array_item_result;
        ConvertVariantToJsonValue(element_manager,
                                  array_item,
                                  &array_item_result);
        result_array[i] = array_item_result;
      }
      *value = result_array;
    } else if (VariantIsObject(variant_value)) {
      Json::Value result_object(Json::objectValue);
      CComVariant json_serialized;
      if (ExecuteToJsonMethod(variant_value, &json_serialized)) {
        ConvertVariantToJsonValue(element_manager, json_serialized, &result_object);
      } else {
        int property_enum_status = GetAllVariantObjectPropertyValues(element_manager,
                                                                     variant_value,
                                                                     &result_object);
        if (property_enum_status != WD_SUCCESS) {
          return EUNEXPECTEDJSERROR;
        }
      }
      *value = result_object;
    } else {
      CComPtr<IHTMLElement> node;
      HRESULT hr = variant_value.pdispVal->QueryInterface<IHTMLElement>(&node);
      if (FAILED(hr)) {
        LOG(DEBUG) << "Unknown type of dispatch not IHTMLElement, checking for IHTMLWindow2";
        CComPtr<IHTMLWindow2> window_node;
        hr = variant_value.pdispVal->QueryInterface<IHTMLWindow2>(&window_node);
        if (SUCCEEDED(hr) && window_node) {
          // TODO: We need to track window objects and return a custom JSON
          // object according to the spec, but that will require a fair
          // amount of refactoring.
          LOG(WARN) << "Returning window object from JavaScript is not supported";
          return EUNEXPECTEDJSERROR;
        }

        LOG(DEBUG) << "Unknown type of dispatch not IHTMLWindow2, checking for toJSON function";
        CComVariant json_serialized_variant;
        if (ExecuteToJsonMethod(variant_value, &json_serialized_variant)) {
          Json::Value interim_value;
          ConvertVariantToJsonValue(element_manager,
                                    json_serialized_variant,
                                    &interim_value);
          *value = interim_value;
          return WD_SUCCESS;
        }

        UINT typeinfo_count = 0;
        variant_value.pdispVal->GetTypeInfoCount(&typeinfo_count);
        if (typeinfo_count != 0) {
          LOG(DEBUG) << "Unknown type of dispatch with no toJSON function, "
                     << "trying to blindly enumerate properties";
          Json::Value final_result_object;
          int property_enum_status = GetAllVariantObjectPropertyValues(element_manager,
                                                                       variant_value,
                                                                       &final_result_object);
          if (property_enum_status != WD_SUCCESS) {
            return EUNEXPECTEDJSERROR;
          }
          *value = final_result_object;
          return WD_SUCCESS;
        }
        // We've already done our best to check if the object is an array or
        // an object. We now know it doesn't implement IHTMLElement. We have
        // no choice but to throw up our hands here.
        LOG(WARN) << "Dispatch value is not recognized as a JavaScript object, array, or element reference";
        return EUNEXPECTEDJSERROR;
      }
      ElementHandle element_wrapper;
      bool element_added = element_manager->AddManagedElement(node, &element_wrapper);
      Json::Value element_value(Json::objectValue);
      element_value[JSON_ELEMENT_PROPERTY_NAME] = element_wrapper->element_id();
      *value = element_value;
    }
  } else {
    LOG(WARN) << "Unknown type of result is found";
    status_code = EUNKNOWNSCRIPTRESULT;
  }
  return status_code;
}

bool VariantUtilities::ExecuteToJsonMethod(VARIANT object_to_serialize,
                                           VARIANT* json_object_variant) {
  CComVariant to_json_method;
  bool has_to_json_property = GetVariantObjectPropertyValue(object_to_serialize.pdispVal,
                                                            L"toJSON",
                                                            &to_json_method);
  if (!has_to_json_property) {
    LOG(DEBUG) << "No toJSON property found on IDispatch";
    return false;
  }

  // Grab the "call" method out of the returned function
  DISPID call_member_id;
  OLECHAR FAR* call_member_name = L"call";
  HRESULT hr = to_json_method.pdispVal->GetIDsOfNames(IID_NULL,
                                                      &call_member_name,
                                                      1,
                                                      LOCALE_USER_DEFAULT,
                                                      &call_member_id);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Cannot locate call method on toJSON function";
    return false;
  }

  // IDispatch::Invoke() expects the arguments to be passed into it
  // in reverse order. To accomplish this, we create a new variant
  // array of size n + 1 where n is the number of arguments we have.
  // we copy each element of arguments_array_ into the new array in
  // reverse order, and add an extra argument, the window object,
  // to the end of the array to use as the "this" parameter for the
  // function invocation.
  std::vector<CComVariant> argument_array(1);
  argument_array[0].Copy(&object_to_serialize);

  DISPPARAMS call_parameters = { 0 };
  memset(&call_parameters, 0, sizeof call_parameters);
  call_parameters.cArgs = static_cast<unsigned int>(argument_array.size());
  call_parameters.rgvarg = &argument_array[0];

  CComBSTR error_description = L"";

  int return_code = WD_SUCCESS;
  EXCEPINFO exception;
  memset(&exception, 0, sizeof exception);
  hr = to_json_method.pdispVal->Invoke(call_member_id,
                                       IID_NULL,
                                       LOCALE_USER_DEFAULT,
                                       DISPATCH_METHOD,
                                       &call_parameters,
                                       json_object_variant,
                                       &exception,
                                       0);

  if (FAILED(hr)) {
    if (DISP_E_EXCEPTION == hr) {
      error_description = exception.bstrDescription ? exception.bstrDescription : L"EUNEXPECTEDJSERROR";
      CComBSTR error_source(exception.bstrSource ? exception.bstrSource : L"EUNEXPECTEDJSERROR");
      LOG(INFO) << "Exception message was: '" << error_description << "'";
      LOG(INFO) << "Exception source was: '" << error_source << "'";
    }
    else {
      LOGHR(DEBUG, hr) << "Failed to execute anonymous function, no exception information retrieved";
    }
    return false;
  }

  return true;
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
    // Only log failures to find dispid to debug level, not warn level.
    // Querying for the existence of a property is a normal thing to
    // want to accomplish.
    LOGHR(DEBUG, hr) << "Unable to get dispatch ID (dispid) for property "
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
  hr = dispatchex->GetNextDispID(fdexEnumAll,
                                 DISPID_STARTENUM,
                                 &current_disp_id);
  while (hr == S_OK) {
    CComBSTR member_name_bstr;
    dispatchex->GetMemberName(current_disp_id, &member_name_bstr);
    std::wstring member_name = member_name_bstr;
    property_names->push_back(member_name);
    hr = dispatchex->GetNextDispID(fdexEnumAll,
                                   current_disp_id,
                                   &current_disp_id);
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

int VariantUtilities::GetArrayItem(IDispatch* array_dispatch,
                                   long index,
                                   VARIANT* item){
  LOG(TRACE) << "Entering Script::GetArrayItem";
  std::wstring index_string = std::to_wstring(static_cast<long long>(index));
  CComVariant array_item_variant;
  bool get_array_item_success = GetVariantObjectPropertyValue(array_dispatch,
                                                              index_string,
                                                              item);

  if (!get_array_item_success) {
    // Array-like item doesn't have indexed items; try using the
    // 'item' method to access the elements in the collection.
    LPOLESTR item_method_pointer = L"item";
    DISPID dispid_item;
    HRESULT hr = array_dispatch->GetIDsOfNames(IID_NULL,
                                               &item_method_pointer,
                                               1,
                                               LOCALE_USER_DEFAULT,
                                               &dispid_item);
    if (FAILED(hr)) {
      return EUNEXPECTEDJSERROR;
    }

    std::vector<CComVariant> argument_array_copy(2);
    argument_array_copy[0] = index;
    argument_array_copy[1] = array_dispatch;
    DISPPARAMS call_parameters = { 0 };
    memset(&call_parameters, 0, sizeof call_parameters);
    call_parameters.cArgs = 2;
    call_parameters.rgvarg = &argument_array_copy[0];
    hr = array_dispatch->Invoke(dispid_item,
                                IID_NULL,
                                LOCALE_USER_DEFAULT,
                                DISPATCH_METHOD,
                                &call_parameters,
                                item,
                                NULL,
                                NULL);
    if (FAILED(hr)) {
      return EUNEXPECTEDJSERROR;
    }
  }
  return WD_SUCCESS;
}

int VariantUtilities::GetAllVariantObjectPropertyValues(IElementManager* element_manager,
                                                        VARIANT variant_value,
                                                        Json::Value* value) {
  std::vector<std::wstring> property_names;
  GetPropertyNameList(variant_value.pdispVal, &property_names);

  for (size_t i = 0; i < property_names.size(); ++i) {
    CComVariant property_value_variant;
    bool property_value_retrieved =
      GetVariantObjectPropertyValue(variant_value.pdispVal,
                                    property_names[i],
                                    &property_value_variant);
    if (!property_value_retrieved) {
      LOG(WARN) << "Did not successfully get value for property '"
                << StringUtilities::ToString(property_names[i])
                << "' from object.";
      return EUNEXPECTEDJSERROR;
    }

    Json::Value property_value;
    ConvertVariantToJsonValue(element_manager,
                              property_value_variant,
                              &property_value);

    std::string name = StringUtilities::ToString(property_names[i]);
    (*value)[name] = property_value;
  }

  return WD_SUCCESS;
}

} // namespace webdriver
