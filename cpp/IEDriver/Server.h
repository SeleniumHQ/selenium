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

#ifndef WEBDRIVER_IE_SERVER_H_
#define WEBDRIVER_IE_SERVER_H_

#include <vector>
#include <map>
#include <sstream>
#include <string>
#include "mongoose.h"
#include "CommandValues.h"
#include "ErrorCodes.h"
#include "IESession.h"
#include "Response.h"
#include "Session.h"

#define SERVER_DEFAULT_PAGE "<html><head><title>WebDriver</title></head><body><p id='main'>This is the initial start page for the IE WebDriver.</p></body></html>"

using namespace std;

namespace webdriver {

class Server {
public:
	Server(int port);
	virtual ~Server(void);
	int ProcessRequest(struct mg_connection* conn, const struct mg_request_info* request_info);
	int session_count(void) const { return static_cast<int>(this->sessions_.size()); }
	int port(void) const { return this->port_; }

private:
	typedef std::map<std::string, int> VerbMap;
	typedef std::map<std::string, VerbMap> UrlMap;
	typedef std::map<std::wstring, SessionHandle> SessionMap;

	int LookupCommand(const std::string& uri, const std::string& http_verb, std::wstring* session_id, std::wstring* locator);
	std::wstring CreateSession(void);
	void ShutDownSession(const std::wstring& session_id);
	std::wstring ReadRequestBody(struct mg_connection* conn, const struct mg_request_info* request_info);
	bool LookupSession(const std::wstring& session_id, SessionHandle* session_handle);
	int SendResponseToBrowser(struct mg_connection* conn, const struct mg_request_info* request_info, const std::wstring& serialized_response);
	void PopulateCommandRepository(void);

	void SendWelcomePage(mg_connection* connection, const mg_request_info* request_info);
	void SendHttpOk(mg_connection* connection, const mg_request_info* request_info, const std::wstring& body);
	void SendHttpBadRequest(mg_connection* connection, const mg_request_info* request_info, const std::wstring& body);
	void SendHttpInternalError(mg_connection* connection, const mg_request_info* request_info, const std::wstring& body);
	void SendHttpMethodNotAllowed(mg_connection* connection, const mg_request_info* request_info, const std::wstring& allowed_methods);
	void SendHttpNotFound(mg_connection* connection, const mg_request_info* request_info, const std::wstring& body);
	void SendHttpNotImplemented(mg_connection* connection, const mg_request_info* request_info, const std::string& body);
	void SendHttpSeeOther(mg_connection* connection, const mg_request_info* request_info, const std::string& location);

	int port_;
	UrlMap commands_;
	SessionMap sessions_;
};

} //namespace WebDriver

#endif // WEBDRIVER_IE_SERVER_H_
