/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#include "stdafx.h"
#include <atlenc.h>
#include <atlimage.h>
#include <atltypes.h>
#include <shlguid.h>
#include <string>

#include "logging.h"
#include "ScreenshotCapture.h"

ScreenshotCapture::ScreenshotCapture(IWebBrowser2* pBrowser)
  : m_pBrowser(pBrowser), m_pImage(NULL), m_csMessage("")
{
}

ScreenshotCapture::~ScreenshotCapture()
{
  delete m_pImage;
}

BOOL ScreenshotCapture::FindContentWindow(HWND tabWindow, HWND* pContentWindow) {
  HWND shellHwnd = ::FindWindowEx(
      tabWindow,
      0,
      _T("Shell DocObject View"),
      NULL);
  if (shellHwnd == NULL) {
    LOG(WARN) << "Could not find shell view";
    return FALSE;
  }
  HWND contentHwnd = ::FindWindowEx(
      shellHwnd,
      0,
      _T("Internet Explorer_Server"),
      NULL);
  if (contentHwnd == NULL) {
    LOG(WARN) << "Could not find 'Internet Explorer_Server'";
    return FALSE;
  }
  (*pContentWindow) = contentHwnd;

  return TRUE;
}

HRESULT ScreenshotCapture::CaptureBrowser(IHTMLDocument2* pDoc)
{
  // Get the browser HWND.
  HWND hWnd;

  CComPtr<IServiceProvider> pServiceProvider;
  HRESULT hr = m_pBrowser->QueryInterface(&pServiceProvider);
  if (FAILED(hr)) {
    LOG(WARN) << "Query for IServiceProvider failed: " << hr;
    return hr;
  }
  CComPtr<IOleWindow> pWindow;
  hr = pServiceProvider->QueryService(SID_SShellBrowser, &pWindow);
  if (FAILED(hr)) {
    LOG(WARN) << "QueryService for ShellBrowser failed: " << hr;
    return hr;
  }
  HWND tabWindow;
  hr = pWindow->GetWindow(&tabWindow);
  if (FAILED(hr)) {
    LOG(WARN) << "Could not get window: " << hr;
    return hr;
  }
  if (!FindContentWindow(tabWindow, &hWnd)) {
    LOG(WARN) << "Could not find content hwnd";
    return E_FAIL;
  }
  RECT windowRect;
  ::GetWindowRect(hWnd, &windowRect);
  int width = windowRect.right - windowRect.left;
  int height = windowRect.bottom - windowRect.top;
  m_pImage = new CImage();
  m_pImage->Create(width, height, 16);
  HDC bmDc = m_pImage->GetDC();
  hr = ::PrintWindow(hWnd, bmDc, PW_CLIENTONLY);
  if (FAILED(hr)) {
    // Could not draw.
    LOG(WARN) << "PrintWindow failed";
    m_pImage->ReleaseDC();
    return hr;
  }
  m_pImage->ReleaseDC();

  return S_OK;
}

BOOL ScreenshotCapture::GetImageSize(SIZE* pSize)
{
  if (m_pImage == NULL) {
    LOG(WARN) << "GetSize called without an image";
    return FALSE;
  }
  pSize->cx = m_pImage->GetWidth();
  pSize->cy = m_pImage->GetHeight();
  return TRUE;
}

HRESULT ScreenshotCapture::GetBase64Data(std::wstring& data)
{
  if (m_pImage == NULL) {
    // CImage was not initialized.
    return E_POINTER;
  }
  CComPtr<IStream> stream;
  HRESULT hr = ::CreateStreamOnHGlobal(NULL, TRUE, &stream);
  if (FAILED(hr)) {
    LOG(WARN) << "Error creating IStream" << hr;
    return hr;
  }
  hr = m_pImage->Save(stream, Gdiplus::ImageFormatPNG);
  if (FAILED(hr)) {
    LOG(WARN) << "Saving image failed" << hr;
    return hr;
  }
  // Get the size of the stream.
  STATSTG statstg;
  hr = stream->Stat(&statstg, STATFLAG_DEFAULT);
  if (FAILED(hr)) {
    LOG(WARN) << "No stat on stream" << hr;
    return hr;
  }
  HGLOBAL hGlobal = NULL;
  hr = ::GetHGlobalFromStream(stream, &hGlobal);
  if (FAILED(hr)) {
    LOG(WARN) << "No HGlobal in stream" << hr;
    return hr;
  }
  // TODO: What if the file is bigger than max_int?
  LOG(INFO) << "Size of stream: " << statstg.cbSize.QuadPart;
  int length = Base64EncodeGetRequiredLength(
      statstg.cbSize.QuadPart,
      ATL_BASE64_FLAG_NOCRLF);
  if (length <= 0) {
    LOG(WARN) << "Got zero or negative length from base64 required length";
    return E_FAIL;
  }
  char *array = new char[length + 1];
  if (!::Base64Encode(
        reinterpret_cast<BYTE*>(::GlobalLock(hGlobal)),
        statstg.cbSize.QuadPart,
        array,
        &length,
        ATL_BASE64_FLAG_NOCRLF)) {
    delete array;
    ::GlobalUnlock(hGlobal);
    LOG(WARN) << "Failure encoding to base64";
    return E_FAIL;
  }
  array[length] = '\0';
  data = CA2W(array);

  delete array;
  ::GlobalUnlock(hGlobal);

  return S_OK;
}
