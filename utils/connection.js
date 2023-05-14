const { Pool } = require('pg');


module.exports = class TramDBConnection {
  constructor() {
    this.conn = null;
    this.getConnection()
  }

  getConnection = async () => {
    const pool = new Pool({
      user: process.env.POSTGRESQL_USER,
      host: process.env.POSTGRESQL_HOST,
      database: process.env.POSTGRESQL_DATABASE,
      password: process.env.POSTGRESQL_PASSWORD,
      port: process.env.POSTGRESQL_PORT,
    });
    this.pool = pool;
    this.conn = await pool.connect();
  }

  runQuery = async (query, values) => {
      const res = await this.conn.query(query, values);
      return res;
  };


}



