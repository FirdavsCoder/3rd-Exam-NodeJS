const path = require("path");
const DataSource = require("../../lib/dataSource");
const bodyParser = require("../../lib/bodyParser");
const { User } = require("../../lib/userClass");

const userDatabasePath = path.join(__dirname, "../../database", "users.json");
const userData = new DataSource(userDatabasePath);

const userGroupsDatabasePath = path.join(__dirname, "../../database", "user_groups.json");
const userGroupsData = new DataSource(userGroupsDatabasePath);

const groupDatabasePath = path.join(__dirname, "../../database", "groups.json");
const groupData = new DataSource(groupDatabasePath);

//  User Module created
class UserModule {

  //    Users GET
  //    - /user - GET
  static getUsers(req, res) {
    const users = userData.read();

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(users));
  }


  //    Users GET
  //    - /user/{id} - GET
  static getUserById(req, res, userId) {
    const users = userData.read();

    const foundUser = users.find((user) => user.id === userId);

    if (foundUser) {
      res.writeHead(200, { "Content-Type": "Application/json" });
      res.end(JSON.stringify(foundUser));
    } else {
      res.writeHead(404, { "Content-Type": "Application/json" });
      res.end(JSON.stringify({
        success: false, 
        message: "User Not Found"
      }));
    }
  }


  //    Users POST
  //    - /user - POST
  static async createUser(req, res) {
    const body = await bodyParser(req);

    if (!body.firstName || !body.lastName || !body.login || isNaN(body.age)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(
        JSON.stringify(
          {
            success: false, 
            message: "Firstname, lastname, login and age must be required"
          }
        )
      );
    }

    const users = userData.read();

    const foundUserByLogin = users.find((user) => user.login === body.login);

    if (foundUserByLogin) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(
        {
          success: false, 
          message: "This login is already exist!"
        }
      ));
    }

    let generateId = 0;

    users.forEach((user) => {
      if (generateId < user.id) {
        generateId = user.id;
      }
    });

    const newUser = new User(
      generateId + 1,
      body.firstName,
      body.lastName,
      body.login,
      body.age
    );

    users.push(newUser);

    userData.write(users);

    res.writeHead(201, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(newUser));
  }


  //    Users PUT
  //    - /user/{id} - PUT
  static async updateUser(req, res, userId) {
    const body = await bodyParser(req);

    if (!body.firstName || !body.lastName || !body.login || isNaN(body.age)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(
        {
          success: false, 
          message: "firstname, lastname, login and age must be required"
        }
      )
      );
    }

    const users = userData.read();

    const foundUserIndex = users.findIndex((user) => user.id === userId);

    const foundUserByLogin = users.find((user) => user.login === body.login);

    if (foundUserIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false, 
        message: "User Not Found!"
      }));
    }

    const [foundUser] = users.splice(foundUserIndex, 1);

    if (foundUserByLogin && foundUser.login !== body.login) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify({
        success: false, 
        message: "This login is already exist!"
      }));
    }

    foundUser.first_name = body.firstName
    foundUser.last_name = body.lastName
    foundUser.login = body.login
    foundUser.age = body.age

    users.push(foundUser);

    userData.write(users);

    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify(foundUser));
  }


  //    Users Delete
  //    - /user/{id} - DELETE
  static deleteUser(req, res, userId) {
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


    const [deletedUser] = users.splice(foundUserIndex, 1);
    userData.write(users);
    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(deletedUser));


    // else {
    //   res.writeHead(400, { "Content-Type": "Application/json" });
    //   return res.end(JSON.stringify("Bad request"));
    // }


    
  }
}

module.exports = UserModule;
