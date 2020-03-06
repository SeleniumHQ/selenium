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

#ifndef WEBDRIVER_IE_VARIANTUTILITIES_H
#define WEBDRIVER_IE_VARIANTUTILITIES_H

#include <string>
#include <vector>

// Forward declaration of classes to avoid
// circular include files.
namespace Json {
  class Value;
} // namespace Json

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class IECommandExecutor;
class IElementManager;

class VariantUtilities {
 private:
  VariantUtilities(void);
  ~VariantUtilities(void);
 public:
  static bool VariantIsEmpty(VARIANT value);
  static bool VariantIsString(VARIANT value);
  static bool VariantIsInteger(VARIANT value);
  static bool VariantIsBoolean(VARIANT value);
  static bool VariantIsDouble(VARIANT value);
  static bool VariantIsArray(VARIANT value);
  static bool VariantIsObject(VARIANT value);
  static bool VariantIsElement(VARIANT value);
  static bool VariantIsElementCollection(VARIANT value);
  static bool VariantIsIDispatch(VARIANT value);
  static int VariantAsJsonValue(IElementManager* element_manager,
                                VARIANT variant_value,
                                Json::Value* value);
  static bool GetVariantObjectPropertyValue(IDispatch* variant_object,
                                            std::wstring property_name,
                                            VARIANT* property_value);

 private:
  static std::wstring GetVariantObjectTypeName(VARIANT value);
  static int GetArrayLength(IDispatch* array_dispatch, long* length);
  static int GetArrayItem(IDispatch* array_dispatch,
                          long index,
                          VARIANT* item);
  static int GetPropertyNameList(IDispatch* object_dispatch,
                                 std::vector<std::wstring>* property_names);
  static bool HasSelfReferences(VARIANT current_object,
                                std::vector<IDispatch*>* visited);
  static int ConvertVariantToJsonValue(IElementManager* element_manager,
                                       VARIANT variant_value,
                                       Json::Value* value);
  static bool ExecuteToJsonMethod(VARIANT object_to_serialize,
                                  VARIANT* json_object_variant);
  static int GetAllVariantObjectPropertyValues(IElementManager* element_manager,
                                               VARIANT variant_value,
                                               Json::Value* value);
};

} // namespace webdriver

#endif  // WEBDRIVER_IE_VARIANTUTILITIES_H
