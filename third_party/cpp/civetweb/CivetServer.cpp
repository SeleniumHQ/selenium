/* Copyright (c) 2013-2014 the Civetweb developers
 * Copyright (c) 2013 No Face Press, LLC
 *
 * License http://opensource.org/licenses/mit-license.php MIT License
 */

#include "CivetServer.h"

#include <stdlib.h>
#include <string.h>
#include <assert.h>

#ifndef UNUSED_PARAMETER
#define UNUSED_PARAMETER(x) (void)(x)
#endif

bool CivetHandler::handleGet(CivetServer *server, struct mg_connection *conn)
{
    UNUSED_PARAMETER(server);
    UNUSED_PARAMETER(conn);
    return false;
}

bool CivetHandler::handlePost(CivetServer *server, struct mg_connection *conn)
{
    UNUSED_PARAMETER(server);
    UNUSED_PARAMETER(conn);
    return false;
}

bool CivetHandler::handlePut(CivetServer *server, struct mg_connection *conn)
{
    UNUSED_PARAMETER(server);
    UNUSED_PARAMETER(conn);
    return false;
}

bool CivetHandler::handleDelete(CivetServer *server, struct mg_connection *conn)
{
    UNUSED_PARAMETER(server);
    UNUSED_PARAMETER(conn);
    return false;
}

int CivetServer::requestHandler(struct mg_connection *conn, void *cbdata)
{
    struct mg_request_info *request_info = mg_get_request_info(conn);
    assert(request_info != NULL);
    CivetServer *me = (CivetServer*) (request_info->user_data);
    assert(me != NULL);
    mg_lock_context(me->context);
    me->connections[conn] = CivetConnection();
    mg_unlock_context(me->context);

    CivetHandler *handler = (CivetHandler *)cbdata;

    if (handler) {
        if (strcmp(request_info->request_method, "GET") == 0) {
            return handler->handleGet(me, conn) ? 1 : 0;
        } else if (strcmp(request_info->request_method, "POST") == 0) {
            return handler->handlePost(me, conn) ? 1 : 0;
        } else if (strcmp(request_info->request_method, "PUT") == 0) {
            return handler->handlePut(me, conn) ? 1 : 0;
        } else if (strcmp(request_info->request_method, "DELETE") == 0) {
            return handler->handleDelete(me, conn) ? 1 : 0;
        }
    }

    return 0; // No handler found
}

CivetServer::CivetServer(const char **options,
                         const struct mg_callbacks *_callbacks) :
    context(0)
{
    struct mg_callbacks callbacks;
    memset(&callbacks, 0, sizeof(callbacks));

    if (_callbacks) {
        callbacks = *_callbacks;
        userCloseHandler = _callbacks->connection_close;
    } else {
        userCloseHandler = NULL;
    }
    callbacks.connection_close = closeHandler;
    context = mg_start(&callbacks, this, options);
}

CivetServer::~CivetServer()
{
    close();
}

void CivetServer::closeHandler(struct mg_connection *conn)
{
    struct mg_request_info *request_info = mg_get_request_info(conn);
    assert(request_info != NULL);
    CivetServer *me = (CivetServer*) (request_info->user_data);
    assert(me != NULL);

    if (me->userCloseHandler) me->userCloseHandler(conn);
    mg_lock_context(me->context);
    me->connections.erase(conn);
    mg_unlock_context(me->context);
}

void CivetServer::addHandler(const std::string &uri, CivetHandler *handler)
{
    mg_set_request_handler(context, uri.c_str(), requestHandler, handler);
}

void CivetServer::removeHandler(const std::string &uri)
{
    mg_set_request_handler(context, uri.c_str(), NULL, NULL);
}

void CivetServer::close()
{
    if (context) {
        mg_stop (context);
        context = 0;
    }
}

int CivetServer::getCookie(struct mg_connection *conn, const std::string &cookieName, std::string &cookieValue)
{
    //Maximum cookie length as per microsoft is 4096. http://msdn.microsoft.com/en-us/library/ms178194.aspx
    char _cookieValue[4096];
    const char *cookie = mg_get_header(conn, "Cookie");
    int lRead = mg_get_cookie(cookie, cookieName.c_str(), _cookieValue, sizeof(_cookieValue));
    cookieValue.clear();
    cookieValue.append(_cookieValue);
    return lRead;
}

const char* CivetServer::getHeader(struct mg_connection *conn, const std::string &headerName)
{
    return mg_get_header(conn, headerName.c_str());
}

void
CivetServer::urlDecode(const char *src, std::string &dst, bool is_form_url_encoded)
{
    urlDecode(src, strlen(src), dst, is_form_url_encoded);
}

