#include "StdAfx.h"
#include "WebDriver.h"

void * event_handler(enum mg_event event_raised, 
					 struct mg_connection *conn, 
					 const struct mg_request_info *request_info) {
	handler_result_code = NULL;
	if (event_raised == MG_NEW_REQUEST) {
		handler_result_code = server->ProcessRequest(conn, request_info);
	}

	return &handler_result_code;
}

webdriver::IEDriverServer* StartServer(int port) {
	char buffer[10];
	if (server == NULL) {
		_itoa_s(port, buffer, 10, 10);
		//char* options[] = { "listening_ports", buffer, "access_control_list", "-0.0.0.0/0,+127.0.0.1", NULL };
		char* options[] = { "listening_ports", buffer, "access_control_list", "-0.0.0.0/0,+127.0.0.1", "enable_keep_alive", "yes", NULL };
		server = new webdriver::IEDriverServer(port);
		ctx = mg_start(event_handler, (const char **)options);
	}
	return server;
}

void StopServer(webdriver::IEDriverServer *myserver) {
	mg_stop(ctx);
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