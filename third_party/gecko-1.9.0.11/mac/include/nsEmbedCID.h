/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Boris Zbarsky <bzbarsky@mit.edu>.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef NSEMBEDCID_H
#define NSEMBEDCID_H

/**
 * @file
 * @brief List of, and documentation for, frozen Gecko embedding contracts.
 */

/**
 * Web Browser ContractID
 *   Creating an instance of this ContractID (via createInstanceByContractID)
 *   is the basic way to instantiate a Gecko browser.
 *
 * This contract implements the following interfaces:
 * nsIWebBrowser
 * nsIWebBrowserSetup
 * nsIInterfaceRequestor
 *
 * @note This contract does not guarantee implementation of any other
 * interfaces and does not guarantee ability to get any particular
 * interfaces via the nsIInterfaceRequestor implementation.
 */
#define NS_WEBBROWSER_CONTRACTID \
  "@mozilla.org/embedding/browser/nsWebBrowser;1"

/**
 * Prompt Service ContractID
 *   The prompt service (which can be gotten by calling getServiceByContractID
 *   on this ContractID) is the way to pose various prompts, alerts,
 *   and confirmation dialogs to the user.
 * 
 * This contract implements the following interfaces:
 * nsIPromptService
 * nsIPromptService2 (optional)
 *
 * Embedders may override this ContractID with their own implementation if they
 * want more control over the way prompts, alerts, and confirmation dialogs are
 * presented to the user.
 */
#define NS_PROMPTSERVICE_CONTRACTID \
 "@mozilla.org/embedcomp/prompt-service;1"

/**
 * Non Blocking Alert Service ContractID
 *   This service is for posing non blocking alerts to the user.
 *
 * This contract implements the following interfaces:
 * nsINonBlockingAlertService
 *
 * Embedders may override this ContractID with their own implementation.
 */
#define NS_NONBLOCKINGALERTSERVICE_CONTRACTID \
 "@mozilla.org/embedcomp/nbalert-service;1"

/**
 * This contract ID should be implemented by password managers to be able to
 * override the standard implementation of nsIAuthPrompt2. It will be used as
 * a service.
 *
 * This contract implements the following interfaces:
 * nsIPromptFactory
 */
#define NS_PWMGR_AUTHPROMPTFACTORY \
 "@mozilla.org/passwordmanager/authpromptfactory;1"

#endif // NSEMBEDCID_H
