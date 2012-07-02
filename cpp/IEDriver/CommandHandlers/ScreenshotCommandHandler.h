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

#ifndef WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "logging.h"
#include <atlimage.h>
#include <atlenc.h>

// Define a shared data segment.  Variables in this segment can be
// shared across processes that load this DLL.
#pragma data_seg("SHARED")
HHOOK next_hook = NULL;
HWND ie_window_handle = NULL;
int max_width = 0;
int max_height = 0;
#pragma data_seg()

#pragma comment(linker, "/section:SHARED,RWS")

namespace webdriver {

class ScreenshotCommandHandler : public IECommandHandler {
 public:
  ScreenshotCommandHandler(void) {
    this->image_ = NULL;
  }

  virtual ~ScreenshotCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    bool isSameColour = true;
    HRESULT hr;
    int i = 0;
    do {
      if (this->image_ != NULL) {
        delete this->image_;
      }
      this->image_ = new CImage();
      hr = this->CaptureBrowser(browser_wrapper);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Failed to capture browser image at " << i << " try";
        delete this->image_;
        this->image_ = NULL;
        response->SetSuccessResponse("");
        return;
      }
      isSameColour = IsSameColour();
      if (isSameColour) {
        ::Sleep(2000);
        LOG(DEBUG) << "Failed to capture non single color browser image at " << i << " try";
      }
      i++;
    } while (i < 4 && isSameColour);

