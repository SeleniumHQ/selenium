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

#ifndef WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_

#include "../IECommandHandler.h"
#include "../DocumentHost.h"
#include <atlimage.h>
#include <atlenc.h>

namespace webdriver {

class ScreenshotCommandHandler : public IECommandHandler {
 public:
  ScreenshotCommandHandler(void);
  virtual ~ScreenshotCommandHandler(void);

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const ParametersMap& command_parameters,
                       Response* response);
  int GenerateScreenshotImage(BrowserHandle browser_wrapper);
  HRESULT GetBase64Data(std::string& data);
  void ClearImage();
  void CropImage(HWND content_window_handle, LocationInfo element_location);

 private:
  HRESULT CaptureViewport(BrowserHandle browser);
  void CaptureWindow(HWND window_handle,
                     long width,
                     long height);
  bool IsSameColour();
  void GetWindowDimensions(HWND window_handle,
                           int* width,
                           int* height);

  ATL::CImage* image_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_
