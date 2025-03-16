# Raspberry Pi Setup Guide

## Setup OS

On another Linux machine, plug in the microSD card.

1. Download and select an OS:
   - `2024-11-19-raspios-bookworm-arm64-lite.img.xyz` (a lightweight operating system that should perform well)

2. Setup the imager:
   ```bash
   sudo rpi-imager -c ~/Downloads/2024-11-19-raspios-bookworm-arm64-lite.img.xyz
   ```

3. This will open up the imager. Specify the microSD card and install the OS.

4. Once installed, insert the microSD card into the Raspberry Pi slot. It will now boot into the OS.

## Initial System Configuration

Update and upgrade the system:
```bash
sudo apt update
sudo apt upgrade
sudo reboot
```

## Desktop Environment Setup

Install and configure LightDM display manager:
```bash
sudo apt install lightdm
sudo systemctl enable lightdm
sudo systemctl start lightdm
sudo reboot
```

Install i3 window manager and related components:
```bash
sudo apt install i3 i3status dmenu i3lock
```

> **Note:** After rebooting, you may only see a terminal login screen. You'll need to manually start LightDM. This is an unresolved issue that requires further investigation.

## Essential Software Installation

Install commonly used applications:
```bash
sudo apt install chromium git neofetch tmux zsh nitrogen gnome-terminal vim pcmanfm
sudo apt update
sudo apt upgrade
sudo reboot
```

## Shell Configuration

Set GNOME Terminal as the base terminal and ZSH as the startup shell:
```bash
chsh -s $(which zsh)
```

Install Oh My Zsh:
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## Personalized Workflow

Clone your configuration files:
```bash
git clone https://github.com/archiGrad/.config
```

## Game Testing

Clone the game repository:
```bash
git clone https://github.com/archiGrad/PARADE_webgl_g1
```

## Web Environment Setup

Create and configure a Python virtual environment:
```bash
python -m venv website
source website/bin/activate
pip install qrcode flask requests pillow
```

## Performance Testing

Launch Chromium in kiosk mode:
```bash
chromium --kiosk http://127.0.0.1:5000
```

For potentially better performance, try:
```bash
chromium --enable-gpu-rasterization --enable-zero-copy
```

## Other Configurations

Ensure US keyboard layout:
```bash
sudo setxkbmap us
```

Add this command to your i3 config file for automatic execution on startup.

## Todo List

- [ ] Configure Raspberry Pi to prevent sleep/standby mode (check boot settings)
- [ ] Install a vim-based browser to eliminate the need for a mouse, essential for on-the-spot installations where the Pi is embedded

