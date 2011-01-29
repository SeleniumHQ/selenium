#ifndef WEBDRIVER_IE_WEBDRIVER_H_
#define WEBDRIVER_IE_WEBDRIVER_H_

#include "IEDriverServer.h"

#define EXPORT __declspec(dllexport)

#ifdef __cplusplus
extern "C" {
#endif

webdriver::IEDriverServer* server;
static void * event_handler(enum mg_event event_raised, 
							struct mg_connection *conn, 
							const struct mg_request_info *request_info);

struct mg_context *ctx;
int handler_result_code;
EXPORT webdriver::IEDriverServer* StartServer(int port);
EXPORT void StopServer(webdriver::IEDriverServer* myserver);
EXPORT int GetServerSessionCount();
EXPORT bool ServerIsRunning();
EXPORT int GetServerPort();

#ifdef __cplusplus
}
#endif

#endif // WEBDRIVER_IE_WEBDRIVER_H_
