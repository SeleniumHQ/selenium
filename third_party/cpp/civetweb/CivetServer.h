/* Copyright (c) 2013-2014 the Civetweb developers
 * Copyright (c) 2013 No Face Press, LLC
 *
 * License http://opensource.org/licenses/mit-license.php MIT License
 */

#ifndef _CIVETWEB_SERVER_H_
#define _CIVETWEB_SERVER_H_
#ifdef __cplusplus

#include "civetweb.h"
#include <map>
#include <string>

// forward declaration
class CivetServer;

/**
 * Basic interface for a URI request handler.  Handlers implementations
 * must be reentrant.
 */
class CivetHandler
{
public:

    /**
     * Destructor
     */
    virtual ~CivetHandler() {
    }

    /**
     * Callback method for GET request.
     *
     * @param server - the calling server
     * @param conn - the connection information
     * @returns true if implemented, false otherwise
     */
    virtual bool handleGet(CivetServer *server, struct mg_connection *conn);

    /**
     * Callback method for POST request.
     *
     * @param server - the calling server
     * @param conn - the connection information
     * @returns true if implemented, false otherwise
     */
    virtual bool handlePost(CivetServer *server, struct mg_connection *conn);

    /**
     * Callback method for PUT request.
     *
     * @param server - the calling server
     * @param conn - the connection information
     * @returns true if implemented, false otherwise
     */
    virtual bool handlePut(CivetServer *server, struct mg_connection *conn);

    /**
     * Callback method for DELETE request.
     *
     * @param server - the calling server
     * @param conn - the connection information
     * @returns true if implemented, false otherwise
     */
    virtual bool handleDelete(CivetServer *server, struct mg_connection *conn);

};

/**
 * CivetServer
 *
 * Basic class for embedded web server.  This has an URL mapping built-in.
 */
class CivetServer
{
public:

    /**
     * Constructor
     *
     * This automatically starts the sever.
     * It is good practice to call getContext() after this in case there
     * were errors starting the server.
     *
     * @param options - the web server options.
     * @param callbacks - optional web server callback methods.
     */
    CivetServer(const char **options, const struct mg_callbacks *callbacks = 0);

    /**
     * Destructor
     */
    virtual ~CivetServer();

    /**
     * close()
     *
     * Stops server and frees resources.
     */
    void close();

    /**
     * getContext()
     *
     * @return the context or 0 if not running.
     */
    const struct mg_context *getContext() const {
        return context;
    }

    /**
     * addHandler(const std::string &, CivetHandler *)
     *
     * Adds a URI handler.  If there is existing URI handler, it will
     * be replaced with this one.
     *
     * URI's are ordered and prefix (REST) URI's are supported.
     *
     *  @param uri - URI to match.
     *  @param handler - handler instance to use.  This will be free'ed
     *      when the server closes and instances cannot be reused.
     */
    void addHandler(const std::string &uri, CivetHandler *handler);

    /**
     * removeHandler(const std::string &)
     *
     * Removes a handler.
     *
     * @param uri - the exact URL used in addHandler().
     */
    void removeHandler(const std::string &uri);

    /**
     * getCookie(struct mg_connection *conn, const std::string &cookieName, std::string &cookieValue)
     *
     * Puts the cookie value string that matches the cookie name in the cookieValue destinaton string.
     *
     * @param conn - the connection information
     * @param cookieName - cookie name to get the value from
     * @param cookieValue - cookie value is returned using thiis reference
     * @returns the size of the cookie value string read.
    */
    static int getCookie(struct mg_connection *conn, const std::string &cookieName, std::string &cookieValue);

    /**
     * getHeader(struct mg_connection *conn, const std::string &headerName)
     * @param conn - the connection information
     * @param headerName - header name to get the value from
     * @returns a char array whcih contains the header value as string
    */
    static const char* getHeader(struct mg_connection *conn, const std::string &headerName);

    /**
     * getParam(struct mg_connection *conn, const char *, std::string &, size_t)
     *
     * Returns a query paramter contained in the supplied buffer.  The
     * occurance value is a zero-based index of a particular key name.  This
     * should not be confused with the index over all of the keys.  Note that this
     * function assumes that parameters are sent as text in http query string
     * format, which is the default for web forms. This function will work for
     * html forms with method="GET" and method="POST" attributes. In other cases,
     * you may use a getParam version that directly takes the data instead of the
     * connection as a first argument.
     *
     * @param conn - parameters are read from the data sent through this connection
     * @param name - the key to search for
     * @param dst - the destination string
     * @param occurrence - the occurrence of the selected name in the query (0 based).
     * @return true if key was found
     */
    static bool getParam(struct mg_connection *conn, const char *name,
                         std::string &dst, size_t occurrence=0);

