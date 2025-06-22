# Linux Essential Reference Guide

## File System Navigation

### Basic Commands

```bash
pwd                    # Print working directory
ls                     # List files and directories
ls -la                 # List with details and hidden files
cd /path/to/directory  # Change directory
cd ..                  # Go up one directory
cd ~                   # Go to home directory
```

### File Operations

```bash
touch filename         # Create empty file
mkdir dirname          # Create directory
mkdir -p dir1/dir2     # Create nested directories
cp source dest         # Copy file
cp -r source dest      # Copy directory recursively
mv old_name new_name   # Move/rename file
rm filename            # Delete file
rm -rf dirname         # Delete directory recursively
```

## File Permissions

### Permission Types

- **r** (read) = 4
- **w** (write) = 2
- **x** (execute) = 1

### Examples

```bash
chmod 755 script.sh    # rwxr-xr-x (owner: rwx, group: rx, others: rx)
chmod +x script.sh     # Add execute permission
chown user:group file  # Change owner and group
```

## Text Processing

### Essential Commands

```bash
cat file.txt           # Display file content
less file.txt          # View file with pagination
head -n 10 file.txt    # Show first 10 lines
tail -n 10 file.txt    # Show last 10 lines
tail -f logfile        # Follow file changes in real-time
```

### Search and Filter

```bash
grep "pattern" file    # Search for pattern in file
grep -r "pattern" dir  # Recursive search in directory
find /path -name "*.txt"  # Find files by name
locate filename        # Find files using database
```

### Text Manipulation

```bash
sort file.txt          # Sort lines
uniq file.txt          # Remove duplicate lines
wc -l file.txt         # Count lines
sed 's/old/new/g' file # Replace text
awk '{print $1}' file  # Print first column
```

## Process Management

### Process Commands

```bash
ps aux                 # List all running processes
ps -ef | grep apache   # Find specific process
top                    # Real-time process monitor
htop                   # Enhanced process monitor
kill PID               # Terminate process by ID
killall process_name   # Kill all processes by name
```

### Background Jobs

```bash
command &              # Run command in background
jobs                   # List active jobs
bg %1                  # Send job to background
fg %1                  # Bring job to foreground
nohup command &        # Run command immune to hangups
```

## System Information

### Hardware and System

```bash
uname -a               # System information
lscpu                  # CPU information
free -h                # Memory usage
df -h                  # Disk space usage
du -sh directory       # Directory size
lsblk                  # List block devices
```

### Network

```bash
ifconfig               # Network interface configuration
ip addr show           # Show IP addresses
netstat -tuln          # Show listening ports
ss -tuln               # Modern netstat alternative
ping hostname          # Test connectivity
```

## Package Management

### Ubuntu/Debian (APT)

```bash
sudo apt update        # Update package list
sudo apt upgrade       # Upgrade packages
sudo apt install package  # Install package
sudo apt remove package   # Remove package
sudo apt search keyword   # Search packages
```

### CentOS/RHEL (YUM/DNF)

```bash
sudo yum update        # Update packages
sudo yum install package  # Install package
sudo dnf install package  # DNF (newer)
```

## Archive and Compression

### Tar Commands

```bash
tar -czf archive.tar.gz directory/  # Create compressed archive
tar -xzf archive.tar.gz             # Extract compressed archive
tar -tf archive.tar.gz              # List archive contents
```

### Other Compression

```bash
zip -r archive.zip directory/       # Create ZIP archive
unzip archive.zip                   # Extract ZIP archive
gzip file.txt                       # Compress file
gunzip file.txt.gz                  # Decompress file
```

## Environment and Variables

### Environment Variables

```bash
export VAR_NAME=value  # Set environment variable
echo $VAR_NAME         # Display variable value
env                    # Show all environment variables
which command          # Show command location
```

### PATH Management

```bash
echo $PATH             # Show PATH variable
export PATH=$PATH:/new/path  # Add to PATH
```

## Input/Output Redirection

### Redirection Operators

```bash
command > file         # Redirect output to file (overwrite)
command >> file        # Redirect output to file (append)
command < file         # Use file as input
command 2> error.log   # Redirect errors to file
command &> file        # Redirect both output and errors
```

### Pipes

```bash
command1 | command2    # Pipe output of command1 to command2
ps aux | grep apache   # Example: find apache processes
cat file | sort | uniq # Chain multiple commands
```

## Service Management (systemd)

### Service Commands

```bash
sudo systemctl start service    # Start service
sudo systemctl stop service     # Stop service
sudo systemctl restart service  # Restart service
sudo systemctl status service   # Check service status
sudo systemctl enable service   # Enable service at boot
sudo systemctl disable service  # Disable service at boot
```

