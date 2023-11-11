const http = require("http");
const DataSource = require("./lib/dataSource");
const path = require("path");
const { Car } = require("./lib/groupClass");
const { UserCar, UserGroup } = require("./lib/userGroupClass");
// const { Transaction } = require("./lib/transactionClass");
const { isBoolean } = require("./lib/isBoolean");
const UserModule = require("./modules/user/user_module");
const bodyParser = require("./lib/bodyParser");
const GroupModule = require("./modules/group/group_module");
const UserGroupModule = require("./modules/userGroups/userGroups")

const userDatabasePath = path.join(__dirname, "database", "users.json");
const groupDatabasePath = path.join(__dirname, "database", "groups.json");
const userGroupsDatabasePath = path.join(__dirname, "database", "user_groups.json");
const transactionDatabasePath = path.join(__dirname, "database", "transaction.json");

const userData = new DataSource(userDatabasePath);
const carData = new DataSource(groupDatabasePath);
const userCarData = new DataSource(userGroupsDatabasePath);


const moduls = async (req, res) => {
  const url = req.url.split("/");
  const method = req.method;

  try {
    
// ***^^^*** \\

    // USERS
    if (method === "GET" && url[1] === "user"&& !url[2] ) {
      console.log("Working...");
      UserModule.getUsers(req, res);
    } else if (method === "GET" && url[1] === "user" && url[2]) {
      UserModule.getUserById(req, res, Number(url[2]));
    } else if (method === "POST" && url[1] === "user") {
      UserModule.createUser(req, res);
    } else if (method === "PUT" && url[1] === "user" && url[2]) {
      UserModule.updateUser(req, res, Number(url[2]));
    } else if (method === "DELETE" && url[1] === "user" && url[2]) {
      UserModule.deleteUser(req, res, Number(url[2]));
    } 

// ***^^^*** \\

    // GROUPS 
    else if (method === "GET" && url[1] === "group" && !url[2]) {
      GroupModule.getGroups(req, res);
    } else if (method === "GET" && url[1] === "group" && url[2]) {
      GroupModule.getGroupById(req, res, Number(url[2]))
    } else if (method === "POST" && url[1] === "group") {
      GroupModule.createGroup(req, res)
    } else if (method === "PUT" && url[1] === "group" && url[2]) {
      GroupModule.updateGroup(req, res, Number(url[2]))
    } else if (method === "DELETE" && url[1] === "group" && url[2]){
      GroupModule.deleteGroup(req, res, Number(url[2]))
    }
    
// ***^^^*** \\

    // User-Groups    
    else if (method === "GET" && url[1] === "user-group" && url[2] === "user" && url[3]) {
      console.log(url);
      UserGroupModule.getUserGroupByUserId(req, res, Number(url[3]))
    } else if (method === "GET" && url[1] === "user-group" && url[2] === "group" && url[3]) {
      UserGroupModule.getUserGroupByGroupId(req, res, Number(url[3]))
    } else if (method === "POST" && url[1] === "user-group") {
      console.log("Ishlavoti...");
      UserGroupModule.createUserGroup(req, res)
    } else if (method === "DELETE" && url[1] === "user-group" && url[2] && url[3]) {
      UserGroupModule.deleteUserGroupsByUserIdAndGroupId(req, res, Number(url[2]), Number(url[3]))
    } else {
      res.writeHead(405, { "Content-Type": "Application/json" });
      res.end(JSON.stringify("Method not allowed"));
    }
  } catch (error) {
    if (isBoolean(error)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      res.end(JSON.stringify("Bady must be required"));
    } else {
      res.writeHead(500, { "Content-Type": "Application/json" });
      res.end(JSON.stringify(error.message ?? "Server error"));
    }
  }
};

const server = http.createServer(moduls);

const port = 3000;

server.listen(port, () => {
  console.log(`server running on port: ${port}`);
});
