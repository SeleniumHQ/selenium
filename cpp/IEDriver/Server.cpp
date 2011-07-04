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
#include <regex>
#include "Server.h"
#include "logging.h"

namespace webdriver {

Server::Server(int port) {
	// It's possible to set the log level at compile time using this:
    LOG::Level("FATAL");
    LOG(INFO) << "Starting IE Driver server on port: " << port;
	this->port_ = port;
	this->PopulateCommandRepository();
}

Server::~Server(void) {
	if (this->sessions_.size() > 0) {
		vector<std::wstring> session_ids;
		SessionMap::iterator it = this->sessions_.begin();
		for (; it != this->sessions_.end(); ++it) {
			session_ids.push_back(it->first);
		}

		for (size_t index = 0; index < session_ids.size(); ++index) {
			this->ShutDownSession(session_ids[index]);
		}
	}
}

std::wstring Server::CreateSession() {
	// TODO: make this generic and not tightly bound to the IESession class
	SessionHandle session_handle(new IESession(this->port_));
	std::wstring session_id = session_handle->Initialize();

	this->sessions_[session_id] = session_handle;
	return session_id;
}

void Server::ShutDownSession(const std::wstring& session_id) {
	SessionMap::iterator it = this->sessions_.find(session_id);
	if (it != this->sessions_.end()) {
		it->second->ShutDown();
		this->sessions_.erase(session_id);
	}
}

std::wstring Server::ReadRequestBody(struct mg_connection* conn, const struct mg_request_info* request_info) {
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
		request_body.append(&output_buffer[0], output_buffer_size);
	}

	return request_body;
}

int Server::ProcessRequest(struct mg_connection* conn, const struct mg_request_info* request_info) {
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

			std::wstring serialized_response = L"";
			SessionHandle session_handle = NULL;
			if (!this->LookupSession(session_id, &session_handle)) {
				// Hand-code the response for an invalid session id
				serialized_response = L"{ \"status\" : 404, \"sessionId\" : \"" + session_id + L"\", \"value\" : \"session " + session_id + L" does not exist\" }";
			} else {
				// Compile the serialized JSON representation of the command by hand.
				std::wstringstream command_value_stream;
				command_value_stream << command;
				std::wstring command_value = command_value_stream.str();

				std::wstring serialized_command = L"{ \"command\" : " + command_value + L", \"locator\" : " + locator_parameters + L", \"parameters\" : " + request_body + L" }";
				bool session_is_valid = session_handle->ExecuteCommand(serialized_command, &serialized_response);
				if (!session_is_valid) {
					this->ShutDownSession(session_id);
				}
			}

			return_code = this->SendResponseToBrowser(conn, request_info, serialized_response);
		}
	}

	return return_code;
}

bool Server::LookupSession(const std::wstring& session_id, SessionHandle* session_handle) {
	SessionMap::iterator it = this->sessions_.find(session_id);
	if (it == this->sessions_.end()) {
		return false;
	}
	*session_handle = it->second;
	return true;
}

