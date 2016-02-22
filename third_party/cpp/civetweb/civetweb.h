/* Copyright (c) 2013-2014 the Civetweb developers
 * Copyright (c) 2004-2013 Sergey Lyubka
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#ifndef CIVETWEB_HEADER_INCLUDED
#define CIVETWEB_HEADER_INCLUDED

#ifndef CIVETWEB_VERSION
#define CIVETWEB_VERSION "1.7"
#endif

#ifndef CIVETWEB_API
    #if defined(_WIN32)
        #if defined(CIVETWEB_DLL_EXPORTS)
            #define CIVETWEB_API __declspec(dllexport)
        #elif defined(CIVETWEB_DLL_IMPORTS)
            #define CIVETWEB_API __declspec(dllimport)
        #else
            #define CIVETWEB_API
        #endif
    #else
        #define CIVETWEB_API
    #endif
#endif

#include <stdio.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */

struct mg_context;     /* Handle for the HTTP service itself */
struct mg_connection;  /* Handle for the individual connection */


/* This structure contains information about the HTTP request. */
struct mg_request_info {
    const char *request_method; /* "GET", "POST", etc */
    const char *uri;            /* URL-decoded URI */
    const char *http_version;   /* E.g. "1.0", "1.1" */
    const char *query_string;   /* URL part after '?', not including '?', or
                                   NULL */
    const char *remote_user;    /* Authenticated user, or NULL if no auth
                                   used */
    long remote_ip;             /* Client's IP address */
    long long content_length;   /* Length (in bytes) of the request body,
                                   can be -1 if no length was given. */
    int remote_port;            /* Client's port */
    int is_ssl;                 /* 1 if SSL-ed, 0 if not */
    void *user_data;            /* User data pointer passed to mg_start() */
    void *conn_data;            /* Connection-specific user data */

    int num_headers;            /* Number of HTTP headers */
    struct mg_header {
        const char *name;       /* HTTP header name */
        const char *value;      /* HTTP header value */
    } http_headers[64];         /* Maximum 64 headers */
};


/* This structure needs to be passed to mg_start(), to let civetweb know
   which callbacks to invoke. For detailed description, see
   https://github.com/bel2125/civetweb/blob/master/docs/UserManual.md */
struct mg_callbacks {
    /* Called when civetweb has received new HTTP request.
       If callback returns non-zero,
       callback must process the request by sending valid HTTP headers and
       body, and civetweb will not do any further processing.
       If callback returns 0, civetweb processes the request itself. In this
       case, callback must not send any data to the client. */
    int  (*begin_request)(struct mg_connection *);

    /* Called when civetweb has finished processing request. */
    void (*end_request)(const struct mg_connection *, int reply_status_code);

    /* Called when civetweb is about to log a message. If callback returns
       non-zero, civetweb does not log anything. */
    int  (*log_message)(const struct mg_connection *, const char *message);

    /* Called when civetweb initializes SSL library. */
    int  (*init_ssl)(void *ssl_context, void *user_data);

    /* Called when websocket request is received, before websocket handshake.
       If callback returns 0, civetweb proceeds with handshake, otherwise
       cinnection is closed immediately. */
    int (*websocket_connect)(const struct mg_connection *);

    /* Called when websocket handshake is successfully completed, and
       connection is ready for data exchange. */
    void (*websocket_ready)(struct mg_connection *);

    /* Called when data frame has been received from the client.
       Parameters:
          bits: first byte of the websocket frame, see websocket RFC at
                http://tools.ietf.org/html/rfc6455, section 5.2
          data, data_len: payload, with mask (if any) already applied.
       Return value:
          non-0: keep this websocket connection opened.
          0:     close this websocket connection. */
    int  (*websocket_data)(struct mg_connection *, int bits,
                           char *data, size_t data_len);

    /* Called when civetweb is closing a connection.  The per-context mutex is
       locked when this is invoked.  This is primarily useful for noting when
       a websocket is closing and removing it from any application-maintained
       list of clients. */
    void (*connection_close)(struct mg_connection *);

