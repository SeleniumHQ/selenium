#ifndef WEBDRIVER_IE_GETALLWINDOWHANDLESCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETALLWINDOWHANDLESCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetAllWindowHandlesCommandHandler : public WebDriverCommandHandler {
public:
	GetAllWindowHandlesCommandHandler(void) {
	}

	virtual ~GetAllWindowHandlesCommandHandler(void) {
	}

protected:
	void GetAllWindowHandlesCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		Json::Value handles(Json::arrayValue);
		std::vector<std::wstring> handle_list;
		manager->GetManagedBrowserHandles(&handle_list);
		for (unsigned int i = 0; i < handle_list.size(); ++i) {
			std::string handle(CW2A(handle_list[i].c_str(), CP_UTF8));
			handles.append(handle);
		}

		response->SetResponse(SUCCESS, handles);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETALLWINDOWHANDLESCOMMANDHANDLER_H_
