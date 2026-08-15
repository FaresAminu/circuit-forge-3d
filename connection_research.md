# Références de connexion — Circuit Forge System Planner

Les règles affichées par Circuit Forge doivent rester des **routes fonctionnelles de référence**. Elles ne doivent pas se présenter comme un schéma électrique ou un pinout prêt à alimenter un montage.

| Source | Constat utile pour l’interface | Décision produit |
| --- | --- | --- |
| [Raspberry Pi — documentation matérielle](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) | La documentation officielle sépare explicitement l’alimentation, l’en-tête GPIO, SPI, USB, les schémas et les dessins mécaniques. | Chaque route Raspberry Pi affiche une classe d’interface (GPIO, I²C/SPI, USB, réseau) et un rappel de vérifier le schéma ou le datasheet concerné. |
| [Arduino UNO R3 — documentation matérielle](https://docs.arduino.cc/hardware/uno-rev3/) | L’UNO R3 propose 14 E/S numériques, dont 6 PWM, 6 entrées analogiques, un port USB, une prise d’alimentation et des ressources séparées de pinout, datasheet et schéma. | L’interface peut montrer un contrôleur, une alimentation ou une liaison USB/série, mais ne doit pas inventer une broche précise sans confirmation utilisateur. |
| [ESP32 — API Wi‑Fi officielle](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html) | Le mode point d’accès permet à l’ESP32 de recevoir des connexions d’autres appareils ; le mode station le rattache à un point d’accès existant. | La vue système peut proposer deux scénarios séparés : téléphone/ordinateur vers point d’accès local ESP32, ou prototype ESP32 vers Wi‑Fi existant. |
| [NVIDIA Jetson Nano — spécifications](https://developer.nvidia.com/embedded/jetson-nano) | La page officielle recense Ethernet Gigabit, USB, GPIO, I²C, SPI et UART parmi les interfaces du Nano. | La plateforme représente les classes de liens disponibles, mais conserve le détail exact des connecteurs et des tensions comme une vérification de datasheet. |

## Règle de prudence

Une ligne dans la vue système signifie : « cette liaison doit être résolue lors de la conception ». Elle ne signifie jamais : « branchez ce câble sans autre vérification ». Toute alimentation séparée, adaptation de tension, relais, moteur, pompe, vanne ou travail proche de l’eau doit rester marqué comme une vérification obligatoire avec le superviseur de l’atelier.
