#ifndef WEBDRIVER_IE_FINDELEMENTSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDELEMENTSCOMMANDHANDLER_H_

#include <ctime>
#include "Session.h"

namespace webdriver {

class FindElementsCommandHandler : public WebDriverCommandHandler {
public:
	FindElementsCommandHandler(void) {
	}

	virtual ~FindElementsCommandHandler(void) {
	}

protected:
	void FindElementsCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		ParametersMap::const_iterator using_parameter_iterator = command_parameters.find("using");
		ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
		if (using_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: using");
			return;
		} else if (value_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else {
			std::wstring mechanism = CA2W(using_parameter_iterator->second.asString().c_str(), CP_UTF8);
			std::wstring value = CA2W(value_parameter_iterator->second.asString().c_str(), CP_UTF8);

			std::wstring mechanism_translation;
			int status_code = session.GetElementFindMethod(mechanism, &mechanism_translation);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unknown finder mechanism: " + using_parameter_iterator->second.asString());
				return;
			}

			int timeout(session.implicit_wait_timeout());
			clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
			if (timeout > 0 && timeout < 1000)  {
				end += 1 * CLOCKS_PER_SEC;
			}

			Json::Value found_elements(Json::arrayValue);
			do {
				status_code = session.LocateElements(ElementHandle(), mechanism_translation, value, &found_elements);
				if (status_code == SUCCESS && found_elements.size() > 0) {
					break;
				} else {
					::Sleep(100);
				}
			} while (clock() < end);

			if (status_code == SUCCESS) {
				response->SetResponse(SUCCESS, found_elements);
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDELEMENTSCOMMANDHANDLER_H_
