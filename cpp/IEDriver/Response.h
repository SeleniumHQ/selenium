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

#ifndef WEBDRIVER_IE_RESPONSE_H_
#define WEBDRIVER_IE_RESPONSE_H_

#include <string>
#include "json.h"

using namespace std;

namespace webdriver {

class Response {
public:
	Response(void);
	Response(std::string session_id);
	virtual ~Response(void);
	std::wstring Serialize(void);
	void Deserialize(const std::wstring& json);

	int status_code(void) const { return this->status_code_; }

	Json::Value value(void) const { return this->m_value; }

	void SetResponse(const int status_code, const Json::Value& response_value);
	void SetErrorResponse(const int error_code, const std::string& message);

private:
	int status_code_;
	std::string session_id_;
	Json::Value m_value;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_RESPONSE_H_
