/* Copyright (c) 2013-2017 the Civetweb developers
 * Copyright (c) 2013 No Face Press, LLC
 *
 * License http://opensource.org/licenses/mit-license.php MIT License
 */

#ifndef _CIVETWEB_SERVER_H_
#define _CIVETWEB_SERVER_H_
#ifdef __cplusplus

#include "civetweb.h"
#include <map>
#include <stdexcept>
#include <string>
#include <vector>

// forward declaration
class CivetServer;

/**
 * Exception class for thrown exceptions within the CivetHandler object.
 */
class CIVETWEB_API CivetException : public std::runtime_error
{
  public:
	CivetException(const std::string &msg) : std::runtime_error(msg)
	{
	}
};

/**
 * Basic interface for a URI request handler.  Handlers implementations
 * must be reentrant.
 */
class CIVETWEB_API CivetHandler
{
  public:
	/**
	 * Destructor
	 */
	virtual ~CivetHandler()
	{
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
	 * Callback method for HEAD request.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 * @returns true if implemented, false otherwise
	 */
	virtual bool handleHead(CivetServer *server, struct mg_connection *conn);

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

	/**
	 * Callback method for OPTIONS request.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 * @returns true if implemented, false otherwise
	 */
	virtual bool handleOptions(CivetServer *server, struct mg_connection *conn);

	/**
	 * Callback method for PATCH request.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 * @returns true if implemented, false otherwise
	 */
	virtual bool handlePatch(CivetServer *server, struct mg_connection *conn);
};

/**
 * Basic interface for a URI authorization handler.  Handler implementations
 * must be reentrant.
 */
class CIVETWEB_API CivetAuthHandler
{
  public:
	/**
	 * Destructor
	 */
	virtual ~CivetAuthHandler()
	{
	}

	/**
	 * Callback method for authorization requests. It is up the this handler
	 * to generate 401 responses if authorization fails.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 * @returns true if authorization succeeded, false otherwise
	 */
	virtual bool authorize(CivetServer *server, struct mg_connection *conn) = 0;
};

/**
 * Basic interface for a websocket handler.  Handlers implementations
 * must be reentrant.
 */
class CIVETWEB_API CivetWebSocketHandler
{
  public:
	/**
	 * Destructor
	 */
	virtual ~CivetWebSocketHandler()
	{
	}

	/**
	 * Callback method for when the client intends to establish a websocket
	 *connection, before websocket handshake.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 * @returns true to keep socket open, false to close it
	 */
	virtual bool handleConnection(CivetServer *server,
	                              const struct mg_connection *conn);

	/**
	 * Callback method for when websocket handshake is successfully completed,
	 *and connection is ready for data exchange.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 */
	virtual void handleReadyState(CivetServer *server,
	                              struct mg_connection *conn);

	/**
	 * Callback method for when a data frame has been received from the client.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 * @bits: first byte of the websocket frame, see websocket RFC at
	 *http://tools.ietf.org/html/rfc6455, section 5.2
	 * @data, data_len: payload, with mask (if any) already applied.
	 * @returns true to keep socket open, false to close it
	 */
	virtual bool handleData(CivetServer *server,
	                        struct mg_connection *conn,
	                        int bits,
	                        char *data,
	                        size_t data_len);

