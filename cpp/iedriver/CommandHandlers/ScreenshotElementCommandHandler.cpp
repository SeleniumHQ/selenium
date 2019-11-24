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

#include "ScreenshotElementCommandHandler.h"
#include "errorcodes.h"
#include "logging.h"
#include "../Browser.h"
#include "../Element.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"

namespace webdriver {

ScreenshotElementCommandHandler::ScreenshotElementCommandHandler(void) {
}

ScreenshotElementCommandHandler::~ScreenshotElementCommandHandler(void) {
}

void ScreenshotElementCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  LOG(TRACE) << "Entering ScreenshotCommandHandler::ExecuteInternal";
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  }

  std::string element_id = id_parameter_iterator->second.asString();

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get browser");
    return;
  }

  ElementHandle element_wrapper;
  status_code = this->GetElement(executor, element_id, &element_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code,
                               "Could not get element of which to take a screenshot");
    return;
  }

  // Scroll the target element into view before executing the action
  // sequence.
  LocationInfo location = {};
  std::vector<LocationInfo> frame_locations;
  status_code = element_wrapper->GetLocationOnceScrolledIntoView(executor.input_manager()->scroll_behavior(),
                                                                 &location,
                                                                 &frame_locations);

  bool displayed;
  status_code = element_wrapper->IsDisplayed(true, &displayed);
  if (status_code != WD_SUCCESS || !displayed) {
    response->SetErrorResponse(EELEMENTNOTDISPLAYED,
                               "Element is not displayed");
    return;
  }

  status_code = this->GenerateScreenshotImage(browser_wrapper);
  if (status_code != WD_SUCCESS) {
    // TODO: Return a meaningful error here.
    response->SetSuccessResponse("");
    return;
  }

  this->CropImage(browser_wrapper->GetContentWindowHandle(), location);

  // now either correct or single color image is got
  std::string base64_screenshot = "";
  HRESULT hr = this->GetBase64Data(base64_screenshot);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to transform browser image to Base64 format";
    this->ClearImage();
    response->SetSuccessResponse("");
    return;
  }

  this->ClearImage();
  response->SetSuccessResponse(base64_screenshot);
}

} // namespace webdriver
