// ========================================================================
// $Id: Target.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.html;


/* -------------------------------------------------------------------- */
/** HTML Link Target.
 * This is a HTML reference (not a CSS Link).
 * @see StyleLink
 */
public class Target extends Block
{

    /* ----------------------------------------------------------------- */
    /** Construct Link.
     * @param target The target name 
     */
    public Target(String target)
    {
        super("a");
        attribute("name",target);
    }

    /* ----------------------------------------------------------------- */
    /** Construct Link.
     * @param target The target name 
     * @param link Link Element
     */
    public Target(String target,Object link)
    {
        this(target);
        add(link);
    }
}
