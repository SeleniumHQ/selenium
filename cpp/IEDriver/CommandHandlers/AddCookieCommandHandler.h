// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#ifndef WEBDRIVER_IE_ADDCOOKIECOMMANDHANDLER_H_
#define WEBDRIVER_IE_ADDCOOKIECOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include <ctime>

namespace webdriver {

class AddCookieCommandHandler : public IECommandHandler {
 public:
  AddCookieCommandHandler(void) {
  }

  virtual ~AddCookieCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    ParametersMap::const_iterator cookie_parameter_iterator = command_parameters.find("cookie");
    if (cookie_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: cookie");
      return;
    }

    Json::Value cookie_value = cookie_parameter_iterator->second;
    std::string cookie_string(cookie_value["name"].asString() +
                              "=" +
                              cookie_value["value"].asString() +
                              "; ");
    cookie_value.removeMember("name");
    cookie_value.removeMember("value");

    bool is_secure = cookie_value["secure"].asBool();
    if (is_secure) {
      cookie_string += "secure; ";
    }
    cookie_value.removeMember("secure");

    Json::Value expiry = cookie_value.get("expiry", Json::Value::null);
    if (!expiry.isNull()) {
      cookie_value.removeMember("expiry");
      if (expiry.isDouble()) {
        time_t expiration_time = static_cast<time_t>(expiry.asDouble());
        char raw_formatted_time[30];
        tm time_info;
        gmtime_s(&time_info, &expiration_time);
        std::string month = this->GetMonthName(time_info.tm_mon);
        std::string weekday = this->GetWeekdayName(time_info.tm_wday);
        std::string format_string = weekday + ", %d " + month + " %Y %H:%M:%S GMT";
        strftime(raw_formatted_time, 30 , format_string.c_str(), &time_info);
        std::string formatted_time(&raw_formatted_time[0]);
        cookie_string += "expires=" + formatted_time + "; ";
      }

      // If a test sends both "expiry" and "expires", remove "expires"
      // from the cookie so that it doesn't get added when the string
      // properties of the JSON object are processed.
      Json::Value expires_value = cookie_value.get("expires", Json::Value::null);
      if (!expires_value.isNull()) {
        cookie_value.removeMember("expires");
      }
    }

    Json::Value domain = cookie_value.get("domain", Json::Value::null);
    if (!domain.isNull() && domain.isString() && domain.asString() != "") {
      cookie_string += "domain=" + domain.asString() + "; ";
    }

    Json::Value path = cookie_value.get("path", Json::Value::null);
    if (!path.isNull() && path.isString() && path.asString() != "") {
      cookie_string += "path=" + path.asString() + "; ";
    }

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get current browser");
      return;
    }

    status_code = browser_wrapper->AddCookie(cookie_string);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to add cookie to page");
      return;
    }

    response->SetSuccessResponse(Json::Value::null);
  }

 private:
  std::string GetMonthName(int month_name) {
    // NOTE: can cookie dates used with put_cookie be localized?
    // If so, this function is not needed and a simple call to 
    // strftime() will suffice.
    switch (month_name) {
      case 0:
        return "Jan";
      case 1:
        return "Feb";
      case 2:
        return "Mar";
      case 3:
        return "Apr";
      case 4:
        return "May";
      case 5:
        return "Jun";
      case 6:
        return "Jul";
      case 7:
        return "Aug";
      case 8:
        return "Sep";
      case 9:
        return "Oct";
      case 10:
        return "Nov";
      case 11:
        return "Dec";
    }

    return "";
  }

  std::string GetWeekdayName(int weekday_name) {
    // NOTE: can cookie dates used with put_cookie be localized?
    // If so, this function is not needed and a simple call to 
    // strftime() will suffice.
    switch (weekday_name) {
      case 0:
        return "Sun";
      case 1:
        return "Mon";
      case 2:
        return "Tue";
      case 3:
        return "Wed";
      case 4:
        return "Thu";
      case 5:
        return "Fri";
      case 6:
        return "Sat";
    }

    return "";
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ADDCOOKIECOMMANDHANDLER_H_