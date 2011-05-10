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
		// ASSUMPTION: Version string will never be larger than 2 characters
		// (+1 for the null terminator).
		int version = session.browser_version();
		char buffer[3];
		_itoa_s(version, buffer, 3, 10);
		std::string version_string(buffer);

		Json::Value capabilities;
		capabilities["browserName"] = "internet explorer";
		capabilities["version"] = version_string;
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
