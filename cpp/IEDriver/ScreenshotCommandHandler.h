#ifndef WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SCREENSHOTCOMMANDHANDLER_H_

#include "BrowserManager.h"
#include <atlimage.h>
#include <atlenc.h>

namespace webdriver {

class ScreenshotCommandHandler : public WebDriverCommandHandler {
public:
	ScreenshotCommandHandler(void) {
		this->image_ = NULL;
	}

	virtual ~ScreenshotCommandHandler(void) {
		delete this->image_;
	}

protected:
	void ScreenshotCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		BrowserWrapper *browser_wrapper;
		manager->GetCurrentBrowser(&browser_wrapper);
		
		HRESULT hr = this->CaptureBrowser(browser_wrapper->browser());
		if (FAILED(hr)) {
			response->SetResponse(SUCCESS, "");
			return;
		}

		std::string base64_screenshot = "";
		hr = this->GetBase64Data(base64_screenshot);
		if (FAILED(hr)) {
			response->SetResponse(SUCCESS, "");
			return;
		}

		response->SetResponse(SUCCESS, base64_screenshot);
	}

private:
	ATL::CImage* image_;

	bool ScreenshotCommandHandler::FindContentWindow(HWND tab_window_handle, HWND* content_window_handle_pointer) {
		HWND shell_window_handle = ::FindWindowEx(tab_window_handle, 0, _T("Shell DocObject View"), NULL);
		if (shell_window_handle == NULL) {
			// LOG(WARN) << "Could not find shell view";
			return false;
		}

		HWND content_window_handle = ::FindWindowEx(shell_window_handle, 0, _T("Internet Explorer_Server"), NULL);
		if (content_window_handle == NULL) {
			// LOG(WARN) << "Could not find 'Internet Explorer_Server'";
			return false;
		}

		*content_window_handle_pointer = content_window_handle;

		return true;
	}

	HRESULT ScreenshotCommandHandler::CaptureBrowser(IWebBrowser2 *browser) {
		// Get the browser HWND.
		HWND content_window_handle;

		CComPtr<IServiceProvider> service_provider;
		HRESULT hr = browser->QueryInterface(&service_provider);
		if (FAILED(hr)) {
			// LOG(WARN) << "Query for IServiceProvider failed: " << hr;
			return hr;
		}

		CComPtr<IOleWindow> window_pointer;
		hr = service_provider->QueryService(SID_SShellBrowser, &window_pointer);
		if (FAILED(hr)) {
			// LOG(WARN) << "QueryService for ShellBrowser failed: " << hr;
			return hr;
		}

		HWND tab_window_handle;
		hr = window_pointer->GetWindow(&tab_window_handle);
		if (FAILED(hr)) {
			// LOG(WARN) << "Could not get window: " << hr;
			return hr;
		}

		if (!this->FindContentWindow(tab_window_handle, &content_window_handle)) {
			// LOG(WARN) << "Could not find content hwnd";
			return E_FAIL;
		}

		RECT window_rect;
		::GetWindowRect(content_window_handle, &window_rect);
		int width = window_rect.right - window_rect.left;
		int height = window_rect.bottom - window_rect.top;
		this->image_ = new CImage();
		this->image_->Create(width, height, 16);
		HDC device_context_handle = this->image_->GetDC();
		BOOL result = ::PrintWindow(content_window_handle, device_context_handle, PW_CLIENTONLY);
		if (!result) {
			// Could not draw.
			// LOG(WARN) << "PrintWindow failed";
			this->image_->ReleaseDC();
			return hr;
		}

		this->image_->ReleaseDC();
		return S_OK;
	}

	bool ScreenshotCommandHandler::GetImageSize(SIZE* size_pointer) {
		if (this->image_ == NULL) {
			// LOG(WARN) << "GetSize called without an image";
			return false;
		}
		size_pointer->cx = this->image_->GetWidth();
		size_pointer->cy = this->image_->GetHeight();
		return true;
	}

	HRESULT ScreenshotCommandHandler::GetBase64Data(std::string& data) {
		if (this->image_ == NULL) {
			// CImage was not initialized.
			return E_POINTER;
		}

		CComPtr<IStream> stream;
		HRESULT hr = ::CreateStreamOnHGlobal(NULL, TRUE, &stream);
		if (FAILED(hr)) {
			// LOG(WARN) << "Error creating IStream" << hr;
			return hr;
		}

		hr = this->image_->Save(stream, Gdiplus::ImageFormatPNG);
		if (FAILED(hr)) {
			// LOG(WARN) << "Saving image failed" << hr;
			return hr;
		}

		// Get the size of the stream.
		STATSTG statstg;
		hr = stream->Stat(&statstg, STATFLAG_DEFAULT);
		if (FAILED(hr)) {
			// LOG(WARN) << "No stat on stream" << hr;
			return hr;
		}

		HGLOBAL global_memory_handle = NULL;
		hr = ::GetHGlobalFromStream(stream, &global_memory_handle);
		if (FAILED(hr)) {
			// LOG(WARN) << "No HGlobal in stream" << hr;
			return hr;
		}

		// TODO: What if the file is bigger than max_int?
		// LOG(INFO) << "Size of stream: " << statstg.cbSize.QuadPart;
		int length = ::Base64EncodeGetRequiredLength((int)statstg.cbSize.QuadPart, ATL_BASE64_FLAG_NOCRLF);
		if (length <= 0) {
			// LOG(WARN) << "Got zero or negative length from base64 required length";
			return E_FAIL;
		}

		char *data_array = new char[length + 1];
		if (!::Base64Encode(reinterpret_cast<BYTE*>(::GlobalLock(global_memory_handle)), (int)statstg.cbSize.QuadPart, data_array, &length, ATL_BASE64_FLAG_NOCRLF)) {
			delete[] data_array;
			::GlobalUnlock(global_memory_handle);
			// LOG(WARN) << "Failure encoding to base64";
			return E_FAIL;
		}
		data_array[length] = '\0';
		data = data_array;

		delete[] data_array;
		::GlobalUnlock(global_memory_handle);

		return S_OK;
	}

};

} // namespace webdriver

#endif // WEBDRIVER_IE_ADDCOOKIECOMMANDHANDLER_H_