#ifndef WEBDRIVER_IE_IEDRIVERSERVER_H_
#define WEBDRIVER_IE_IEDRIVERSERVER_H_

#include <vector>
#include <map>
#include <sstream>
#include <string>
#include "mongoose.h"
#include "BrowserManager.h"

#define SERVER_DEFAULT_PAGE "<html><head><title>WebDriver</title></head><body><p id='main'>This is the initial start page for the IE WebDriver.</p></body></html>"

using namespace std;

namespace webdriver {

class IEDriverServer {
public:
	IEDriverServer(int port);
	virtual ~IEDriverServer(void);
	int ProcessRequest(struct mg_connection *conn, const struct mg_request_info *request_info);
	int session_count(void) const { return static_cast<int>(this->sessions_.size()); }
	int port(void) const { return this->port_; }

private:
	int LookupCommand(const std::string& uri, const std::string& http_verb, std::wstring *session_id, std::wstring *locator);
	std::wstring CreateSession(void);
	void ShutDownSession(const std::wstring& session_id);
	std::wstring ReadRequestBody(struct mg_connection *conn, const struct mg_request_info *request_info);
	std::wstring SendCommandToManager(const std::wstring& session_id, const std::wstring& serialized_command);
	int SendResponseToBrowser(struct mg_connection *conn, const struct mg_request_info *request_info, const std::wstring& serialized_response);
	void PopulateCommandRepository(void);

	void SendWelcomePage(mg_connection *connection, const mg_request_info *request_info);
	void SendHttpOk(mg_connection *connection, const mg_request_info *request_info, const std::wstring& body);
	void SendHttpBadRequest(mg_connection *connection, const mg_request_info *request_info, const std::wstring& body);
	void SendHttpInternalError(mg_connection *connection, const mg_request_info *request_info, const std::wstring& body);
	void SendHttpMethodNotAllowed(mg_connection *connection, const mg_request_info *request_info, const std::wstring& allowed_methods);
	void SendHttpNotFound(mg_connection *connection, const mg_request_info *request_info, const std::wstring& body);
	void SendHttpNotImplemented(mg_connection *connection, const mg_request_info *request_info, const std::string& body);
	void SendHttpSeeOther(mg_connection *connection, const mg_request_info *request_info, const std::string& location);

	int port_;
	std::map<std::string, std::map<std::string, int>> command_repository_;
	std::map<std::wstring, HWND> sessions_;
};

} //namespace WebDriver

#endif // WEBDRIVER_IE_IEDRIVERSERVER_H_
