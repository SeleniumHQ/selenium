// Copyright 2011 WebDriver committers
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#ifndef WEBDRIVER_IE_COMMAND_H_
#define WEBDRIVER_IE_COMMAND_H_

#include <map>
#include "json.h"

using namespace std;

namespace webdriver {

class Command {
public:
	Command();
	virtual ~Command(void);
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

#endif // WEBDRIVER_IE_COMMAND_H_