    std::string base64_screenshot = "";
    hr = this->GetBase64Data(base64_screenshot);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to transform browser image to Base64 format";
      response->SetSuccessResponse("");
      return;
    }

    response->SetSuccessResponse(base64_screenshot);
    delete this->image_;
    this->image_ = NULL;
  }

 private:
  ATL::CImage* image_;

  HRESULT CaptureBrowser(BrowserHandle browser) {
    ie_window_handle = browser->GetTopLevelWindowHandle();
    HWND content_window_handle = browser->GetWindowHandle();

    CComPtr<IHTMLDocument2> document;
    browser->GetDocument(&document);

    int image_height(0);
    int image_width(0);
    HRESULT hr = this->GetDocumentDimensions(document,
                                             &image_width,
                                             &image_height);
    if (FAILED(hr)) {
      LOGHR(DEBUG, hr) << "Unable to get document dimensions";
      return hr;
    }

    int chrome_width(0);
    int chrome_height(0);
    this->GetBrowserChromeDimensions(ie_window_handle,
                                     content_window_handle,
                                     &chrome_width,
                                     &chrome_height);

    max_width = image_width + chrome_width;
    max_height = image_height + chrome_height;

    // For some reason, this technique does not allow the user to resize
    // the browser window to greater than 65536 x 65536. This is pretty
    // big, so we'll cap the allowable screenshot size to that.
    if (max_height > 65536) {
      LOG(WARN) << L"Height greater than 65536 pixels. Truncating screenshot height to 65536.";
      max_height = 65536;
      image_height = max_height - chrome_height;
    }

    if (max_width > 65536) {
      LOG(WARN) << L"Width greater than 65536 pixels. Truncating screenshot width to 65536.";
      max_width = 65536;
      image_width = max_width - chrome_width;
    }

    long original_width = browser->GetWidth();
    long original_height = browser->GetHeight();

    // The resize message is being ignored if the window appears to be
    // maximized.  There's likely a way to bypass that. The kludgy way 
    // is to unmaximize the window, then move on with setting the window
    // to the dimensions we really want.  This is okay because we revert
    // back to the original dimensions afterward.
    BOOL is_maximized = ::IsZoomed(ie_window_handle);
    if (is_maximized) {
      ::ShowWindow(ie_window_handle, SW_SHOWNORMAL);
    }

    this->InstallWindowsHook();

    browser->SetWidth(max_width);
    browser->SetHeight(max_height);

    // Capture the window's canvas to a DIB.
    BOOL created = this->image_->Create(image_width, image_height, /*numbers of bits per pixel = */ 32);
    if (!created) {
      LOG(WARN) << "Unable to create image";
    }
    HDC device_context_handle = this->image_->GetDC();

    BOOL print_result = ::PrintWindow(content_window_handle,
                                      device_context_handle,
                                      PW_CLIENTONLY);
    if (!print_result) {
      LOG(WARN) << L"PrintWindow API returned FALSE";
    }

    this->UninstallWindowsHook();

    // Restore the browser to the original dimensions.
    if (is_maximized) {
      ::ShowWindow(ie_window_handle, SW_MAXIMIZE);
    } else {
      browser->SetHeight(original_height);
      browser->SetWidth(original_width);
    }

    this->image_->ReleaseDC();
    return hr;
  }

  bool IsSameColour() {
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

  HRESULT GetBase64Data(std::string& data) {
    if (this->image_ == NULL) {
      LOG(DEBUG) << "CImage was not initialized.";
      return E_POINTER;
    }

    CComPtr<IStream> stream;
    HRESULT hr = ::CreateStreamOnHGlobal(NULL, TRUE, &stream);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Error creating IStream";
      return hr;
    }

    hr = this->image_->Save(stream, Gdiplus::ImageFormatPNG);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Saving image failed";
      return hr;
    }

    // Get the size of the stream.
    STATSTG statstg;
    hr = stream->Stat(&statstg, STATFLAG_DEFAULT);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "No stat on stream";
      return hr;
    }

    HGLOBAL global_memory_handle = NULL;
    hr = ::GetHGlobalFromStream(stream, &global_memory_handle);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "No HGlobal in stream";
      return hr;
    }

    // TODO: What if the file is bigger than max_int?
    LOG(DEBUG) << "Size of stream: " << statstg.cbSize.QuadPart;
    int length = ::Base64EncodeGetRequiredLength(static_cast<int>(statstg.cbSize.QuadPart),
                                                 ATL_BASE64_FLAG_NOCRLF);
    if (length <= 0) {
      LOG(WARN) << "Got zero or negative length from base64 required length";
      return E_FAIL;
    }

    BYTE* global_lock = reinterpret_cast<BYTE*>(::GlobalLock(global_memory_handle));
    if (global_lock == NULL) {
      ::GlobalUnlock(global_memory_handle);
      LOG(WARN) << "Failure to lock memory";
      return E_FAIL;
    }

    char* data_array = new char[length + 1];
    if (!::Base64Encode(global_lock,
                        static_cast<int>(statstg.cbSize.QuadPart),
                        data_array,
                        &length,
                        ATL_BASE64_FLAG_NOCRLF)) {
      delete[] data_array;
      ::GlobalUnlock(global_memory_handle);
      LOG(WARN) << "Failure encoding to base64";
      return E_FAIL;
    }
    data_array[length] = '\0';
    data = data_array;

    delete[] data_array;
    ::GlobalUnlock(global_memory_handle);

    return S_OK;
  }

  void GetBrowserChromeDimensions(HWND top_level_window_handle,
                                  HWND content_window_handle,
                                  int* width,
                                  int* height) {
    int top_level_window_width = 0;
    int top_level_window_height = 0;
    this->GetWindowDimensions(top_level_window_handle,
                              &top_level_window_width,
                              &top_level_window_height);

    int content_window_width = 0;
    int content_window_height = 0;
    this->GetWindowDimensions(content_window_handle,
                              &content_window_width,
                              &content_window_height);

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

  HRESULT GetDocumentDimensions(IHTMLDocument2* document,
                                int* width,
                                int* height) {
    CComVariant document_height;
    CComVariant document_width;

    CComQIPtr<IHTMLDocument5> html_document5(document);
    if (!html_document5) {
      LOG(WARN) << L"Unable to cast document to IHTMLDocument5. IE6 or greater is required.";
      return E_FAIL;
    }

    CComBSTR compatibility_mode;
    html_document5->get_compatMode(&compatibility_mode);

    // In non-standards-compliant mode, the BODY element represents the canvas.
    // In standards-compliant mode, the HTML element represents the canvas.
    CComPtr<IHTMLElement> canvas_element;
    if (compatibility_mode == L"BackCompat") {
      document->get_body(&canvas_element);
      if (!canvas_element) {
        LOG(WARN) << "Unable to get canvas element from document in compatibility mode";
        return E_FAIL;
      }
    } else {
      CComQIPtr<IHTMLDocument3> html_document3(document);
      if (!html_document3) {
        LOG(WARN) << L"Unable to get IHTMLDocument3 handle from document.";
        return E_FAIL;
      }

      // The root node should be the HTML element.
      html_document3->get_documentElement(&canvas_element);
      if (!canvas_element) {
        LOG(WARN) << L"Could not retrieve document element.";
        return E_FAIL;
      }

      CComQIPtr<IHTMLHtmlElement> html_element(canvas_element);
      if (!html_element) {
        LOG(WARN) << L"Document element is not the HTML element.";
        return E_FAIL;
      }
    }

    canvas_element->getAttribute(CComBSTR("scrollHeight"),
                                 0,
                                 &document_height);
    canvas_element->getAttribute(CComBSTR("scrollWidth"), 0, &document_width);
    *height = document_height.intVal;
    *width = document_width.intVal;
    return S_OK;
  }

  void InstallWindowsHook() {
    HINSTANCE instance_handle = _AtlBaseModule.GetModuleInstance();
    HOOKPROC hook_procedure = reinterpret_cast<HOOKPROC>(::GetProcAddress(instance_handle,
                                                                          "ScreenshotWndProc"));
    if (hook_procedure == NULL) {
      LOG(WARN) << L"GetProcAddress return value was NULL";
      return;
    }
    // Install the Windows hook.
    DWORD thread_id = ::GetWindowThreadProcessId(ie_window_handle, NULL);
    next_hook = ::SetWindowsHookEx(WH_CALLWNDPROC,
                                   hook_procedure,
                                   instance_handle,
                                   thread_id);
    if (next_hook == NULL) {
      DWORD error = ::GetLastError();
      LOG(WARN) << L"SetWindowsHookEx return value was NULL, actual error code was " << error;
    }
  }

  void UninstallWindowsHook() {
    ::UnhookWindowsHookEx(next_hook);
  }
};

} // namespace webdriver

