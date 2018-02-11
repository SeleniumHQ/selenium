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

#include "ScreenshotCommandHandler.h"
#include <atlenc.h>
#include <atlimage.h>
#include "errorcodes.h"
#include "logging.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

ScreenshotCommandHandler::ScreenshotCommandHandler(void) {
  this->image_ = NULL;
}

ScreenshotCommandHandler::~ScreenshotCommandHandler(void) {
}

void ScreenshotCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  LOG(TRACE) << "Entering ScreenshotCommandHandler::ExecuteInternal";

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get browser");
    return;
  }

  bool isSameColour = true;
  HRESULT hr;
  int i = 0;
  int tries = 4;
  do {
    this->ClearImage();

    this->image_ = new CImage();
    hr = this->CaptureViewport(browser_wrapper);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Failed to capture browser image at " << i << " try";
      this->ClearImage();
      response->SetSuccessResponse("");
      return;
    }

    isSameColour = IsSameColour();
    if (isSameColour) {
      ::Sleep(2000);
      LOG(DEBUG) << "Failed to capture non single color browser image at " << i << " try";
    }

    i++;
  } while ((i < tries) && isSameColour);

  // now either correct or single color image is got
  std::string base64_screenshot = "";
  hr = this->GetBase64Data(base64_screenshot);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to transform browser image to Base64 format";
    this->ClearImage();
    response->SetSuccessResponse("");
    return;
  }

  this->ClearImage();
  response->SetSuccessResponse(base64_screenshot);
}

void ScreenshotCommandHandler::ClearImage() {
  if (this->image_ != NULL) {
    delete this->image_;
    this->image_ = NULL;
  }
}

HRESULT ScreenshotCommandHandler::CaptureViewport(BrowserHandle browser) {
  LOG(TRACE) << "Entering ScreenshotCommandHandler::CaptureViewport";

  HWND content_window_handle = browser->GetContentWindowHandle();
  int content_width = 0, content_height = 0;

  this->GetWindowDimensions(content_window_handle, &content_width, &content_height);
  this->CaptureWindow(content_window_handle, content_width, content_height);

  return S_OK;
}

void ScreenshotCommandHandler::CaptureWindow(HWND window_handle,
                                              long width,
                                              long height) {
  // Capture the window's canvas to a DIB.
  // If there are any scroll bars in the window, they should
  // be explicitly cropped out of the image, because of the
  // size of image we are creating..
  BOOL created = this->image_->Create(width, height, /*numbers of bits per pixel = */ 32);
  if (!created) {
    LOG(WARN) << "Unable to initialize image object";
  }
  HDC device_context_handle = this->image_->GetDC();

  BOOL print_result = ::PrintWindow(window_handle,
                                    device_context_handle,
                                    PW_CLIENTONLY);
  if (!print_result) {
    LOG(WARN) << "PrintWindow API is not able to get content window screenshot";
  }

  this->image_->ReleaseDC();
}

bool ScreenshotCommandHandler::IsSameColour() {
  COLORREF firstPixelColour = this->image_->GetPixel(0, 0);

  for (int i = 0; i < this->image_->GetWidth(); i++) {
    for (int j = 0; j < this->image_->GetHeight(); j++) {
      if (firstPixelColour != this->image_->GetPixel(i, j)) {
        return false;
      }
    }
  }

  return true;
}

HRESULT ScreenshotCommandHandler::GetBase64Data(std::string& data) {
  LOG(TRACE) << "Entering ScreenshotCommandHandler::GetBase64Data";

  if (this->image_ == NULL) {
    LOG(DEBUG) << "CImage was not initialized.";
    return E_POINTER;
  }

  CComPtr<IStream> stream;
  HRESULT hr = ::CreateStreamOnHGlobal(NULL, TRUE, &stream);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Error is occured during creating IStream";
    return hr;
  }

  GUID image_format = Gdiplus::ImageFormatPNG /*Gdiplus::ImageFormatJPEG*/;
  hr = this->image_->Save(stream, image_format);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Saving screenshot image is failed";
    return hr;
  }

  // Get the size of the stream.
  STATSTG statstg;
  hr = stream->Stat(&statstg, STATFLAG_DEFAULT);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "No stat on stream is got";
    return hr;
  }

  HGLOBAL global_memory_handle = NULL;
  hr = ::GetHGlobalFromStream(stream, &global_memory_handle);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "No HGlobal in stream";
    return hr;
  }

  // TODO: What if the file is bigger than max_int?
  int stream_size = static_cast<int>(statstg.cbSize.QuadPart);
  LOG(DEBUG) << "Size of screenshot image stream is " << stream_size;

  int length = ::Base64EncodeGetRequiredLength(stream_size, ATL_BASE64_FLAG_NOCRLF);
  if (length <= 0) {
    LOG(WARN) << "Got zero or negative length from base64 required length";
    return E_FAIL;
  }

  BYTE* global_lock = reinterpret_cast<BYTE*>(::GlobalLock(global_memory_handle));
  if (global_lock == NULL) {
    LOGERR(WARN) << "Unable to lock memory for base64 encoding";
    ::GlobalUnlock(global_memory_handle);      
    return E_FAIL;
  }

  char* data_array = new char[length + 1];
  if (!::Base64Encode(global_lock,
                      stream_size,
                      data_array,
                      &length,
                      ATL_BASE64_FLAG_NOCRLF)) {
    delete[] data_array;
    ::GlobalUnlock(global_memory_handle);
    LOG(WARN) << "Unable to encode image stream to base64";
    return E_FAIL;
  }
  data_array[length] = '\0';
  data = data_array;

  delete[] data_array;
  ::GlobalUnlock(global_memory_handle);

  return S_OK;
}

void ScreenshotCommandHandler::GetWindowDimensions(HWND window_handle,
                                                    int* width,
                                                    int* height) {
  RECT window_rect;
  ::GetWindowRect(window_handle, &window_rect);
  *width = window_rect.right - window_rect.left;
  *height = window_rect.bottom - window_rect.top;
}

} // namespace webdriver
