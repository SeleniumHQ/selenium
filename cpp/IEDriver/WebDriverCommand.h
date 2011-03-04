#ifndef WEBDRIVER_IE_WEBDRIVERCOMMAND_H_
#define WEBDRIVER_IE_WEBDRIVERCOMMAND_H_

#include <map>
#include "json.h"

using namespace std;

namespace webdriver {

class WebDriverCommand {
public:
	WebDriverCommand();
	virtual ~WebDriverCommand(void);
	void Populate(const std::string& json_command);

	int command_value(void) const { return this->command_value_; }
	std::map<std::string, std::string> locator_parameters(void) const { return this->locator_parameters_; }
	std::map<std::string, Json::Value> command_parameters(void) const { return this->command_parameters_; }

private:
	int command_value_;
	std::map<std::string, std::string> locator_parameters_;
	std::map<std::string, Json::Value> command_parameters_;

};

} // namespace webdriver

#endif // WEBDRIVER_IE_WEBDRIVERCOMMAND_H_
