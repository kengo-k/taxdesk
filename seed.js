const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { execSync } = require("child_process");

dotenv.config();

function main() {
  const url = process.env.DATABASE_URL;

  const pattern = /^postgresql:\/\/(.+):(.+)@(.+):(\d+)\/(.+?)(?:\?.*)?$/;
  const matches = url.match(pattern);

  if (matches) {
    const [, user, password, host, port, db] = matches;

    console.log("user:", user);
    console.log("password:", password);
    console.log("host:", host);
    console.log("port:", port);
    console.log("database:", db);
    process.env.PGPASSWORD = password;

    const files = fs.readdirSync("seed");
    files.forEach((f) => {
      const table = path.basename(f, ".csv");
      let fullpath = path.resolve(`seed/${f}`);
      execSync(`
        psql \
          -U ${user} \
          -d ${db} \
          -h ${host} \
          -p ${port} \
          -c "\\copy ${table} FROM '${fullpath}' DELIMITER ',' CSV HEADER"`);
    });
  } else {
    console.log("Invalid URL format");
  }
}

main();
