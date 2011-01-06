#ifndef WEBDRIVER_IE_BROWSERFACTORY_H_
#define WEBDRIVER_IE_BROWSERFACTORY_H_

#include <exdisp.h>
#include <exdispid.h>
#include <iepmapi.h>
#include <shlguid.h>
#include <mshtml.h>
#include <oleacc.h>
#include <sddl.h>
#include <string>
#include <sstream>
#include <vector>

using namespace std;

namespace webdriver {

struct ProcessWindowInfo {
	DWORD dwProcessId;
	HWND hwndBrowser;
	IWebBrowser2 *pBrowser;
};

class BrowserFactory {
public:
	BrowserFactory(void);
	virtual ~BrowserFactory(void);

	DWORD LaunchBrowserProcess(int port);
	IWebBrowser2* CreateBrowser();
	void AttachToBrowser(ProcessWindowInfo *procWinInfo);
	HWND GetTabWindowHandle(IWebBrowser2* pBrowser);

	static BOOL CALLBACK FindBrowserWindow(HWND hwnd, LPARAM param);
	static BOOL CALLBACK FindChildWindowForProcess(HWND hwnd, LPARAM arg);
	static BOOL CALLBACK FindDialogWindowForProcess(HWND hwnd, LPARAM arg);

private:
	int ie_major_version_;
	int windows_major_version_;
	std::wstring ie_executable_location_;

	void SetThreadIntegrityLevel(void);
	void ResetThreadIntegrityLevel(void);

	void GetExecutableLocation(void);
	void GetIEVersion(void);
	void GetOSVersion(void);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSERFACTORY_H_
