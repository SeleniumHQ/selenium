#ifndef WEBDRIVER_IE_IEDRIVERSERVER_H_
#define WEBDRIVER_IE_IEDRIVERSERVER_H_

#include <vector>
#include <map>
//#include <regex>
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

private:
	int LookupCommand(std::string uri, std::string http_verb, std::wstring *session_id, std::wstring *locator);
	std::wstring CreateSession(void);
	void ShutDownSession(std::wstring session_id);
	std::wstring ReadRequestBody(struct mg_connection *conn, const struct mg_request_info *request_info);
	std::wstring SendCommandToManager(std::wstring session_id, std::wstring serialized_command);
	int SendResponseToBrowser(struct mg_connection *conn, const struct mg_request_info *request_info, std::wstring serialized_response);
	void PopulateCommandRepository(void);

	void SendWelcomePage(mg_connection *connection, const mg_request_info *request_info);
	void SendHttpOk(mg_connection *connection, const mg_request_info *request_info, std::wstring body);
	void SendHttpBadRequest(mg_connection *connection, const mg_request_info *request_info, std::wstring body);
	void SendHttpInternalError(mg_connection *connection, const mg_request_info *request_info, std::wstring body);
	void SendHttpMethodNotAllowed(mg_connection *connection, const mg_request_info *request_info, std::wstring allowed_methods);
	void SendHttpNotFound(mg_connection *connection, const mg_request_info *request_info, std::wstring body);
	void SendHttpNotImplemented(mg_connection *connection, const mg_request_info *request_info, std::string body);
	void SendHttpSeeOther(mg_connection *connection, const mg_request_info *request_info, std::string location);

	int port_;
	std::map<std::string, std::map<std::string, int>> command_repository_;
	std::map<std::wstring, HWND> sessions_;
};

} //namespace WebDriver

#endif // WEBDRIVER_IE_IEDRIVERSERVER_H_
