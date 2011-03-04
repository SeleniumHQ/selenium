#include "StdAfx.h"
#include "WebDriverCommand.h"

namespace webdriver {

WebDriverCommand::WebDriverCommand() : command_value_(0) {
}

WebDriverCommand::~WebDriverCommand() {
}

void WebDriverCommand::Populate(const std::string& json_command) {
	// Clear the existing maps.
	this->command_parameters_.clear();
	this->locator_parameters_.clear();

	Json::Value root;
	Json::Reader reader;
	BOOL successful_parse = reader.parse(json_command, root);
	if (!successful_parse) {
		// report to the user the failure and their locations in the document.
		//std::cout  << "\nFailed to parse configuration\n"
		//		   << reader.getFormatedErrorMessages()
		//		   << "\nJSON: " << json_command << "\n";
	}

	this->command_value_ = root.get("command", 0).asInt();
	if (this->command_value_ != 0) {
		Json::Value locator_parameter_object = root["locator"];
		Json::Value::iterator end = locator_parameter_object.end();
		for (Json::Value::iterator it = locator_parameter_object.begin(); it != end; ++it) {
			std::string key = it.key().asString();
			std::string value = locator_parameter_object[key].asString();
			this->locator_parameters_[key] = value;
		}

		Json::Value command_parameter_object = root["parameters"];
		end = command_parameter_object.end();
		for (Json::Value::iterator it = command_parameter_object.begin(); it != end; ++it) {
			std::string key = it.key().asString();
			Json::Value value = command_parameter_object[key];
			this->command_parameters_[key] = value;
		}
	}
}

} // namespace webdriver