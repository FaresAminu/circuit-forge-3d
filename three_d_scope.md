# Prototype Forge 3D — périmètre technique

La plateforme doit produire des **assemblages conceptuels paramétriques** : un étudiant décrit les cartes, capteurs, câbles et dimensions utiles ; le navigateur reconnaît les composants courants, les dispose dans un boîtier, offre une vue 3D et exporte un modèle. Elle ne doit pas présenter cette géométrie comme un substitut aux fichiers mécaniques certifiés du fabricant.

| Décision | Justification |
| --- | --- |
| Export GLB | Le format glTF/GLB est adapté à la livraison et à l’échange de contenu 3D ; l’exporteur Three.js le prend en charge. [1] |
| Export STL | OpenSCAD propose l’export STL parmi ses formats, ce qui rend le format pertinent pour une étape de fabrication ou de préparation d’impression. [2] |
| Export OpenSCAD paramétrique | L’étudiant garde un fichier simple à modifier pour changer un boîtier, des perçages ou des dégagements avant de passer à une fabrication. |
| Modèles simplifiés de composants | Les dimensions visibles servent à l’implantation et à la discussion. Les perçages, connecteurs, tolérances, alimentation et températures doivent être validés avec la documentation constructeur. |

Les dimensions de référence aident à poser des enveloppes raisonnables, mais elles ne suffisent pas pour une fabrication directe. Le Raspberry Pi 4 dispose d’un plan mécanique officiel lié à sa page de spécifications. [3] NVIDIA décrit le module Jetson Nano comme une carte de 69,6 × 45 mm avec connecteur bord-à-bord ; un kit de développement et un module ne doivent donc pas être confondus dans l’outil. [4]

Pour l’extension du catalogue, la plateforme représente les **cartes d’intégration** et non uniquement les puces brutes. À titre d’exemple, le module DFRobot BME280 de référence mesure 22 × 25 mm, tandis que les documents Raspberry Pi confirment que les modules caméra utilisent des nappes et des connecteurs distincts suivant les cartes. [5] [6] Les ensembles intelligents d’irrigation associent couramment des cartes de calcul, des capteurs de sol et d’ambiance, et des actionneurs ; l’outil les organise donc en zones de contrôle, de mesure, d’alimentation et de sortie plutôt que de les disperser sans logique spatiale. [7]

## Sources

[1] [Three.js — GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html)

[2] [OpenSCAD User Manual — STL Import and Export](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/STL_Import_and_Export)

[3] [Raspberry Pi 4 Model B specifications and mechanical drawing](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/specifications/)

[4] [NVIDIA Jetson Nano technical specifications](https://developer.nvidia.com/embedded/jetson-nano)

[5] [DFRobot — Gravity BME280 Environmental Sensor](https://wiki.dfrobot.com/sen0236/)

[6] [Raspberry Pi — Camera documentation](https://www.raspberrypi.com/documentation/accessories/camera.html)

[7] [IoT electronics in precision irrigation](https://www.sciencedirect.com/science/article/pii/S2772375523001399)
