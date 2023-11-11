const path = require("path");
const DataSource = require("../../lib/dataSource");
const bodyParser = require("../../lib/bodyParser");
const { UserGroup } = require("../../lib/userGroupClass");

const userGroupsDatabasePath = path.join(__dirname, "../../database", "user_groups.json");
const userGroupsData = new DataSource(userGroupsDatabasePath);



const groupDatabasePath = path.join(__dirname, "../../database", "groups.json");
const groupData = new DataSource(groupDatabasePath);


const userDatabasePath = path.join(__dirname, "../../database", "users.json");
const userData = new DataSource(userDatabasePath);

//  User Module created
class UserGroupModule {

  //    UserGroups GET
  //    - /user-group/user/{userId} - GET
  static async getUserGroupByUserId(req, res, userId) {
    const users = userData.read();
    const userGroups = userGroupsData.read()
    const groups = groupData.read();

    const foundUserIndex = users.findIndex((user) => user.id === userId);
    const foundUserGroupIndex = userGroups.findIndex((userGroup) => userGroup.user_id === userId)

    if (foundUserIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false,
        message: "User not found"
      }));
    }
    
    if (foundUserGroupIndex !== -1) {
      const allUserDatas = []
      const groupssssss = userGroups.filter(g => g.user_id === userId)
      for (let index = 0; index < groupssssss.length; index++) {
        const element = groupssssss[index].group_id
        const foundGroup = groups.find((group) => group.id === element);
        allUserDatas.push(foundGroup)

      }
      res.writeHead(200, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(allUserDatas));
    }

    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify({
      success: false,
      message: "User has not joined any group yet!"
    }));
  }

  //    UserGroups GET
  //    - /user-group/group/{groupId} - GET
  static async getUserGroupByGroupId(req, res, groupId) {
    const users = userData.read();
    const groups = groupData.read();
    const userGroups = userGroupsData.read()

    const foundGroupIndex = groups.findIndex((group) => group.id === groupId);
    const foundUserGroupIndex = userGroups.findIndex((userGroup) => userGroup.group_id === groupId)

    if (foundGroupIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false,
        message: "Group Not Found!"
      }));
    }
    else if (foundUserGroupIndex !== -1) {
      const allUserDatas = []
      const groupssssss = userGroups.filter(g => g.group_id === groupId)
      for (let index = 0; index < groupssssss.length; index++) {
        const element = groupssssss[index].user_id
        const foundUser = users.find((user) => user.id === element);
        allUserDatas.push(foundUser)

      }
      res.writeHead(200, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(allUserDatas));
    }
    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify({
      success: true,
      message: "No students found to joined this group!!",
    }));
  }

  //    UserGroups DELETE
  //    - /user-group/{userId}/{groupId} - DELETE
  static async deleteUserGroupsByUserIdAndGroupId(req, res, userId, groupId) {
      const userGroups = await userGroupsData.readAsync();
      const foundUserGroupIndex = userGroups.findIndex(
        (userGroup) => userGroup.user_id === userId && userGroup.group_id === groupId
      );
      if (foundUserGroupIndex === -1) {
        res.writeHead(404, { "Content-Type": "Application/json" });
        return res.end(JSON.stringify({
          success: false,
          message: "UserGroup Not Found!"
        }));
      }
      const [deleteUserGroup] = userGroups.splice(foundUserGroupIndex, 1);
      userGroupsData.write(userGroups);
      res.writeHead(200, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: true,
        message: "UserGroup has been deleted successfully!",
        deleteUserGroup
      }));
  }

  //    UserGroup POST
  //    - /user-group - POST
  static async createUserGroup(req, res) {
    console.log("Working...");
    const body = await bodyParser(req);
    if (!body.userId || !body.groupId) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("userId and groupId must be required"));
    }

    const users = userData.read();
    const groups = groupData.read();
    const foundUser = users.find((user) => user.id === body.userId);
    const foundGroup = groups.find((group) => group.id === body.groupId);
    console.log(foundGroup);

    if (!foundUser) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(
        {
          success: false,
          message: "User not found!"
        }
      ));
    }
    if (!foundGroup) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(
        {
          success: false,
          message: "Group not found!"
        }
      ));
    }
    const userGroups = userGroupsData.read();
    const foundUserGroup = userGroups.find(
      (userGroup) =>
        userGroup.user_id === body.userId && userGroup.group_id === body.groupId
    );
    if (foundUserGroup) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(
        {
          success: false,
          message: "Group already exist!"
        }
      ));
    }
    let generateId = 0;
    for (let i = 0; i < userGroups.length; i++) {
      const userGroup = userGroups[i];

      if (generateId < userGroup.id) {
        generateId = userGroup.id;
      }
    }
    const newUserGroup = new UserGroup(generateId + 1, body.userId, body.groupId);
    userGroups.push(newUserGroup);
    userGroupsData.write(userGroups);
    res.writeHead(201, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify({
      success: true,
      message: "Successfully created!",
      newUserGroup
    }));
  }
}

module.exports = UserGroupModule;