## Useful Shortcuts

### Command Line Shortcuts

- **Ctrl+C**: Interrupt current command
- **Ctrl+Z**: Suspend current command
- **Ctrl+D**: Exit shell/logout
- **Ctrl+L**: Clear screen
- **Ctrl+R**: Search command history
- **Tab**: Auto-complete
- **!!**: Repeat last command
- **!n**: Repeat command number n from history

### History Commands

```bash
history                # Show command history
!123                   # Execute command number 123
!!                     # Execute last command
!string                # Execute last command starting with 'string'
```

## File Editing

### Vi/Vim Basics

```bash
vim filename           # Open file in vim
```

**Vim Modes:**

- **Normal mode**: Navigation and commands
- **Insert mode**: Text editing (press 'i')
- **Command mode**: Save/quit (press ':')

**Essential Vim Commands:**

- **:w**: Save file
- **:q**: Quit
- **:wq**: Save and quit
- **:q!**: Quit without saving
- **dd**: Delete line
- **yy**: Copy line
- **p**: Paste

### Nano (Simpler Editor)

```bash
nano filename          # Open file in nano
```

- **Ctrl+O**: Save
- **Ctrl+X**: Exit
- **Ctrl+K**: Cut line
- **Ctrl+U**: Paste

## Networking and Remote Access

### SSH

```bash
ssh user@hostname      # Connect to remote server
ssh -p 2222 user@host  # Connect using specific port
scp file user@host:path  # Copy file to remote server
rsync -av local/ remote/  # Synchronize directories
```

### File Transfer

```bash
wget URL               # Download file from URL
curl -O URL            # Download file using curl
curl -X POST -d "data" URL  # Send POST request
```

## System Monitoring

### Log Files

```bash
tail -f /var/log/syslog     # Follow system log
journalctl -f               # Follow systemd journal
journalctl -u service_name  # Show logs for specific service
```

### Performance Monitoring

```bash
iostat                 # I/O statistics
vmstat                 # Virtual memory statistics
sar -u 1 10           # CPU usage every 1 second, 10 times
```

## Cron Jobs (Task Scheduling)

### Crontab Format

```
* * * * * command
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, Sunday = 0 or 7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

### Crontab Commands

```bash
crontab -l             # List cron jobs
crontab -e             # Edit cron jobs
crontab -r             # Remove all cron jobs
```

### Examples

```bash
0 2 * * * /path/to/backup.sh     # Run backup daily at 2 AM
*/5 * * * * /path/to/check.sh    # Run every 5 minutes
0 0 1 * * /path/to/monthly.sh    # Run monthly on 1st day
```

## Important Directories

### System Directories

- **/**: Root directory
- **/home**: User home directories
- **/etc**: Configuration files
- **/var**: Variable data (logs, cache)
- **/usr**: User programs
- **/bin**: Essential binaries
- **/sbin**: System binaries
- **/tmp**: Temporary files
- **/opt**: Optional software
- **/proc**: Process information
- **/dev**: Device files

## Common Configuration Files

### System Configuration

- **/etc/passwd**: User accounts
- **/etc/group**: Group information
- **/etc/hosts**: Hostname resolution
- **/etc/fstab**: File system mounts
- **/etc/crontab**: System cron jobs
- **/etc/ssh/sshd_config**: SSH daemon config
- **/etc/apache2/**: Apache configuration
- **/etc/nginx/**: Nginx configuration

## Tips and Best Practices

### Safety Tips

- Always use `sudo` carefully
- Test commands in non-production environments
- Use `--dry-run` option when available
- Backup important data before major changes
- Read man pages: `man command`

### Efficiency Tips

- Use tab completion
- Learn keyboard shortcuts
- Use aliases for frequently used commands
- Use `screen` or `tmux` for persistent sessions
- Keep a command history and use `Ctrl+R` to search

### Troubleshooting

- Check logs in `/var/log/`
- Use `dmesg` for kernel messages
- Check service status with `systemctl status`
- Use `lsof` to see open files
- Monitor resources with `top`, `htop`, `iotop`

---

_This guide covers essential Linux commands and concepts. For detailed information, use `man command` or `command --help`._

```cmd
>sudo amazon-linux-extras install epel -y
>sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
>sudo yum install mysql-community-service
>sudo systemctl enable mysqld
>sudo systemctl start mysqld
>sudo systemctl status mysqld

-get temporary password
sudo cat /var/log/mysqld.log | grep "temporary password"
mysql -uroot -p
-change password
ALTER USER root@'localhost' IDENTIFIED_WITH mysql_native_password BY "123455"
```
