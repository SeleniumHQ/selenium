/**
 * Author: Samit Badle
 * Date: 13/Sep/2011
 */

/**
 * Controller for listbox which reorders the list items using drag and drop
 * The list box must be loaded before this controller object is created, i.e. call during or after the load event
 *
 * @author Samit Badle
 * @param listBox - element with list box (must have an id)
 * @param listItemsRa - array with string items to show and reorder in the listbox
 */
function DnDReorderedListbox(listBox, listItemsRa) {
  this.listBox = listBox;
  this.listBoxDnD = new ListboxDnDReorder(this.listBox, 'application/x-' + listBox.id.toLowerCase());
  this.listItems = listItemsRa;
  this.reload();
}

/**
 * Reloads the list box and throws away user ordering
 *
 * @param [listItemsRa] - optionally replace the list items as well
 */
DnDReorderedListbox.prototype.reload = function(listItemsRa) {
  if (listItemsRa) {
    this.listItems = listItemsRa;
  }
  var list = this.listBox;
  //clear the listbox
  for (var i = list.getRowCount() - 1; i >= 0; i--) {
    list.removeItemAt(i);
  }
  //load the listbox with the list
  var listItems = this.listItems;
  for (var j = 0; j < listItems.length; j++) {
    list.appendItem(listItems[j], j);
  }
};

DnDReorderedListbox.prototype.getListItems = function() {
  var listItems = this.listItems;
  var newRa = new Array(listItems.length);
  var list = this.listBox;
  for (var i = list.itemCount - 1; i >= 0; i--) {
    newRa[i] = listItems[list.getItemAtIndex(i).value];
  }
  return newRa;
};

/**
 * Drag and drop reordering behaviour for the list Box
 * The list box must be loaded before this controller object is created, i.e. call during or after the load event
 * Note: The list item is removed and a new one is created using the label and value properties, all others are lost.
 *
 * @author Samit Badle
 * @param listBox
 * @param dataType
 */
function ListboxDnDReorder(listBox, dataType) {
  this.dataType = dataType; //for e.g. 'application/x-something'
  this.listBox = listBox;
  var self = this;
  listBox.addEventListener('dragstart', function(event) {self.dragStart(event)}, false);
  listBox.addEventListener('dragenter', function(event) {self.dragOver(event)}, false);
  listBox.addEventListener('dragover', function(event) {self.dragOver(event)}, false);
  listBox.addEventListener('dragleave', function(event) {self.dragLeave(event)}, false);
  listBox.addEventListener('drop', function(event) {self.drop(event)}, false);
  listBox.addEventListener('dragend', function(event) {self.dragEnd(event)}, false);
  listBox.draggable = 'true';
}

ListboxDnDReorder.prototype.dragStart = function(event) {
  this.itemCount = this.listBox.itemCount;
  if (this.itemCount > 1) {
    // You cannot rearrange a single or no items no matter how hard you try
    //cache some useful elements first
    this.selectedItem = this.listBox.selectedItem;
    this.lastListItem = this.listBox.getItemAtIndex(this.itemCount - 1);
    var rect = this.lastListItem.getBoundingClientRect();
    this.flipYPos = rect.top + (rect.height / 2);
    event.dataTransfer.setData(this.dataType, 'This text may be dragged');
  }
};

ListboxDnDReorder.prototype.dragOver = function(event) {
  //TODO: currently you can sort only drag and drop among displayed items, add auto scroll when at the top or bottom of displayed list
  if (event.dataTransfer.types.contains(this.dataType)) {
    // no point trying to let people drop text or other stuff here either
    var listItem = event.target;
    if (listItem.nodeName == 'listitem') {
      //if you are on an list item, give feedback that the drop will insert before the item
      if (listItem == this.lastListItem) {
        this._showDropPosition(listItem, event.clientY > this.flipYPos);
      } else {
        this._showDropPosition(listItem);
      }
      event.preventDefault();
    } else {
      if (this.itemCount > 1) {
        //if you are not on any item, give feedback that the drop will be at the end of the list
        this._showDropPosition(this.lastListItem, true);
        event.preventDefault();
      }
    }
  }
};

ListboxDnDReorder.prototype.dragLeave = function(event) {
  this._clearDropPosition();
};

ListboxDnDReorder.prototype.dragEnd = function(event) {
  this._clearDropPosition();
  this.selectedItem = null;
  this.curItem = null;
};

ListboxDnDReorder.prototype.drop = function(event) {
  var dropIndex = this.listBox.getIndexOfItem(this.curItem);
  if (this.dropAfter) {
    dropIndex++;
  }
  var selectedIndex = this.listBox.getIndexOfItem(this.selectedItem);
  this._clearDropPosition();
  if (selectedIndex < dropIndex) {
    dropIndex--;
  }
  if (selectedIndex != dropIndex) {
    var lbl = this.selectedItem.label;
    var userData = this.selectedItem.value;
    this.listBox.removeItemAt(selectedIndex);
    this.listBox.insertItemAt(dropIndex, lbl, userData);
  }
};

ListboxDnDReorder.prototype.dropStyle = '1px solid Highlight';

ListboxDnDReorder.prototype._showDropPosition = function(item, after) {
  if (this.curItem != item) {
    this._clearDropPosition();
    this.curItem = item;
    this.dropAfter = after;
    if (after) {
      this.curItem.style.borderBottom = this.dropStyle;
    } else {
      this.curItem.style.borderTop = this.dropStyle;
    }
  }
};

ListboxDnDReorder.prototype._clearDropPosition = function () {
  if (this.curItem) {
    this.curItem.style.borderTop = 'none';
    this.curItem.style.borderBottom = 'none';
    this.curItem = null;
  }
};