    /* Called when civetweb tries to open a file. Used to intercept file open
       calls, and serve file data from memory instead.
       Parameters:
          path:     Full path to the file to open.
          data_len: Placeholder for the file size, if file is served from
                    memory.
       Return value:
          NULL: do not serve file from memory, proceed with normal file open.
          non-NULL: pointer to the file contents in memory. data_len must be
          initilized with the size of the memory block. */
    const char * (*open_file)(const struct mg_connection *,
                              const char *path, size_t *data_len);

    /* Called when civetweb is about to serve Lua server page (.lp file), if
       Lua support is enabled.
       Parameters:
         lua_context: "lua_State *" pointer. */
    void (*init_lua)(struct mg_connection *, void *lua_context);

    /* Called when civetweb has uploaded a file to a temporary directory as a
       result of mg_upload() call.
       Parameters:
          file_file: full path name to the uploaded file. */
    void (*upload)(struct mg_connection *, const char *file_name);

    /* Called when civetweb is about to send HTTP error to the client.
       Implementing this callback allows to create custom error pages.
       Parameters:
         status: HTTP error status code. */
    int  (*http_error)(struct mg_connection *, int status);

    /* Called after civetweb context has been created, before requests
       are processed.
       Parameters:
         ctx: context handle */
    void (*init_context)(struct mg_context * ctx);

    /* Called when civetweb context is deleted.
       Parameters:
         ctx: context handle */
    void (*exit_context)(struct mg_context * ctx);
};


/* Start web server.

   Parameters:
     callbacks: mg_callbacks structure with user-defined callbacks.
     options: NULL terminated list of option_name, option_value pairs that
              specify Civetweb configuration parameters.

   Side-effects: on UNIX, ignores SIGCHLD and SIGPIPE signals. If custom
      processing is required for these, signal handlers must be set up
      after calling mg_start().


   Example:
     const char *options[] = {
       "document_root", "/var/www",
       "listening_ports", "80,443s",
       NULL
     };
     struct mg_context *ctx = mg_start(&my_func, NULL, options);

   Refer to https://github.com/bel2125/civetweb/blob/master/docs/UserManual.md
   for the list of valid option and their possible values.

   Return:
     web server context, or NULL on error. */
CIVETWEB_API struct mg_context *mg_start(const struct mg_callbacks *callbacks,
                            void *user_data,
                            const char **configuration_options);


/* Stop the web server.

   Must be called last, when an application wants to stop the web server and
   release all associated resources. This function blocks until all Civetweb
   threads are stopped. Context pointer becomes invalid. */
CIVETWEB_API void mg_stop(struct mg_context *);


/* mg_request_handler

   Called when a new request comes in.  This callback is URI based
   and configured with mg_set_request_handler().

   Parameters:
      conn: current connection information.
      cbdata: the callback data configured with mg_set_request_handler().
   Returns:
      0: the handler could not handle the request, so fall through.
      1: the handler processed the request. */
typedef int (* mg_request_handler)(struct mg_connection *conn, void *cbdata);


/* mg_set_request_handler

   Sets or removes a URI mapping for a request handler.

   URI's are ordered and prefixed URI's are supported. For example,
   consider two URIs: /a/b and /a
           /a   matches /a
           /a/b matches /a/b
           /a/c matches /a

   Parameters:
      ctx: server context
      uri: the URI to configure
      handler: the callback handler to use when the URI is requested.
               If NULL, the URI will be removed.
      cbdata: the callback data to give to the handler when it s requested. */
CIVETWEB_API void mg_set_request_handler(struct mg_context *ctx, const char *uri, mg_request_handler handler, void *cbdata);


/* Get the value of particular configuration parameter.
   The value returned is read-only. Civetweb does not allow changing
   configuration at run time.
   If given parameter name is not valid, NULL is returned. For valid
   names, return value is guaranteed to be non-NULL. If parameter is not
   set, zero-length string is returned. */
CIVETWEB_API const char *mg_get_option(const struct mg_context *ctx, const char *name);


/* Get context from connection. */
CIVETWEB_API struct mg_context *mg_get_context(struct mg_connection *conn);


/* Get user data passed to mg_start from context. */
CIVETWEB_API void *mg_get_user_data(struct mg_context *ctx);


#if defined(MG_LEGACY_INTERFACE)
/* Return array of strings that represent valid configuration options.
   For each option, option name and default value is returned, i.e. the
   number of entries in the array equals to number_of_options x 2.
   Array is NULL terminated. */