    /**
     * getParam(const std::string &, const char *, std::string &, size_t)
     *
     * Returns a query paramter contained in the supplied buffer.  The
     * occurance value is a zero-based index of a particular key name.  This
     * should not be confused with the index over all of the keys.
     *
     * @param data - the query string (text)
     * @param name - the key to search for
     * @param dst - the destination string
     * @param occurrence - the occurrence of the selected name in the query (0 based).
     * @return true if key was found
     */
    static bool getParam(const std::string &data, const char *name,
                         std::string &dst, size_t occurrence=0) {
        return getParam(data.c_str(), data.length(), name, dst, occurrence);
    }

    /**
     * getParam(const char *, size_t, const char *, std::string &, size_t)
     *
     * Returns a query paramter contained in the supplied buffer.  The
     * occurance value is a zero-based index of a particular key name.  This
     * should not be confused with the index over all of the keys.
     *
     * @param data the - query string (text)
     * @param data_len - length of the query string
     * @param name - the key to search for
     * @param dst - the destination string
     * @param occurrence - the occurrence of the selected name in the query (0 based).
     * @return true if key was found
     */
    static bool getParam(const char *data, size_t data_len, const char *name,
                         std::string &dst, size_t occurrence=0);


    /**
     * urlDecode(const std::string &, std::string &, bool)
     *
     * @param src - string to be decoded
     * @param dst - destination string
     * @param is_form_url_encoded - true if form url encoded
     *       form-url-encoded data differs from URI encoding in a way that it
     *       uses '+' as character for space, see RFC 1866 section 8.2.1
     *       http://ftp.ics.uci.edu/pub/ietf/html/rfc1866.txt
     */
    static void urlDecode(const std::string &src, std::string &dst, bool is_form_url_encoded=true) {
        urlDecode(src.c_str(), src.length(), dst, is_form_url_encoded);
    }

    /**
     * urlDecode(const char *, size_t, std::string &, bool)
     *
     * @param src - buffer to be decoded
     * @param src_len - length of buffer to be decoded
     * @param dst - destination string
     * @param is_form_url_encoded - true if form url encoded
     *       form-url-encoded data differs from URI encoding in a way that it
     *       uses '+' as character for space, see RFC 1866 section 8.2.1
     *       http://ftp.ics.uci.edu/pub/ietf/html/rfc1866.txt
     */
    static void urlDecode(const char *src, size_t src_len, std::string &dst, bool is_form_url_encoded=true);

    /**
     * urlDecode(const char *, std::string &, bool)
     *
     * @param src - buffer to be decoded (0 terminated)
     * @param dst - destination string
     * @param is_form_url_encoded true - if form url encoded
     *       form-url-encoded data differs from URI encoding in a way that it
     *       uses '+' as character for space, see RFC 1866 section 8.2.1
     *       http://ftp.ics.uci.edu/pub/ietf/html/rfc1866.txt
     */
    static void urlDecode(const char *src, std::string &dst, bool is_form_url_encoded=true);

    /**
     * urlEncode(const std::string &, std::string &, bool)
     *
     * @param src - buffer to be encoded
     * @param dst - destination string
     * @param append - true if string should not be cleared before encoding.
     */
    static void urlEncode(const std::string &src, std::string &dst, bool append=false) {
        urlEncode(src.c_str(), src.length(), dst, append);
    }

    /**
     * urlEncode(const char *, size_t, std::string &, bool)
     *
     * @param src - buffer to be encoded (0 terminated)
     * @param dst - destination string
     * @param append - true if string should not be cleared before encoding.
     */
    static void urlEncode(const char *src, std::string &dst, bool append=false);

    /**
     * urlEncode(const char *, size_t, std::string &, bool)
     *
     * @param src - buffer to be encoded
     * @param src_len - length of buffer to be decoded
     * @param dst - destination string
     * @param append - true if string should not be cleared before encoding.
     */
    static void urlEncode(const char *src, size_t src_len, std::string &dst, bool append=false);

protected:
    class CivetConnection {
    public:
        char * postData;
        unsigned long postDataLen;

        CivetConnection();
        ~CivetConnection();
    };

    struct mg_context *context;
    std::map<struct mg_connection *, class CivetConnection> connections;

private:
    /**
     * requestHandler(struct mg_connection *, void *cbdata)
     *
     * Handles the incomming request.
     *
     * @param conn - the connection information
     * @param cbdata - pointer to the CivetHandler instance.
     * @returns 0 if implemented, false otherwise
     */
    static int requestHandler(struct mg_connection *conn, void *cbdata);

    /**
     * closeHandler(struct mg_connection *)
     *
     * Handles closing a request (internal handler)
     *
     * @param conn - the connection information
     */
    static void closeHandler(struct mg_connection *conn);

    /**
     * Stores the user provided close handler
     */
    void (*userCloseHandler)(struct mg_connection *conn);

};

#endif /*  __cplusplus */
#endif /* _CIVETWEB_SERVER_H_ */
