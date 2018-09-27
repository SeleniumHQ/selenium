import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import ProfileInterfaces = require("./interfaces/ProfileInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface IProfileApi extends basem.ClientApiBase {
    deleteProfileAttribute(id: string, descriptor: string): Promise<void>;
    getProfileAttribute(id: string, descriptor: string): Promise<ProfileInterfaces.ProfileAttribute>;
    getProfileAttributes(id: string, partition: string, modifiedSince?: string, modifiedAfterRevision?: string, withCoreAttributes?: boolean, coreAttributes?: string): Promise<ProfileInterfaces.ProfileAttribute[]>;
    setProfileAttribute(container: any, id: string, descriptor: string): Promise<void>;
    setProfileAttributes(attributesCollection: VSSInterfaces.VssJsonCollectionWrapperV<ProfileInterfaces.ProfileAttributeBase<any>[]>, id: string): Promise<void>;
    getAvatar(id: string, size?: string, format?: string): Promise<ProfileInterfaces.Avatar>;
    getAvatarPreview(container: any, id: string, size?: string, format?: string, displayName?: string): Promise<ProfileInterfaces.Avatar>;
    resetAvatar(id: string): Promise<void>;
    setAvatar(container: any, id: string): Promise<void>;
    getGeoRegion(ipaddress: string): Promise<ProfileInterfaces.GeoRegion>;
    createProfile(createProfileContext: ProfileInterfaces.CreateProfileContext, autoCreate?: boolean): Promise<ProfileInterfaces.Profile>;
    getProfile(id: string, details?: boolean, withAttributes?: boolean, partition?: string, coreAttributes?: string, forceRefresh?: boolean): Promise<ProfileInterfaces.Profile>;
    updateProfile(profile: ProfileInterfaces.Profile, id: string): Promise<void>;
    getRegions(): Promise<ProfileInterfaces.ProfileRegions>;
    getSupportedLcids(): Promise<string[]>;
    getUserDefaults(includeAvatar?: boolean): Promise<ProfileInterfaces.Profile>;
    refreshUserDefaults(id: string): Promise<ProfileInterfaces.Profile>;
}
export declare class ProfileApi extends basem.ClientApiBase implements IProfileApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
    * @param {string} id
    * @param {string} descriptor
    */
    deleteProfileAttribute(id: string, descriptor: string): Promise<void>;
    /**
    * @param {string} id
    * @param {string} descriptor
    */
    getProfileAttribute(id: string, descriptor: string): Promise<ProfileInterfaces.ProfileAttribute>;
    /**
    * @param {string} id
    * @param {string} partition
    * @param {string} modifiedSince
    * @param {string} modifiedAfterRevision
    * @param {boolean} withCoreAttributes
    * @param {string} coreAttributes
    */
    getProfileAttributes(id: string, partition: string, modifiedSince?: string, modifiedAfterRevision?: string, withCoreAttributes?: boolean, coreAttributes?: string): Promise<ProfileInterfaces.ProfileAttribute[]>;
    /**
    * @param {any} container
    * @param {string} id
    * @param {string} descriptor
    */
    setProfileAttribute(container: any, id: string, descriptor: string): Promise<void>;
    /**
    * @param {VSSInterfaces.VssJsonCollectionWrapperV<ProfileInterfaces.ProfileAttributeBase<any>[]>} attributesCollection
    * @param {string} id
    */
    setProfileAttributes(attributesCollection: VSSInterfaces.VssJsonCollectionWrapperV<ProfileInterfaces.ProfileAttributeBase<any>[]>, id: string): Promise<void>;
    /**
    * @param {string} id
    * @param {string} size
    * @param {string} format
    */
    getAvatar(id: string, size?: string, format?: string): Promise<ProfileInterfaces.Avatar>;
    /**
    * @param {any} container
    * @param {string} id
    * @param {string} size
    * @param {string} format
    * @param {string} displayName
    */
    getAvatarPreview(container: any, id: string, size?: string, format?: string, displayName?: string): Promise<ProfileInterfaces.Avatar>;
    /**
    * @param {string} id
    */
    resetAvatar(id: string): Promise<void>;
    /**
    * @param {any} container
    * @param {string} id
    */
    setAvatar(container: any, id: string): Promise<void>;
    /**
    * Lookup up country/region based on provided IPv4, null if using the remote IPv4 address.
    *
    * @param {string} ipaddress - IPv4 address to be used for reverse lookup, null if using RemoteIPAddress in request context
    */
    getGeoRegion(ipaddress: string): Promise<ProfileInterfaces.GeoRegion>;
    /**
    * Create profile
    *
    * @param {ProfileInterfaces.CreateProfileContext} createProfileContext - Context for profile creation
    * @param {boolean} autoCreate - Create profile automatically
    */
    createProfile(createProfileContext: ProfileInterfaces.CreateProfileContext, autoCreate?: boolean): Promise<ProfileInterfaces.Profile>;
    /**
    * @param {string} id
    * @param {boolean} details
    * @param {boolean} withAttributes
    * @param {string} partition
    * @param {string} coreAttributes
    * @param {boolean} forceRefresh
    */
    getProfile(id: string, details?: boolean, withAttributes?: boolean, partition?: string, coreAttributes?: string, forceRefresh?: boolean): Promise<ProfileInterfaces.Profile>;
    /**
    * Update profile
    *
    * @param {ProfileInterfaces.Profile} profile - Update profile
    * @param {string} id - Profile ID
    */
    updateProfile(profile: ProfileInterfaces.Profile, id: string): Promise<void>;
    /**
    */
    getRegions(): Promise<ProfileInterfaces.ProfileRegions>;
    /**
    */
    getSupportedLcids(): Promise<string[]>;
    /**
    * @param {boolean} includeAvatar
    */
    getUserDefaults(includeAvatar?: boolean): Promise<ProfileInterfaces.Profile>;
    /**
    * @param {string} id
    */
    refreshUserDefaults(id: string): Promise<ProfileInterfaces.Profile>;
}
