#ifndef WEBDRIVER_IE_SWITCHTOFRAMECOMMANDHANDLER_H_
#define WEBDRIVER_IE_SWITCHTOFRAMECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class SwitchToFrameCommandHandler : public WebDriverCommandHandler {
public:
	SwitchToFrameCommandHandler(void) {
	}

	virtual ~SwitchToFrameCommandHandler(void) {
	}

protected:
	void SwitchToFrameCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("id") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: id");
			return;
		} else {
			Json::Value frame_id = command_parameters["id"];
			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			//std::wstringstream path_stream;
			if (frame_id.isString()) {
				std::wstring frame_name(CA2W(frame_id.asString().c_str(), CP_UTF8));
				status_code = browser_wrapper->SetFocusedFrameByName(frame_name);
				//path_stream << path;
			} else if(frame_id.isIntegral()) {
				//path_stream << frame_id.asInt();
				int frame_index(frame_id.asInt());
				status_code = browser_wrapper->SetFocusedFrameByIndex(frame_index);
			} else if (frame_id.isNull()) {
				status_code = browser_wrapper->SetFocusedFrameByElement(NULL);
			} else if (frame_id.isObject()) {
				Json::Value element_id = frame_id.get("ELEMENT", Json::Value::null);
				if (element_id.isNull()) {
					status_code = ENOSUCHFRAME;
				} else {
					std::wstring frame_element_id(CA2W(element_id.asString().c_str(), CP_UTF8));

					ElementWrapper *frame_element_wrapper;
					status_code = this->GetElement(manager, frame_element_id, &frame_element_wrapper);
					if (status_code == SUCCESS) {
						status_code = browser_wrapper->SetFocusedFrameByElement(frame_element_wrapper->element());
					}
				}
			}

			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "No frame found");
			} else {
				response->SetResponse(SUCCESS, Json::Value::null);
			}

			//browser_wrapper->set_path_to_frame(path_stream.str());
			//CComPtr<IHTMLDocument2> doc;
			//browser_wrapper->GetDocument(&doc);
			//if (!doc) {
			//	browser_wrapper->set_path_to_frame(L"");
			//	response->SetErrorResponse(ENOSUCHFRAME, "No frame found");
			//	return;
			//} else {
			//	response->SetResponse(SUCCESS, Json::Value::null);
			//	return;
			//}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SWITCHTOFRAMECOMMANDHANDLER_H_
