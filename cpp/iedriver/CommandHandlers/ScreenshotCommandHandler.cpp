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
    const bool should_resize_window = executor.enable_full_page_screenshot();
    do {
      this->ClearImage();

      this->image_ = new CImage();
      if (should_resize_window) {
        hr = this->CaptureFullPage(browser_wrapper);
      } else {
        hr = this->CaptureViewport(browser_wrapper);
      }
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

  HRESULT ScreenshotCommandHandler::CaptureFullPage(BrowserHandle browser) {
    LOG(TRACE) << "Entering ScreenshotCommandHandler::CaptureFullPage";

    HWND ie_window_handle = browser->GetTopLevelWindowHandle();
    HWND content_window_handle = browser->GetContentWindowHandle();

    CComPtr<IHTMLDocument2> document;
    browser->GetDocument(true, &document);
    if (!document) {
      LOG(WARN) << "Unable to get document from browser. Are you viewing a non-HTML document?";
      return E_ABORT;
    }

    LocationInfo document_info;
    bool result = DocumentHost::GetDocumentDimensions(document, &document_info);
    if (!result) {
      LOG(DEBUG) << "Unable to get document dimensions";
      return E_FAIL;
    }
    LOG(DEBUG) << "Initial document sizes (scrollWidth, scrollHeight) are (w, h): "
               << document_info.width << ", " << document_info.height;

    int chrome_width(0);
    int chrome_height(0);
    this->GetBrowserChromeDimensions(ie_window_handle,
                                     content_window_handle,
                                     &chrome_width,
                                     &chrome_height);
    LOG(DEBUG) << "Initial chrome sizes are (w, h): "
               << chrome_width << ", " << chrome_height;

    int target_window_width = document_info.width + chrome_width;
    int target_window_height = document_info.height + chrome_height;

    // For some reason, this technique does not allow the user to resize
    // the browser window to greater than SIZE_LIMIT x SIZE_LIMIT. This is
    // pretty big, so we'll cap the allowable screenshot size to that.
    //
    // GDI+ limit after which it may report Generic error for some image types
    int SIZE_LIMIT = 65534; 
    if (target_window_height > SIZE_LIMIT) {
      LOG(WARN) << "Required height is greater than limit. Truncating screenshot height.";
      target_window_height = SIZE_LIMIT;
      document_info.height = target_window_height - chrome_height;
    }
    if (target_window_width > SIZE_LIMIT) {
      LOG(WARN) << "Required width is greater than limit. Truncating screenshot width.";
      target_window_width = SIZE_LIMIT;
      document_info.width = target_window_width - chrome_width;
    }

    long original_width = browser->GetWidth();
    long original_height = browser->GetHeight();
    LOG(DEBUG) << "Initial browser window sizes are (w, h): "
               << original_width << ", " << original_height;

    // If the window is already wide enough to accomodate
    // the document, don't resize that dimension. Otherwise,
    // the window will display a horizontal scroll bar, and
    // we need to retain the scrollbar to avoid rerendering
    // during the resize, so reduce the target window width
    // by two pixels.
    if (original_width > target_window_width) {
      target_window_width = original_width;
    } else {
      target_window_width -= 2;
    }

    // If the window is already tall enough to accomodate
    // the document, don't resize that dimension. Otherwise,
    // the window will display a vertical scroll bar, and
    // we need to retain the scrollbar to avoid rerendering
    // during the resize, so reduce the target window height
    // by two pixels.
    if (original_height > target_window_height) {
      target_window_height = original_height;
    } else {
      target_window_height -= 2;
    }

    BOOL is_maximized = ::IsZoomed(ie_window_handle);
    bool requires_resize = original_width < target_window_width ||
                           original_height < target_window_height;

    if (requires_resize) {
      // The resize message is being ignored if the window appears to be
      // maximized.  There's likely a way to bypass that. The kludgy way 
      // is to unmaximize the window, then move on with setting the window
      // to the dimensions we really want.  This is okay because we revert
      // back to the original dimensions afterward.
      if (is_maximized) {
        LOG(DEBUG) << "Window is maximized currently. Demaximizing.";
        ::ShowWindow(ie_window_handle, SW_SHOWNORMAL);
      }

      // NOTE: There is a *very* slight chance that resizing the window
      // so there are no longer scroll bars to be displayed *might* cause
      // layout redraws such that the screenshot does not show the entire
      // DOM after the resize. Since we should always be expanding the
      // window size, never contracting it, this is a corner case that
      // explicitly will *not* be fixed. Any issue reports describing this
      // corner case will be closed without action.
      RECT ie_window_rect;
      ::GetWindowRect(ie_window_handle, &ie_window_rect);
      ::SetWindowPos(ie_window_handle,
                     NULL, 
                     ie_window_rect.left,
                     ie_window_rect.top,
                     target_window_width,
                     target_window_height,
                     SWP_NOSENDCHANGING);
    }

    CaptureWindow(content_window_handle, document_info.width, document_info.height);

    if (requires_resize) {
      // Restore the browser to the original dimensions.
      if (is_maximized) {
        ::ShowWindow(ie_window_handle, SW_MAXIMIZE);
      } else {
        browser->SetHeight(original_height);
        browser->SetWidth(original_width);
      }
    }

    return S_OK;
  }

  HRESULT ScreenshotCommandHandler::CaptureViewport(BrowserHandle browser) {
    LOG(TRACE) << "Entering ScreenshotCommandHandler::CaptureViewport";

    HWND content_window_handle = browser->GetContentWindowHandle();
    int content_width = 0, content_height = 0;

    this->GetWindowDimensions(content_window_handle, &content_width, &content_height);
    CaptureWindow(content_window_handle, content_width, content_height);

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

  void ScreenshotCommandHandler::GetBrowserChromeDimensions(
      HWND top_level_window_handle,
      HWND content_window_handle,
      int* width,
      int* height) {
    LOG(TRACE) << "Entering ScreenshotCommandHandler::GetBrowserChromeDimensions";

    int top_level_window_width = 0;
    int top_level_window_height = 0;
    this->GetWindowDimensions(top_level_window_handle,
                              &top_level_window_width,
                              &top_level_window_height);
    LOG(TRACE) << "Top level window dimensions are (w, h): "
               << top_level_window_width << "," << top_level_window_height;

    int content_window_width = 0;
    int content_window_height = 0;
    this->GetWindowDimensions(content_window_handle,
                              &content_window_width,
                              &content_window_height);
    LOG(TRACE) << "Content window dimensions are (w, h): "
               << content_window_width << "," << content_window_height;

    *width = top_level_window_width - content_window_width;
    *height = top_level_window_height - content_window_height;
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
