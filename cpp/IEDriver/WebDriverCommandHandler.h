#ifndef WEBDRIVER_IE_WEBDRIVERCOMMANDHANDLER_H_
#define WEBDRIVER_IE_WEBDRIVERCOMMANDHANDLER_H_

#include <map>
#include <string>
#include "json.h"
#include "ElementWrapper.h"
#include "WebDriverCommand.h"
#include "WebDriverResponse.h"

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class Session;

class WebDriverCommandHandler {
public:
	typedef std::map<std::string, std::string> LocatorMap;
	typedef std::map<std::string, Json::Value> ParametersMap;

	WebDriverCommandHandler(void);
	virtual ~WebDriverCommandHandler(void);
	void Execute(Session* session, const WebDriverCommand& command, WebDriverResponse* response);

protected:
	virtual void ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse* response);
	int GetElement(Session* session, const std::wstring& element_id, ElementHandle* element_wrapper);
};

typedef std::tr1::shared_ptr<WebDriverCommandHandler> CommandHandlerHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_WEBDRIVERCOMMANDHANDLER_H_