	/**
	 * Callback method for when the connection is closed.
	 *
	 * @param server - the calling server
	 * @param conn - the connection information
	 */
	virtual void handleClose(CivetServer *server,
	                         const struct mg_connection *conn);
};

/**
 * CivetCallbacks
 *
 * wrapper for mg_callbacks
 */
struct CIVETWEB_API CivetCallbacks : public mg_callbacks {
	CivetCallbacks();
};

/**
 * CivetServer
 *
 * Basic class for embedded web server.  This has an URL mapping built-in.
 */
class CIVETWEB_API CivetServer
{
  public:
	/**
	 * Constructor
	 *
	 * This automatically starts the sever.
	 * It is good practice to call getContext() after this in case there
	 * were errors starting the server.
	 *
	 * Note: CivetServer should not be used as a static instance in a Windows
	 * DLL, since the constructor creates threads and the destructor joins
	 * them again (creating/joining threads should not be done in static
	 * constructors).
	 *
	 * @param options - the web server options.
	 * @param callbacks - optional web server callback methods.
	 *
	 * @throws CivetException
	 */
	CivetServer(const char **options,
	            const struct CivetCallbacks *callbacks = 0,
	            const void *UserContext = 0);
	CivetServer(std::vector<std::string> options,
	            const struct CivetCallbacks *callbacks = 0,
	            const void *UserContext = 0);

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
	const struct mg_context *
	getContext() const
	{
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
	 *  @param handler - handler instance to use.
	 */
	void addHandler(const std::string &uri, CivetHandler *handler);

	void
	addHandler(const std::string &uri, CivetHandler &handler)
	{
		addHandler(uri, &handler);
	}

	/**
	 * addWebSocketHandler
	 *
	 * Adds a WebSocket handler for a specific URI.  If there is existing URI
	 *handler, it will
	 * be replaced with this one.
	 *
	 * URI's are ordered and prefix (REST) URI's are supported.
	 *
	 *  @param uri - URI to match.
	 *  @param handler - handler instance to use.
	 */
	void addWebSocketHandler(const std::string &uri,
	                         CivetWebSocketHandler *handler);

	void
	addWebSocketHandler(const std::string &uri, CivetWebSocketHandler &handler)
	{
		addWebSocketHandler(uri, &handler);
	}

	/**
	 * removeHandler(const std::string &)
	 *
	 * Removes a handler.
	 *
	 * @param uri - the exact URL used in addHandler().
	 */
	void removeHandler(const std::string &uri);

	/**
	 * removeWebSocketHandler(const std::string &)
	 *
	 * Removes a web socket handler.
	 *
	 * @param uri - the exact URL used in addWebSocketHandler().
	 */
	void removeWebSocketHandler(const std::string &uri);

	/**
	 * addAuthHandler(const std::string &, CivetAuthHandler *)
	 *
	 * Adds a URI authorization handler.  If there is existing URI authorization
	 * handler, it will be replaced with this one.
	 *
	 * URI's are ordered and prefix (REST) URI's are supported.
	 *
	 * @param uri - URI to match.
	 * @param handler - authorization handler instance to use.
	 */
	void addAuthHandler(const std::string &uri, CivetAuthHandler *handler);

	void
	addAuthHandler(const std::string &uri, CivetAuthHandler &handler)
	{
		addAuthHandler(uri, &handler);
	}

	/**
	 * removeAuthHandler(const std::string &)
	 *
	 * Removes an authorization handler.
	 *
	 * @param uri - the exact URL used in addAuthHandler().
	 */
	void removeAuthHandler(const std::string &uri);

	/**
	 * getListeningPorts()
	 *
	 * Returns a list of ports that are listening
	 *
	 * @return A vector of ports
	 */

	std::vector<int> getListeningPorts();

	/**
	 * getCookie(struct mg_connection *conn, const std::string &cookieName,
	 *std::string &cookieValue)
	 *
	 * Puts the cookie value string that matches the cookie name in the
	 *cookieValue destinaton string.
	 *
	 * @param conn - the connection information
	 * @param cookieName - cookie name to get the value from
	 * @param cookieValue - cookie value is returned using thiis reference
	 * @returns the size of the cookie value string read.
	 */
	static int getCookie(struct mg_connection *conn,
	                     const std::string &cookieName,
	                     std::string &cookieValue);

	/**
	 * getHeader(struct mg_connection *conn, const std::string &headerName)
	 * @param conn - the connection information
	 * @param headerName - header name to get the value from
	 * @returns a char array which contains the header value as string
	 */
	static const char *getHeader(struct mg_connection *conn,
	                             const std::string &headerName);

	/**
	 * getParam(struct mg_connection *conn, const char *, std::string &, size_t)
	 *
	 * Returns a query which contained in the supplied buffer.  The
	 * occurrence value is a zero-based index of a particular key name.  This
	 * should not be confused with the index over all of the keys.  Note that
	 *this
	 * function assumes that parameters are sent as text in http query string
	 * format, which is the default for web forms. This function will work for
	 * html forms with method="GET" and method="POST" attributes. In other
	 *cases,
	 * you may use a getParam version that directly takes the data instead of
	 *the
	 * connection as a first argument.
	 *
	 * @param conn - parameters are read from the data sent through this
	 *connection
	 * @param name - the key to search for
	 * @param dst - the destination string
	 * @param occurrence - the occurrence of the selected name in the query (0
	 *based).
	 * @return true if key was found
	 */
	static bool getParam(struct mg_connection *conn,
	                     const char *name,
	                     std::string &dst,
	                     size_t occurrence = 0);

	/**
	 * getParam(const std::string &, const char *, std::string &, size_t)
	 *
	 * Returns a query parameter contained in the supplied buffer.  The
	 * occurrence value is a zero-based index of a particular key name.  This
	 * should not be confused with the index over all of the keys.
	 *
	 * @param data - the query string (text)
	 * @param name - the key to search for
	 * @param dst - the destination string
	 * @param occurrence - the occurrence of the selected name in the query (0
	 *based).
	 * @return true if key was found
	 */
	static bool
	getParam(const std::string &data,
	         const char *name,
	         std::string &dst,
	         size_t occurrence = 0)
	{
		return getParam(data.c_str(), data.length(), name, dst, occurrence);
	}

	/**
	 * getParam(const char *, size_t, const char *, std::string &, size_t)
	 *
	 * Returns a query parameter contained in the supplied buffer.  The
	 * occurrence value is a zero-based index of a particular key name.  This
	 * should not be confused with the index over all of the keys.
	 *
	 * @param data the - query string (text)
	 * @param data_len - length of the query string
	 * @param name - the key to search for
	 * @param dst - the destination string
	 * @param occurrence - the occurrence of the selected name in the query (0
	 *based).
	 * @return true if key was found
	 */
	static bool getParam(const char *data,
	                     size_t data_len,
	                     const char *name,
	                     std::string &dst,
	                     size_t occurrence = 0);

	/**
	 * getPostData(struct mg_connection *)
	 *
	 * Returns response body from a request made as POST. Since the
	 * connections map is protected, it can't be directly accessed.
	 * This uses string to store post data to handle big posts.
	 *
	 * @param conn - connection from which post data will be read
	 * @return Post data (empty if not available).
	 */
	static std::string getPostData(struct mg_connection *conn);

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
	static void
	urlDecode(const std::string &src,
	          std::string &dst,
	          bool is_form_url_encoded = true)
	{
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
	static void urlDecode(const char *src,
	                      size_t src_len,
	                      std::string &dst,
	                      bool is_form_url_encoded = true);

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
	static void urlDecode(const char *src,
	                      std::string &dst,
	                      bool is_form_url_encoded = true);

	/**
	 * urlEncode(const std::string &, std::string &, bool)
	 *
	 * @param src - buffer to be encoded
	 * @param dst - destination string
	 * @param append - true if string should not be cleared before encoding.
	 */
	static void
	urlEncode(const std::string &src, std::string &dst, bool append = false)
	{
		urlEncode(src.c_str(), src.length(), dst, append);
	}

	/**
	 * urlEncode(const char *, size_t, std::string &, bool)
	 *
	 * @param src - buffer to be encoded (0 terminated)
	 * @param dst - destination string
	 * @param append - true if string should not be cleared before encoding.
	 */
	static void
	urlEncode(const char *src, std::string &dst, bool append = false);

	/**
	 * urlEncode(const char *, size_t, std::string &, bool)
	 *
	 * @param src - buffer to be encoded
	 * @param src_len - length of buffer to be decoded
	 * @param dst - destination string
	 * @param append - true if string should not be cleared before encoding.
	 */
	static void urlEncode(const char *src,
	                      size_t src_len,
	                      std::string &dst,
	                      bool append = false);

	// generic user context which can be set/read,
	// the server does nothing with this apart from keep it.
	const void *
	getUserContext() const
	{
		return UserContext;
	}

  protected:
	class CivetConnection
	{
	  public:
		char *postData;
		unsigned long postDataLen;

		CivetConnection();
		~CivetConnection();
	};

	struct mg_context *context;
	std::map<struct mg_connection *, class CivetConnection> connections;

	// generic user context which can be set/read,
	// the server does nothing with this apart from keep it.
	const void *UserContext;

  private:
	/**
	 * requestHandler(struct mg_connection *, void *cbdata)
	 *
	 * Handles the incoming request.
	 *
	 * @param conn - the connection information
	 * @param cbdata - pointer to the CivetHandler instance.
	 * @returns 0 if implemented, false otherwise
	 */
	static int requestHandler(struct mg_connection *conn, void *cbdata);

	static int webSocketConnectionHandler(const struct mg_connection *conn,
	                                      void *cbdata);
	static void webSocketReadyHandler(struct mg_connection *conn, void *cbdata);
	static int webSocketDataHandler(struct mg_connection *conn,
	                                int bits,
	                                char *data,
	                                size_t data_len,
	                                void *cbdata);
	static void webSocketCloseHandler(const struct mg_connection *conn,
	                                  void *cbdata);
	/**
	 * authHandler(struct mg_connection *, void *cbdata)
	 *
	 * Handles the authorization requests.
	 *
	 * @param conn - the connection information
	 * @param cbdata - pointer to the CivetAuthHandler instance.
	 * @returns 1 if authorized, 0 otherwise
	 */
	static int authHandler(struct mg_connection *conn, void *cbdata);

	/**
	 * closeHandler(struct mg_connection *)
	 *
	 * Handles closing a request (internal handler)
	 *
	 * @param conn - the connection information
	 */
	static void closeHandler(const struct mg_connection *conn);

	/**
	 * Stores the user provided close handler
	 */
	void (*userCloseHandler)(const struct mg_connection *conn);
};

#endif /*  __cplusplus */
#endif /* _CIVETWEB_SERVER_H_ */
