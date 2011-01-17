#ifndef WEBDRIVER_IE_WEBDRIVERRESPONSE_H_
#define WEBDRIVER_IE_WEBDRIVERRESPONSE_H_

#include <string>
#include "json.h"

using namespace std;

namespace webdriver {

class WebDriverResponse {
public:
	WebDriverResponse(void);
	WebDriverResponse(std::string session_id);
	virtual ~WebDriverResponse(void);
	std::wstring Serialize(void);
	void Deserialize(std::wstring json);

	int status_code(void) { return this->status_code_; }

	Json::Value value(void) { return this->m_value; }

	void SetResponse(int status_code, Json::Value response_value);
	void SetErrorResponse(int error_code, std::string message);

private:
	int status_code_;
	std::string session_id_;
	Json::Value m_value;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_WEBDRIVERRESPONSE_H_
