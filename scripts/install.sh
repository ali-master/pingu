#!/bin/sh

set -e

# Portable echo function that works with both bash and sh
echo_e() {
    # Use printf for maximum portability across all shells
    printf '%b\n' "$*"
}

# Pingu installer script
# Usage: curl -fsSL https://raw.githubusercontent.com/ali-master/pingu/master/scripts/install.sh | sh
# Force reinstall: curl -fsSL https://raw.githubusercontent.com/ali-master/pingu/master/scripts/install.sh | sh -s -- --force

REPO="ali-master/pingu"
VERSION="latest"
FORCE_INSTALL=false

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        -f|--force)
            FORCE_INSTALL=true
            shift
            ;;
        *)
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Symbols
CHECKMARK="${GREEN}✓${NC}"
CROSS="${RED}✗${NC}"
INFO="${CYAN}ℹ${NC}"
WARN="${YELLOW}⚠${NC}"
PENGUIN="${BLUE}🐧${NC}"

# Function to print colored output
print_color() {
    echo_e "$1$2${NC}"
}

# Function to print step
print_step() {
    echo_e "${BOLD}$1${NC}"
}

# Function to print error and exit
error_exit() {
    echo_e "${RED}${CROSS} Error: $1${NC}" >&2
    exit 1
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get file size for progress calculation
get_file_size() {
    local url="$1"
    if command_exists curl; then
        curl -sI "$url" | grep -i Content-Length | awk '{print $2}' | tr -d '\r'
    elif command_exists wget; then
        wget --spider --server-response "$url" 2>&1 | grep -i Content-Length | awk '{print $2}' | tr -d '\r'
    fi
}

# Function to format bytes
format_bytes() {
    local bytes="$1"
    if [ "$bytes" -lt 1024 ]; then
        echo "${bytes}B"
    elif [ "$bytes" -lt 1048576 ]; then
        echo "$((bytes / 1024))KB"
    else
        echo "$((bytes / 1048576))MB"
    fi
}

# Function to download with progress bar
download_with_progress() {
    local url="$1"
    local output="$2"
    local size
    size=$(get_file_size "$url")
    
    # Show download information
    if [ -n "$size" ] && [ "$size" -gt 0 ]; then
        echo_e "  ${BLUE}📥 Downloading Pingu ($(format_bytes "$size"))${NC}"
        echo_e "  ${INFO} Expected size: ${GREEN}$(format_bytes "$size")${NC}"
    else
        echo_e "  ${BLUE}📥 Downloading Pingu${NC}"
        echo_e "  ${WARN} Size information not available"
    fi
    
    # Show download details
    echo_e "  ${INFO} Using $(command_exists curl && echo "curl" || echo "wget") for download"
    echo ""
    
    if command_exists curl; then
        # Use curl with detailed progress including speed
        echo_e "  ${DIM}Download Progress:${NC}"
        if ! curl -L \
             --progress-bar \
             --speed-time 5 \
             --speed-limit 1 \
             --connect-timeout 30 \
             --max-time 600 \
             --retry 3 \
             --retry-delay 2 \
             --user-agent "Pingu-Installer/1.0" \
             -w "\n  ${INFO} Average download speed: ${GREEN}%{speed_download}${NC} bytes/sec\n" \
             "$url" -o "$output"; then
            return 1
        fi
        
    elif command_exists wget; then
        # Use wget with detailed progress
        echo_e "  ${DIM}Download Progress:${NC}"
        if ! wget --show-progress \
             --progress=bar:force:noscroll \
             --timeout=30 \
             --tries=3 \
             --waitretry=2 \
             --user-agent="Pingu-Installer/1.0" \
             "$url" -O "$output" 2>&1 | while IFS= read -r line; do
                 # Extract and display speed from wget output
                 if echo "$line" | grep -q "K/s\|M/s"; then
                     speed=$(echo "$line" | grep -oE '[0-9.]+[KM]/s' | tail -1)
                     printf "\r  ${INFO} Download speed: ${GREEN}%s${NC}    " "$speed"
                 fi
                 echo "$line"
             done; then
            return 1
        fi
        
    else
        error_exit "curl or wget is required to download Pingu"
    fi
    
    # Verify download completed
    local actual_size
    actual_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null || echo "0")
    
    if [ -n "$size" ] && [ "$size" -gt 0 ] && [ "$actual_size" -ne "$size" ]; then
        echo_e "  ${WARN} Size mismatch: expected $(format_bytes "$size"), got $(format_bytes "$actual_size")"
    fi
    
    echo_e "  ${CHECKMARK} Downloaded $(format_bytes "$actual_size")"
}

# Function to detect package manager
detect_package_manager() {
    if command_exists apt-get; then
        echo "apt"
    elif command_exists yum; then
        echo "yum"
    elif command_exists dnf; then
        echo "dnf"
    elif command_exists pacman; then
        echo "pacman"
    elif command_exists brew; then
        echo "brew"
    elif command_exists apk; then
        echo "apk"
    else
        echo "unknown"
    fi
}

# ASCII Art Banner
print_banner() {
    echo_e "${CYAN}"
    cat << "EOF"
    ____  _                   
   / __ \(_)___  ____ ___  __
  / /_/ / / __ \/ __ `/ / / /
 / ____/ / / / / /_/ / /_/ / 
/_/   /_/_/ /_/\__, /\__,_/  
              /____/         
EOF
    echo_e "${NC}"
    echo_e "${DIM}Modern Network Diagnostics Tool${NC}"
    echo ""
}

# Clear screen and print banner
clear
print_banner

# System Detection
print_step "System Detection"
echo_e "${INFO} Detecting system configuration..."

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"
KERNEL="$(uname -r)"
HOSTNAME="$(hostname)"

case $OS in
  Linux*)
    OS_NAME="linux"
    DISTRO=$(lsb_release -si 2>/dev/null || echo "Unknown")
    DISTRO_VERSION=$(lsb_release -sr 2>/dev/null || echo "")
    ;;
  Darwin*)
    OS_NAME="macos"
    DISTRO="macOS"
    DISTRO_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "")
    ;;
  CYGWIN*|MINGW*|MSYS*)
    OS_NAME="windows"
    DISTRO="Windows"
    ;;
  *)
    error_exit "Unsupported operating system: $OS (only Linux, macOS, and Windows are supported)"
    ;;
esac

# Detect Architecture
case $ARCH in
  x86_64|amd64)
    ARCH_NAME="amd64"
    ARCH_DISPLAY="64-bit (x86_64)"
    ;;
  arm64|aarch64)
    ARCH_NAME="arm64"
    ARCH_DISPLAY="ARM64 (AArch64)"
    ;;
  *)
    error_exit "Unsupported architecture: $ARCH (only x86_64/AMD64 and ARM64 are supported)"
    ;;
esac

# Display system info
echo_e "  ${CHECKMARK} Operating System: ${GREEN}${DISTRO} ${DISTRO_VERSION}${NC}"
echo_e "  ${CHECKMARK} Architecture: ${GREEN}${ARCH_DISPLAY} (${ARCH})${NC}"
echo_e "  ${CHECKMARK} Kernel: ${GREEN}${KERNEL}${NC}"
echo_e "  ${CHECKMARK} Hostname: ${GREEN}${HOSTNAME}${NC}"

# Package manager detection
PKG_MANAGER=$(detect_package_manager)
if [ "$PKG_MANAGER" != "unknown" ]; then
    echo_e "  ${CHECKMARK} Package Manager: ${GREEN}${PKG_MANAGER}${NC}"
fi
echo ""

# Set binary name
if [ "$OS_NAME" = "windows" ]; then
  BINARY_NAME="pingu-${OS_NAME}-${ARCH_NAME}.exe"
  LOCAL_BINARY="pingu.exe"
else
  BINARY_NAME="pingu-${OS_NAME}-${ARCH_NAME}"
  LOCAL_BINARY="pingu"
fi

# Check for existing installation
print_step "Checking Existing Installation"
if command_exists pingu; then
    EXISTING_VERSION=$(pingu --version 2>/dev/null || echo "unknown")
    echo_e "${WARN} Pingu is already installed"
    echo_e "  ${INFO} Current version: ${YELLOW}${EXISTING_VERSION}${NC}"
    
    if [ "$FORCE_INSTALL" = "true" ]; then
        echo_e "${INFO} Force flag detected. Proceeding with installation..."
    else
        printf "Do you want to reinstall/upgrade? [y/N] "
        
        # Read user response
        if [ -t 0 ]; then
            # Terminal is available, read normally
            read -r response
        else
            # No terminal (piped), exit with instructions
            echo ""
            echo_e "${INFO} Non-interactive mode detected."
            echo_e "${INFO} To upgrade in non-interactive mode, use:"
            echo_e ""
            echo_e "  ${CYAN}curl -fsSL ... | sh -s -- --force${NC}"
            echo_e ""
            echo_e "${INFO} Installation cancelled"
            exit 0
        fi
        
        case "$response" in
            [yY][eE][sS]|[yY]) 
                echo_e "${INFO} Proceeding with installation..."
                ;;
            *)
                echo_e "${INFO} Installation cancelled"
                echo_e "${DIM}Tip: Use --force flag to skip this prompt${NC}"
                exit 0
                ;;
        esac
    fi
else
    echo_e "  ${CHECKMARK} No existing installation found"
fi
echo ""

# Download URL and version detection
if [ "$VERSION" = "latest" ]; then
  # Get latest version tag from GitHub
  echo_e "${INFO} Checking latest version..."
  if command_exists curl; then
    LATEST_VERSION=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
  elif command_exists wget; then
    LATEST_VERSION=$(wget -qO- "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
  fi
  
  if [ -n "$LATEST_VERSION" ]; then
    echo_e "  ${CHECKMARK} Latest version: ${GREEN}${LATEST_VERSION}${NC}"
  else
    echo_e "  ${WARN} Could not detect latest version, proceeding anyway..."
    LATEST_VERSION="latest"
  fi
  
  DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}"
else
  LATEST_VERSION="$VERSION"
  DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY_NAME}"
fi

# Check internet connectivity
print_step "Network Check"
echo_e "${INFO} Checking internet connectivity..."
if ! ping -c 1 github.com >/dev/null 2>&1; then
    if ! ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        error_exit "No internet connection detected"
    else
        echo_e "${WARN} Cannot reach github.com, but internet is available"
    fi
else
    echo_e "  ${CHECKMARK} Internet connection verified"
fi
echo ""

# Create temporary directory
print_step "Preparing Installation"
TMP_DIR=$(mktemp -d)
echo_e "  ${CHECKMARK} Created temporary directory: ${DIM}${TMP_DIR}${NC}"
cd "$TMP_DIR"

# Download binary with progress
print_step "Downloading Pingu"
echo_e "  ${INFO} Source: ${DIM}${DOWNLOAD_URL}${NC}"
echo_e "  ${INFO} Target: ${DIM}${LOCAL_BINARY}${NC}"
echo ""

if ! download_with_progress "$DOWNLOAD_URL" "$LOCAL_BINARY"; then
    rm -rf "$TMP_DIR"
    error_exit "Failed to download Pingu from $DOWNLOAD_URL"
fi
echo_e "  ${CHECKMARK} Download completed successfully"
echo ""

print_step "Verifying Download"
# Verify download exists
if [ ! -f "$LOCAL_BINARY" ]; then
    rm -rf "$TMP_DIR"
    error_exit "Downloaded file not found"
fi

# Get file information
FILE_SIZE=$(stat -f%z "$LOCAL_BINARY" 2>/dev/null || stat -c%s "$LOCAL_BINARY" 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -eq 0 ]; then
    rm -rf "$TMP_DIR"
    error_exit "Downloaded file is empty"
fi

# Calculate checksums
echo_e "  ${INFO} Calculating checksums..."
if command_exists sha256sum; then
    SHA256=$(sha256sum "$LOCAL_BINARY" | awk '{print $1}')
    echo_e "  ${CHECKMARK} SHA256: ${DIM}${SHA256}${NC}"
elif command_exists shasum; then
    SHA256=$(shasum -a 256 "$LOCAL_BINARY" | awk '{print $1}')
    echo_e "  ${CHECKMARK} SHA256: ${DIM}${SHA256}${NC}"
fi

if command_exists md5sum; then
    MD5=$(md5sum "$LOCAL_BINARY" | awk '{print $1}')
    echo_e "  ${CHECKMARK} MD5: ${DIM}${MD5}${NC}"
elif command_exists md5; then
    MD5=$(md5 -q "$LOCAL_BINARY")
    echo_e "  ${CHECKMARK} MD5: ${DIM}${MD5}${NC}"
fi

# File type detection
if command_exists file; then
    FILE_TYPE=$(file "$LOCAL_BINARY")
    echo_e "  ${CHECKMARK} File type: ${DIM}${FILE_TYPE}${NC}"
fi

# File size verification
echo_e "  ${CHECKMARK} File size: ${GREEN}$(format_bytes "$FILE_SIZE")${NC}"

# Verify it's executable
if file "$LOCAL_BINARY" | grep -q "executable"; then
    echo_e "  ${CHECKMARK} Executable format verified"
else
    echo_e "  ${WARN} Warning: File may not be executable format"
fi

# Make executable
chmod +x "$LOCAL_BINARY"
echo_e "  ${CHECKMARK} Execute permissions set"

# Final verification
if [ -x "$LOCAL_BINARY" ]; then
    echo_e "  ${CHECKMARK} Binary is ready for installation"
else
    error_exit "Failed to set execute permissions"
fi
echo ""

# Install to system
print_step "Installing Pingu"
if [ "$OS_NAME" = "windows" ]; then
  # For Windows, install to user's home directory
  INSTALL_DIR="$HOME/.pingu"
  mkdir -p "$INSTALL_DIR"
  mv "$LOCAL_BINARY" "$INSTALL_DIR/pingu.exe"
  INSTALL_PATH="$INSTALL_DIR/pingu.exe"
  
  echo_e "  ${CHECKMARK} Installed to: ${GREEN}$INSTALL_PATH${NC}"
  echo_e "  ${INFO} Add ${GREEN}$INSTALL_DIR${NC} to your PATH environment variable"
  
else
  # For Unix-like systems
  if [ -w "/usr/local/bin" ] || [ "$EUID" = "0" ]; then
    INSTALL_PATH="/usr/local/bin/pingu"
    if [ -f "$INSTALL_PATH" ]; then
        echo_e "  ${INFO} Backing up existing binary..."
        mv "$INSTALL_PATH" "$INSTALL_PATH.backup.$(date +%Y%m%d%H%M%S)"
    fi
    mv "$LOCAL_BINARY" "$INSTALL_PATH"
    echo_e "  ${CHECKMARK} Installed to: ${GREEN}$INSTALL_PATH${NC}"
  else
    # Install to user's bin directory
    INSTALL_DIR="$HOME/.local/bin"
    mkdir -p "$INSTALL_DIR"
    INSTALL_PATH="$INSTALL_DIR/pingu"
    
    if [ -f "$INSTALL_PATH" ]; then
        echo_e "  ${INFO} Backing up existing binary..."
        mv "$INSTALL_PATH" "$INSTALL_PATH.backup.$(date +%Y%m%d%H%M%S)"
    fi
    
    mv "$LOCAL_BINARY" "$INSTALL_PATH"
    echo_e "  ${CHECKMARK} Installed to: ${GREEN}$INSTALL_PATH${NC}"
    
    # Check if directory is in PATH
    if ! echo ":$PATH:" | grep -q ":$INSTALL_DIR:"; then
        echo_e "  ${WARN} ${YELLOW}$INSTALL_DIR is not in your PATH${NC}"
        echo ""
        echo_e "  Add this line to your shell configuration file:"
        echo_e "  ${DIM}(.bashrc, .zshrc, .profile, etc.)${NC}"
        echo ""
        echo_e "  ${CYAN}export PATH=\"\$PATH:$INSTALL_DIR\"${NC}"
        echo ""
    fi
  fi
fi

# Cleanup
cd /
rm -rf "$TMP_DIR"
echo ""

# Verify installation
print_step "Verification"
if command_exists pingu; then
    NEW_VERSION=$(pingu --version 2>/dev/null || echo "Version check failed")
    echo_e "  ${CHECKMARK} Pingu is ready to use!"
    
    if [ -n "$EXISTING_VERSION" ] && [ "$EXISTING_VERSION" != "unknown" ]; then
        echo_e "  ${INFO} Upgraded from: ${YELLOW}${EXISTING_VERSION}${NC} → ${GREEN}${NEW_VERSION}${NC}"
    else
        echo_e "  ${INFO} Installed version: ${GREEN}${NEW_VERSION}${NC}"
    fi
else
    echo_e "  ${WARN} Pingu was installed but is not in PATH"
    echo_e "  ${INFO} Binary location: ${GREEN}$INSTALL_PATH${NC}"
fi
echo ""

# Print success message and usage examples
print_color "$GREEN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_color "$GREEN" "  ${PENGUIN} Pingu installed successfully!"
print_color "$GREEN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Usage examples
print_step "Quick Start Guide"
echo ""
echo_e "${BOLD}Basic Usage:${NC}"
echo_e "  ${DIM}# Ping a domain${NC}"
echo_e "  ${CYAN}pingu google.com${NC}"
echo ""
echo_e "  ${DIM}# Ping an IP address${NC}"
echo_e "  ${CYAN}pingu 8.8.8.8${NC}"
echo ""

echo_e "${BOLD}Advanced Options:${NC}"
echo_e "  ${DIM}# Send specific number of packets${NC}"
echo_e "  ${CYAN}pingu -c 10 google.com${NC}"
echo ""
echo_e "  ${DIM}# Set packet interval (seconds)${NC}"
echo_e "  ${CYAN}pingu -i 0.5 google.com${NC}"
echo ""
echo_e "  ${DIM}# Set timeout (seconds)${NC}"
echo_e "  ${CYAN}pingu -t 10 google.com${NC}"
echo ""
echo_e "  ${DIM}# Export results to JSON${NC}"
echo_e "  ${CYAN}pingu -e google.com${NC}"
echo ""
echo_e "  ${DIM}# Combine multiple options${NC}"
echo_e "  ${CYAN}pingu -c 20 -i 0.2 -t 5 google.com${NC}"
echo ""

echo_e "${BOLD}Real-World Examples:${NC}"
echo_e "  ${DIM}# Monitor your home network${NC}"
echo_e "  ${CYAN}pingu 192.168.1.1${NC}"
echo ""
echo_e "  ${DIM}# Test DNS servers${NC}"
echo_e "  ${CYAN}pingu 1.1.1.1  # Cloudflare${NC}"
echo_e "  ${CYAN}pingu 8.8.8.8  # Google${NC}"
echo ""
echo_e "  ${DIM}# Continuous monitoring with export${NC}"
echo_e "  ${CYAN}pingu -e your-server.com${NC}"
echo ""

echo_e "${BOLD}Features:${NC}"
echo_e "  ${CHECKMARK} Real-time network quality analysis"
echo_e "  ${CHECKMARK} Beautiful terminal UI with live graphs"
echo_e "  ${CHECKMARK} Cross-platform support"
echo_e "  ${CHECKMARK} Export results to JSON"
echo_e "  ${CHECKMARK} Advanced network metrics (jitter, packet loss, etc.)"
echo ""

echo_e "${BOLD}Resources:${NC}"
echo_e "  ${INFO} Documentation: ${BLUE}https://github.com/${REPO}${NC}"
echo_e "  ${INFO} Report Issues: ${BLUE}https://github.com/${REPO}/issues${NC}"
echo_e "  ${INFO} View Help: ${CYAN}pingu --help${NC}"
echo ""

# System-specific notes
if [ "$OS_NAME" = "darwin" ]; then
    echo_e "${BOLD}macOS Note:${NC}"
    echo_e "  ${INFO} You may need to allow Pingu in System Preferences > Security & Privacy"
    echo ""
elif [ "$OS_NAME" = "windows" ]; then
    echo_e "${BOLD}Windows Note:${NC}"
    echo_e "  ${INFO} Run as Administrator for best results"
    echo_e "  ${INFO} Windows Defender may need to allow the application"
    echo ""
fi

print_color "$GREEN" "Happy pinging! ${PENGUIN}"
echo ""
