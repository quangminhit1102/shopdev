# Reverse Proxy Setup with Nginx on AWS EC2 (Amazon Linux 2023)

Setting up Nginx as a reverse proxy on an AWS EC2 instance running Amazon Linux is a common and powerful configuration. A reverse proxy acts as an intermediary for requests from clients to servers. It can enhance security, provide load balancing, improve performance through caching, and simplify URL structures.

This guide provides step-by-step instructions to set up Nginx as a reverse proxy on an Amazon Linux 2023 EC2 instance.

---

## Prerequisites

- **AWS EC2 instance (Amazon Linux 2023):** Make sure you have an EC2 instance running and you can SSH into it.
- **An application running on your EC2 instance:** This could be a web application, API, or any service listening on a specific port (e.g., Node.js app on port 3000, Flask on 5000, Apache/Tomcat on 8080).  
  _For this guide, we'll assume your app is running on `localhost:8080`._
- **Basic understanding of Nginx and Linux command line.**

---

## Steps

### 1. Connect to Your EC2 Instance

```bash
ssh -i /path/to/your/key.pem ec2-user@your-ec2-public-ip
```

---

### 2. Install Nginx

If Nginx isn't already installed, install it:

```bash
sudo yum update -y
sudo yum install nginx -y
```

---

### 3. Start and Enable Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verify that Nginx is running:

```bash
sudo systemctl status nginx
```

You should see `active (running)`.  
You can also open your EC2 instance's public IP in a web browser; you should see the Nginx welcome page.

---

### 4. Configure Nginx as a Reverse Proxy

Nginx's main configuration file is usually `nginx.conf`, but it often includes files from `conf.d` or `sites-enabled`.  
On Amazon Linux, a common practice is to create a new configuration file in `/etc/nginx/conf.d/`.

Create a new configuration file for your reverse proxy:

```bash
sudo vi /etc/nginx/conf.d/my-app.conf
```

Add the following content. Replace `your_domain_or_ip` with your EC2 instance's public IP address or your domain name, and replace `http://localhost:8080` with your backend application's address and port.

```nginx
server {
    listen 80;
    server_name your_domain_or_ip; # Replace with your domain name or public IP

    location / {
        proxy_pass http://localhost:8080; # The address and port of your backend application
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Explanation of directives:**

- `listen 80;`: Nginx will listen for incoming HTTP requests on port 80.
- `server_name your_domain_or_ip;`: Specifies the domain name or IP address this server block will respond to.
- `location / { ... }`: Defines how Nginx handles requests for the root path.
- `proxy_pass http://localhost:8080;`: Forwards all requests to your backend application.
- `proxy_set_header ...`: Passes important headers (host, client IP, protocol) to your backend.

Save and exit the file (`Esc`, then type `:wq` and press `Enter`).

---

### 5. Test Nginx Configuration

Before restarting, always test your Nginx configuration for syntax errors:

```bash
sudo nginx -t
```

You should see output similar to:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If there are any errors, Nginx will tell you where they are. Fix them before proceeding.

---

### 6. Reload Nginx to Apply Changes

```bash
sudo systemctl reload nginx
```

---

### 7. Open Firewall Ports (AWS Security Groups)

Even with Nginx configured, you need to allow incoming traffic on port 80 (and 443 for HTTPS) in your EC2 instance's security group.

- Go to your EC2 instance in the AWS Management Console.
- Under "Security," click on the security group associated with your instance.
- Go to "Inbound rules" and click "Edit inbound rules."
- Add a new rule:
  - **Type:** HTTP (Port 80)
  - **Source:** Anywhere (`0.0.0.0/0`) or restrict to specific IPs if known.
- (Optional, but recommended for production): Add another rule for HTTPS (Port 443) if you plan to set up SSL/TLS.
- Save the rules.

---

### 8. Test the Reverse Proxy

Now, when you access your EC2 instance's public IP address (or domain name) in your web browser, Nginx will receive the request on port 80 and forward it to your backend application running on `localhost:8080`.  
You should see the output from your backend application.

---

## Important Considerations for Production

- **HTTPS/SSL/TLS:**  
  It is highly recommended to configure Nginx to serve over HTTPS (port 443) for all production applications.  
  You’ll need an SSL certificate (e.g., from Let’s Encrypt using Certbot, or AWS Certificate Manager).  
  Nginx can handle SSL termination, encrypting traffic between clients and Nginx, while Nginx can still proxy to your backend over HTTP (or HTTPS if your backend supports it).

- **Domain Name:**  
  For production, use a proper domain name and configure DNS records to point to your EC2 instance’s public IP or Elastic IP.

- **Load Balancing:**  
  Nginx can also act as a load balancer to distribute traffic among multiple backend application instances.

- **Caching:**  
  Nginx can cache static assets or even dynamic responses to improve performance.

- **Logging:**  
  Configure Nginx access and error logs to monitor traffic and troubleshoot issues.

---

## Security

- **Restrict bindIp on your backend application:**  
  If your backend application is only meant to be accessed by Nginx on the same server, configure it to listen only on `127.0.0.1` (localhost) to prevent direct external access.

- **Rate Limiting:**  
  Protect your backend from abuse by implementing rate limiting in Nginx.

- **Firewall:**  
  Always use AWS Security Groups to control network access.

- **Authentication:**  
  Ensure your backend application has proper authentication and authorization.
