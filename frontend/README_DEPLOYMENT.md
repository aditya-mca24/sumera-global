# Surema deployment

This project uses a Vite frontend, the Express API in `backend`, AWS RDS MySQL, and Razorpay. MobaXterm is an SSH client used to manage the AWS EC2 server; it is not a hosting provider.

## AWS RDS MySQL

Create a MySQL RDS database and record its endpoint, port, username, and password. Allow TCP `3306` from the EC2 security group only; do not open MySQL to `0.0.0.0/0`.

Set these backend variables on the server:

```dotenv
DB_HOST=<rds-endpoint>
DB_PORT=3306
DB_USER=<rds-user>
DB_PASSWORD=<rds-password>
DB_NAME=surema_fashion
JWT_SECRET=<long-random-production-secret>
JWT_EXPIRES_IN=7d
```

## EC2 server through MobaXterm

Create an Ubuntu EC2 instance, allow inbound TCP `22` from your IP and TCP `80`/`443` from the internet, then connect with MobaXterm using the instance public IP and `.pem` key.

```bash
sudo apt update && sudo apt install -y git nginx nodejs npm
git clone <repository-url> surema
cd surema/backend
npm ci
npm start
```

Run the API with a process manager such as `pm2`, and configure Nginx to proxy `/api` to `http://127.0.0.1:3001`. Keep the backend `.env` on the server and out of git.

## Razorpay

Start in Razorpay Test Mode and put the credentials in the backend environment only:

```dotenv
RAZORPAY_KEY_ID=<key-id>
RAZORPAY_KEY_SECRET=<secret>
FRONTEND_URL=https://www.<your-domain>
```

After testing, switch both credentials to Live Mode. Configure webhooks to the final HTTPS API URL if webhook reconciliation is enabled.

## GoDaddy domain and HTTPS

For an EC2/Nginx deployment, use an `A` record for `@` and `www` pointing to an AWS Elastic IP. Build and serve the frontend:

```bash
cd frontend
npm ci
VITE_API_URL=https://api.<your-domain>/api npm run build
```

Serve `frontend/dist` with Nginx and configure SPA fallback to `index.html`. Issue a Let's Encrypt certificate and redirect HTTP to HTTPS. Set `FRONTEND_URL` to the exact frontend HTTPS origin; multiple origins can be comma-separated.

## Final checks

- `GET https://api.<your-domain>/api/health` returns `{"status":"ok"}`.
- Registration, sign-in, products, and cart work on the production frontend.
- A Razorpay Test Mode payment verifies and marks the order paid.
- RDS is private and no `.env` or Razorpay secret is committed.
