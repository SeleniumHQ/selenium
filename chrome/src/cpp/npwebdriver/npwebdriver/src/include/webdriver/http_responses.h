#ifndef WEBDRIVER_HTTP_RESPONSES_H_
#define WEBDRIVER_HTTP_RESPONSES_H_

//TODO(danielwh): This whole char*/sprintf handling is quite messy...
//Factor it into javascript

namespace webdriver {

/**
 * Expect:
 * %u: Length of filled response data
 * %s: Filled response data
 */
const char *kOkResponse =
    "HTTP/1.1 200 OK"
    "\r\nContent-Length: %u"
    "\r\nContent-Type: application/json; charset=ISO-8859-1"
    "\r\n\r\n%s";

const char *kNoContentReseponse = "HTTP/1.1 204 No Content";

const char *kFailureResponse =
    "HTTP/1.1 501 Not Implemented"
    "\r\nConnection: close"
    "\r\nContent-Length: 0";

/**
 * Expect:
 * %u: Length of filled response data
 * %s: Filled response data
 */
const char *kNotFoundResponse =
    "HTTP/1.1 404 Not Found"
    "\r\nContent-Length: %u"
    "\r\nContent-Type: application/json; charset=ISO-8859-1"
    "\r\n\r\n%s";

/**
 * Expect:
 * %u: Session ID
 * %s: Context
 */
const char *kNotFoundResponseData =
    "{\"error\":true,\"sessionId\":\"%u\",\"value\":\"{\"className\":\"org.openqa.selenium.remote.RemoteWebElement\"}\",\"context\":\"%s\",\"class\":\"org.openqa.selenium.remote.Response\"}";

/**
 * Expect:
 * %u: Session ID
 * %s: Context
 * %s: Lookup, value (e.g. id foo)
  */
const char *kElementNotFoundResponseData =
    "{\"error\":true,\"sessionId\":\"%u\",\"context\":\"%s\",\"value\":{\"message\":\"Unable to locate element with %s\",\"class\":\"org.openqa.selenium.NoSuchElementException\"},\"class\":\"org.openqa.selenium.remote.Response\"}";

/**
 * Expect:
 * %u: Session ID
 * %s: Value (if a string, must be wrapped in "s
 * %s: Context
 */
const char *kSendValueResponseData =
    "{\"error\":false,\"sessionId\":\"%u\",\"value\":%s,\"context\":\"%s\",\"class\":\"org.openqa.selenium.remote.Response\"}";

/**
 * Expect:
 * %u: Port WebDriver is listening on
 * %u: Session ID
 * %s: context
 * TODO(danielwh): This is hideously hard-coded... Think of some nice workaround
 */
const char kAcceptCreateSessionResponse[] = 
    "HTTP/1.1 302 Found"
    "\r\nLocation: http://localhost:%u/session/%u/%s"
    "\r\nContent-Length: 0";

/**
 * Expect:
 * %u: sessionId
 * %s: JSON string containing the agreed capabilities for the session
 */
const char *kConfirmCreateSessionResponseData =
    "{\"error\":false,\"sessionId\":\"%u\",\"value\":%s}";

/**
 * Expect:
 * %u: Session ID
 * %s: JSON array string of element/ID strings for instance element ID
 * %s: Context
 */
const char *kGetElementFoundResponseData = "{\"error\":false,\"sessionId\":\"%u\",\"value\":%s,\"context\":\"%s\",\"class\":\"org.openqa.selenium.remote.Response\"}";

/**
 * Expect:
 * %u: Session ID
 * %s: Context
 */
const char *kGetElementNotFoundResponseData =
    "{\"error\":true,\"sessionId\":\"%u\",\"value\":\"\",\"context\":\"%s\",\"class\":\"org.openqa.selenium.remote.Response\"}";

} //namespace webdriver

#endif //WEBDRIVER_HTTP_RESPONSES_H_