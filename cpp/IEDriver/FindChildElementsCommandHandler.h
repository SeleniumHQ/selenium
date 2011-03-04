#ifndef WEBDRIVER_IE_FINDCHILDELEMENTSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDCHILDELEMENTSCOMMANDHANDLER_H_

#include <ctime>
#include "BrowserManager.h"

namespace webdriver {

class FindChildElementsCommandHandler : public WebDriverCommandHandler {
public:
	FindChildElementsCommandHandler(void) {
	}

	virtual ~FindChildElementsCommandHandler(void) {
	}

protected:
	void FindChildElementsCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		std::map<std::string, Json::Value>::const_iterator using_parameter_iterator = command_parameters.find("using");
		std::map<std::string, Json::Value>::const_iterator value_parameter_iterator = command_parameters.find("value");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (using_parameter_iterator == command_parameters.end()) {
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

			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			std::tr1::shared_ptr<ElementWrapper> parent_element_wrapper;
			status_code = this->GetElement(manager, element_id, &parent_element_wrapper);

			if (status_code == SUCCESS) {
				Json::Value found_elements(Json::arrayValue);

				int timeout(manager->implicit_wait_timeout());
				clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
				if (timeout > 0 && timeout < 1000) {
					end += 1 * CLOCKS_PER_SEC;
				}

				status_code = SUCCESS;
				do {
					status_code = finder->FindElements(manager, parent_element_wrapper, value, &found_elements);
					if (status_code == SUCCESS && found_elements.size() > 0) {
						break;
					}
				} while (clock() < end);

				if (status_code == SUCCESS) {
					response->SetResponse(SUCCESS, found_elements);
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDCHILDELEMENTSCOMMANDHANDLER_H_
