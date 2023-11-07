# General Notes
This is pseudo-ecommerce shop web app with fully functional login, order creation system, integration with database and external api, that i develop during my learning sessions about structure of web applications and api security.

# Vercel Production Predeployment Notes
To prevent errors during build:
- create Vercel Postgres storage
- connect created storage to your project
- generate vercel api key for your vercel account
- create vercel env variable "API_KEY" wich will contain generated vercel api key
- ensure that vercel project name is "cool-shop"

# Local Development Mode 
While working locally with this project use "npm run dev", this command will execute [`development init script`](./devInitScript.js).
This init script will:
- generate Asymmetric RSA Keys For JWT signing and verification
- create local sqlite database described in [`prisma dev schema`](./prisma/devSchema.prisma) for local dev tests
- Populate local sqlite database with [fakestore api products data](https://fakestoreapi.com/) (for better performance evry product image will be copied in `.\public\fakeapiproductsimages` directory)
- create local .env.local file with env variables for local dev tests
- execute "next dev" command
When run locally fakestore api products data fetch occurs evry 24h to ensure data integrity.

# Vercel Production Mode
When this project is imported to vercel and evrything described in [`Vercel Production Predeployment Notes`](#vercel-production-predeployment-notes) is configured correctly push done to main branch will create vercel deployment.

**Note**:[`Vercel production init script`](./prodInitScript.js) use preconfigured vercel env var with name "API_KEY", that contains [generated vercel api key](https://vercel.com/docs/rest-api) to automaticly get and set vercel env variables.

When vercel build starts [`production init script`](./prodInitScript.js) is launched and will:
- check if Asymmetric RSA Keys For JWT signing and verification are included in vercel env variables. If they don't exist secrets are generated and set automaticly.
- initialize vercel postgres database as described in [`prisma production schema`](./prisma/prodSchema.prisma)
- initialize prisma client
- populates vercel postgres database with fakestore api products data