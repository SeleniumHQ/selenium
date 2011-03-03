#ifndef WEBDRIVER_IE_GETSPEEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETSPEEDCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetSpeedCommandHandler : public WebDriverCommandHandler {
public:
	GetSpeedCommandHandler(void) {
	}

	virtual ~GetSpeedCommandHandler(void) {
	}

protected:
	void GetSpeedCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		int speed = manager->speed();
		switch (speed) {
		  case 1000:
			response->SetResponse(SUCCESS, "SLOW");
			break;
		  case 500:
			response->SetResponse(SUCCESS, "MEDIUM");
			break;
		  default:
			response->SetResponse(SUCCESS, "FAST");
			break;
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE__H_
