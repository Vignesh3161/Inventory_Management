export default {
  insertUser: `
    INSERT INTO "Users" ("name", "password", "roleId", "phone", "status")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  findUserById: `
    SELECT u.*, r."roleName" 
    FROM "Users" u
    LEFT JOIN "Roles" r ON u."roleId" = r."roleId"
    WHERE u."userId" = $1
  `,
  findUserByName: `
    SELECT u.*, r."roleName"
    FROM "Users" u
    LEFT JOIN "Roles" r ON u."roleId" = r."roleId"
    WHERE u."name" = $1
  `,
  findAllUsers: `
    SELECT u.*, r."roleName"
    FROM "Users" u
    LEFT JOIN "Roles" r ON u."roleId" = r."roleId"
    ORDER BY u."userId" ASC
  `
};
