export enum WorkspacePermissions {
  WORKSPACE_READ = 'workspace.read',
  WORKSPACE_UPDATE = 'workspace.update',

  MEMBERSHIP_INVITE = 'membership.invite',
  MEMBERSHIP_REMOVE = 'membership.remove',
  MEMBERSHIP_UPDATE = 'membership.update',

  DEVICE_CREATE = 'device.create',
  DEVICE_COMMAND = 'device.command',
  DEVICE_READ = 'device.read',
  DEVICE_REMOVE = 'device.remove',
  DEVICE_UPDATE = 'device.update',
  DEVICE_ALL_PERMISSIONS = 'device.*',

  MEDIA_READ = 'media.read',
  MEDIA_REMOVE = 'media.remove',
  MEDIA_ALL_PERMISSIONS = 'media.*',

  WORKSPACE_WEBHOOKS_CREATE = 'workspace.webhooks.create',
  WORKSPACE_WEBHOOKS_VALIDATE = 'workspace.webhooks.validate',
  WORKSPACE_WEBHOOKS_READ = 'workspace.webhooks.read',
  WORKSPACE_WEBHOOKS_DELETE = 'workspace.webhooks.delete',
  WORKSPACE_WEBHOOKS_UPDATE = 'workspace.webhooks.update',
  WORKSPACE_WEBHOOKS_DEACTIVATE = 'workspace.webhooks.deactivate',
  WORKSPACE_WEBHOOKS_ALL_PERMISSIONS = 'workspace.webhooks.*',
}
