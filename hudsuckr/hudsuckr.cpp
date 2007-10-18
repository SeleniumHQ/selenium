/*
 * Copyright 2007 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// Hudsuckr Windows Proxy Configuration Tool
// "You know, for kids!"


#define _WIN32_WINNT 0x0500	// Change this to the appropriate value to target other versions of Windows.
#include <stdio.h>
#include <tchar.h>
#include <windows.h>
#include <wininet.h>
#include <ras.h>
#pragma comment( lib, "wininet" )
#pragma comment( lib, "rasapi32" )


//// Options used in INTERNET_PER_CONN_OPTON struct
//#define INTERNET_PER_CONN_FLAGS                         1
//#define INTERNET_PER_CONN_PROXY_SERVER                  2
//#define INTERNET_PER_CONN_PROXY_BYPASS                  3
//#define INTERNET_PER_CONN_AUTOCONFIG_URL                4
//#define INTERNET_PER_CONN_AUTODISCOVERY_FLAGS           5
//etc.
//// PER_CONN_FLAGS
//#define PROXY_TYPE_DIRECT                               0x00000001   // direct to net
//#define PROXY_TYPE_PROXY                                0x00000002   // via named proxy
//#define PROXY_TYPE_AUTO_PROXY_URL                       0x00000004   // autoproxy URL
//#define PROXY_TYPE_AUTO_DETECT                          0x00000008   // use autoproxy detection

// Figure out which Dial-Up or VPN connection is active; in a normal LAN connection, this should
// return NULL
LPTSTR FindActiveConnection()
{
    DWORD dwCb = sizeof(RASCONN);
    DWORD dwErr = ERROR_SUCCESS;
    DWORD dwRetries = 5;
    DWORD dwConnections = 0;
    RASCONN* lpRasConn = NULL;
    RASCONNSTATUS rasconnstatus;
    rasconnstatus.dwSize = sizeof(RASCONNSTATUS);

    //
    // Loop through in case the information from RAS changes between calls.
    //
    while (dwRetries--)
    {
        //
        // If the memory is allocated, free it.
        //
        if (NULL != lpRasConn)
        {
            HeapFree(GetProcessHeap(), 0, lpRasConn);
            lpRasConn = NULL;
        }
        //
        // Allocate the size needed for the RAS structure.
        //
        lpRasConn = (RASCONN*)HeapAlloc(GetProcessHeap(), 0, dwCb);
        if (NULL == lpRasConn)
        {
            dwErr = ERROR_NOT_ENOUGH_MEMORY;
            break;
        }
        //
        // Set the structure size for version checking purposes.
        //
        lpRasConn->dwSize = sizeof(RASCONN);
        //
        // Call the RAS API then exit the loop if we are successful or an unknown
        // error occurs.
        //
        dwErr = RasEnumConnections(
                    lpRasConn,
                    &dwCb,
                    &dwConnections);
        if (ERROR_INSUFFICIENT_BUFFER != dwErr)
        {
            break;
        }
    }
    //
    // In the success case, print the names of the connections.
    //
    if (ERROR_SUCCESS == dwErr)
    {
        DWORD i;

        for (i = 0; i < dwConnections; i++)
        {
            RasGetConnectStatus(lpRasConn[i].hrasconn, &rasconnstatus);
            if (rasconnstatus.rasconnstate == RASCS_Connected)
            {
                return lpRasConn[i].szEntryName;
            }

        }
    }
    return NULL; // Couldn't find an active dial-up/VPN connection; return NULL

}

int QueryOptions(LPTSTR szActiveConnection)
{
    _tprintf(L"ACTIVE_CONNECTION=%s\n", szActiveConnection);
    const int optionCount = 5;
    INTERNET_PER_CONN_OPTION_LIST    List;
    INTERNET_PER_CONN_OPTION         Option[optionCount];
    unsigned long                    nSize = sizeof(INTERNET_PER_CONN_OPTION_LIST);

    Option[0].dwOption = 1;
    for (int i = 1; i < optionCount; i++) {
        Option[i].dwOption = i;
    }

    List.dwSize = sizeof(INTERNET_PER_CONN_OPTION_LIST);
    List.pszConnection = szActiveConnection;
    List.dwOptionCount = optionCount;
    List.dwOptionError = 0;
    List.pOptions = Option;

    if(!InternetQueryOption(NULL, INTERNET_OPTION_PER_CONNECTION_OPTION, &List, &nSize)) {
        DWORD lastError = GetLastError();
        _tprintf(L"InternetQueryOption failed! (%d)\n", lastError);
        return lastError;
    }

    _tprintf(L"PROXY_TYPE_DIRECT=");
    if((Option[INTERNET_PER_CONN_FLAGS].Value.dwValue & PROXY_TYPE_DIRECT) == PROXY_TYPE_DIRECT) {
        _tprintf(L"true\n");
    } else {
        _tprintf(L"false\n");
    }

    _tprintf(L"PROXY_TYPE_PROXY=");
    if((Option[INTERNET_PER_CONN_FLAGS].Value.dwValue & PROXY_TYPE_PROXY) == PROXY_TYPE_PROXY) {
        _tprintf(L"true\n");
    } else {
        _tprintf(L"false\n");
    }

    _tprintf(L"PROXY_TYPE_AUTO_PROXY_URL=");
    if((Option[INTERNET_PER_CONN_FLAGS].Value.dwValue & PROXY_TYPE_AUTO_PROXY_URL) == PROXY_TYPE_AUTO_PROXY_URL) {
        _tprintf(L"true\n");
    } else {
        _tprintf(L"false\n");
    }

    _tprintf(L"PROXY_TYPE_AUTO_DETECT=");
    if((Option[INTERNET_PER_CONN_FLAGS].Value.dwValue & PROXY_TYPE_AUTO_DETECT) == PROXY_TYPE_AUTO_DETECT) {
        _tprintf(L"true\n");
    } else {
        _tprintf(L"false\n");
    }

    _tprintf(L"INTERNET_PER_CONN_PROXY_SERVER=%s\n", Option[INTERNET_PER_CONN_PROXY_SERVER].Value.pszValue);
    _tprintf(L"INTERNET_PER_CONN_PROXY_BYPASS=%s\n", Option[INTERNET_PER_CONN_PROXY_BYPASS].Value.pszValue);
    _tprintf(L"INTERNET_PER_CONN_AUTOCONFIG_URL=%s\n", Option[INTERNET_PER_CONN_AUTOCONFIG_URL].Value.pszValue);

	return 0;
}

void CheckBlankArg(LPTSTR * pszArg) {
    if (*pszArg == NULL) return;
    if (_tcslen(*pszArg) == 0) {
        *pszArg = NULL;
        return;
    }
    if (!_tcsicmp(*pszArg, L"(null)")) {
        *pszArg = NULL;
        return;
    }
}

int _tmain(int argc, _TCHAR* argv[])
{
    if (argc < 2) return QueryOptions(FindActiveConnection());
    if (argc != 9) {
        printf("Hudsuckr Windows Proxy Configuration Tool: \"You know, for kids!\"\n\n"

            "Windows manages Internet proxy connection information in the registry;\n"
            "each Internet \"connection\" can have its own separate proxy\n"
            "configuration.  These settings correspond to settings in the \"Internet\n"
            "Options\" Control Panel, under the \"Connections\" tab.\n\n"

            "Run \"hudsuckr\" without arguments to print out the current proxy\n"
            "configuration details.  We print out the name of the current active\n"
            "connection, the four connection flags (DIRECT, PROXY, AUTO_PROXY_URL,\n"
            "AUTO_DETECT), and three strings: PROXY_SERVER, PROXY_BYPASS, and\n"
            "AUTOCONFIG_URL. The seven settings are described in MS documentation\n"
            "available here: http://msdn2.microsoft.com/en-us/library/aa385145.aspx\n\n"

            "Run \"hudsuckr\" with exactly eight arguments to set the proxy\n"
            "configuration, like this:\n"
            "  hudsuckr (null) true true true true \"localhost:4444\" \"<local>\" \"file://c:/proxy.pac\"\n\n"

            "Specify the name of the connection first (or use the LAN settings by\n"
            "specifying \"(null)\"), then set the four flags using \"true\" and\n"
            "\"false\", then the proxy server (with a colon to specify the port), the\n"
            "list of servers to bypass delimited by semi-colons (with \"<local>\" as\n"
            "a special string that bypasses local addresses), and finally the URL\n"
            "to a proxy PAC autoconfiguration file.  Use \"\" or \"(null)\" to leave\n"
            "string settings blank/empty.\n\n"

            "If you're still confused about the flags, look at the proxy settings\n"
            "in the \"Internet Options\" Control Panel. See how you can check those\n"
            "checkboxes independently of one another? The flags correspond to those\n"
            "checkboxes.  If AUTO_DETECT is true, IE will try to use WPAD; if\n"
            "successful, WPAD will override the specified AUTOCONFIG_URL. If an\n"
            "AUTOCONFIG_URL is detected (by AUTO_DETECT) or specified directly\n"
            "(AUTO_PROXY_URL is enabled), IE will use the autoconfig script as a\n"
            "proxy PAC file.  If no AUTOCONFIG_URL was specified or detected, IE\n"
            "will attempt to use the server specified in PROXY_SERVER if the PROXY\n"
            "flag is enabled; it will bypass the proxy for the list of servers\n"
            "specified in PROXY_BYPASS. Finally, if PROXY, AUTO_DETECT and\n"
            "AUTO_PROXY_URL are all set to false, IE will attempt to contact the\n"
            "web server directly.  Note that the DIRECT flag always appears to be\n"
            "true, even if the PROXY flag is true; we recommend you leave it that\n"
            "way, too."
            "\n\nNumber of arguments: %d", argc-1
            );
        return -1;
    }
    BOOL bDirect, bProxy, bAutoProxyUrl, bAutoDetect;
    LPTSTR szActiveConnection, szProxyServer, szProxyBypass, szAutoConfigUrl;

    int i = 1;
    szActiveConnection = argv[i++];
    CheckBlankArg(&szActiveConnection);

    bDirect = (_tcsicmp(argv[i++], L"true") == 0);
    bProxy = (_tcsicmp(argv[i++], L"true") == 0);
    bAutoProxyUrl = (_tcsicmp(argv[i++], L"true") == 0);
    bAutoDetect = (_tcsicmp(argv[i++], L"true") == 0);
    
    DWORD dwConnFlags;
    dwConnFlags = bDirect + (bProxy << 1) + (bAutoProxyUrl << 2) + (bAutoDetect << 3);
    
    szProxyServer = argv[i++];
    CheckBlankArg(&szProxyServer);
    szProxyBypass = argv[i++];
    CheckBlankArg(&szProxyBypass);
    szAutoConfigUrl = argv[i++];
    CheckBlankArg(&szAutoConfigUrl);

    const int optionCount = 4;
    INTERNET_PER_CONN_OPTION_LIST    List;
    INTERNET_PER_CONN_OPTION         Option[optionCount];
    unsigned long                    nSize = sizeof(INTERNET_PER_CONN_OPTION_LIST);

    i = 0;
    Option[i].dwOption = INTERNET_PER_CONN_FLAGS;
    Option[i++].Value.dwValue = dwConnFlags;
    Option[i].dwOption = INTERNET_PER_CONN_PROXY_SERVER;
    Option[i++].Value.pszValue = szProxyServer;
    Option[i].dwOption = INTERNET_PER_CONN_PROXY_BYPASS;
    Option[i++].Value.pszValue = szProxyBypass;
    Option[i].dwOption = INTERNET_PER_CONN_AUTOCONFIG_URL;
    Option[i++].Value.pszValue = szAutoConfigUrl;

    List.dwSize = sizeof(INTERNET_PER_CONN_OPTION_LIST);
    List.pszConnection = szActiveConnection;
    List.dwOptionCount = optionCount;
    List.dwOptionError = 0;
    List.pOptions = Option;
    
    if(!InternetSetOption(NULL, INTERNET_OPTION_PER_CONNECTION_OPTION, &List, nSize)) {
        DWORD lastError = GetLastError();
        printf("InternetSetOption failed! (%d)\n", lastError);
        return lastError;
    }

    if(!InternetSetOption(NULL, INTERNET_OPTION_SETTINGS_CHANGED, NULL, 0)) {
        DWORD lastError = GetLastError();
        printf("InternetSetOption failed! (%d)\n", lastError);
        return lastError;
    }

    return QueryOptions(szActiveConnection);
}

