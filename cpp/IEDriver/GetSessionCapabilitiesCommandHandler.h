#ifndef WEBDRIVER_IE_GETSESSIONCAPABILITIESCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETSESSIONCAPABILITIESCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetSessionCapabilitiesCommandHandler : public WebDriverCommandHandler {
public:
	GetSessionCapabilitiesCommandHandler(void) {
	}

	virtual ~GetSessionCapabilitiesCommandHandler(void) {
	}

protected:
	void GetSessionCapabilitiesCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		Json::Value capabilities;
		capabilities["browserName"] = "internet explorer";
		capabilities["version"] = "0";
		capabilities["javascriptEnabled"] = true;
		capabilities["platform"] = "WINDOWS";
		capabilities["nativeEvents"] = true;
		capabilities["cssSelectorsEnabled"] = true;
		capabilities["takesScreenshot"] = true;
		response->SetResponse(SUCCESS, capabilities);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETSESSIONCAPABILITIESCOMMANDHANDLER_H_
