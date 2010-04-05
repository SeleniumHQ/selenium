/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//a shorthand writting
const Ci = Components.interfaces;
const Cc = Components.classes;


/**
 * Object used to observe DnD on the suiteTree
 */
var suiteTreeDragObserver = {

    onDragStart: function (aEvent, aXferData, aDragAction) {

        try{
            var selectedIndex = document.getElementById('suiteTree').currentIndex;
            if (selectedIndex == -1)
                return;

            aXferData.data = new TransferData();
            aXferData.data.addDataForFlavour("text/unicode", selectedIndex.toString());
            aDragAction.action = Ci.nsIDragService.DRAGDROP_ACTION_MOVE;

        }catch(e){
            new Log("DND").error("onDragStart error: "+e);
        }
    },
    onDrop: function (aEvent, aXferData, aDragSession) {},
    onDragExit: function (aEvent, aDragSession) {},
    onDragOver: function (aEvent, aFlavour, aDragSession) {},
    getSupportedFlavours: function() {return null; }
};



/**
 * Object used to observe dnd on the commands of the current testcase
 */
var commandsDragObserver = {

    onDragStart: function (aEvent, aXferData, aDragAction) {

        try{
            var selectedIndex = document.getElementById('commands').currentIndex;
            if (selectedIndex == -1)
                return;

            aXferData.data = new TransferData();
            aXferData.data.addDataForFlavour("text/unicode", selectedIndex.toString());
            aDragAction.action = Ci.nsIDragService.DRAGDROP_ACTION_MOVE;

        }catch(e){
            new Log("DND").error("onDragStart error: "+e);
        }
    },
    onDrop: function (aEvent, aXferData, aDragSession) {},
    onDragExit: function (aEvent, aDragSession) {},
    onDragOver: function (aEvent, aFlavour, aDragSession) {},
    getSupportedFlavours: function() {return null; }
};