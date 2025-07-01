<div align="center">

![Pingu Logo](assets/logo.svg)

# 🐧 PINGU

**A modern ping utility with beautiful CLI output, real-time network analysis, and comprehensive performance metrics**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0%2B-black.svg)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Contributing](#contributing)

</div>

---

## ✨ Features

- 🎨 **Beautiful Terminal UI** - Built with [Ink](https://github.com/vadimdemedes/ink) and [Ink UI](https://github.com/vadimdemedes/ink-ui) components
- 📊 **Real-time Monitoring** - Live ping results with animated progress indicators
- 🔍 **Comprehensive Analysis** - Detailed network quality metrics, jitter analysis, and performance scoring
- 📱 **Responsive Design** - Adapts to different terminal sizes (narrow, medium, wide layouts)
- 🌐 **Cross-platform** - Works on Windows, macOS, Linux, and OpenBSD
- 📁 **Export Support** - Save detailed analysis results to JSON files
- 🎯 **Advanced Metrics** - Packet loss, response time distribution, streak analysis, and more
- ⚡ **Fast & Lightweight** - Single binary with no dependencies

## 🚀 Quick Start

### One-line Installation

```bash
# Install latest version for your platform (auto-detects OS/arch)
curl -fsSL https://raw.githubusercontent.com/ali-master/pingu/main/scripts/install.sh | sh
```

> **Note**: The installer automatically detects your operating system and CPU architecture, downloads the appropriate binary, and installs it to your system. It will try to install to `/usr/local/bin` (with sudo if needed) or fall back to `~/bin`.

### Platform-specific Downloads

#### macOS
```bash
# Apple Silicon (M1/M2)
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-darwin-arm64 -o pingu
chmod +x pingu && sudo mv pingu /usr/local/bin/

# Intel
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-darwin-amd64 -o pingu
chmod +x pingu && sudo mv pingu /usr/local/bin/
```

#### Linux
```bash
# x86_64
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-linux-amd64 -o pingu
chmod +x pingu && sudo mv pingu /usr/local/bin/

# ARM64
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-linux-arm64 -o pingu
chmod +x pingu && sudo mv pingu /usr/local/bin/

# ARM (32-bit)
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-linux-arm -o pingu
chmod +x pingu && sudo mv pingu /usr/local/bin/
```

#### Windows
```powershell
# x86_64
Invoke-WebRequest -Uri "https://github.com/ali-master/pingu/releases/latest/download/pingu-windows-amd64.exe" -OutFile "pingu.exe"

# ARM64
Invoke-WebRequest -Uri "https://github.com/ali-master/pingu/releases/latest/download/pingu-windows-arm64.exe" -OutFile "pingu.exe"
```

#### OpenBSD
```bash
# x86_64
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-openbsd-amd64 -o pingu
chmod +x pingu && doas mv pingu /usr/local/bin/

# ARM64
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-openbsd-arm64 -o pingu
chmod +x pingu && doas mv pingu /usr/local/bin/
```

### Upgrading Pingu

#### Automatic Upgrade

```bash
# Run the installer again to upgrade to the latest version
curl -fsSL https://raw.githubusercontent.com/ali-master/pingu/main/scripts/install.sh | sh
```

The installer will:
- Detect your existing installation
- Prompt you to confirm the upgrade
- Backup your current binary (with timestamp)
- Install the latest version
- Verify the installation

#### Manual Upgrade

```bash
# Check your current version
pingu --version

# Download the latest version for your platform
# (Replace with your specific platform from the examples above)
curl -L https://github.com/ali-master/pingu/releases/latest/download/pingu-linux-amd64 -o pingu-new

# Replace the existing binary
chmod +x pingu-new
sudo mv pingu-new /usr/local/bin/pingu

# Verify the upgrade
pingu --version
```

#### Version Management

```bash
# Check latest release version
curl -s https://api.github.com/repos/ali-master/pingu/releases/latest | grep tag_name

# Download a specific version (replace v1.0.0 with desired version)
curl -L https://github.com/ali-master/pingu/releases/download/v1.0.0/pingu-linux-amd64 -o pingu
```

### From Source

```bash
# Prerequisites: Bun 1.0+
git clone https://github.com/ali-master/pingu.git
cd pingu
bun install
bun run build

# Binary will be available at ./dist/pingu
```

## 📖 Usage

### Basic Usage

```bash
# Ping a host continuously
pingu google.com

# Ping with specific count
pingu -c 10 8.8.8.8

# Ping with custom interval and timeout
pingu --count 5 --interval 2 --timeout 10 example.com

# Export results to JSON
pingu -e --count 20 cloudflare.com
```

### Command Line Options

```
Usage
  $ pingu <host>

Options
  --count, -c       Number of ping packets to send (default: unlimited)
  --interval, -i    Wait interval seconds between sending each packet (default: 1)
  --timeout, -t     Time to wait for a response, in seconds (default: 5)
  --size, -s        Number of data bytes to be sent (default: 56)
  --export, -e      Export results to JSON file after completion

Examples
  $ pingu google.com
  $ pingu -c 10 8.8.8.8
  $ pingu --count 5 --interval 2 example.com
  $ pingu -e -c 100 cloudflare.com
```

### Interface Overview

Pingu provides a comprehensive real-time interface that includes:

- **📡 Live Feed** - Real-time ping results with status indicators
- **📊 Quick Statistics** - Packet counts, success rates, and loss percentages
- **📈 Performance Overview** - Success/error rate progress bars
- **🌐 Network Quality** - Overall network quality scoring and assessment
- **⏱️ Response Time Analysis** - Min, max, average, median, and jitter metrics
- **🔥 Streak Analysis** - Current and historical success/failure streaks
- **🚨 Error Analysis** - Detailed breakdown of timeout and unreachable errors
- **🔬 Advanced Metrics** - Response time distribution and sequence analysis

## 🎨 Responsive Design

Pingu automatically adapts its interface based on your terminal size:

- **Narrow (< 60 cols)**: Compact layout with essential information
- **Medium (60-120 cols)**: Standard layout with most features
- **Wide (≥ 120 cols)**: Full layout with advanced metrics and dual-column displays

## 📊 Network Quality Metrics

Pingu analyzes your network connection and provides detailed metrics:

- **Network Quality Score** (0-100): Overall connection quality
- **Jitter Analysis**: Response time variability measurement
- **Consistency Score**: Network stability assessment
- **Packet Loss Tracking**: Real-time loss percentage calculation
- **Response Time Distribution**: Categorized latency analysis
- **Streak Tracking**: Success/failure pattern analysis

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh/) 1.0+ (recommended) or Node.js 18+
- TypeScript 5.0+

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ali-master/pingu.git
cd pingu

# Install dependencies
bun install

# Start development mode
bun run dev

# Type checking
bun run typecheck

# Run tests
bun run test

# Build for production
bun run build
```

### Project Structure

```
pingu/
├── src/
│   ├── cli.tsx           # CLI entry point and argument parsing
│   ├── app.tsx           # Main React component with responsive UI
│   ├── analyzer.ts       # Ping output analysis logic
│   ├── types/
│   │   ├── entry.ts      # Ping entry type definitions
│   │   └── analysis-result.ts # Analysis result interface
│   └── helpers/
│       └── parse-line.ts # Ping output parsing utilities
├── assets/               # Logo designs and brand assets
├── dist/                # Compiled binary output
└── scripts/             # Build and deployment scripts
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Areas for Contribution

- 🐛 Bug fixes and performance improvements
- ✨ New features and analysis metrics
- 📱 UI/UX enhancements and responsive design
- 🌍 Internationalization and localization
- 📚 Documentation improvements
- 🧪 Test coverage expansion

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using [Ink](https://github.com/vadimdemedes/ink) and [Ink UI](https://github.com/vadimdemedes/ink-ui)
- Inspired by traditional ping utilities but with modern UX principles
- Special thanks to the open-source community for tools and libraries

---

<div align="center">

**[⬆ Back to Top](#-pingu)**

Made with 🐧 by [Ali Torki](https://github.com/ali-master)

</div>