int Server::SendResponseToBrowser(struct mg_connection* conn, const struct mg_request_info* request_info, const std::wstring& serialized_response) {
	int return_code = 0;
	if (serialized_response.size() > 0) {
		Response response;
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

void Server::SendWelcomePage(struct mg_connection* connection,
                const struct mg_request_info* request_info) {
	std::string page_body = SERVER_DEFAULT_PAGE;
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
void Server::SendHttpOk(struct mg_connection* connection,
                const struct mg_request_info* request_info,
				const std::wstring& body) {
	std::string narrow_body = CW2A(body.c_str(), CP_UTF8);
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

void Server::SendHttpBadRequest(struct mg_connection* const connection,
                        const struct mg_request_info* const request_info,
				        const std::wstring& body) {
	std::string narrow_body = CW2A(body.c_str(), CP_UTF8);
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

void Server::SendHttpInternalError(struct mg_connection* connection,
                           const struct mg_request_info* request_info,
						   const std::wstring& body) {
	std::string narrow_body = CW2A(body.c_str(), CP_UTF8);
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

void Server::SendHttpNotFound(struct mg_connection* const connection,
                      const struct mg_request_info* const request_info,
				      const std::wstring& body) {
	std::string narrow_body = CW2A(body.c_str(), CP_UTF8);
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

void Server::SendHttpMethodNotAllowed(struct mg_connection* connection,
							const struct mg_request_info* request_info,
							const std::wstring& allowed_methods) {
	std::string narrow_body = CW2A(allowed_methods.c_str(), CP_UTF8);
	std::ostringstream out;
	out << "HTTP/1.1 405 Method Not Allowed\r\n"
		<< "Content-Type: text/html\r\n"
		<< "Content-Length: 0\r\n"
		<< "Allow: " << narrow_body << "\r\n\r\n";

	mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpNotImplemented(struct mg_connection* connection,
							const struct mg_request_info* request_info,
							const std::string& body) {
	std::ostringstream out;
	out << "HTTP/1.1 501 Not Implemented\r\n"
		<< "Content-Type: text/html\r\n"
		<< "Content-Length: 0\r\n"
		<< "Allow: " << body << "\r\n\r\n";

	mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpSeeOther(struct mg_connection* connection,
							const struct mg_request_info* request_info,
							const std::string& location) {
	std::ostringstream out;
	out << "HTTP/1.1 303 See Other\r\n"
		<< "Location: " << location << "\r\n"
		<< "Content-Type: text/html\r\n"
		<< "Content-Length: 0\r\n\r\n";

	mg_write(connection, out.str().c_str(), out.str().size());
}

int Server::LookupCommand(const std::string& uri, const std::string& http_verb, std::wstring* session_id, std::wstring* locator) {
	int value = NoCommand;
	UrlMap::const_iterator it = this->commands_.begin();
	for (; it != this->commands_.end(); ++it) {
		std::vector<std::string> locator_param_names;
		std::string url_candidate = it->first;
		size_t param_start_pos = url_candidate.find_first_of(":");
		while (param_start_pos != std::string::npos) {
			size_t param_len = std::string::npos;
			size_t param_end_pos = url_candidate.find_first_of("/", param_start_pos);
			if (param_end_pos != std::string::npos) {
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

		std::tr1::regex matcher("^" + url_candidate + "$");
		std::tr1::match_results<std::string::const_iterator> matches;
		if (std::tr1::regex_search(uri, matches, matcher)) {
			VerbMap::const_iterator verb_iterator = it->second.find(http_verb);
			if (verb_iterator != it->second.end()) {
				value = verb_iterator->second;
				std::string param = "{";
				size_t param_count = locator_param_names.size();
				for (unsigned int i = 0; i < param_count; i++) {
					if (i != 0) {
						param += ",";
					}

					std::string locator_param_value = matches[i + 1].str();
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
				verb_iterator = it->second.begin();
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

void Server::PopulateCommandRepository() {
	this->commands_["/session"]["POST"] = NewSession;
	this->commands_["/session/:sessionid"]["GET"] = GetSessionCapabilities;
	this->commands_["/session/:sessionid"]["DELETE"] = Quit;
	this->commands_["/session/:sessionid/window_handle"]["GET"] = GetCurrentWindowHandle;
	this->commands_["/session/:sessionid/window_handles"]["GET"] = GetWindowHandles;
	this->commands_["/session/:sessionid/url"]["GET"] = GetCurrentUrl;
	this->commands_["/session/:sessionid/url"]["POST"] = Get;
	this->commands_["/session/:sessionid/forward"]["POST"] = GoForward;
	this->commands_["/session/:sessionid/back"]["POST"] = GoBack;
	this->commands_["/session/:sessionid/refresh"]["POST"] = Refresh;
	this->commands_["/session/:sessionid/speed"]["GET"] = GetSpeed;
	this->commands_["/session/:sessionid/speed"]["POST"] = SetSpeed;
	this->commands_["/session/:sessionid/execute"]["POST"] = ExecuteScript;
	this->commands_["/session/:sessionid/execute_async"]["POST"] = ExecuteAsyncScript;
	this->commands_["/session/:sessionid/screenshot"]["GET"] = Screenshot;
	this->commands_["/session/:sessionid/frame"]["POST"] = SwitchToFrame;
	this->commands_["/session/:sessionid/window"]["POST"] = SwitchToWindow;
	this->commands_["/session/:sessionid/window"]["DELETE"] = Close;
	this->commands_["/session/:sessionid/cookie"]["GET"] = GetAllCookies;
	this->commands_["/session/:sessionid/cookie"]["POST"] = AddCookie;
	this->commands_["/session/:sessionid/cookie"]["DELETE"] = DeleteAllCookies;
	this->commands_["/session/:sessionid/cookie/:name"]["DELETE"] = DeleteCookie;
	this->commands_["/session/:sessionid/source"]["GET"] = GetPageSource;
	this->commands_["/session/:sessionid/title"]["GET"] = GetTitle;
	this->commands_["/session/:sessionid/element"]["POST"] = FindElement;
	this->commands_["/session/:sessionid/elements"]["POST"] = FindElements;
	this->commands_["/session/:sessionid/timeouts/implicit_wait"]["POST"] = ImplicitlyWait;
	this->commands_["/session/:sessionid/timeouts/async_script"]["POST"] = SetAsyncScriptTimeout;
	this->commands_["/session/:sessionid/element/active"]["POST"] = GetActiveElement;
	this->commands_["/session/:sessionid/element/:id/element"]["POST"] = FindChildElement;
	this->commands_["/session/:sessionid/element/:id/elements"]["POST"] = FindChildElements;
	this->commands_["/session/:sessionid/element/:id"]["GET"] = DescribeElement;
	this->commands_["/session/:sessionid/element/:id/click"]["POST"] = ClickElement;
	this->commands_["/session/:sessionid/element/:id/text"]["GET"] = GetElementText;
	this->commands_["/session/:sessionid/element/:id/submit"]["POST"] = SubmitElement;
	this->commands_["/session/:sessionid/element/:id/value"]["GET"] = GetElementValue;
	this->commands_["/session/:sessionid/element/:id/value"]["POST"] = SendKeysToElement;
	this->commands_["/session/:sessionid/element/:id/name"]["GET"] = GetElementTagName;
	this->commands_["/session/:sessionid/element/:id/clear"]["POST"] = ClearElement;
	this->commands_["/session/:sessionid/element/:id/selected"]["GET"] = IsElementSelected;
	this->commands_["/session/:sessionid/element/:id/selected"]["POST"] = SetElementSelected;
	this->commands_["/session/:sessionid/element/:id/toggle"]["POST"] = ToggleElement;
	this->commands_["/session/:sessionid/element/:id/enabled"]["GET"] = IsElementEnabled;
	this->commands_["/session/:sessionid/element/:id/displayed"]["GET"] = IsElementDisplayed;
	this->commands_["/session/:sessionid/element/:id/location"]["GET"] = GetElementLocation;
	this->commands_["/session/:sessionid/element/:id/location_in_view"]["GET"] = GetElementLocationOnceScrolledIntoView;
	this->commands_["/session/:sessionid/element/:id/size"]["GET"] = GetElementSize;
	this->commands_["/session/:sessionid/element/:id/css/:propertyName"]["GET"] = GetElementValueOfCssProperty;
	this->commands_["/session/:sessionid/element/:id/attribute/:name"]["GET"] = GetElementAttribute;
	this->commands_["/session/:sessionid/element/:id/equals/:other"]["GET"] = ElementEquals;
	this->commands_["/session/:sessionid/element/:id/hover"]["POST"] = HoverOverElement;
	this->commands_["/session/:sessionid/element/:id/drag"]["POST"] = DragElement;
	this->commands_["/session/:sessionid/screenshot"]["GET"] = Screenshot;

	this->commands_["/session/:sessionid/accept_alert"]["POST"] = AcceptAlert;
	this->commands_["/session/:sessionid/dismiss_alert"]["POST"] = DismissAlert;
	this->commands_["/session/:sessionid/alert_text"]["GET"] = GetAlertText;
	this->commands_["/session/:sessionid/alert_text"]["POST"] = SendKeysToAlert;

	this->commands_["/session/:sessionid/modifier"]["POST"] = SendModifierKey;
	this->commands_["/session/:sessionid/moveto"]["POST"] = MouseMoveTo;
	this->commands_["/session/:sessionid/click"]["POST"] = MouseClick;
	this->commands_["/session/:sessionid/doubleclick"]["POST"] = MouseDoubleClick;
	this->commands_["/session/:sessionid/buttondown"]["POST"] = MouseButtonDown;
	this->commands_["/session/:sessionid/buttonup"]["POST"] = MouseButtonUp;

	/*
	commandDictionary.Add(DriverCommand.DefineDriverMapping, new CommandInfo(CommandInfo.PostCommand, "/config/drivers"));
	commandDictionary.Add(DriverCommand.SetBrowserVisible, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/visible"));
	commandDictionary.Add(DriverCommand.IsBrowserVisible, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/visible"));
	*/
}

} // namespace webdriver