/* Deprecated: Use mg_get_valid_options instead. */
CIVETWEB_API const char **mg_get_valid_option_names(void);
#endif


struct mg_option {
    const char * name;
    int type;
    const char * default_value;
};

enum {
    CONFIG_TYPE_UNKNOWN = 0x0,
    CONFIG_TYPE_NUMBER = 0x1,
    CONFIG_TYPE_STRING = 0x2,
    CONFIG_TYPE_FILE = 0x3,
    CONFIG_TYPE_DIRECTORY = 0x4,
    CONFIG_TYPE_BOOLEAN = 0x5,
    CONFIG_TYPE_EXT_PATTERN = 0x6
};


/* Return array of struct mg_option, representing all valid configuration
   options of civetweb.c.
   The array is terminated by a NULL name option. */
CIVETWEB_API const struct mg_option *mg_get_valid_options(void);


/* Get the list of ports that civetweb is listening on.
   size is the size of the ports int array and ssl int array to fill.
   It is the caller's responsibility to make sure ports and ssl each
   contain at least size int elements worth of memory to write into.
   Return value is the number of ports and ssl information filled in.
   The value returned is read-only. Civetweb does not allow changing
   configuration at run time. */
CIVETWEB_API size_t mg_get_ports(const struct mg_context *ctx, size_t size, int* ports, int* ssl);


/* Add, edit or delete the entry in the passwords file.

   This function allows an application to manipulate .htpasswd files on the
   fly by adding, deleting and changing user records. This is one of the
   several ways of implementing authentication on the server side. For another,
   cookie-based way please refer to the examples/chat in the source tree.

   If password is not NULL, entry is added (or modified if already exists).
   If password is NULL, entry is deleted.

   Return:
     1 on success, 0 on error. */
CIVETWEB_API int mg_modify_passwords_file(const char *passwords_file_name,
                                          const char *domain,
                                          const char *user,
                                          const char *password);


/* Return information associated with the request. */
CIVETWEB_API struct mg_request_info *mg_get_request_info(struct mg_connection *);


/* Send data to the client.
   Return:
    0   when the connection has been closed
    -1  on error
    >0  number of bytes written on success */
CIVETWEB_API int mg_write(struct mg_connection *, const void *buf, size_t len);


/* Send data to a websocket client wrapped in a websocket frame.  Uses mg_lock
   to ensure that the transmission is not interrupted, i.e., when the
   application is proactively communicating and responding to a request
   simultaneously.

   Send data to a websocket client wrapped in a websocket frame.
   This function is available when civetweb is compiled with -DUSE_WEBSOCKET

   Return:
    0   when the connection has been closed
    -1  on error
    >0  number of bytes written on success */
CIVETWEB_API int mg_websocket_write(struct mg_connection* conn, int opcode,
                                    const char *data, size_t data_len);


/* Blocks until unique access is obtained to this connection. Intended for use
   with websockets only.
   Invoke this before mg_write or mg_printf when communicating with a
   websocket if your code has server-initiated communication as well as
   communication in direct response to a message. */
CIVETWEB_API void mg_lock_connection(struct mg_connection* conn);
CIVETWEB_API void mg_unlock_connection(struct mg_connection* conn);

#if defined(MG_LEGACY_INTERFACE)
#define mg_lock mg_lock_connection
#define mg_unlock mg_unlock_connection
#endif

/* Lock server context.  This lock may be used to protect ressources
   that are shared between different connection/worker threads. */
CIVETWEB_API void mg_lock_context(struct mg_context* ctx);
CIVETWEB_API void mg_unlock_context(struct mg_context* ctx);


/* Opcodes, from http://tools.ietf.org/html/rfc6455 */
enum {
    WEBSOCKET_OPCODE_CONTINUATION = 0x0,
    WEBSOCKET_OPCODE_TEXT = 0x1,
    WEBSOCKET_OPCODE_BINARY = 0x2,
    WEBSOCKET_OPCODE_CONNECTION_CLOSE = 0x8,
    WEBSOCKET_OPCODE_PING = 0x9,
    WEBSOCKET_OPCODE_PONG = 0xa
};


