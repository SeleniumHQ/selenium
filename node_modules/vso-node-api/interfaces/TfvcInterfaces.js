/*
 * ---------------------------------------------------------
 * Copyright(C) Microsoft Corporation. All rights reserved.
 * ---------------------------------------------------------
 *
 * ---------------------------------------------------------
 * Generated file, DO NOT EDIT
 * ---------------------------------------------------------
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TfsCoreInterfaces = require("../interfaces/CoreInterfaces");
var ItemContentType;
(function (ItemContentType) {
    ItemContentType[ItemContentType["RawText"] = 0] = "RawText";
    ItemContentType[ItemContentType["Base64Encoded"] = 1] = "Base64Encoded";
})(ItemContentType = exports.ItemContentType || (exports.ItemContentType = {}));
var TfvcVersionOption;
(function (TfvcVersionOption) {
    TfvcVersionOption[TfvcVersionOption["None"] = 0] = "None";
    TfvcVersionOption[TfvcVersionOption["Previous"] = 1] = "Previous";
    TfvcVersionOption[TfvcVersionOption["UseRename"] = 2] = "UseRename";
})(TfvcVersionOption = exports.TfvcVersionOption || (exports.TfvcVersionOption = {}));
var TfvcVersionType;
(function (TfvcVersionType) {
    TfvcVersionType[TfvcVersionType["None"] = 0] = "None";
    TfvcVersionType[TfvcVersionType["Changeset"] = 1] = "Changeset";
    TfvcVersionType[TfvcVersionType["Shelveset"] = 2] = "Shelveset";
    TfvcVersionType[TfvcVersionType["Change"] = 3] = "Change";
    TfvcVersionType[TfvcVersionType["Date"] = 4] = "Date";
    TfvcVersionType[TfvcVersionType["Latest"] = 5] = "Latest";
    TfvcVersionType[TfvcVersionType["Tip"] = 6] = "Tip";
    TfvcVersionType[TfvcVersionType["MergeSource"] = 7] = "MergeSource";
})(TfvcVersionType = exports.TfvcVersionType || (exports.TfvcVersionType = {}));
var VersionControlChangeType;
(function (VersionControlChangeType) {
    VersionControlChangeType[VersionControlChangeType["None"] = 0] = "None";
    VersionControlChangeType[VersionControlChangeType["Add"] = 1] = "Add";
    VersionControlChangeType[VersionControlChangeType["Edit"] = 2] = "Edit";
    VersionControlChangeType[VersionControlChangeType["Encoding"] = 4] = "Encoding";
    VersionControlChangeType[VersionControlChangeType["Rename"] = 8] = "Rename";
    VersionControlChangeType[VersionControlChangeType["Delete"] = 16] = "Delete";
    VersionControlChangeType[VersionControlChangeType["Undelete"] = 32] = "Undelete";
    VersionControlChangeType[VersionControlChangeType["Branch"] = 64] = "Branch";
    VersionControlChangeType[VersionControlChangeType["Merge"] = 128] = "Merge";
    VersionControlChangeType[VersionControlChangeType["Lock"] = 256] = "Lock";
    VersionControlChangeType[VersionControlChangeType["Rollback"] = 512] = "Rollback";
    VersionControlChangeType[VersionControlChangeType["SourceRename"] = 1024] = "SourceRename";
    VersionControlChangeType[VersionControlChangeType["TargetRename"] = 2048] = "TargetRename";
    VersionControlChangeType[VersionControlChangeType["Property"] = 4096] = "Property";
    VersionControlChangeType[VersionControlChangeType["All"] = 8191] = "All";
})(VersionControlChangeType = exports.VersionControlChangeType || (exports.VersionControlChangeType = {}));
var VersionControlRecursionType;
(function (VersionControlRecursionType) {
    /**
     * Only return the specified item.
     */
    VersionControlRecursionType[VersionControlRecursionType["None"] = 0] = "None";
    /**
     * Return the specified item and its direct children.
     */
    VersionControlRecursionType[VersionControlRecursionType["OneLevel"] = 1] = "OneLevel";
    /**
     * Return the specified item and its direct children, as well as recursive chains of nested child folders that only contain a single folder.
     */
    VersionControlRecursionType[VersionControlRecursionType["OneLevelPlusNestedEmptyFolders"] = 4] = "OneLevelPlusNestedEmptyFolders";
    /**
     * Return specified item and all descendants
     */
    VersionControlRecursionType[VersionControlRecursionType["Full"] = 120] = "Full";
})(VersionControlRecursionType = exports.VersionControlRecursionType || (exports.VersionControlRecursionType = {}));
exports.TypeInfo = {
    Change: {},
    GitRepository: {},
    GitRepositoryRef: {},
    ItemContent: {},
    ItemContentType: {
        enumValues: {
            "rawText": 0,
            "base64Encoded": 1
        }
    },
    TfvcBranch: {},
    TfvcBranchRef: {},
    TfvcChange: {},
    TfvcChangeset: {},
    TfvcChangesetRef: {},
    TfvcItem: {},
    TfvcItemDescriptor: {},
    TfvcItemRequestData: {},
    TfvcLabel: {},
    TfvcLabelRef: {},
    TfvcShelveset: {},
    TfvcShelvesetRef: {},
    TfvcVersionDescriptor: {},
    TfvcVersionOption: {
        enumValues: {
            "none": 0,
            "previous": 1,
            "useRename": 2
        }
    },
    TfvcVersionType: {
        enumValues: {
            "none": 0,
            "changeset": 1,
            "shelveset": 2,
            "change": 3,
            "date": 4,
            "latest": 5,
            "tip": 6,
            "mergeSource": 7
        }
    },
    VersionControlChangeType: {
        enumValues: {
            "none": 0,
            "add": 1,
            "edit": 2,
            "encoding": 4,
            "rename": 8,
            "delete": 16,
            "undelete": 32,
            "branch": 64,
            "merge": 128,
            "lock": 256,
            "rollback": 512,
            "sourceRename": 1024,
            "targetRename": 2048,
            "property": 4096,
            "all": 8191
        }
    },
    VersionControlProjectInfo: {},
    VersionControlRecursionType: {
        enumValues: {
            "none": 0,
            "oneLevel": 1,
            "oneLevelPlusNestedEmptyFolders": 4,
            "full": 120
        }
    },
};
exports.TypeInfo.Change.fields = {
    changeType: {
        enumType: exports.TypeInfo.VersionControlChangeType
    },
    newContent: {
        typeInfo: exports.TypeInfo.ItemContent
    }
};
exports.TypeInfo.GitRepository.fields = {
    parentRepository: {
        typeInfo: exports.TypeInfo.GitRepositoryRef
    },
    project: {
        typeInfo: TfsCoreInterfaces.TypeInfo.TeamProjectReference
    }
};
exports.TypeInfo.GitRepositoryRef.fields = {
    project: {
        typeInfo: TfsCoreInterfaces.TypeInfo.TeamProjectReference
    }
};
exports.TypeInfo.ItemContent.fields = {
    contentType: {
        enumType: exports.TypeInfo.ItemContentType
    }
};
exports.TypeInfo.TfvcBranch.fields = {
    children: {
        isArray: true,
        typeInfo: exports.TypeInfo.TfvcBranch
    },
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcBranchRef.fields = {
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcChange.fields = {
    changeType: {
        enumType: exports.TypeInfo.VersionControlChangeType
    },
    newContent: {
        typeInfo: exports.TypeInfo.ItemContent
    }
};
exports.TypeInfo.TfvcChangeset.fields = {
    changes: {
        isArray: true,
        typeInfo: exports.TypeInfo.TfvcChange
    },
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcChangesetRef.fields = {
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcItem.fields = {
    changeDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcItemDescriptor.fields = {
    recursionLevel: {
        enumType: exports.TypeInfo.VersionControlRecursionType
    },
    versionOption: {
        enumType: exports.TypeInfo.TfvcVersionOption
    },
    versionType: {
        enumType: exports.TypeInfo.TfvcVersionType
    }
};
exports.TypeInfo.TfvcItemRequestData.fields = {
    itemDescriptors: {
        isArray: true,
        typeInfo: exports.TypeInfo.TfvcItemDescriptor
    }
};
exports.TypeInfo.TfvcLabel.fields = {
    items: {
        isArray: true,
        typeInfo: exports.TypeInfo.TfvcItem
    },
    modifiedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcLabelRef.fields = {
    modifiedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcShelveset.fields = {
    changes: {
        isArray: true,
        typeInfo: exports.TypeInfo.TfvcChange
    },
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcShelvesetRef.fields = {
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TfvcVersionDescriptor.fields = {
    versionOption: {
        enumType: exports.TypeInfo.TfvcVersionOption
    },
    versionType: {
        enumType: exports.TypeInfo.TfvcVersionType
    }
};
exports.TypeInfo.VersionControlProjectInfo.fields = {
    defaultSourceControlType: {
        enumType: TfsCoreInterfaces.TypeInfo.SourceControlTypes
    },
    project: {
        typeInfo: TfsCoreInterfaces.TypeInfo.TeamProjectReference
    }
};
