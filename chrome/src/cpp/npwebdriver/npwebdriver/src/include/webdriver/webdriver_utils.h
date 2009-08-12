#ifndef WEBDRIVER_WEBDRIVER_UTILS_H_
#define WEBDRIVER_WEBDRIVER_UTILS_H_

#if defined(WIN32)
#include <Objbase.h> //For CoCreateGuid
#elif defined(UNIX)
#define _TRUNCATE ((size_t)-1)
#endif

#include <sstream>
#include <string>

#if defined(UNIX)
#include <string.h> //for strcmp
#endif

namespace webdriver {

static const size_t kGuidStringLength = 39;
static const char *kSpoofContext = "foo";

static wchar_t *CharStringToWCharString(char *in_string) {
#if defined(WIN32)
  size_t convertedChars = 0;
  wchar_t *out_string = new wchar_t[strlen(in_string) + 1];
  mbstowcs_s(&convertedChars, out_string, strlen(in_string) + 1,
             in_string, _TRUNCATE);
  return out_string;
#elif defined(UNIX)
  //TODO(danielwh): Implement in Linux
  return NULL;
#endif
}

static char *WCharStringToCharString(wchar_t *in_string) {
#if defined(WIN32)
  size_t convertedChars = 0;
  char *out_string = new char[wcslen(in_string) + 1];
  wcstombs_s(&convertedChars, out_string, wcslen(in_string) + 1,
             in_string, _TRUNCATE);
  return out_string;
#elif defined(UNIX)
  //TODO(danielwh): Implement in Linux
  return NULL;
#endif
}

static char *GenerateGuidString() {
#if defined(WIN32)
  GUID guid;
  CoCreateGuid(&guid);

  wchar_t *guid_string_w = new wchar_t[kGuidStringLength];
  StringFromGUID2(guid, guid_string_w, kGuidStringLength);
  return WCharStringToCharString(guid_string_w);
#elif defined(UNIX)
  return "Not So Unique...";
#endif
}

static const char *GetArg(int argc, char *argn[], char *argv[],
                                      char *desired) {
  for (int i = 0; i < argc; i++) {
    if (!strcmp(argn[i], desired)) {
      return argv[i];
    }
  }
  return NULL;
}

/**
 * Escapes ' characters, as required by the format of the javascript commands
 * in webdriver/javascript_commands.h
 * Does not modify original string
 * @param input string to escape
 * @return escaped string
 */
static std::string EscapeChar(std::string input, char c) {
  std::stringstream in, out;
  in << c;
  out << "\\" << c;
  size_t pos = 0;
  while (input.find(c, pos) != std::string::npos) {
    size_t next_pos = input.find(in.str().c_str(), pos);
    input.replace(next_pos, 1, out.str().c_str());
    pos = next_pos + 2;
  }
  return input;
}

} //namespace webdriver

#endif //WEBDRIVER_WEBDRIVER_UTILS_H_
