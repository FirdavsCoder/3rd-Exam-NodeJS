class UserGroup {
  constructor(id, userId, groupId) {
    this.id = id;
    this.user_id = userId;
    this.group_id = groupId;
  }
}

module.exports = { UserGroup };
