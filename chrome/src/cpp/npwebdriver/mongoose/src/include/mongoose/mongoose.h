/*
 * Copyright (c) 2004-2009 Sergey Lyubka
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
 *
 * $Id: mongoose.h 279 2009-03-28 16:45:11Z valenok $
 *
 * Modified by danielwh 2009-07-20:
 *  o Factored mg_header into its a global struct
 *  o Added set_connection_keep_alive
 */

#ifndef MONGOOSE_HEADER_INCLUDED
#define	MONGOOSE_HEADER_INCLUDED

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */

struct mg_context;	/* Handle for the HTTP service itself	*/
struct mg_connection;	/* Handle for the individual connection	*/

struct mg_header {
	char	*name;		/* HTTP header name	*/
	char	*value;		/* HTTP header value	*/
};

/*
 * This structure contains full information about the HTTP request.
 * It is passed to the user-specified callback function as a parameter.
 */
struct mg_request_info {
	char	*request_method;	/* "GET", "POST", etc	*/
	char	*uri;			/* Normalized URI	*/
	char	*query_string;		/* \0 - terminated	*/
	char	*post_data;		/* POST data buffer	*/
	char	*remote_user;		/* Authenticated user	*/
	long	remote_ip;		/* Client's IP address	*/
	int	remote_port;		/* Client's port	*/
	int	post_data_len;		/* POST buffer length	*/
	int	http_version_major;
	int	http_version_minor;
	int	status_code;		/* HTTP status code	*/
	int	num_headers;		/* Number of headers	*/
#define	MAX_HTTP_HEADERS	64
	struct mg_header http_headers[MAX_HTTP_HEADERS];
};

/*
 * Mongoose configuration option.
 * Array of those is returned by mg_get_option_list().
 */
struct mg_option {
	char	*name;
	char	*description;
	char	*default_value;
};

/*
 * Functions dealing with initialization, starting and stopping Mongoose
 *
 * mg_start		Start serving thread. Return server context.
 * mg_stop		Stop server thread, and release the context.
 * mg_set_option	Set an option for the running context.
 * mg_get_option	Get an option for the running context.
 * mg_get_option_list	Get a list of all known options.
 * mg_bind_to_uri	Associate user function with paticular URI.
 *			'*' in regex matches zero or more characters.
 * mg_bind_to_error_code	Associate user function with HTTP error code.
 *			Passing 0 as error code binds function to all codes.
 *			Error code is passed as status_code in request info.
 * mg_protect_uri	Similar to "protect" option, but uses a user
 *			specified function instead of the passwords file.
 *			User specified function is usual callback, which
 *			does use its third argument to pass the result back.
 */

struct mg_context *mg_start(void);
void mg_stop(struct mg_context *);
const struct mg_option *mg_get_option_list(void);
const char *mg_get_option(struct mg_context *, const char *);
int mg_set_option(struct mg_context *, const char *, const char *);

typedef void (*mg_callback_t)(struct mg_connection *,
		const struct mg_request_info *info, void *user_data);

void mg_bind_to_uri(struct mg_context *ctx, const char *uri_regex,
		mg_callback_t func, void *user_data);
void mg_bind_to_error_code(struct mg_context *ctx, int error_code,
		mg_callback_t func, void *user_data);
void mg_protect_uri(struct mg_context *ctx, const char *uri_regex,
		mg_callback_t func, void *user_data);

/*
 * Needed only if SSL certificate asks for a password.
 * Instead of prompting for a password, specified function will be called.
 */
typedef int (*mg_spcb_t)(char *buf, int num, int w, void *key);
void mg_set_ssl_password_callback(struct mg_context *ctx, mg_spcb_t func);

/*
 * Functions that can be used within the user URI callback
 *
 * mg_write	Send data to the remote end.
 * mg_printf	Send data, using printf() semantics.
 * mg_get_header Helper function to get HTTP header value
 * mg_get_var	Helper function to get form variable value.
 *		NOTE: Returned value must be mg_free_var()-ed by the caller.
 */
int mg_write(struct mg_connection *, const void *buf, int len);
int mg_printf(struct mg_connection *, const char *fmt, ...);
const char *mg_get_header(const struct mg_connection *, const char *hdr_name);
char *mg_get_var(const struct mg_connection *, const char *var_name);
void mg_free_var(char *var);

/*
 * General helper functions
 * mg_version	Return current version.
 * mg_md5	Helper function. buf must be 33 bytes in size. Expects
 *		a NULL terminated list of asciz strings.
 *		Fills buf with stringified \0 terminated MD5 hash.
 */
const char *mg_version(void);
void mg_md5(char *buf, ...);

void set_connection_keep_alive(struct mg_connection *connection, int keep_alive);

#ifdef __cplusplus
}
#endif /* __cplusplus */

#endif /* MONGOOSE_HEADER_INCLUDED */
