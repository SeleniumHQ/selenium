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
	void FindChildElementsCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (command_parameters.find("using") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: using");
			return;
		} else if (command_parameters.find("value") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else {
			std::wstring mechanism = CA2W(command_parameters["using"].asString().c_str(), CP_UTF8);
			std::wstring value = CA2W(command_parameters["value"].asString().c_str(), CP_UTF8);

			ElementFinder *finder;
			int status_code = manager->GetElementFinder(mechanism, &finder);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unknown finder mechanism: " + command_parameters["using"].asString());
				return;
			}

			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			ElementWrapper *parent_element_wrapper;
			status_code = this->GetElement(manager, element_id, &parent_element_wrapper);

			if (status_code == SUCCESS) {
				std::vector<ElementWrapper *> found_elements;

				int timeout(manager->implicit_wait_timeout());
				clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
				if (timeout > 0 && timeout < 1000) {
					end += 1 * CLOCKS_PER_SEC;
				}

				int status_code = SUCCESS;
				do {
					status_code = finder->FindElements(manager, parent_element_wrapper, value, &found_elements);
					if (status_code == SUCCESS && found_elements.size() > 0) {
						break;
					}
				} while (clock() < end);

				if (status_code == SUCCESS) {
					Json::Value element_array(Json::arrayValue);
					for (unsigned int i = 0; i < found_elements.size(); ++i) {
						element_array[i] = found_elements[i]->ConvertToJson();
					}

					response->SetResponse(SUCCESS, element_array);
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
