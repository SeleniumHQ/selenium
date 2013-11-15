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
      hr = this->CaptureBrowser(browser_wrapper);
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

 private:
  ATL::CImage* image_;

  void ClearImage() {
    if (this->image_ != NULL) {
      delete this->image_;
      this->image_ = NULL;
    }
  }

  HRESULT CaptureBrowser(BrowserHandle browser) {
    LOG(TRACE) << "Entering ScreenshotCommandHandler::CaptureBrowser";

    ie_window_handle = browser->GetTopLevelWindowHandle();
    HWND content_window_handle = browser->GetWindowHandle();

    CComPtr<IHTMLDocument2> document;
    browser->GetDocument(&document);
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

    max_width = document_info.width + chrome_width;
    max_height = document_info.height + chrome_height;

    // For some reason, this technique does not allow the user to resize
    // the browser window to greater than SIZE_LIMIT x SIZE_LIMIT. This is pretty
    // big, so we'll cap the allowable screenshot size to that.
    //
    // GDI+ limit after which it may report Generic error for some image types
    int SIZE_LIMIT = 65534; 
    if (max_height > SIZE_LIMIT) {
      LOG(WARN) << "Required height is greater than limit. Truncating screenshot height.";
      max_height = SIZE_LIMIT;
      document_info.height = max_height - chrome_height;
    }
    if (max_width > SIZE_LIMIT) {
      LOG(WARN) << "Required width is greater than limit. Truncating screenshot width.";
      max_width = SIZE_LIMIT;
      document_info.width = max_width - chrome_width;
    }

    long original_width = browser->GetWidth();
    long original_height = browser->GetHeight();
    LOG(DEBUG) << "Initial browser window sizes are (w, h): "
               << original_width << ", " << original_height;

    // The resize message is being ignored if the window appears to be
    // maximized.  There's likely a way to bypass that. The kludgy way 
    // is to unmaximize the window, then move on with setting the window
    // to the dimensions we really want.  This is okay because we revert
    // back to the original dimensions afterward.
    BOOL is_maximized = ::IsZoomed(ie_window_handle);
    if (is_maximized) {
      LOG(DEBUG) << "Window is maximized currently. Demaximizing.";
      ::ShowWindow(ie_window_handle, SW_SHOWNORMAL);
    }

    this->InstallWindowsHook();

    browser->SetWidth(max_width);
    browser->SetHeight(max_height);

    // Capture the window's canvas to a DIB.
    BOOL created = this->image_->Create(document_info.width,
                                        document_info.height,
                                        /*numbers of bits per pixel = */ 32);
    if (!created) {
      LOG(WARN) << "Unable to initialize image object";
    }
    HDC device_context_handle = this->image_->GetDC();

    BOOL print_result = ::PrintWindow(content_window_handle,
                                      device_context_handle,
                                      PW_CLIENTONLY);
    if (!print_result) {
      LOG(WARN) << "PrintWindow API is not able to get content window screenshot";
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
    return S_OK;
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

  void GetBrowserChromeDimensions(HWND top_level_window_handle,
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

  void GetWindowDimensions(HWND window_handle, int* width, int* height) {
    RECT window_rect;
    ::GetWindowRect(window_handle, &window_rect);
    *width = window_rect.right - window_rect.left;
    *height = window_rect.bottom - window_rect.top;
  }

  void InstallWindowsHook() {
    LOG(TRACE) << "Entering ScreenshotCommandHandler::InstallWindowsHook";

    HINSTANCE instance_handle = _AtlBaseModule.GetModuleInstance();

    FARPROC hook_procedure_address = ::GetProcAddress(instance_handle, "ScreenshotWndProc");
    if (hook_procedure_address == NULL || hook_procedure_address == 0) {
      LOGERR(WARN) << "Unable to get address of hook procedure to catch WM_GETMINMAXINFO";
      return;
    }
    HOOKPROC hook_procedure = reinterpret_cast<HOOKPROC>(hook_procedure_address);

    // Install the Windows hook.
    DWORD thread_id = ::GetWindowThreadProcessId(ie_window_handle, NULL);
    next_hook = ::SetWindowsHookEx(WH_CALLWNDPROC,
                                   hook_procedure,
                                   instance_handle,
                                   thread_id);
    if (next_hook == NULL) {      
      LOGERR(WARN) << "Unable to set windows hook to catch WM_GETMINMAXINFO";
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
