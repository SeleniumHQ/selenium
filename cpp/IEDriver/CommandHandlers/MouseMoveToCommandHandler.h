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

#ifndef WEBDRIVER_IE_MOUSEMOVETOCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSEMOVETOCOMMANDHANDLER_H_

#include "interactions.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class MouseMoveToCommandHandler : public IECommandHandler {
 public:
  MouseMoveToCommandHandler(void) {
  }

  virtual ~MouseMoveToCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    ParametersMap::const_iterator element_parameter_iterator = command_parameters.find("element");
    ParametersMap::const_iterator xoffset_parameter_iterator = command_parameters.find("xoffset");
    ParametersMap::const_iterator yoffset_parameter_iterator = command_parameters.find("yoffset");
    bool element_specified(element_parameter_iterator != command_parameters.end());
    bool offset_specified((xoffset_parameter_iterator != command_parameters.end()) &&
                          (yoffset_parameter_iterator != command_parameters.end()));
    if (!element_specified && !offset_specified) {
      response->SetErrorResponse(400,
                                 "Missing parameters: element, xoffset, yoffset");
      return;
    } else {
      int status_code = SUCCESS;
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      BrowserHandle browser_wrapper;
      status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code,
                                    "Unable to get browser");
        return;
      }

      if (executor.enable_native_events()) {
        long start_x = executor.last_known_mouse_x();
        long start_y = executor.last_known_mouse_y();

        long end_x = start_x;
        long end_y = start_y;
        if (element_specified && !element_parameter_iterator->second.isNull()) {
          std::string element_id = element_parameter_iterator->second.asString();
          status_code = this->GetElementCoordinates(executor,
                                                    element_id,
                                                    offset_specified,
                                                    &end_x,
                                                    &end_y);
          if (status_code != SUCCESS) {
            response->SetErrorResponse(status_code,
                                       "Unable to locate element with id " + element_id);
          }
        }

        if (offset_specified) {
          end_x += xoffset_parameter_iterator->second.asInt();
          end_y += yoffset_parameter_iterator->second.asInt();
        }

        HWND browser_window_handle = browser_wrapper->GetWindowHandle();
        LRESULT move_result = mouseMoveTo(browser_window_handle,
                                          executor.speed(),
                                          start_x,
                                          start_y,
                                          end_x,
                                          end_y);

        mutable_executor.set_last_known_mouse_x(end_x);
        mutable_executor.set_last_known_mouse_y(end_y);
      } else { // Fall back on synthesized events.
        std::wstring script_source = L"(function() { return function(){" + 
                                      atoms::asString(atoms::INPUTS) + 
                                      L"; return webdriver.atoms.inputs.mouseMove(arguments[0], arguments[1], arguments[2], arguments[3]);" + 
                                      L"};})();";

        CComPtr<IHTMLDocument2> doc;
        browser_wrapper->GetDocument(&doc);
        Script script_wrapper(doc, script_source, 4);

        if (element_specified && !element_parameter_iterator->second.isNull()) {
          std::string element_id = element_parameter_iterator->second.asString();
          ElementHandle target_element;
          int status_code = this->GetElement(executor, element_id, &target_element);
          script_wrapper.AddArgument(target_element->element());
        } else {
          script_wrapper.AddNullArgument();
        }

        int x_offset = 0;
        int y_offset = 0;
        if (offset_specified) {
          x_offset = xoffset_parameter_iterator->second.asInt();
          y_offset = yoffset_parameter_iterator->second.asInt();
          script_wrapper.AddArgument(x_offset);
          script_wrapper.AddArgument(y_offset);
        } else {
          script_wrapper.AddNullArgument();
          script_wrapper.AddNullArgument();
        }

        script_wrapper.AddArgument(executor.mouse_state());
        status_code = script_wrapper.Execute();
        if (status_code == SUCCESS) {
          mutable_executor.set_mouse_state(script_wrapper.result());
        } else {
          LOG(WARN) << "Unable to execute js to mose move";
        }
      }
      response->SetSuccessResponse(Json::Value::null);
      return;
    }
  }

 private:
  int MouseMoveToCommandHandler::GetElementCoordinates(const IECommandExecutor& executor,
                                                       const std::string& element_id,
                                                       bool get_element_origin,
                                                       long *x_coordinate,
                                                       long *y_coordinate) {
    ElementHandle target_element;
    int status_code = this->GetElement(executor, element_id, &target_element);
    if (status_code != SUCCESS) {
      LOG(WARN) << "Unable to get element";
      return status_code;
    }

    long element_x = 0, element_y = 0, element_width = 0, element_height = 0;
    status_code = target_element->GetLocationOnceScrolledIntoView(executor.scroll_behavior(),
                                                                  &element_x,
                                                                  &element_y,
                                                                  &element_width,
                                                                  &element_height);
    // We can't use the status code alone here. GetLocationOnceScrolledIntoView
    // returns EELEMENTNOTDISPLAYED if the element is visible, but the click
    // point (the center of the element) is not within the viewport. However,
    // we might still be able to move to whatever portion of the element *is*
    // visible in the viewport, so we have to have an extra check.
    if (status_code != SUCCESS && element_width == 0 && element_height == 0) {
      LOG(WARN) << "Unable to get location after scrolling or element sizes are zero";
      return status_code;
    }

    if (get_element_origin) {
      *x_coordinate = element_x;
      *y_coordinate = element_y;
    } else {
      LOG(INFO) << "Checking whether element has single text node.";
      BrowserHandle browser_wrapper;
      executor.GetCurrentBrowser(&browser_wrapper);
      CComPtr<IHTMLDocument2> doc;
      browser_wrapper->GetDocument(&doc);
      if (this->HasDirectTextNode(doc, target_element)) {
        LOG(INFO) << "Element has single text node. Will use the middle of that.";
        std::pair<int, int> textSize = this->GetBoundariesOfElementText(executor, doc, target_element);

        // Get middle of selection if there's only one text node.
        *x_coordinate = element_x + textSize.first / 2;
        *y_coordinate = element_y + textSize.second / 2;
      } else {
        *x_coordinate = element_x + (element_width / 2);
        *y_coordinate = element_y + (element_height / 2);
      }
    }

    return SUCCESS;
  }

  bool MouseMoveToCommandHandler::HasDirectTextNode(CComPtr<IHTMLDocument2> doc,
                                                    ElementHandle target_element) {
    std::wstring script_source = L"(function() { return function() { var e = arguments[0]; ";
    script_source += L"return (e.childNodes.length > 1) && (e.childNodes[0].nodeType == 3); };})();";

    LOG(INFO) << "Executing: " << string(script_source.begin(), script_source.end());
    Script script_wrapper(doc, script_source, 1);

    script_wrapper.AddArgument(target_element->element());
    int status_code = script_wrapper.Execute();
    if (status_code == SUCCESS) {
      std::string res;
      script_wrapper.ConvertResultToString(&res);
      return (res == "true");
    } else {
      LOG(WARN) << "Unable to execute js to detect if there is a single text node. Error: " << status_code; 
    }
    return false;
  }

  std::pair<int, int> GetBoundariesOfElementText(const IECommandExecutor& executor,
      CComPtr<IHTMLDocument2> doc, ElementHandle target_element) {
    std::wstring script_source = L"(function() { return function() { var e = arguments[0]; ";
    script_source += L"var tr = document.body.createTextRange(); tr.moveToElementText(e);";
    script_source += L"return [tr.boundingHeight, tr.boundingWidth]; };})();";

    LOG(INFO) << "Executing: " << string(script_source.begin(), script_source.end());
    Script script_wrapper(doc, script_source, 1);

    script_wrapper.AddArgument(target_element->element());
    int status_code = script_wrapper.Execute();
    if (status_code == SUCCESS) {
      Json::Value boundaries_array;
      script_wrapper.ConvertResultToJsonValue(executor, &boundaries_array);
      Json::UInt index = 0;
      Json::Value& height(boundaries_array[index]);
      index++;
      Json::Value& width(boundaries_array[index]);
      LOG(INFO) << "Got height: " << height << " and width: " << width;
      return std::make_pair(width.asInt(), height.asInt());
    } else {
      LOG(WARN) << "Unable to execute js to detect if there is a single text node. Error: " << status_code; 
    }
    return std::make_pair(0, 0);
  }

};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSEMOVETOCOMMANDHANDLER_H_
