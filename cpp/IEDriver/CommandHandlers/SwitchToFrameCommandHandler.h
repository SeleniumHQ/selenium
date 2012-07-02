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

#ifndef WEBDRIVER_IE_SWITCHTOFRAMECOMMANDHANDLER_H_
#define WEBDRIVER_IE_SWITCHTOFRAMECOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class SwitchToFrameCommandHandler : public IECommandHandler {
 public:
  SwitchToFrameCommandHandler(void) {
  }

  virtual ~SwitchToFrameCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    Json::Value frame_id = Json::Value::null;
    ParametersMap::const_iterator it = command_parameters.find("id");
    if (it != command_parameters.end()) {
      frame_id = it->second;
    } else {
      response->SetErrorResponse(400, "Missing parameter: id");
      return;
    }
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    if (frame_id.isNull()) {
      status_code = browser_wrapper->SetFocusedFrameByElement(NULL);
    } else if (frame_id.isObject()) {
      Json::Value element_id = frame_id.get("ELEMENT", Json::Value::null);
      if (element_id.isNull()) {
        status_code = ENOSUCHFRAME;
      } else {
        std::string frame_element_id = element_id.asString();

        ElementHandle frame_element_wrapper;
        status_code = this->GetElement(executor,
                                       frame_element_id,
                                       &frame_element_wrapper);
        if (status_code == SUCCESS) {
          status_code = browser_wrapper->SetFocusedFrameByElement(frame_element_wrapper->element());
        }
      }
    } else if (frame_id.isString()) {
      std::string frame_name = frame_id.asString();
      status_code = browser_wrapper->SetFocusedFrameByName(frame_name);
    } else if(frame_id.isIntegral()) {
      int frame_index = frame_id.asInt();
      status_code = browser_wrapper->SetFocusedFrameByIndex(frame_index);
    }

    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "No frame found");
    } else {
      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SWITCHTOFRAMECOMMANDHANDLER_H_
