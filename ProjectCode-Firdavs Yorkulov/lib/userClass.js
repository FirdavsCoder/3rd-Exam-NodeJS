class User {
  constructor(id, firstName, lastName, login, age) {
    this.id = id;
    this.first_name = firstName
    this.last_name = lastName;
    this.login = login;
    this.age = age;
  }
}

module.exports = { User };
