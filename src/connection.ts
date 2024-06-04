class _ConnectionSetting {
  public get() {
    const setting = {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    }
    return setting
  }
  public getDatabaseURL() {
    const { user, password, host, port, database } = this.get()
    return `postgresql://${user}:${password}@${host}:${port}/${database}`
  }
}

export const ConnectionSetting = new _ConnectionSetting()