/* Macros for enabling compiler-specific checks for printf-like arguments. */
#undef PRINTF_FORMAT_STRING
#if defined(_MSC_VER) && _MSC_VER >= 1400
#include <sal.h>
#if defined(_MSC_VER) && _MSC_VER > 1400
#define PRINTF_FORMAT_STRING(s) _Printf_format_string_ s
#else
#define PRINTF_FORMAT_STRING(s) __format_string s
#endif
#else
#define PRINTF_FORMAT_STRING(s) s
#endif

#ifdef __GNUC__
#define PRINTF_ARGS(x, y) __attribute__((format(printf, x, y)))
#else
#define PRINTF_ARGS(x, y)
#endif

/* Send data to the client using printf() semantics.
   Works exactly like mg_write(), but allows to do message formatting. */
CIVETWEB_API int mg_printf(struct mg_connection *,
                           PRINTF_FORMAT_STRING(const char *fmt), ...) PRINTF_ARGS(2, 3);


/* Send contents of the entire file together with HTTP headers. */
CIVETWEB_API void mg_send_file(struct mg_connection *conn, const char *path);


/* Read data from the remote end, return number of bytes read.
   Return:
     0     connection has been closed by peer. No more data could be read.
     < 0   read error. No more data could be read from the connection.
     > 0   number of bytes read into the buffer. */
CIVETWEB_API int mg_read(struct mg_connection *, void *buf, size_t len);


/* Get the value of particular HTTP header.

   This is a helper function. It traverses request_info->http_headers array,
   and if the header is present in the array, returns its value. If it is
   not present, NULL is returned. */
CIVETWEB_API const char *mg_get_header(const struct mg_connection *, const char *name);


/* Get a value of particular form variable.

   Parameters:
     data: pointer to form-uri-encoded buffer. This could be either POST data,
           or request_info.query_string.
     data_len: length of the encoded data.
     var_name: variable name to decode from the buffer
     dst: destination buffer for the decoded variable
     dst_len: length of the destination buffer

   Return:
     On success, length of the decoded variable.
     On error:
        -1 (variable not found).
        -2 (destination buffer is NULL, zero length or too small to hold the
            decoded variable).

   Destination buffer is guaranteed to be '\0' - terminated if it is not
   NULL or zero length. */
CIVETWEB_API int mg_get_var(const char *data, size_t data_len,
                            const char *var_name, char *dst, size_t dst_len);


/* Get a value of particular form variable.

   Parameters:
     data: pointer to form-uri-encoded buffer. This could be either POST data,
           or request_info.query_string.
     data_len: length of the encoded data.
     var_name: variable name to decode from the buffer
     dst: destination buffer for the decoded variable
     dst_len: length of the destination buffer
     occurrence: which occurrence of the variable, 0 is the first, 1 the
                 second...
                this makes it possible to parse a query like
                b=x&a=y&a=z which will have occurrence values b:0, a:0 and a:1

   Return:
     On success, length of the decoded variable.
     On error:
        -1 (variable not found).
        -2 (destination buffer is NULL, zero length or too small to hold the
            decoded variable).

   Destination buffer is guaranteed to be '\0' - terminated if it is not
   NULL or zero length. */
CIVETWEB_API int mg_get_var2(const char *data, size_t data_len,
                             const char *var_name, char *dst, size_t dst_len, size_t occurrence);


/* Fetch value of certain cookie variable into the destination buffer.

   Destination buffer is guaranteed to be '\0' - terminated. In case of
   failure, dst[0] == '\0'. Note that RFC allows many occurrences of the same
   parameter. This function returns only first occurrence.

   Return:
     On success, value length.
     On error:
        -1 (either "Cookie:" header is not present at all or the requested
            parameter is not found).
        -2 (destination buffer is NULL, zero length or too small to hold the
            value). */
CIVETWEB_API int mg_get_cookie(const char *cookie, const char *var_name,
                               char *buf, size_t buf_len);


/* Download data from the remote web server.
     host: host name to connect to, e.g. "foo.com", or "10.12.40.1".
     port: port number, e.g. 80.
     use_ssl: wether to use SSL connection.
     error_buffer, error_buffer_size: error message placeholder.
     request_fmt,...: HTTP request.
   Return:
     On success, valid pointer to the new connection, suitable for mg_read().
     On error, NULL. error_buffer contains error message.
   Example:
     char ebuf[100];
     struct mg_connection *conn;
     conn = mg_download("google.com", 80, 0, ebuf, sizeof(ebuf),
                        "%s", "GET / HTTP/1.0\r\nHost: google.com\r\n\r\n");
 */
