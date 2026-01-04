#!/bin/bash
set -e

echo ">>> Removing conflicting packages (if any)..."
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg || true; done

echo ">>> Setting up Docker's Apt repository..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo ">>> Installing Docker CE..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo ">>> Adding current user ($USER) to docker group..."
sudo usermod -aG docker $USER

echo ">>> Starting Docker service..."
if pidof systemd > /dev/null; then
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "Docker started via systemd."
else
    sudo service docker start
    echo "Docker started via init.d service."
fi

echo "========================================================"
echo "INSTALLATION COMPLETE!"
echo "Please execute this command to refresh your group membership:"
echo "    newgrp docker"
echo "Then you can verify installation with:"
echo "    docker run hello-world"
echo "========================================================"