#ifdef __cplusplus
extern "C" {
#endif

// This function is our message processor that we inject into the IEFrame 
// process.  Its sole purpose is to process WM_GETMINMAXINFO messages and 
// modify the max tracking size so that we can resize the IEFrame window to 
// greater than the virtual screen resolution.  All other messages are 
// delegated to the original IEFrame message processor.  This function 
// uninjects itself immediately upon execution.
LRESULT CALLBACK MinMaxInfoHandler(HWND hwnd,
                                   UINT message,
                                   WPARAM wParam,
                                   LPARAM lParam) {
  // Grab a reference to the original message processor.
  HANDLE original_message_proc = ::GetProp(hwnd,
                                           L"__original_message_processor__");
  ::RemoveProp(hwnd, L"__original_message_processor__");

  // Uninject this method.
  ::SetWindowLongPtr(hwnd,
                     GWLP_WNDPROC,
                     reinterpret_cast<LONG_PTR>(original_message_proc));

  if (WM_GETMINMAXINFO == message) {
    MINMAXINFO* minMaxInfo = reinterpret_cast<MINMAXINFO*>(lParam);

    minMaxInfo->ptMaxTrackSize.x = max_width;
    minMaxInfo->ptMaxTrackSize.y = max_height;

    // We're not going to pass this message onto the original message
    // processor, so we should return 0, per the documentation for
    // the WM_GETMINMAXINFO message.
    return 0;
  }

  // All other messages should be handled by the original message processor.
  return ::CallWindowProc(reinterpret_cast<WNDPROC>(original_message_proc),
                          hwnd,
                          message,
                          wParam,
                          lParam);
}

// Many thanks to sunnyandy for helping out with this approach.  What we're 
// doing here is setting up a Windows hook to see incoming messages to the
// IEFrame's message processor.  Once we find one that's WM_GETMINMAXINFO,
// we inject our own message processor into the IEFrame process to handle 
// that one message. WM_GETMINMAXINFO is sent on a resize event so the process
// can see how large a window can be. By modifying the max values, we can allow
// a window to be sized greater than the (virtual) screen resolution would
// otherwise allow.
//
// See the discussion here: http://www.codeguru.com/forum/showthread.php?p=1889928
LRESULT CALLBACK ScreenshotWndProc(int nCode, WPARAM wParam, LPARAM lParam) {
  CWPSTRUCT* call_window_proc_struct = reinterpret_cast<CWPSTRUCT*>(lParam);
  if (WM_GETMINMAXINFO == call_window_proc_struct->message) {
    // Inject our own message processor into the process so we can modify
    // the WM_GETMINMAXINFO message. It is not possible to modify the 
    // message from this hook, so the best we can do is inject a function
    // that can.
    LONG_PTR proc = ::SetWindowLongPtr(call_window_proc_struct->hwnd,
                                       GWLP_WNDPROC,
                                       reinterpret_cast<LONG_PTR>(MinMaxInfoHandler));
    ::SetProp(call_window_proc_struct->hwnd,
              L"__original_message_processor__",
              reinterpret_cast<HANDLE>(proc));
  }

  return ::CallNextHookEx(next_hook, nCode, wParam, lParam);
}

#ifdef __cplusplus
}
#endif

#endif // WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_
