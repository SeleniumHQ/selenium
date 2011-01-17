#include "StdAfx.h"
#include "WebDriverResponse.h"

namespace webdriver {

WebDriverResponse::WebDriverResponse(void) : status_code_(0), session_id_("") {
}

WebDriverResponse::WebDriverResponse(std::string session_id) {
	this->session_id_ = session_id;
	this->status_code_ = 0;
}

WebDriverResponse::~WebDriverResponse(void) {
}

void WebDriverResponse::Deserialize(std::wstring json) {
	Json::Value response_object;
	Json::Reader reader;
	std::string input(CW2A(json.c_str(), CP_UTF8));
	reader.parse(input, response_object);
	this->status_code_ = response_object["status"].asInt();
	this->session_id_ = response_object["sessionId"].asString();
	this->m_value = response_object["value"];
}

std::wstring WebDriverResponse::Serialize(void) {
	Json::Value json_object;
	json_object["status"] = this->status_code_;
	json_object["sessionId"] = this->session_id_;
	json_object["value"] = this->m_value;
	Json::FastWriter writer;
	std::string output(writer.write(json_object));
	std::wstring response(CA2W(output.c_str(), CP_UTF8));
	return response;
}

void WebDriverResponse::SetResponse(int status_code, Json::Value response_value) {
	this->status_code_ = status_code;
	this->m_value = response_value;
}

void WebDriverResponse::SetErrorResponse(int status_code, std::string message) {
	this->status_code_ = status_code;
	this->m_value["message"] = message;
}

} // namespace webdriver