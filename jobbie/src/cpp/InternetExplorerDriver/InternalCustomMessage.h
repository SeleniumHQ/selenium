/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#ifndef JOBBIE_INTERNALCUSTOMMESSAGE_H_
#define JOBBIE_INTERNALCUSTOMMESSAGE_H_

#define _WD_START						WM_USER+1
#define _WD_GETIE						WM_USER+2
#define _WD_SWITCHTOFRAME				WM_USER+3

#define _WD_ELEM_ISDISPLAYED			WM_USER+10
#define _WD_ELEM_ISENABLED				WM_USER+11
#define _WD_ELEM_GETLOCATIONONCESCROLLEDINTOVIEW WM_USER+12
#define _WD_ELEM_GETLOCATION			WM_USER+13
#define _WD_ELEM_GETHEIGHT				WM_USER+14
#define _WD_ELEM_GETWIDTH				WM_USER+15
#define _WD_ELEM_GETTAGNAME 			WM_USER+16
#define _WD_ELEM_SENDKEYS				WM_USER+17
#define _WD_ELEM_CLEAR					WM_USER+18
#define _WD_ELEM_ISSELECTED				WM_USER+19
#define _WD_ELEM_SETSELECTED			WM_USER+20
#define _WD_ELEM_TOGGLE					WM_USER+21
#define _WD_ELEM_GETVALUEOFCSSPROP		WM_USER+22
#define _WD_ELEM_GETTEXT				WM_USER+23
#define _WD_ELEM_CLICK					WM_USER+24
#define _WD_ELEM_SUBMIT					WM_USER+25
#define _WD_ELEM_GETCHILDRENWTAGNAME	WM_USER+26
#define _WD_ELEM_ISFRESH				WM_USER+27

#define _WD_GETVISIBLE					WM_USER+30
#define _WD_SETVISIBLE					WM_USER+31
#define _WD_GETCURRENTURL				WM_USER+32
#define _WD_GETPAGESOURCE				WM_USER+33
#define _WD_GETTITLE					WM_USER+34
#define _WD_GETURL						WM_USER+35
#define _WD_GOFORWARD					WM_USER+36
#define _WD_GOBACK						WM_USER+37
#define _WD_GET_HANDLE					WM_USER+38
#define _WD_GET_HANDLES					WM_USER+39

#define _WD_SELELEMENTBYID				WM_USER+40
#define _WD_SELELEMENTSBYID				WM_USER+41
#define _WD_SELELEMENTBYLINK			WM_USER+42
#define _WD_SELELEMENTSBYLINK			WM_USER+43
#define _WD_SELELEMENTBYPARTIALLINK		WM_USER+44
#define _WD_SELELEMENTSBYPARTIALLINK	WM_USER+45
#define _WD_SELELEMENTBYNAME			WM_USER+46
#define _WD_SELELEMENTSBYNAME			WM_USER+47
#define _WD_SELELEMENTBYCLASSNAME		WM_USER+48
#define _WD_SELELEMENTSBYCLASSNAME		WM_USER+49
#define _WD_SELELEMENTBYTAGNAME			WM_USER+50
#define _WD_SELELEMENTSBYTAGNAME		WM_USER+51

#define _WD_GETCOOKIES					WM_USER+60
#define _WD_ADDCOOKIE					WM_USER+61

#define _WD_WAITFORNAVIGATIONTOFINISH	WM_USER+70
#define _WD_ELEM_RELEASE				WM_USER+71

#define _WD_CLOSEWINDOW					WM_USER+80
#define _WD_EXECUTESCRIPT				WM_USER+81
#define _WD_GETACTIVEELEMENT			WM_USER+82
#define _WD_SWITCHWINDOW				WM_USER+83

#define _WD_CAPTURESCREENSHOT    WM_USER+84
#define _WD_GETSCRIPTRESULTOBJECTTYPE  WM_USER+85

// ==============================================================
//     HEART BEATS
// ==============================================================
#define _WD_HB_START					WM_USER+0x100
#define _WD_HB_STOP					    WM_USER+0x101
#define _WD_HB_BEAT					    WM_USER+0x102
#define _WD_HB_CRASHED					WM_USER+0x103


#endif // JOBBIE_INTERNALCUSTOMMESSAGE_H_
