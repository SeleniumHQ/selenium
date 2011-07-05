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
#include "WebDriver.h"

void* event_handler(enum mg_event event_raised, 
					 struct mg_connection* conn, 
					 const struct mg_request_info* request_info) {
	handler_result_code = NULL;
	if (event_raised == MG_NEW_REQUEST) {
		handler_result_code = server->ProcessRequest(conn, request_info);
	}

	return &handler_result_code;
}

webdriver::Server* StartServer(int port) {
	char buffer[10];
	if (server == NULL) {
		_itoa_s(port, buffer, 10, 10);
		// const char* options[] = { "listening_ports", buffer, "access_control_list", "-0.0.0.0/0,+127.0.0.1", "enable_keep_alive", "yes", NULL };
		const char* options[] = { "listening_ports", buffer, "access_control_list", "-0.0.0.0/0,+127.0.0.1", NULL };
		server = new webdriver::Server(port);
		ctx = mg_start(event_handler, NULL, options);
        if (ctx == NULL) {
            delete server;
            server = NULL;
        }
	}
	return server;
}

void StopServer(webdriver::Server* myserver) {
    if (ctx) {
	    mg_stop(ctx);
        ctx = NULL;
    }
	delete server;
	server = NULL;
}

int GetServerSessionCount() {
	int session_count(0);
	if (server != NULL) {
		session_count = server->session_count();
	}
	return session_count;
}

int GetServerPort() {
	int server_port(0);
	if (server != NULL) {
		server_port = server->port();
	}
	return server_port;
}

bool ServerIsRunning() {
	return server != NULL;
}