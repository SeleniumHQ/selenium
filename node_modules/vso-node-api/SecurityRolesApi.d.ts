import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import SecurityRolesInterfaces = require("./interfaces/SecurityRolesInterfaces");
export interface ISecurityRolesApi extends basem.ClientApiBase {
    getRoleAssignments(scopeId: string, resourceId: string): Promise<SecurityRolesInterfaces.RoleAssignment[]>;
    removeRoleAssignment(scopeId: string, resourceId: string, identityId: string): Promise<void>;
    removeRoleAssignments(identityIds: string[], scopeId: string, resourceId: string): Promise<void>;
    setRoleAssignment(roleAssignment: SecurityRolesInterfaces.UserRoleAssignmentRef, scopeId: string, resourceId: string, identityId: string): Promise<SecurityRolesInterfaces.RoleAssignment>;
    setRoleAssignments(roleAssignments: SecurityRolesInterfaces.UserRoleAssignmentRef[], scopeId: string, resourceId: string): Promise<SecurityRolesInterfaces.RoleAssignment[]>;
    getRoleDefinitions(scopeId: string): Promise<SecurityRolesInterfaces.SecurityRole[]>;
}
export declare class SecurityRolesApi extends basem.ClientApiBase implements ISecurityRolesApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {string} scopeId
     * @param {string} resourceId
     */
    getRoleAssignments(scopeId: string, resourceId: string): Promise<SecurityRolesInterfaces.RoleAssignment[]>;
    /**
     * @param {string} scopeId
     * @param {string} resourceId
     * @param {string} identityId
     */
    removeRoleAssignment(scopeId: string, resourceId: string, identityId: string): Promise<void>;
    /**
     * @param {string[]} identityIds
     * @param {string} scopeId
     * @param {string} resourceId
     */
    removeRoleAssignments(identityIds: string[], scopeId: string, resourceId: string): Promise<void>;
    /**
     * @param {SecurityRolesInterfaces.UserRoleAssignmentRef} roleAssignment
     * @param {string} scopeId
     * @param {string} resourceId
     * @param {string} identityId
     */
    setRoleAssignment(roleAssignment: SecurityRolesInterfaces.UserRoleAssignmentRef, scopeId: string, resourceId: string, identityId: string): Promise<SecurityRolesInterfaces.RoleAssignment>;
    /**
     * @param {SecurityRolesInterfaces.UserRoleAssignmentRef[]} roleAssignments
     * @param {string} scopeId
     * @param {string} resourceId
     */
    setRoleAssignments(roleAssignments: SecurityRolesInterfaces.UserRoleAssignmentRef[], scopeId: string, resourceId: string): Promise<SecurityRolesInterfaces.RoleAssignment[]>;
    /**
     * @param {string} scopeId
     */
    getRoleDefinitions(scopeId: string): Promise<SecurityRolesInterfaces.SecurityRole[]>;
}
