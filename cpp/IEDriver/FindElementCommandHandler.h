#ifndef WEBDRIVER_IE_FINDELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDELEMENTCOMMANDHANDLER_H_

#include <ctime>
#include "BrowserManager.h"

namespace webdriver {

class FindElementCommandHandler : public WebDriverCommandHandler {
public:
	FindElementCommandHandler(void) {
	}

	virtual ~FindElementCommandHandler(void) {
	}

protected:
	void FindElementCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, Json::Value>::const_iterator using_parameter_iterator = command_parameters.find("using");
		std::map<std::string, Json::Value>::const_iterator value_parameter_iterator = command_parameters.find("value");
		if (using_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: using");
			return;
		} else if (value_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else {
			std::wstring mechanism = CA2W(using_parameter_iterator->second.asString().c_str(), CP_UTF8);
			std::wstring value = CA2W(value_parameter_iterator->second.asString().c_str(), CP_UTF8);

			std::tr1::shared_ptr<ElementFinder> finder;
			int status_code = manager->GetElementFinder(mechanism, &finder);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unknown finder mechanism: " + using_parameter_iterator->second.asString());
				return;
			}

			int timeout(manager->implicit_wait_timeout());
			clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
			if (timeout > 0 && timeout < 1000) {
				end += 1 * CLOCKS_PER_SEC;
			}

			Json::Value found_element;
			do {
				status_code = finder->FindElement(manager, std::tr1::shared_ptr<ElementWrapper>(), value, &found_element);
				if (status_code == SUCCESS) {
					break;
				}
			} while (clock() < end);
			
			if (status_code == SUCCESS) {
				response->SetResponse(SUCCESS, found_element);
				return;
			} else {
				response->SetErrorResponse(status_code, "Unable to find element with " + using_parameter_iterator->second.asString() + " == " + value_parameter_iterator->second.asString());
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDELEMENTCOMMANDHANDLER_H_
