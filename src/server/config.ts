import * as secret from './secret'

class Config {

    redisOpts;
    API_KEY;
    API_SECRET;
    constructor() {

        this.API_KEY = secret.API_KEY;
        this.API_SECRET = secret.API_SECRET;

        this.redisOpts = {
            host: secret.REDIS_HOST,
            port: secret.REDIS_PORT,
            db: secret.REDIS_DB,
            password: secret.REDIS_PWD
        }
    }

}

export const config = new Config();