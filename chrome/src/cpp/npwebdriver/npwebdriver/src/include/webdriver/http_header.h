#ifndef WEBDRIVER_HTTP_HEADER_H_
#define WEBDRIVER_HTTP_HEADER_H_

#include <string>

namespace webdriver {

struct HttpHeader {
  std::string name_;
  std::string value_;
  HttpHeader(std::string name, std::string value) : name_(name), value_(value) {}
};

} //namespace webdriver

#endif //WEBDRIVER_HTTP_HEADER_H_
