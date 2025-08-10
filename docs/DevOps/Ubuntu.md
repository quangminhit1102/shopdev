# Ubuntu Reference Guide

## Overview

Ubuntu is a Debian-based Linux distribution known for stability, user-friendliness, and strong community support. Uses APT package manager and includes GNOME desktop environment by default.

## System Information

```bash
# Ubuntu version
lsb_release -a
cat /etc/os-release

# System specs
uname -a                    # Kernel info
hostnamectl                 # System info
lscpu                      # CPU info
free -h                    # Memory usage
df -h                      # Disk usage
lsblk                      # Block devices
```

## Package Management (APT)

### Basic Commands

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade
sudo apt full-upgrade      # More comprehensive upgrade

# Install packages
sudo apt install package-name
sudo apt install package1 package2 package3

# Remove packages
sudo apt remove package-name
sudo apt purge package-name    # Remove with config files
sudo apt autoremove           # Remove unused dependencies

# Search packages
apt search keyword
apt list --installed
apt show package-name
```

### Package Management Examples

```bash
# Install development tools
sudo apt install build-essential git curl wget vim

# Install media codecs
sudo apt install ubuntu-restricted-extras

# Install snap packages
sudo snap install code
sudo snap install discord

# Clean package cache
sudo apt autoclean
sudo apt clean
```

## File System Navigation

### Basic Navigation

```bash
# Directory operations
pwd                        # Current directory
ls -la                     # List files (detailed)
cd /path/to/directory      # Change directory
cd ~                       # Home directory
cd ..                      # Parent directory
cd -                       # Previous directory

# File operations
cp source destination      # Copy file
mv source destination      # Move/rename
rm filename               # Delete file
rm -rf directory          # Delete directory recursively
mkdir directory           # Create directory
mkdir -p path/to/dir      # Create nested directories

# File viewing
cat filename              # Display file content
less filename             # View file page by page
head -10 filename         # First 10 lines
tail -10 filename         # Last 10 lines
tail -f logfile           # Follow file changes
```

### File Permissions

```bash
# View permissions
ls -l filename

# Change permissions
chmod 755 filename        # rwxr-xr-x
chmod 644 filename        # rw-r--r--
chmod +x filename         # Add execute permission
chmod -x filename         # Remove execute permission

# Change ownership
sudo chown user:group filename
sudo chown -R user:group directory
```

## Process Management

### Process Commands

```bash
# View processes
ps aux                    # All processes
ps aux | grep process     # Find specific process
top                       # Real-time process viewer
htop                      # Enhanced process viewer (install first)

# Process control
kill PID                  # Terminate process by PID
killall process-name      # Terminate by name
pkill process-name        # Kill processes by name

# Background processes
command &                 # Run in background
nohup command &          # Run immune to hangups
jobs                     # List background jobs
fg %1                    # Bring job to foreground
```

## Network Configuration

### Network Commands

```bash
# Network interfaces
ip addr show             # Show IP addresses
ip route show            # Show routing table
ifconfig                 # Network interface config (deprecated)

# Network testing
ping google.com          # Test connectivity
wget URL                 # Download file
curl URL                 # Transfer data from server

# Network services
sudo systemctl status networking
sudo systemctl restart networking

# Firewall (UFW)
sudo ufw status
sudo ufw enable
sudo ufw allow 22        # Allow SSH
sudo ufw allow 80/tcp    # Allow HTTP
sudo ufw deny 21         # Deny FTP
```

## User Management

### User Commands

```bash
# User information
whoami                   # Current user
id                       # User and group IDs
users                    # Currently logged in users
w                        # Who is logged on

# User management
sudo adduser username    # Add new user
sudo deluser username    # Delete user
sudo usermod -aG group username  # Add user to group
sudo passwd username     # Change user password

# Switch users
su username              # Switch user
sudo su                  # Switch to root
sudo -i                  # Interactive root shell
```

## Services and Systemd

### Service Management

```bash
# Service status
sudo systemctl status service-name
sudo systemctl list-units --type=service

# Service control
sudo systemctl start service-name
sudo systemctl stop service-name
sudo systemctl restart service-name
sudo systemctl reload service-name

# Enable/disable services
sudo systemctl enable service-name     # Start at boot
sudo systemctl disable service-name    # Don't start at boot

# Logs
journalctl -u service-name
journalctl -f                          # Follow logs
```

### Common Services

```bash
# Apache web server
sudo systemctl start apache2
sudo systemctl enable apache2

# MySQL database
sudo systemctl start mysql
sudo systemctl enable mysql

# SSH service
sudo systemctl start ssh
sudo systemctl enable ssh
```

## Environment Variables

### Environment Management

```bash
# View environment
env                      # All environment variables
echo $PATH              # Specific variable
echo $HOME              # Home directory

# Set temporary variables
export VAR_NAME=value

# Permanent variables (add to ~/.bashrc)
echo 'export PATH=$PATH:/new/path' >> ~/.bashrc
source ~/.bashrc        # Reload bashrc
```

## File Searching and Text Processing

### Search Commands

```bash
# Find files
find /path -name "filename"
find . -type f -name "*.txt"
find . -size +10M                     # Files larger than 10MB

