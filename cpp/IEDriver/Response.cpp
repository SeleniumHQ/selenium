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

#include "StdAfx.h"
#include "Response.h"

namespace webdriver {

Response::Response(void) : status_code_(0), session_id_("") {
}

Response::Response(std::string session_id) {
	this->session_id_ = session_id;
	this->status_code_ = 0;
}

Response::~Response(void) {
}

void Response::Deserialize(const std::wstring& json) {
	Json::Value response_object;
	Json::Reader reader;
	std::string input(CW2A(json.c_str(), CP_UTF8));
	reader.parse(input, response_object);
	this->status_code_ = response_object["status"].asInt();
	this->session_id_ = response_object["sessionId"].asString();
	this->m_value = response_object["value"];
}

std::wstring Response::Serialize(void) {
	Json::Value json_object;
	json_object["status"] = this->status_code_;
	json_object["sessionId"] = this->session_id_;
	json_object["value"] = this->m_value;
	Json::FastWriter writer;
	std::string output(writer.write(json_object));
	std::wstring response(CA2W(output.c_str(), CP_UTF8));
	return response;
}

void Response::SetResponse(const int status_code, const Json::Value& response_value) {
	this->status_code_ = status_code;
	this->m_value = response_value;
}

void Response::SetErrorResponse(const int status_code, const std::string& message) {
	this->status_code_ = status_code;
	this->m_value["message"] = message;
}

} // namespace webdriver