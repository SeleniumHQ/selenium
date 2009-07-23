//TODO(danielwh): Use proper logging

#ifndef WEBDRIVER_WEBDRIVER_LOGGING_H_
#define WEBDRIVER_WEBDRIVER_LOGGING_H_

#include "mongoose/mongoose.h"

#include <sstream>
#include <string>

namespace webdriver {

static void GENERAL_WEBDRIVER_LOG(const char *filename, const char *str) {
  FILE *file = fopen(filename,"a");
  fputs(str, file);
  fclose(file);
}

static char *FORMAT_HTTP_REQUEST_FOR_LOG(const mg_request_info *info) {
  std::stringstream header_stream;
  for (int i = 0; i < info->num_headers; ++i) {
    header_stream << "<" << info->http_headers[i].name << ": " << info->http_headers[i].value << std::endl;
  }
  char *buf = new char[10000];
  sprintf(buf, "<%s %s HTTP/%d.%d\n%s\n\n<%.*s\n\n",
      info->request_method,
      info->uri,
      info->http_version_major,
      info->http_version_minor,
      header_stream.str().c_str(),
      info->post_data_len,
      info->post_data);
  return buf;
}

#if defined(WIN32)
static void WEBDRIVER_LOG(const char *str) { GENERAL_WEBDRIVER_LOG("c:\\tmp\\log.txt", str); }
static void HTTP_WEBDRIVER_LOG(const char *str) { GENERAL_WEBDRIVER_LOG("c:\\tmp\\http-log.txt", str); }
static void JS_WEBDRIVER_LOG(const char *str) { GENERAL_WEBDRIVER_LOG("c:\\tmp\\js-log.txt", str); }
static void WEBDRIVER_LOG_HTTP_IN(const mg_request_info *info) {
  GENERAL_WEBDRIVER_LOG("c:\\tmp\\http-log.txt", FORMAT_HTTP_REQUEST_FOR_LOG(info));
}

#elif defined(UNIX)
static void WEBDRIVER_LOG(const char *str) { GENERAL_WEBDRIVER_LOG("/tmp/chromedriver-log.txt", str); }
static void HTTP_WEBDRIVER_LOG(const char *str) { GENERAL_WEBDRIVER_LOG("/tmp/chromedriver-http-log.txt", str); }
static void JS_WEBDRIVER_LOG(const char *str) { GENERAL_WEBDRIVER_LOG("/tmp/chromedriver-js-log.txt", str); }
static void WEBDRIVER_LOG_HTTP_IN(const mg_request_info *info) {
  GENERAL_WEBDRIVER_LOG("/tmp/chromedriver-http-log.txt", FORMAT_HTTP_REQUEST_FOR_LOG(info));
}
#endif //OS-specific
  

} //namespace webdriver

#endif //WEBDRIVER_WEBDRIVER_LOGGING_H_