# Search text in files
grep "pattern" filename
grep -r "pattern" directory           # Recursive search
grep -i "pattern" filename            # Case insensitive

# Text processing
sed 's/old/new/g' filename            # Replace text
awk '{print $1}' filename             # Print first column
sort filename                         # Sort lines
uniq filename                         # Remove duplicates
wc -l filename                        # Count lines
```

## Archive and Compression

### Archive Commands

```bash
# Create archives
tar -czf archive.tar.gz directory     # Create compressed tar
tar -cf archive.tar directory         # Create uncompressed tar
zip -r archive.zip directory          # Create zip archive

# Extract archives
tar -xzf archive.tar.gz               # Extract compressed tar
tar -xf archive.tar                   # Extract uncompressed tar
unzip archive.zip                     # Extract zip

# View archive contents
tar -tzf archive.tar.gz               # List tar contents
unzip -l archive.zip                  # List zip contents
```

## System Monitoring

### Monitoring Commands

```bash
# System performance
top                      # Process activity
htop                     # Enhanced top
iotop                    # I/O activity
nethogs                  # Network usage per process

# Disk usage
df -h                    # Filesystem usage
du -sh directory         # Directory size
du -h --max-depth=1      # Subdirectory sizes
ncdu                     # Interactive disk usage

# Memory and CPU
free -h                  # Memory usage
uptime                   # System uptime and load
vmstat 1                 # Virtual memory statistics
iostat 1                 # I/O statistics
```

## Software Installation Methods

### APT Packages

```bash
# Standard packages
sudo apt install package-name

# .deb packages
sudo dpkg -i package.deb
sudo apt install -f              # Fix dependencies
```

### Snap Packages

```bash
# Install snap packages
sudo snap install package-name
sudo snap install --classic package-name

# Manage snaps
snap list
snap refresh
snap remove package-name
```

### Flatpak

```bash
# Install Flatpak
sudo apt install flatpak

# Add Flathub repository
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install applications
flatpak install flathub com.example.App
```

## Essential Ubuntu Shortcuts

### Terminal Shortcuts

```
Ctrl + Alt + T          # Open terminal
Ctrl + Shift + T        # New terminal tab
Ctrl + C               # Cancel/interrupt command
Ctrl + Z               # Suspend process
Ctrl + D               # Exit terminal/logout
Ctrl + L               # Clear screen
Ctrl + A               # Beginning of line
Ctrl + E               # End of line
Ctrl + R               # Search command history
```

### Desktop Shortcuts

```
Super                  # Activities overview
Alt + Tab              # Switch applications
Alt + F4               # Close window
Ctrl + Alt + L         # Lock screen
Ctrl + Alt + D         # Show desktop
Super + L              # Lock screen
Print Screen           # Screenshot
```

## Common Configuration Files

### Important Files

```bash
# System configuration
/etc/hosts              # Host file
/etc/fstab             # Filesystem table
/etc/crontab           # System cron jobs
/etc/ssh/sshd_config   # SSH daemon config

# User configuration
~/.bashrc              # Bash configuration
~/.profile             # Login shell profile
~/.ssh/config          # SSH client config
~/.gitconfig           # Git configuration
```

## Troubleshooting Commands

### System Diagnosis

```bash
# Boot issues
sudo dmesg              # Kernel messages
sudo journalctl -b      # Boot log
sudo systemctl --failed # Failed services

# Hardware issues
lshw                    # Hardware info
lsusb                   # USB devices
lspci                   # PCI devices
sensors                 # Temperature sensors

# Network issues
ping -c 4 8.8.8.8      # Test internet connectivity
nslookup domain.com     # DNS lookup
netstat -tuln           # Network connections
ss -tuln                # Socket statistics
```

## Ubuntu Versions (LTS)

| Version | Codename        | Release  | Support Until |
| ------- | --------------- | -------- | ------------- |
| 24.04   | Noble Numbat    | Apr 2024 | Apr 2029      |
| 22.04   | Jammy Jellyfish | Apr 2022 | Apr 2027      |
| 20.04   | Focal Fossa     | Apr 2020 | Apr 2025      |
| 18.04   | Bionic Beaver   | Apr 2018 | Apr 2023      |

## Quick Setup Script

```bash
#!/bin/bash
# Ubuntu fresh install setup

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim htop tree unzip

# Install development tools
sudo apt install -y build-essential nodejs npm python3-pip

# Install media codecs
sudo apt install -y ubuntu-restricted-extras

# Install snap packages
sudo snap install code --classic
sudo snap install discord

# Clean up
sudo apt autoremove -y
sudo apt autoclean

echo "Ubuntu setup complete!"
```

## Best Practices

1. **Regular updates**: `sudo apt update && sudo apt upgrade`
2. **Backup important data**: Use `rsync` or `tar`
3. **Use sudo wisely**: Don't run as root unnecessarily
4. **Learn keyboard shortcuts**: Increases productivity
5. **Monitor system resources**: Use `htop`, `df`, `free`
6. **Keep system clean**: Regular `autoremove` and `autoclean`
7. **Use LTS versions**: For stability in production
8. **Configure firewall**: Enable UFW for security

```cmd
>sudo apt-get update
>sudo apt-get install nginx
>sudo systemctl status nginx
>sudo vim /var/www/html/index.nginx-debian.html
```
