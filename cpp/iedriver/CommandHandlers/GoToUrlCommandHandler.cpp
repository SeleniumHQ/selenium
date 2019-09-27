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

#include "GoToUrlCommandHandler.h"
#include <shlwapi.h>
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../StringUtilities.h"

namespace webdriver {

GoToUrlCommandHandler::GoToUrlCommandHandler(void) {
}

GoToUrlCommandHandler::~GoToUrlCommandHandler(void) {
}

void GoToUrlCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator url_parameter_iterator = command_parameters.find("url");
  if (url_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: url");
    return;
  } else {
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Unable to get browser");
      return;
    }

    // TODO: PathIsURL isn't quite the right thing. We need to
    // find the correct API that will parse the URL to tell 
    // us whether the URL is valid according to the URL spec.
    std::string url = url_parameter_iterator->second.asString();
    std::wstring wide_url = StringUtilities::ToWString(url);
    BOOL is_valid = ::PathIsURL(wide_url.c_str());
    if (is_valid != TRUE) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Specified URL (" + url + ") is not valid.");
      return;
    }

    bool is_file_url = ::UrlIsFileUrl(wide_url.c_str()) == TRUE;
    if (is_file_url) {
      DWORD path_length = MAX_PATH;
      std::vector<wchar_t> buffer(path_length);
      HRESULT hr = ::PathCreateFromUrl(wide_url.c_str(), &buffer[0], &path_length, 0);
      if (FAILED(hr)) {
        response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                   "Specified URL (" + url + ") is a file, " +
                                   "but the path was not valid.");
        return;
      } else {
        std::wstring file_path(&buffer[0]);
        if (file_path.size() == 0) {
          response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                     "Specified URL (" + url + ") is a file, " +
                                     "but the path was not valid.");
          return;
        } else {
          if (::PathIsDirectory(file_path.c_str())) {
            response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                       "Specified URL (" + url + ") is a directory, " +
                                       "and the browser opens directories outside the browser window.");
              return;
          }
        }
      }
    }

    if (browser_wrapper->IsCrossZoneUrl(url)) {
      browser_wrapper->InitiateBrowserReattach();
    }
    status_code = browser_wrapper->NavigateToUrl(url);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(ERROR_UNKNOWN_ERROR, "Failed to navigate to "
          + url
          + ". This usually means that a call to the COM method IWebBrowser2::Navigate2() failed.");
      return;
    }
    browser_wrapper->SetFocusedFrameByElement(NULL);
    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
