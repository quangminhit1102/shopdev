# Enable HTTPS with Certbot and Let's Encrypt on Amazon Linux 2023 (EC2)

Installing Certbot on Amazon Linux 2023 EC2 instances is a common task to enable HTTPS for your website using free SSL/TLS certificates from Let's Encrypt. Unlike Amazon Linux 2, Amazon Linux 2023 (AL2023) does not use EPEL for Certbot, and the recommended method is to install it via pip within a Python virtual environment.

This guide provides a comprehensive step-by-step process to install Certbot and enable HTTPS for your Nginx or Apache web server.

---

## Prerequisites

- **EC2 Instance:** Amazon Linux 2023 EC2 instance with sudo privileges.
- **Domain Name:** Registered domain (e.g., yourdomain.com) with DNS A record pointing to your EC2 public IP (Elastic IP recommended).
- **Security Group:** Inbound rules allowing ports 80 (HTTP) and 443 (HTTPS) from 0.0.0.0/0.
- **Web Server:** Nginx or Apache installed and serving your website.

---

## Installation Steps

### 1. Connect to Your EC2 Instance

```bash
ssh -i /path/to/your-key.pem ec2-user@your-ec2-public-ip-or-domain
```

### 2. Update System Packages

```bash
sudo dnf update -y
```

### 3. Install Python 3 and augeas-libs

Certbot relies on Python, and augeas-libs is a dependency.

```bash
sudo dnf install -y python3 augeas-libs
```

### 4. Create a Python Virtual Environment for Certbot

```bash
sudo python3 -m venv /opt/certbot/
```

### 5. Upgrade Pip within the Virtual Environment

```bash
sudo /opt/certbot/bin/pip install --upgrade pip
```

### 6. Install Certbot and the Web Server Plugin

For **Nginx**:

```bash
sudo /opt/certbot/bin/pip install certbot certbot-nginx
```

For **Apache**:

```bash
sudo /opt/certbot/bin/pip install certbot certbot-apache
```

### 7. Create a Symlink for Certbot (Optional but Recommended)

This allows you to run certbot commands directly from anywhere in the terminal.

```bash
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

If you get an error like "ln: failed to create symbolic link '/usr/bin/certbot': File exists", use the -f flag to force overwrite:

```bash
sudo ln -sf /opt/certbot/bin/certbot /usr/bin/certbot
```

### 8. Obtain and Install the SSL Certificate

For **Nginx**:

```bash
sudo certbot --nginx
```

For **Apache**:

```bash
sudo certbot --apache
```

Certbot will prompt you for:

- An email address for urgent renewal notices and security advisories.
- Agreement to the Let's Encrypt Terms of Service.
- Whether to share your email with the Electronic Frontier Foundation (EFF).
- Your domain name(s) (e.g., yourdomain.com and www.yourdomain.com).
- Whether to redirect HTTP traffic to HTTPS (highly recommended).

### 9. Test Automatic Certificate Renewal

Let's Encrypt certificates are valid for 90 days, so you need to set up automatic renewal. Certbot typically sets up a cron job or systemd timer for this. You can test the renewal process with a dry run:

```bash
sudo certbot renew --dry-run
```

If this command completes without errors, your automatic renewal is likely set up correctly.

### 10. Verify SSL Installation

After Certbot completes, restart your web server to apply the changes:

For **Nginx**:

```bash
sudo systemctl restart nginx
```

For **Apache**:

```bash
sudo systemctl restart httpd
```

Now, open your web browser and navigate to `https://yourdomain.com`. You should see a secure padlock icon, and your website should be served over HTTPS. You can also use online SSL checker tools to verify the certificate.

---

## Important Notes

- **Firewall (Security Groups):** Double-check that your AWS Security Group for the EC2 instance allows inbound traffic on ports 80 (HTTP) and 443 (HTTPS) from 0.0.0.0/0.
- **Domain DNS:** Ensure your domain's A record is correctly pointing to your EC2 instance's public IP address before running Certbot.
- **Web Server Configuration:** If Certbot has trouble automatically configuring your web server, you might need to manually adjust your Nginx or Apache configuration files to include the certificate paths provided by Certbot. Certbot usually places certificates in `/etc/letsencrypt/live/yourdomain.com/`.
- **Renewal Timer:** Certbot typically creates a systemd timer (e.g., `certbot-renew.timer`) to handle automatic renewals. You can check its status with `sudo systemctl status certbot-renew.timer`.
- **Troubleshooting:** If you encounter issues, review the Certbot output for specific error messages. Check your web server's error logs (`/var/log/nginx/error.log` for Nginx, `/var/log/httpd/error_log` for Apache) for clues.

---

This guide should help you successfully install and configure Certbot on your Amazon Linux 2023 EC2 instance for secure HTTPS hosting.
