/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is the Netscape Portable Runtime (NSPR).
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-2000
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

/*
** File:		pralarm.h
** Description:	API to periodic alarms.
**
**
** Alarms are defined to invoke some client specified function at 
** a time in the future. The notification may be a one time event
** or repeated at a fixed interval. The interval at which the next
** notification takes place may be modified by the client code only
** during the respective notification.
**
** The notification is delivered on a thread that is part of the
** alarm context (PRAlarm). The thread will inherit the priority
** of the Alarm creator.
**
** Any number of periodic alarms (PRAlarmID) may be created within
** the context of a single alarm (PRAlarm). The notifications will be
** scheduled as close to the desired time as possible.
**
** Repeating periodic notifies are expected to run at a fixed rate.
** That rate is expressed as some number of notifies per period where
** the period is much larger than a PRIntervalTime (see prinrval.h).
*/

#if !defined(pralarm_h)
#define pralarm_h

#include "prtypes.h"
#include "prinrval.h"


PR_BEGIN_EXTERN_C

/**********************************************************************/
/************************* TYPES AND CONSTANTS ************************/
/**********************************************************************/

typedef struct PRAlarm PRAlarm;
typedef struct PRAlarmID PRAlarmID;

typedef PRBool (PR_CALLBACK *PRPeriodicAlarmFn)(
    PRAlarmID *id, void *clientData, PRUint32 late);

/**********************************************************************/
/****************************** FUNCTIONS *****************************/
/**********************************************************************/

/***********************************************************************
** FUNCTION:    PR_CreateAlarm
** DESCRIPTION:
**  Create an alarm context.
** INPUTS:      void
** OUTPUTS:     None
** RETURN:      PRAlarm*
**  
** SIDE EFFECTS:
**  This creates an alarm context, which is an object used for subsequent
**  notification creations. It also creates a thread that will be used to
** deliver the notifications that are expected to be defined. The client
** is resposible for destroying the context when appropriate.
** RESTRICTIONS:
**  None. 
** MEMORY:      The object (PRAlarm) and a thread to support notifications.
** ALGORITHM:   N/A
***********************************************************************/
NSPR_API(PRAlarm*) PR_CreateAlarm(void);

/***********************************************************************
** FUNCTION:    PR_DestroyAlarm
** DESCRIPTION:
**  Destroys the context created by PR_CreateAlarm().
** INPUTS:      PRAlarm*
** OUTPUTS:     None
** RETURN:      PRStatus
**  
** SIDE EFFECTS:
**  This destroys the context that was created by PR_CreateAlarm().
**  If there are any active alarms (PRAlarmID), they will be cancelled.
**  Once that is done, the thread that was used to deliver the alarms
**  will be joined. 
** RESTRICTIONS:
**  None. 
** MEMORY:      N/A
** ALGORITHM:   N/A
***********************************************************************/
NSPR_API(PRStatus) PR_DestroyAlarm(PRAlarm *alarm);

/***********************************************************************
** FUNCTION:    PR_SetAlarm
** DESCRIPTION:
**  Creates a periodic notifier that is to be delivered to a specified
**  function at some fixed interval.
** INPUTS:      PRAlarm *alarm              Parent alarm context
**              PRIntervalTime period       Interval over which the notifies
**                                          are delivered.
**              PRUint32 rate               The rate within the interval that
**                                          the notifies will be delivered.
**              PRPeriodicAlarmFn function  Entry point where the notifies
**                                          will be delivered.
** OUTPUTS:     None
** RETURN:      PRAlarmID*                  Handle to the notifier just created
**                                          or NULL if the request failed.
**  
** SIDE EFFECTS:
**  A periodic notifier is created. The notifications will be delivered
**  by the alarm's internal thread at a fixed interval whose rate is the
**  number of interrupts per interval specified. The first notification
**  will be delivered as soon as possible, and they will continue until
**  the notifier routine indicates that they should cease of the alarm
**  context is destroyed (PR_DestroyAlarm).
** RESTRICTIONS:
**  None. 
** MEMORY:      Memory for the notifier object.
** ALGORITHM:   The rate at which notifications are delivered are stated
**              to be "'rate' notifies per 'interval'". The exact time of
**              the notification is computed based on a epoch established
**              when the notifier was set. Each notification is delivered
**              not ealier than the epoch plus the fixed rate times the
**              notification sequence number. Such notifications have the
**              potential to be late by not more than 'interval'/'rate'.
**              The amount of lateness of one notification is taken into
**              account on the next in an attempt to avoid long term slew.  
***********************************************************************/
NSPR_API(PRAlarmID*) PR_SetAlarm(
    PRAlarm *alarm, PRIntervalTime period, PRUint32 rate,
    PRPeriodicAlarmFn function, void *clientData);

/***********************************************************************
** FUNCTION:    PR_ResetAlarm
** DESCRIPTION:
**  Resets an existing alarm.
** INPUTS:      PRAlarmID *id               Identify of the notifier.
**              PRIntervalTime period       Interval over which the notifies
**                                          are delivered.
**              PRUint32 rate               The rate within the interval that
**                                          the notifies will be delivered.
** OUTPUTS:     None
** RETURN:      PRStatus                    Indication of completion.
**  
** SIDE EFFECTS:
**  An existing alarm may have its period and rate redefined. The
**  additional side effect is that the notifier's epoch is recomputed.
**  The first notification delivered by the newly refreshed alarm is
**  defined to be 'interval'/'rate' from the time of the reset.
** RESTRICTIONS:
**  This function may only be called in the notifier for that alarm.
** MEMORY:      N/A.
** ALGORITHM:   See PR_SetAlarm().  
***********************************************************************/
NSPR_API(PRStatus) PR_ResetAlarm(
	PRAlarmID *id, PRIntervalTime period, PRUint32 rate);

PR_END_EXTERN_C

#endif /* !defined(pralarm_h) */

/* prinrval.h */
