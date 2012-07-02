// Copyright 2011 Software Freedom Conservancy
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

#ifndef WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class ExecuteScriptCommandHandler : public IECommandHandler {
 public:
  ExecuteScriptCommandHandler(void) {
  }

  virtual ~ExecuteScriptCommandHandler(void) {
  }

 protected:
  virtual void ExecuteInternal(const IECommandExecutor& executor,
                               const LocatorMap& locator_parameters,
                               const ParametersMap& command_parameters,
                               Response* response) {
    ParametersMap::const_iterator script_parameter_iterator = command_parameters.find("script");
    ParametersMap::const_iterator args_parameter_iterator = command_parameters.find("args");
    if (script_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: script");
      return;
    } else if (args_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: args");
      return;
    } else {
      std::string script_body = script_parameter_iterator->second.asString();
      const std::string script_source = "(function() { return function(){" + script_body + "};})();";

      Json::Value json_args(args_parameter_iterator->second);

      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }

      CComPtr<IHTMLDocument2> doc;
      browser_wrapper->GetDocument(&doc);
      Script script_wrapper(doc, script_source, json_args.size());
      status_code = this->PopulateArgumentArray(executor,
                                                script_wrapper,
                                                json_args);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Error setting arguments for script");
        return;
      }

      status_code = script_wrapper.Execute();

      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "JavaScript error");
        return;
      } else {
        Json::Value script_result;
        script_wrapper.ConvertResultToJsonValue(executor, &script_result);
        response->SetSuccessResponse(script_result);
        return;
      }
    }
  }

  int PopulateArgumentArray(const IECommandExecutor& executor,
                            Script& script_wrapper,
                            Json::Value json_args) {
    int status_code = SUCCESS;
    for (UINT arg_index = 0; arg_index < json_args.size(); ++arg_index) {
      Json::Value arg = json_args[arg_index];
      status_code = this->AddArgument(executor, script_wrapper, arg);
      if (status_code != SUCCESS) {
        break;
      }
    }

    return status_code;
  }

  int AddArgument(const IECommandExecutor& executor,
                  Script& script_wrapper,
                  Json::Value arg) {
    int status_code = SUCCESS;
    if (arg.isString()) {
      std::string value = arg.asString();
      script_wrapper.AddArgument(value);
    } else if (arg.isInt()) {
      int int_number = arg.asInt();
      script_wrapper.AddArgument(int_number);
    } else if (arg.isDouble()) {
      double dbl_number = arg.asDouble();
      script_wrapper.AddArgument(dbl_number);
    } else if (arg.isBool()) {
      bool bool_arg = arg.asBool();
      script_wrapper.AddArgument(bool_arg);
    } else if (arg.isNull()) {
      script_wrapper.AddNullArgument();
    } else if (arg.isArray()) {
      this->WalkArray(executor, script_wrapper, arg);
    } else if (arg.isObject()) {
      if (arg.isMember("ELEMENT")) {
        std::string element_id = arg["ELEMENT"].asString();

        ElementHandle element_wrapper;
        status_code = this->GetElement(executor, element_id, &element_wrapper);
        if (status_code == SUCCESS) {
          script_wrapper.AddArgument(element_wrapper);
        }
      } else {
        this->WalkObject(executor, script_wrapper, arg);
      }
    }

    return status_code;
  }

  int WalkArray(const IECommandExecutor& executor,
                Script& script_wrapper,
                Json::Value array_value) {
    int status_code = SUCCESS;
    Json::UInt array_size = array_value.size();
    std::wstring array_script = L"(function(){ return function() { return [";
    for (Json::UInt index = 0; index < array_size; ++index) {
      if (index != 0) {
        array_script += L",";
      }
      std::vector<wchar_t> index_buffer(10);
      _itow_s(index, &index_buffer[0], 10, 10);
      std::wstring index_string(&index_buffer[0]);
      array_script += L"arguments[" + index_string + L"]";
    }
    array_script += L"];}})();";

    BrowserHandle browser;
    executor.GetCurrentBrowser(&browser);

    CComPtr<IHTMLDocument2> doc;
    browser->GetDocument(&doc);
    Script array_script_wrapper(doc, array_script, array_size);
    for (Json::UInt index = 0; index < array_size; ++index) {
      status_code = this->AddArgument(executor,
                                      array_script_wrapper,
                                      array_value[index]);
      if (status_code != SUCCESS) {
        break;
      }
    }
    
    if (status_code == SUCCESS) {
      status_code = array_script_wrapper.Execute();
    }

    if (status_code == SUCCESS) {
      script_wrapper.AddArgument(array_script_wrapper.result());
    }

    return status_code;
  }

  int WalkObject(const IECommandExecutor& executor,
                 Script& script_wrapper,
                 Json::Value object_value) {
    int status_code = SUCCESS;
    Json::Value::iterator it = object_value.begin();
    int counter = 0;
    std::string object_script = "(function(){ return function() { return {";
    for (; it != object_value.end(); ++it) {
      if (counter != 0) {
        object_script += ",";
      }
      std::vector<char> counter_buffer(10);
      _itoa_s(counter, &counter_buffer[0], 10, 10);
      std::string counter_string = &counter_buffer[0];
      std::string name = it.memberName();
      object_script += name + ":arguments[" + counter_string + "]";
      ++counter;
    }
    object_script += "};}})();";

    BrowserHandle browser;
    executor.GetCurrentBrowser(&browser);

    CComPtr<IHTMLDocument2> doc;
    browser->GetDocument(&doc);
    Script object_script_wrapper(doc, object_script, counter);
    for (it = object_value.begin(); it != object_value.end(); ++it) {
      status_code = this->AddArgument(executor,
                                      object_script_wrapper,
                                      object_value[it.memberName()]);
      if (status_code != SUCCESS) {
        break;
      }
    }

    if (status_code == SUCCESS) {
      status_code = object_script_wrapper.Execute();
    }

    if (status_code == SUCCESS) {
      script_wrapper.AddArgument(object_script_wrapper.result());
    }
    return status_code;
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_