void
CivetServer::urlDecode(const char *src, size_t src_len, std::string &dst, bool is_form_url_encoded)
{
    int i, j, a, b;
#define HEXTOI(x) (isdigit(x) ? x - '0' : x - 'W')

    dst.clear();
    for (i = j = 0; i < (int)src_len; i++, j++) {
        if (i < (int)src_len - 2 && src[i] == '%' &&
            isxdigit(* (const unsigned char *) (src + i + 1)) &&
            isxdigit(* (const unsigned char *) (src + i + 2))) {
            a = tolower(* (const unsigned char *) (src + i + 1));
            b = tolower(* (const unsigned char *) (src + i + 2));
            dst.push_back((char) ((HEXTOI(a) << 4) | HEXTOI(b)));
            i += 2;
        } else if (is_form_url_encoded && src[i] == '+') {
            dst.push_back(' ');
        } else {
            dst.push_back(src[i]);
        }
    }
}

bool
CivetServer::getParam(struct mg_connection *conn, const char *name,
                      std::string &dst, size_t occurrence)
{
    const char *formParams = NULL;
    struct mg_request_info *ri = mg_get_request_info(conn);
    assert(ri != NULL);
    CivetServer *me = (CivetServer*) (ri->user_data);
    assert(me != NULL);
    mg_lock_context(me->context);
    CivetConnection &conobj = me->connections[conn];
    mg_lock_connection(conn);
    mg_unlock_context(me->context);

    if (conobj.postData != NULL) {
        formParams = conobj.postData;
    } else {
        const char * con_len_str = mg_get_header(conn, "Content-Length");
        if (con_len_str) {
            unsigned long con_len = atoi(con_len_str);
            if (con_len>0) {
                // Add one extra character: in case the post-data is a text, it is required as 0-termination.
                // Do not increment con_len, since the 0 terminating is not part of the content (text or binary).
                conobj.postData = (char*)malloc(con_len + 1);
                if (conobj.postData != NULL) {
                    // malloc may fail for huge requests
                    mg_read(conn, conobj.postData, con_len);
                    conobj.postData[con_len] = 0;
                    formParams = conobj.postData;
                    conobj.postDataLen = con_len;
                }
            }
        }
    }
    if (formParams == NULL) {
        // get requests do store html <form> field values in the http query_string
        formParams = ri->query_string;
    }
    mg_unlock_connection(conn);

    if (formParams != NULL) {
        return getParam(formParams, strlen(formParams), name, dst, occurrence);
    }

    return false;
}

bool
CivetServer::getParam(const char *data, size_t data_len, const char *name,
                      std::string &dst, size_t occurrence)
{
    const char *p, *e, *s;
    size_t name_len;

    dst.clear();
    if (data == NULL || name == NULL || data_len == 0) {
        return false;
    }
    name_len = strlen(name);
    e = data + data_len;

    // data is "var1=val1&var2=val2...". Find variable first
    for (p = data; p + name_len < e; p++) {
        if ((p == data || p[-1] == '&') && p[name_len] == '=' &&
            !mg_strncasecmp(name, p, name_len) && 0 == occurrence--) {

            // Point p to variable value
            p += name_len + 1;

            // Point s to the end of the value
            s = (const char *) memchr(p, '&', (size_t)(e - p));
            if (s == NULL) {
                s = e;
            }
            assert(s >= p);

            // Decode variable into destination buffer
            urlDecode(p, (int)(s - p), dst, true);
            return true;
        }
    }
    return false;
}

void
CivetServer::urlEncode(const char *src, std::string &dst, bool append)
{
    urlEncode(src, strlen(src), dst, append);
}

void
CivetServer::urlEncode(const char *src, size_t src_len, std::string &dst, bool append)
{
    static const char *dont_escape = "._-$,;~()";
    static const char *hex = "0123456789abcdef";

    if (!append)
        dst.clear();

    for (; src_len > 0; src++, src_len--) {
        if (isalnum(*(const unsigned char *) src) ||
            strchr(dont_escape, * (const unsigned char *) src) != NULL) {
            dst.push_back(*src);
        } else {
            dst.push_back('%');
            dst.push_back(hex[(* (const unsigned char *) src) >> 4]);
            dst.push_back(hex[(* (const unsigned char *) src) & 0xf]);
        }
    }
}

CivetServer::CivetConnection::CivetConnection() {
    postData = NULL;
    postDataLen = 0;
}

CivetServer::CivetConnection::~CivetConnection() {
    free(postData);
}
