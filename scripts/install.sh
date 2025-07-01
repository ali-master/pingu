#!/bin/bash

set -e

# Pingu installer script
# Usage: curl -fsSL https://raw.githubusercontent.com/ali-master/pingu/master/scripts/install.sh | sh

REPO="ali-master/pingu"
VERSION="latest"

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
    echo -e "$1$2${NC}"
}

# Function to print step
print_step() {
    echo -e "${BOLD}$1${NC}"
}

# Function to print error and exit
error_exit() {
    echo -e "${RED}${CROSS} Error: $1${NC}" >&2
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
    
    if command_exists curl; then
        if [ -n "$size" ] && [ "$size" -gt 0 ]; then
            echo -e "${BLUE}📥 Downloading Pingu ($(format_bytes "$size"))${NC}"
        else
            echo -e "${BLUE}📥 Downloading Pingu${NC}"
        fi
        
        # Use curl with progress bar
        curl -L --progress-bar "$url" -o "$output" || return 1
        
    elif command_exists wget; then
        if [ -n "$size" ] && [ "$size" -gt 0 ]; then
            echo -e "${BLUE}📥 Downloading Pingu ($(format_bytes "$size"))${NC}"
        else
            echo -e "${BLUE}📥 Downloading Pingu${NC}"
        fi
        
        # Use wget with progress bar
        wget --show-progress -q "$url" -O "$output" || return 1
        
    else
        error_exit "curl or wget is required to download Pingu"
    fi
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
    echo -e "${CYAN}"
    cat << "EOF"
    ____  _                   
   / __ \(_)___  ____ ___  __
  / /_/ / / __ \/ __ `/ / / /
 / ____/ / / / / /_/ / /_/ / 
/_/   /_/_/ /_/\__, /\__,_/  
              /____/         
EOF
    echo -e "${NC}"
    echo -e "${DIM}Modern Network Diagnostics Tool${NC}"
    echo ""
}

# Clear screen and print banner
clear
print_banner

# System Detection
print_step "System Detection"
echo -e "${INFO} Detecting system configuration..."

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
echo -e "  ${CHECKMARK} Operating System: ${GREEN}${DISTRO} ${DISTRO_VERSION}${NC}"
echo -e "  ${CHECKMARK} Architecture: ${GREEN}${ARCH_DISPLAY} (${ARCH})${NC}"
echo -e "  ${CHECKMARK} Kernel: ${GREEN}${KERNEL}${NC}"
echo -e "  ${CHECKMARK} Hostname: ${GREEN}${HOSTNAME}${NC}"

# Package manager detection
PKG_MANAGER=$(detect_package_manager)
if [ "$PKG_MANAGER" != "unknown" ]; then
    echo -e "  ${CHECKMARK} Package Manager: ${GREEN}${PKG_MANAGER}${NC}"
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
    echo -e "${WARN} Pingu is already installed (version: ${EXISTING_VERSION})"
    echo -n "Do you want to reinstall/upgrade? [y/N] "
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            echo -e "${INFO} Proceeding with installation..."
            ;;
        *)
            echo -e "${INFO} Installation cancelled"
            exit 0
            ;;
    esac
else
    echo -e "  ${CHECKMARK} No existing installation found"
fi
echo ""

# Download URL
if [ "$VERSION" = "latest" ]; then
  DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}"
else
  DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY_NAME}"
fi

# Check internet connectivity
print_step "Network Check"
echo -e "${INFO} Checking internet connectivity..."
if ! ping -c 1 github.com >/dev/null 2>&1; then
    if ! ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        error_exit "No internet connection detected"
    else
        echo -e "${WARN} Cannot reach github.com, but internet is available"
    fi
else
    echo -e "  ${CHECKMARK} Internet connection verified"
fi
echo ""

# Create temporary directory
print_step "Preparing Installation"
TMP_DIR=$(mktemp -d)
echo -e "  ${CHECKMARK} Created temporary directory: ${DIM}${TMP_DIR}${NC}"
cd "$TMP_DIR"

# Download binary with progress
print_step "Downloading Pingu"
if ! download_with_progress "$DOWNLOAD_URL" "$LOCAL_BINARY"; then
    rm -rf "$TMP_DIR"
    error_exit "Failed to download Pingu from $DOWNLOAD_URL"
fi
echo -e "  ${CHECKMARK} Download completed successfully"
echo ""

# Verify download
if [ ! -f "$LOCAL_BINARY" ]; then
    rm -rf "$TMP_DIR"
    error_exit "Downloaded file not found"
fi

FILE_SIZE=$(stat -f%z "$LOCAL_BINARY" 2>/dev/null || stat -c%s "$LOCAL_BINARY" 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -eq 0 ]; then
    rm -rf "$TMP_DIR"
    error_exit "Downloaded file is empty"
fi
echo -e "  ${CHECKMARK} File verified ($(format_bytes "$FILE_SIZE"))"

# Make executable
chmod +x "$LOCAL_BINARY"
echo -e "  ${CHECKMARK} Made executable"
echo ""

# Install to system
print_step "Installing Pingu"
if [ "$OS_NAME" = "windows" ]; then
  # For Windows, install to user's home directory
  INSTALL_DIR="$HOME/.pingu"
  mkdir -p "$INSTALL_DIR"
  mv "$LOCAL_BINARY" "$INSTALL_DIR/pingu.exe"
  INSTALL_PATH="$INSTALL_DIR/pingu.exe"
  
  echo -e "  ${CHECKMARK} Installed to: ${GREEN}$INSTALL_PATH${NC}"
  echo -e "  ${INFO} Add ${GREEN}$INSTALL_DIR${NC} to your PATH environment variable"
  
else
  # For Unix-like systems
  if [ -w "/usr/local/bin" ] || [ "$EUID" = "0" ]; then
    INSTALL_PATH="/usr/local/bin/pingu"
    if [ -f "$INSTALL_PATH" ]; then
        echo -e "  ${INFO} Backing up existing binary..."
        mv "$INSTALL_PATH" "$INSTALL_PATH.backup.$(date +%Y%m%d%H%M%S)"
    fi
    mv "$LOCAL_BINARY" "$INSTALL_PATH"
    echo -e "  ${CHECKMARK} Installed to: ${GREEN}$INSTALL_PATH${NC}"
  else
    # Install to user's bin directory
    INSTALL_DIR="$HOME/.local/bin"
    mkdir -p "$INSTALL_DIR"
    INSTALL_PATH="$INSTALL_DIR/pingu"
    
    if [ -f "$INSTALL_PATH" ]; then
        echo -e "  ${INFO} Backing up existing binary..."
        mv "$INSTALL_PATH" "$INSTALL_PATH.backup.$(date +%Y%m%d%H%M%S)"
    fi
    
    mv "$LOCAL_BINARY" "$INSTALL_PATH"
    echo -e "  ${CHECKMARK} Installed to: ${GREEN}$INSTALL_PATH${NC}"
    
    # Check if directory is in PATH
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo -e "  ${WARN} ${YELLOW}$INSTALL_DIR is not in your PATH${NC}"
        echo ""
        echo -e "  Add this line to your shell configuration file:"
        echo -e "  ${DIM}(.bashrc, .zshrc, .profile, etc.)${NC}"
        echo ""
        echo -e "  ${CYAN}export PATH=\"\$PATH:$INSTALL_DIR\"${NC}"
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
    VERSION_OUTPUT=$(pingu --version 2>/dev/null || echo "Version check failed")
    echo -e "  ${CHECKMARK} Pingu is ready to use!"
    echo -e "  ${INFO} Version: ${VERSION_OUTPUT}"
else
    echo -e "  ${WARN} Pingu was installed but is not in PATH"
    echo -e "  ${INFO} Binary location: ${GREEN}$INSTALL_PATH${NC}"
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
echo -e "${BOLD}Basic Usage:${NC}"
echo -e "  ${DIM}# Ping a domain${NC}"
echo -e "  ${CYAN}pingu google.com${NC}"
echo ""
echo -e "  ${DIM}# Ping an IP address${NC}"
echo -e "  ${CYAN}pingu 8.8.8.8${NC}"
echo ""

echo -e "${BOLD}Advanced Options:${NC}"
echo -e "  ${DIM}# Send specific number of packets${NC}"
echo -e "  ${CYAN}pingu -c 10 google.com${NC}"
echo ""
echo -e "  ${DIM}# Set packet interval (seconds)${NC}"
echo -e "  ${CYAN}pingu -i 0.5 google.com${NC}"
echo ""
echo -e "  ${DIM}# Set timeout (seconds)${NC}"
echo -e "  ${CYAN}pingu -t 10 google.com${NC}"
echo ""
echo -e "  ${DIM}# Export results to JSON${NC}"
echo -e "  ${CYAN}pingu -e google.com${NC}"
echo ""
echo -e "  ${DIM}# Combine multiple options${NC}"
echo -e "  ${CYAN}pingu -c 20 -i 0.2 -t 5 google.com${NC}"
echo ""

echo -e "${BOLD}Real-World Examples:${NC}"
echo -e "  ${DIM}# Monitor your home network${NC}"
echo -e "  ${CYAN}pingu 192.168.1.1${NC}"
echo ""
echo -e "  ${DIM}# Test DNS servers${NC}"
echo -e "  ${CYAN}pingu 1.1.1.1  # Cloudflare${NC}"
echo -e "  ${CYAN}pingu 8.8.8.8  # Google${NC}"
echo ""
echo -e "  ${DIM}# Continuous monitoring with export${NC}"
echo -e "  ${CYAN}pingu -e your-server.com${NC}"
echo ""

echo -e "${BOLD}Features:${NC}"
echo -e "  ${CHECKMARK} Real-time network quality analysis"
echo -e "  ${CHECKMARK} Beautiful terminal UI with live graphs"
echo -e "  ${CHECKMARK} Cross-platform support"
echo -e "  ${CHECKMARK} Export results to JSON"
echo -e "  ${CHECKMARK} Advanced network metrics (jitter, packet loss, etc.)"
echo ""

echo -e "${BOLD}Resources:${NC}"
echo -e "  ${INFO} Documentation: ${BLUE}https://github.com/${REPO}${NC}"
echo -e "  ${INFO} Report Issues: ${BLUE}https://github.com/${REPO}/issues${NC}"
echo -e "  ${INFO} View Help: ${CYAN}pingu --help${NC}"
echo ""

# System-specific notes
if [ "$OS_NAME" = "darwin" ]; then
    echo -e "${BOLD}macOS Note:${NC}"
    echo -e "  ${INFO} You may need to allow Pingu in System Preferences > Security & Privacy"
    echo ""
elif [ "$OS_NAME" = "windows" ]; then
    echo -e "${BOLD}Windows Note:${NC}"
    echo -e "  ${INFO} Run as Administrator for best results"
    echo -e "  ${INFO} Windows Defender may need to allow the application"
    echo ""
fi

print_color "$GREEN" "Happy pinging! ${PENGUIN}"
echo ""
