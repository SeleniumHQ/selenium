#ifndef WEBDRIVER_IE_GETALLWINDOWHANDLESCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETALLWINDOWHANDLESCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetAllWindowHandlesCommandHandler : public WebDriverCommandHandler {
public:
	GetAllWindowHandlesCommandHandler(void) {
	}

	virtual ~GetAllWindowHandlesCommandHandler(void) {
	}

protected:
	void GetAllWindowHandlesCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		Json::Value handles(Json::arrayValue);
		std::vector<std::wstring> handle_list;
		session.GetManagedBrowserHandles(&handle_list);
		for (unsigned int i = 0; i < handle_list.size(); ++i) {
			std::string handle(CW2A(handle_list[i].c_str(), CP_UTF8));
			handles.append(handle);
		}

		response->SetResponse(SUCCESS, handles);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETALLWINDOWHANDLESCOMMANDHANDLER_H_
