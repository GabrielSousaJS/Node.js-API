import { app } from './app'
import { env } from './env/index'

app
  .listen({
    port: env.data.PORT,
  })
  .then(() => {
    console.log('HTTP Running!')
  })
