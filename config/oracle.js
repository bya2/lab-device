module.exports = {
  user: process.env.NODE_ORACLEDB_USER,
  password: process.env.NODE_ORACLEDB_PASSWORD,
  connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING_1522, // 오라클 포트 1522 (1521일 경우, process.env.NODE_ORACLEDB_CONNECTIONSTRING_1521)
};
