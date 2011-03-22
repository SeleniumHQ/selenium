#ifndef WEBDRIVER_IE_WEBDRIVERCOMMANDHANDLER_H_
#define WEBDRIVER_IE_WEBDRIVERCOMMANDHANDLER_H_

#include <map>
#include <string>
#include "json.h"
#include "WebDriverCommand.h"
#include "WebDriverResponse.h"

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class Session;
class ElementWrapper;

class WebDriverCommandHandler {
public:
	WebDriverCommandHandler(void);
	virtual ~WebDriverCommandHandler(void);
	void Execute(Session* session, const WebDriverCommand& command, WebDriverResponse* response);

protected:
	virtual void ExecuteInternal(Session* session, const std::map<std::string, std::string>& locatorParameters, const std::map<std::string, Json::Value>& commandParameters, WebDriverResponse* response);
	int GetElement(Session* session, const std::wstring& element_id, std::tr1::shared_ptr<ElementWrapper>* element_wrapper);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_WEBDRIVERCOMMANDHANDLER_H_
