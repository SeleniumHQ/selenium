#include "StdAfx.h"
#include <regex>
#include "IEDriverServer.h"

namespace webdriver {

IEDriverServer::IEDriverServer(int port) {
	this->port_ = port;
	this->PopulateCommandRepository();
}

IEDriverServer::~IEDriverServer(void) {
	if (this->sessions_.size() > 0) {
		vector<std::wstring> session_ids;
		std::map<std::wstring, HWND>::iterator it = this->sessions_.begin();
		for (; it != this->sessions_.end(); ++it) {
			session_ids.push_back(it->first);
		}

		for (size_t index = 0; index < session_ids.size(); ++index) {
			this->ShutDownSession(session_ids[index]);
		}
	}
}

std::wstring IEDriverServer::CreateSession() {
	DWORD thread_id;
	HWND manager_window_handle = NULL;
	HANDLE event_handle = ::CreateEvent(NULL, TRUE, FALSE, EVENT_NAME);
	HANDLE thread_handle = ::CreateThread(NULL, 0, &BrowserManager::ThreadProc, (LPVOID)&manager_window_handle, 0, &thread_id);
	::WaitForSingleObject(event_handle, INFINITE);
	::CloseHandle(event_handle);
	::CloseHandle(thread_handle);

	::SendMessage(manager_window_handle, WD_INIT, (WPARAM)this->port_, NULL);

	vector<TCHAR> window_text_buffer(37);
	::GetWindowText(manager_window_handle, &window_text_buffer[0], 37);
	std::wstring manager_id = &window_text_buffer[0];

	this->sessions_[manager_id] = manager_window_handle;
	return manager_id;
}

void IEDriverServer::ShutDownSession(std::wstring session_id) {
	std::map<std::wstring, HWND>::iterator it = this->sessions_.find(session_id);
	if (it != this->sessions_.end()) {
		::SendMessage(it->second, WM_CLOSE, NULL, NULL);
		this->sessions_.erase(session_id);
	}
}

std::wstring IEDriverServer::ReadRequestBody(struct mg_connection *conn, const struct mg_request_info *request_info) {
	std::wstring request_body = L"";
	int content_length = 0;
	for (int header_index = 0; header_index < 64; ++header_index) {
		if (request_info->http_headers[header_index].name == NULL) {
			break;
		}
		if (strcmp(request_info->http_headers[header_index].name, "Content-Length") == 0) {
			content_length = atoi(request_info->http_headers[header_index].value);
			break;
		}
	}
	if (content_length == 0) {
		request_body = L"{}";
	} else {
		std::vector<char> input_buffer(content_length + 1);
		int bytes_read = 0;
		while (bytes_read < content_length) {
			bytes_read += mg_read(conn, &input_buffer[bytes_read], content_length - bytes_read);
		}
		input_buffer[content_length] = '\0';
		int output_buffer_size = ::MultiByteToWideChar(CP_UTF8, 0, &input_buffer[0], -1, NULL, 0);
		vector<TCHAR> output_buffer(output_buffer_size);
		::MultiByteToWideChar(CP_UTF8, 0, &input_buffer[0], -1, &output_buffer[0], output_buffer_size);
		request_body.append(&output_buffer[0], bytes_read);
	}

	return request_body;
}

int IEDriverServer::ProcessRequest(struct mg_connection *conn, const struct mg_request_info *request_info) {
	int return_code = NULL;
	std::string http_verb = request_info->request_method;
	std::wstring request_body = L"{}";
	if (http_verb == "POST") {
		request_body = this->ReadRequestBody(conn, request_info);
	}

	if (strcmp(request_info->uri, "/") == 0) {
		this->SendWelcomePage(conn, request_info);
		return_code = 200;
	} else {
		std::wstring session_id = L"";
		std::wstring locator_parameters = L"";
		int command = this->LookupCommand(request_info->uri, http_verb, &session_id, &locator_parameters);
		if (command == NoCommand) {
			if (locator_parameters.size() != 0) {
				this->SendHttpMethodNotAllowed(conn, request_info, locator_parameters);
			} else {
				this->SendHttpNotImplemented(conn, request_info, "Command not implemented");
			}
		} else {
			if (command == NewSession) {
				session_id = this->CreateSession();                                             
			}

			// Compile the serialized JSON representation of the command by hand.
			std::wstringstream command_value_stream;
			command_value_stream << command;
			std::wstring command_value = command_value_stream.str();

			std::wstring serialized_command = L"{ \"command\" : " + command_value + L", \"locator\" : " + locator_parameters + L", \"parameters\" : " + request_body + L" }";
			std::wstring serialized_response = this->SendCommandToManager(session_id, serialized_command);
			return_code = this->SendResponseToBrowser(conn, request_info, serialized_response);

			if (command == Quit) {
				this->ShutDownSession(session_id);
			}
		}
	}

	return return_code;
}

std::wstring IEDriverServer::SendCommandToManager(std::wstring session_id, std::wstring serialized_command) {
	// Sending a command consists of four actions:
	// 1. Setting the command to be executed
	// 2. Executing the command
	// 3. Waiting for the response to be populated
	// 4. Retrieving the response
	std::map<std::wstring, HWND>::iterator it = this->sessions_.find(session_id);
	if (it == this->sessions_.end()) {
		// Hand-code the response for an invalid session id
		return L"{ status : 404, sessionId : \"" + session_id + L"\", value : \"session " + session_id + L" does not exist\" }";
	}

	HWND manager_window_handle = it->second;
	::SendMessage(manager_window_handle, WD_SET_COMMAND, NULL, (LPARAM)serialized_command.c_str());
	::PostMessage(manager_window_handle, WD_EXEC_COMMAND, NULL, NULL);
	
	int response_length = (int)::SendMessage(manager_window_handle, WD_GET_RESPONSE_LENGTH, NULL, NULL);
	while (response_length == 0) {
		// Sleep a short time to prevent thread starvation on single-core machines.
		::Sleep(10);
		response_length = (int)::SendMessage(manager_window_handle, WD_GET_RESPONSE_LENGTH, NULL, NULL);
	}

	// Must add one to the length to handle the terminating character.
	std::vector<TCHAR> response_buffer(response_length + 1);
	::SendMessage(manager_window_handle, WD_GET_RESPONSE, NULL, (LPARAM)&response_buffer[0]);
	std::wstring serialized_response(&response_buffer[0]);
	response_buffer.clear();
	return serialized_response;
}

int IEDriverServer::SendResponseToBrowser(struct mg_connection *conn, const struct mg_request_info *request_info, std::wstring serialized_response) {
	int return_code = 0;
	if (serialized_response.size() > 0) {
		WebDriverResponse response;
		response.Deserialize(serialized_response);
		if (response.status_code() == 0) {
			this->SendHttpOk(conn, request_info, serialized_response);
			return_code = 200;
		} else if (response.status_code() == 303) {
			std::string location = response.value().asString();
			response.SetResponse(SUCCESS, response.value());
			this->SendHttpSeeOther(conn, request_info, location);
			return_code = 303;
		} else if (response.status_code() == 400) {
			this->SendHttpBadRequest(conn, request_info, serialized_response);
			return_code = 400;
		} else if (response.status_code() == 404) {
			this->SendHttpNotFound(conn, request_info, serialized_response);
			return_code = 404;
		} else if (response.status_code() == 501) {
			this->SendHttpNotImplemented(conn, request_info, "Command not implemented");
			return_code = 501;
		} else {
			this->SendHttpInternalError(conn, request_info, serialized_response);
			return_code = 500;
		}
	}
	return return_code;
}

void IEDriverServer::SendWelcomePage(struct mg_connection* connection,
                const struct mg_request_info* request_info) {
	std::string page_body(SERVER_DEFAULT_PAGE);
	std::ostringstream out;
	out << "HTTP/1.1 200 OK\r\n"
		<< "Content-Length: " << strlen(page_body.c_str()) << "\r\n"
		<< "Content-Type: text/html; charset=UTF-8\r\n"
		<< "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
		<< "Accept-Ranges: bytes\r\n"
		<< "Connection: close\r\n\r\n";
	if (strcmp(request_info->request_method, "HEAD") != 0) {
		out << page_body << "\r\n";
	}

	mg_write(connection, out.str().c_str(), out.str().size());
}

// The standard HTTP Status codes are implemented below.  Chrome uses
// OK, See Other, Not Found, Method Not Allowed, and Internal Error.
// Internal Error, HTTP 500, is used as a catch all for any issue
// not covered in the JSON protocol.
void IEDriverServer::SendHttpOk(struct mg_connection* connection,
                const struct mg_request_info* request_info,
				std::wstring body) {
	std::string narrow_body(CW2A(body.c_str(), CP_UTF8));
	std::ostringstream out;
	out << "HTTP/1.1 200 OK\r\n"
		<< "Content-Length: " << strlen(narrow_body.c_str()) << "\r\n"
		<< "Content-Type: application/json; charset=UTF-8\r\n"
		<< "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
		<< "Accept-Ranges: bytes\r\n"
		<< "Connection: close\r\n\r\n";
	if (strcmp(request_info->request_method, "HEAD") != 0) {
		out << narrow_body << "\r\n";
	}

	mg_write(connection, out.str().c_str(), out.str().size());
}

void IEDriverServer::SendHttpBadRequest(struct mg_connection* const connection,
                        const struct mg_request_info* const request_info,
				        std::wstring body) {
	std::string narrow_body(CW2A(body.c_str(), CP_UTF8));
	std::ostringstream out;
	out << "HTTP/1.1 400 Bad Request\r\n"
		<< "Content-Length: " << strlen(narrow_body.c_str()) << "\r\n"
		<< "Content-Type: application/json; charset=UTF-8\r\n"
		<< "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
		<< "Accept-Ranges: bytes\r\n"
		<< "Connection: close\r\n\r\n";
	if (strcmp(request_info->request_method, "HEAD") != 0) {
		out << narrow_body << "\r\n";
	}

	mg_printf(connection, "%s", out.str().c_str());
}

void IEDriverServer::SendHttpInternalError(struct mg_connection* connection,
                           const struct mg_request_info* request_info,
						   std::wstring body) {
	std::string narrow_body(CW2A(body.c_str(), CP_UTF8));
	std::ostringstream out;
	out << "HTTP/1.1 500 Internal Server Error\r\n"
		<< "Content-Length: " << strlen(narrow_body.c_str()) << "\r\n"
		<< "Content-Type: application/json; charset=UTF-8\r\n"
		<< "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
		<< "Accept-Ranges: bytes\r\n"
		<< "Connection: close\r\n\r\n";
	if (strcmp(request_info->request_method, "HEAD") != 0) {
		out << narrow_body << "\r\n";
	}

	mg_write(connection, out.str().c_str(), out.str().size());
}

void IEDriverServer::SendHttpNotFound(struct mg_connection* const connection,
                      const struct mg_request_info* const request_info,
				      std::wstring body) {
	std::string narrow_body(CW2A(body.c_str(), CP_UTF8));
	std::ostringstream out;
	out << "HTTP/1.1 404 Not Found\r\n"
		<< "Content-Length: " << strlen(narrow_body.c_str()) << "\r\n"
		<< "Content-Type: application/json; charset=UTF-8\r\n"
		<< "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
		<< "Accept-Ranges: bytes\r\n"
		<< "Connection: close\r\n\r\n";
	if (strcmp(request_info->request_method, "HEAD") != 0) {
		out << narrow_body << "\r\n";
	}

	mg_printf(connection, "%s", out.str().c_str());
}

void IEDriverServer::SendHttpMethodNotAllowed(struct mg_connection* connection,
							const struct mg_request_info* request_info,
							std::wstring allowed_methods) {
	std::string narrow_body(CW2A(allowed_methods.c_str(), CP_UTF8));
	std::ostringstream out;
	out << "HTTP/1.1 405 Method Not Allowed\r\n"
		<< "Content-Type: text/html\r\n"
		<< "Content-Length: 0\r\n"
		<< "Allow: " << narrow_body << "\r\n\r\n";

	mg_write(connection, out.str().c_str(), out.str().size());
}

void IEDriverServer::SendHttpNotImplemented(struct mg_connection* connection,
							const struct mg_request_info* request_info,
							std::string body) {
	std::ostringstream out;
	out << "HTTP/1.1 501 Not Implemented\r\n"
		<< "Content-Type: text/html\r\n"
		<< "Content-Length: 0\r\n"
		<< "Allow: " << body << "\r\n\r\n";

	mg_write(connection, out.str().c_str(), out.str().size());
}

void IEDriverServer::SendHttpSeeOther(struct mg_connection* connection,
							const struct mg_request_info* request_info,
							std::string location) {
	std::ostringstream out;
	out << "HTTP/1.1 303 See Other\r\n"
		<< "Location: " << location << "\r\n"
		<< "Content-Type: text/html\r\n"
		<< "Content-Length: 0\r\n\r\n";

	mg_write(connection, out.str().c_str(), out.str().size());
}

int IEDriverServer::LookupCommand(std::string uri, std::string http_verb, std::wstring *session_id, std::wstring *locator) {
	int value = NoCommand;
	std::map<std::string, map<std::string, int>>::iterator it = this->command_repository_.begin();
	for (; it != this->command_repository_.end(); ++it) {
		std::vector<std::string> locator_param_names;
		std::string url_candidate = (*it).first;
		size_t param_start_pos = url_candidate.find_first_of(":");
		while (param_start_pos != std::string.npos) {
			size_t param_len = std::string.npos;
			size_t param_end_pos = url_candidate.find_first_of("/", param_start_pos);
			if (param_end_pos != std::string.npos) {
				param_len = param_end_pos - param_start_pos;
			}

			// Skip the colon
			std::string param_name = url_candidate.substr(param_start_pos + 1, param_len - 1);
			locator_param_names.push_back(param_name);
			if (param_name == "sessionid" || param_name == "id") {
				url_candidate.replace(param_start_pos, param_len, "([0-9a-fA-F-]+)");
			} else {
				url_candidate.replace(param_start_pos, param_len, "([^/]+)");
			}
			param_start_pos = url_candidate.find_first_of(":");
		}

		std::string::const_iterator uri_start = uri.begin();
		std::string::const_iterator uri_end = uri.end(); 
		std::tr1::regex matcher("^" + url_candidate + "$");
		std::tr1::match_results<std::string::const_iterator> matches;
		if (std::tr1::regex_search(uri_start, uri_end, matches, matcher)) {
			if (it->second.find(http_verb) != it->second.end()) {
				value = it->second[http_verb];
				std::string param = "{";
				size_t param_count = locator_param_names.size();
				for (unsigned int i = 0; i < param_count; i++) {
					if (i != 0) {
						param += ",";
					}

					std::string locator_param_value(matches[i + 1].first, matches[i + 1].second);
					param += " \"" + locator_param_names[i] + "\" : \"" + locator_param_value + "\"";
					if (locator_param_names[i] == "sessionid") {
						session_id->append(CA2W(locator_param_value.c_str(), CP_UTF8));
					}
				}

				param += " }";
				std::wstring wide_param(param.begin(), param.end());
				locator->append(wide_param);
				break;
			} else {
				std::map<std::string, int>::iterator verb_iterator = it->second.begin();
				for (; verb_iterator != it->second.end(); ++verb_iterator) {
					if (locator->size() != 0) {
						locator->append(L",");
					}
					locator->append(CA2W(verb_iterator->first.c_str(), CP_UTF8));
				}
			}
		}
	}

	return value;
}

void IEDriverServer::PopulateCommandRepository() {
	this->command_repository_["/session"]["POST"] = NewSession;
	this->command_repository_["/session/:sessionid"]["GET"] = GetSessionCapabilities;
	this->command_repository_["/session/:sessionid"]["DELETE"] = Quit;
	this->command_repository_["/session/:sessionid/window_handle"]["GET"] = GetCurrentWindowHandle;
	this->command_repository_["/session/:sessionid/window_handles"]["GET"] = GetWindowHandles;
	this->command_repository_["/session/:sessionid/url"]["GET"] = GetCurrentUrl;
	this->command_repository_["/session/:sessionid/url"]["POST"] = Get;
	this->command_repository_["/session/:sessionid/forward"]["POST"] = GoForward;
	this->command_repository_["/session/:sessionid/back"]["POST"] = GoBack;
	//this->command_repository_["/session/:sessionid/refresh"]["POST"] = Refresh;
	this->command_repository_["/session/:sessionid/speed"]["GET"] = GetSpeed;
	this->command_repository_["/session/:sessionid/speed"]["POST"] = SetSpeed;
	this->command_repository_["/session/:sessionid/execute"]["POST"] = ExecuteScript;
	this->command_repository_["/session/:sessionid/execute_async"]["POST"] = ExecuteAsyncScript;
	this->command_repository_["/session/:sessionid/screenshot"]["GET"] = Screenshot;
	this->command_repository_["/session/:sessionid/frame"]["POST"] = SwitchToFrame;
	this->command_repository_["/session/:sessionid/window"]["POST"] = SwitchToWindow;
	this->command_repository_["/session/:sessionid/window"]["DELETE"] = Close;
	this->command_repository_["/session/:sessionid/cookie"]["GET"] = GetAllCookies;
	this->command_repository_["/session/:sessionid/cookie"]["POST"] = AddCookie;
	this->command_repository_["/session/:sessionid/cookie"]["DELETE"] = DeleteAllCookies;
	this->command_repository_["/session/:sessionid/cookie/:name"]["DELETE"] = DeleteCookie;
	this->command_repository_["/session/:sessionid/source"]["GET"] = GetPageSource;
	this->command_repository_["/session/:sessionid/title"]["GET"] = GetTitle;
	this->command_repository_["/session/:sessionid/element"]["POST"] = FindElement;
	this->command_repository_["/session/:sessionid/elements"]["POST"] = FindElements;
	this->command_repository_["/session/:sessionid/timeouts/implicit_wait"]["POST"] = ImplicitlyWait;
	this->command_repository_["/session/:sessionid/timeouts/async_script"]["POST"] = SetAsyncScriptTimeout;
	this->command_repository_["/session/:sessionid/element/active"]["POST"] = GetActiveElement;
	this->command_repository_["/session/:sessionid/element/:id/element"]["POST"] = FindChildElement;
	this->command_repository_["/session/:sessionid/element/:id/elements"]["POST"] = FindChildElements;
	this->command_repository_["/session/:sessionid/element/:id"]["GET"] = DescribeElement;
	this->command_repository_["/session/:sessionid/element/:id/click"]["POST"] = ClickElement;
	this->command_repository_["/session/:sessionid/element/:id/text"]["GET"] = GetElementText;
	this->command_repository_["/session/:sessionid/element/:id/submit"]["POST"] = SubmitElement;
	this->command_repository_["/session/:sessionid/element/:id/value"]["GET"] = GetElementValue;
	this->command_repository_["/session/:sessionid/element/:id/value"]["POST"] = SendKeysToElement;
	this->command_repository_["/session/:sessionid/element/:id/name"]["GET"] = GetElementTagName;
	this->command_repository_["/session/:sessionid/element/:id/clear"]["POST"] = ClearElement;
	this->command_repository_["/session/:sessionid/element/:id/selected"]["GET"] = IsElementSelected;
	this->command_repository_["/session/:sessionid/element/:id/selected"]["POST"] = SetElementSelected;
	this->command_repository_["/session/:sessionid/element/:id/toggle"]["POST"] = ToggleElement;
	this->command_repository_["/session/:sessionid/element/:id/enabled"]["GET"] = IsElementEnabled;
	this->command_repository_["/session/:sessionid/element/:id/displayed"]["GET"] = IsElementDisplayed;
	this->command_repository_["/session/:sessionid/element/:id/location"]["GET"] = GetElementLocation;
	this->command_repository_["/session/:sessionid/element/:id/location_in_view"]["GET"] = GetElementLocationOnceScrolledIntoView;
	this->command_repository_["/session/:sessionid/element/:id/size"]["GET"] = GetElementSize;
	this->command_repository_["/session/:sessionid/element/:id/css/:propertyName"]["GET"] = GetElementValueOfCssProperty;
	this->command_repository_["/session/:sessionid/element/:id/attribute/:name"]["GET"] = GetElementAttribute;
	this->command_repository_["/session/:sessionid/element/:id/equals/:other"]["GET"] = ElementEquals;
	this->command_repository_["/session/:sessionid/element/:id/hover"]["POST"] = HoverOverElement;
	this->command_repository_["/session/:sessionid/element/:id/drag"]["POST"] = DragElement;
	this->command_repository_["/session/:sessionid/screenshot"]["GET"] = Screenshot;

	this->command_repository_["/session/:sessionid/accept_alert"]["POST"] = AcceptAlert;
	this->command_repository_["/session/:sessionid/dismiss_alert"]["POST"] = DismissAlert;
	this->command_repository_["/session/:sessionid/alert_text"]["GET"] = GetAlertText;
	this->command_repository_["/session/:sessionid/alert_text"]["POST"] = SendKeysToAlert;

	this->command_repository_["/session/:sessionid/modifier"]["POST"] = SendModifierKey;
	this->command_repository_["/session/:sessionid/moveto"]["POST"] = MouseMoveTo;
	this->command_repository_["/session/:sessionid/click"]["POST"] = MouseClick;
	this->command_repository_["/session/:sessionid/doubleclick"]["POST"] = MouseDoubleClick;
	this->command_repository_["/session/:sessionid/buttondown"]["POST"] = MouseButtonDown;
	this->command_repository_["/session/:sessionid/buttonup"]["POST"] = MouseButtonUp;

	/*
	commandDictionary.Add(DriverCommand.DefineDriverMapping, new CommandInfo(CommandInfo.PostCommand, "/config/drivers"));
	commandDictionary.Add(DriverCommand.SetBrowserVisible, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/visible"));
	commandDictionary.Add(DriverCommand.IsBrowserVisible, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/visible"));
	*/
}

} // namespace webdriver