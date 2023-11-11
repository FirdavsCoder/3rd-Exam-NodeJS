const path = require("path");
const DataSource = require("../../lib/dataSource");
const bodyParser = require("../../lib/bodyParser");
const { Group } = require("../../lib/groupClass");

const groupDatabasePath = path.join(__dirname, "../../database", "groups.json");
const groupData = new DataSource(groupDatabasePath);

const userGroupsDatabasePath = path.join(__dirname, "../../database", "user_groups.json");
const userGroupsData = new DataSource(userGroupsDatabasePath);

const userDatabasePath = path.join(__dirname, "../../database", "users.json");
const userData = new DataSource(userDatabasePath);

// GroupModule class created
class GroupModule {

  //  Group Get
  //  - /group - GET
  static getGroups(req, res) {
    const groups = groupData.read();
    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(groups));
  }

  //  Group Get
  //  - /group/{id} - GET
  static getGroupById(req, res, groupId) {
    const groups = groupData.read();

    const foundGroup = groups.find((group) => group.id === groupId);

    if (foundGroup) {
      res.writeHead(200, { "Content-Type": "Application/json" });
      res.end(JSON.stringify(foundGroup));
    } else {
      res.writeHead(404, { "Content-Type": "Application/json" });
      res.end(JSON.stringify({
        success: false, 
        message: "Group Not Found!"
      }));
    }
  }

  //    Group POST
  //    - /group - POST
  static async createGroup(req, res) {
    const body = await bodyParser(req);

    if (!body.name || !body.shortName ) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(
        JSON.stringify({
          success: false, 
          message: "Name and short name must be required"
        })
      );
    }

    const groups = groupData.read();

    const foundGroupByName = groups.find((group) => group.name === body.name);

    if (foundGroupByName) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false, 
        message: "This name is already exist!"
      }));
    }

    let generateId = 0;

    groups.forEach((group) => {
      if (generateId < group.id) {
        generateId = group.id;
      }
    });

    const newGroup = new Group(
      generateId + 1,
      body.name,
      body.shortName,
    );

    groups.push(newGroup);

    groupData.write(groups);

    res.writeHead(201, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(newGroup));
  }


  //    Group PUT
  //    - /group/{id} - PUT
  static async updateGroup(req, res, groupId) {
    const body = await bodyParser(req);

    if (!body.name || !body.shortName) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false, 
        message: "Name and shortName must be required"
      }));
    }

    const groups = groupData.read();

    const foundGroupIndex = groups.findIndex((group) => group.id === groupId);

    const foundGroupByName = groups.find((group) => group.name === body.name);

    if (foundGroupIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false, 
        message: "Group Not Found"
      }));
    }

    const [foundGroup] = groups.splice(foundGroupIndex, 1);

    if (foundGroupByName && foundGroup.name !== body.name) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false, 
        message: "This name already exist!"
      }));
    }


    foundGroup.name = body.name
    foundGroup.short_name = body.shortName
    
    groups.push(foundGroup);
    groupData.write(groups);

    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify({
      success: true,
      message: "Group is updated successfully!",
      updatedGroup: foundGroup
    }));
  }

  //    Group DELETE
  //    - /group/{id} - DELETE
  static deleteGroup(req, res, groupId) {
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

    const [deletedGroup] = groups.splice(foundGroupIndex, 1);
    groupData.write(groups);
    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify({
      success: true,
      message: "Group has been deleted successfully!",
      deletedGroup
    }));
    

  }
}

module.exports = GroupModule;
