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

#ifndef WEBDRIVER_IE_COMMANDHANDLER_H_
#define WEBDRIVER_IE_COMMANDHANDLER_H_

#include <map>
#include <string>
#include "json.h"
#include "Command.h"
#include "Element.h"
#include "Response.h"

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class Session;

class CommandHandler {
public:
	typedef std::map<std::string, std::string> LocatorMap;
	typedef std::map<std::string, Json::Value> ParametersMap;

	CommandHandler(void);
	virtual ~CommandHandler(void);
	void Execute(const Session& session, const Command& command, Response* response);

protected:
	virtual void ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response* response);
	int GetElement(const Session& session, const std::wstring& element_id, ElementHandle* element_wrapper);
	std::wstring ConvertVariantToWString(VARIANT* to_convert);
};

typedef std::tr1::shared_ptr<CommandHandler> CommandHandlerHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_COMMANDHANDLER_H_
