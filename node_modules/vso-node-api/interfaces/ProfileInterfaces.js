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
var AvatarSize;
(function (AvatarSize) {
    AvatarSize[AvatarSize["Small"] = 0] = "Small";
    AvatarSize[AvatarSize["Medium"] = 1] = "Medium";
    AvatarSize[AvatarSize["Large"] = 2] = "Large";
})(AvatarSize = exports.AvatarSize || (exports.AvatarSize = {}));
exports.TypeInfo = {
    AttributeDescriptor: {
        fields: null
    },
    AttributesContainer: {
        fields: null
    },
    Avatar: {
        fields: null
    },
    AvatarSize: {
        enumValues: {
            "small": 0,
            "medium": 1,
            "large": 2,
        }
    },
    CoreProfileAttribute: {
        fields: null
    },
    Country: {
        fields: null
    },
    CreateProfileContext: {
        fields: null
    },
    GeoRegion: {
        fields: null
    },
    Profile: {
        fields: null
    },
    ProfileAttribute: {
        fields: null
    },
    ProfileAttributeBase: {
        fields: null
    },
    ProfileRegion: {
        fields: null
    },
    ProfileRegions: {
        fields: null
    },
};
exports.TypeInfo.AttributeDescriptor.fields = {};
exports.TypeInfo.AttributesContainer.fields = {
    attributes: {},
};
exports.TypeInfo.Avatar.fields = {
    size: {
        enumType: exports.TypeInfo.AvatarSize
    },
    timeStamp: {
        isDate: true,
    },
};
exports.TypeInfo.CoreProfileAttribute.fields = {
    descriptor: {
        typeInfo: exports.TypeInfo.AttributeDescriptor
    },
    timeStamp: {
        isDate: true,
    },
};
exports.TypeInfo.Country.fields = {};
exports.TypeInfo.CreateProfileContext.fields = {};
exports.TypeInfo.GeoRegion.fields = {};
exports.TypeInfo.Profile.fields = {
    applicationContainer: {
        typeInfo: exports.TypeInfo.AttributesContainer
    },
    coreAttributes: {},
    timeStamp: {
        isDate: true,
    },
};
exports.TypeInfo.ProfileAttribute.fields = {
    descriptor: {
        typeInfo: exports.TypeInfo.AttributeDescriptor
    },
    timeStamp: {
        isDate: true,
    },
};
exports.TypeInfo.ProfileAttributeBase.fields = {
    descriptor: {
        typeInfo: exports.TypeInfo.AttributeDescriptor
    },
    timeStamp: {
        isDate: true,
    },
};
exports.TypeInfo.ProfileRegion.fields = {};
exports.TypeInfo.ProfileRegions.fields = {
    regions: {
        isArray: true,
        typeInfo: exports.TypeInfo.ProfileRegion
    },
};