CIVETWEB_API struct mg_connection *mg_download(const char *host, int port, int use_ssl,
                                               char *error_buffer, size_t error_buffer_size,
                                               PRINTF_FORMAT_STRING(const char *request_fmt),
                                               ...) PRINTF_ARGS(6, 7);


/* Close the connection opened by mg_download(). */
CIVETWEB_API void mg_close_connection(struct mg_connection *conn);


/* File upload functionality. Each uploaded file gets saved into a temporary
   file and MG_UPLOAD event is sent.
   Return number of uploaded files. */
CIVETWEB_API int mg_upload(struct mg_connection *conn, const char *destination_dir);


/* Convenience function -- create detached thread.
   Return: 0 on success, non-0 on error. */
typedef void * (*mg_thread_func_t)(void *);
CIVETWEB_API int mg_start_thread(mg_thread_func_t f, void *p);


/* Return builtin mime type for the given file name.
   For unrecognized extensions, "text/plain" is returned. */
CIVETWEB_API const char *mg_get_builtin_mime_type(const char *file_name);


/* Return Civetweb version. */
CIVETWEB_API const char *mg_version(void);


/* URL-decode input buffer into destination buffer.
   0-terminate the destination buffer.
   form-url-encoded data differs from URI encoding in a way that it
   uses '+' as character for space, see RFC 1866 section 8.2.1
   http://ftp.ics.uci.edu/pub/ietf/html/rfc1866.txt
   Return: length of the decoded data, or -1 if dst buffer is too small. */
CIVETWEB_API int mg_url_decode(const char *src, int src_len, char *dst,
                               int dst_len, int is_form_url_encoded);


/* URL-encode input buffer into destination buffer.
   returns the length of the resulting buffer or -1
   is the buffer is too small. */
CIVETWEB_API int mg_url_encode(const char *src, char *dst, size_t dst_len);


/* MD5 hash given strings.
   Buffer 'buf' must be 33 bytes long. Varargs is a NULL terminated list of
   ASCIIz strings. When function returns, buf will contain human-readable
   MD5 hash. Example:
     char buf[33];
     mg_md5(buf, "aa", "bb", NULL); */
CIVETWEB_API char *mg_md5(char buf[33], ...);


/* Print error message to the opened error log stream.
   This utilizes the provided logging configuration.
     conn: connection
     fmt: format string without the line return
     ...: variable argument list
   Example:
     mg_cry(conn,"i like %s", "logging"); */
CIVETWEB_API void mg_cry(struct mg_connection *conn,
                         PRINTF_FORMAT_STRING(const char *fmt), ...) PRINTF_ARGS(2, 3);


/* utility method to compare two buffers, case incensitive. */
CIVETWEB_API int mg_strncasecmp(const char *s1, const char *s2, size_t len);

/* Connect to a websocket as a client
   Parameters:
     host: host to connect to, i.e. "echo.websocket.org" or "192.168.1.1" or "localhost"
     port: server port
     use_ssl: make a secure connection to server
     error_buffer, error_buffer_size: error message placeholder.
     path: server path you are trying to connect to, i.e. if connection to localhost/app, path should be "/app"
     origin: value of the Origin HTTP header
     data_func: callback that should be used when data is received from the server
     user_data: user supplied argument

   Return:
     On success, valid mg_connection object.
     On error, NULL. */

typedef int  (*websocket_data_func)(struct mg_connection *, int bits,
                           char *data, size_t data_len);

typedef void (*websocket_close_func)(struct mg_connection *);

CIVETWEB_API struct mg_connection *mg_connect_websocket_client(const char *host, int port, int use_ssl,
                                               char *error_buffer, size_t error_buffer_size,
                                               const char *path, const char *origin,
                                               websocket_data_func data_func, websocket_close_func close_func,
                                               void * user_data);
#ifdef __cplusplus
}
#endif /* __cplusplus */

#endif /* CIVETWEB_HEADER_INCLUDED */
