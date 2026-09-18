# MK: Legacy Arena

An action-packed HTML5 / JavaScript canvas arena brawler inspired by *Mighty Knight* and *Mighty Knight Legacy*. Battle through multiple campaign stages, recruit AI companions to fight by your side, unlock and upgrade hero classes, and take down multi-phase bosses!

Live Demo (via GitHub Pages): **[https://benjamin-brinkerhoff.github.io/mk/](https://benjamin-brinkerhoff.github.io/mk/)**

---

## ⚔️ Key Features

* **4 Distinct Hero Classes & Companions**:
  * **Sir Valen (Paladin)**: High health, heavy blade combos, *Shield Slam*, *Whirlwind Blade*, and invulnerable *Holy Aegis*.
  * **Lyra Windrunner (Ranger)**: High agility, swift ranged shots, *Arrow Barrage*, piercing *Gale Shot*, and screen-wide *Rain of Arrows*.
  * **Ignis (Pyromancer)**: Exploding firebolts, *Flame Pillar*, radial *Fire Wave*, and devastating *Cataclysm Meteor*.
  * **Kael (Shadow Rogue)**: Lethal dual daggers, *Shadow Strike* teleportation, 360-degree *Blade Fan*, and dashing *Blade Tempest*.
* **Party & AI Companion System**:
  * Deploy into combat with up to **2 AI companions** fighting alongside you. Companions automatically target foes, stay in formation, and cast abilities.
* **6 Diverse Campaign Stages & Bosses**:
  1. **Stage 1: Royal Courtyard** — Boss: *Warlord Grimgor* (Ground slam & shockwaves)
  2. **Stage 2: Whispering Woods** — Boss: *Fenrir Bloodfang* (Lunge dashes & shadows)
  3. **Stage 3: Crypt of the Damned** — Boss: *Lord Malakar the Lich* (Bone spears & minion waves)
  4. **Stage 4: Molten Depths** — Boss: *Ignis Rex the Magma Golem* (Volcanic fissures)
  5. **Stage 5: Frostpeak Bastion** — Boss: *General Frostfall* (Freezing blizzard blasts)
  6. **Stage 6: The Dread Citadel** — Final Boss: *Overlord Morvath the Undying* (Two combat phases with apocalypse meteor storms)
* **Persistent Armory & Upgrades**:
  * Earn Gold and Gems from battle.
  * Upgrade Max Health, Attack Damage, Armor / Damage Reduction, Movement Speed, Critical Strike Chance, and Skill Cooldowns.
  * Progress is saved in your browser (`localStorage`).
* **Dynamic Procedural Audio**:
  * Real-time sound synthesis and battle music using the **Web Audio API** (no external audio asset dependencies or 404s).
* **Cross-Platform & Mobile Friendly**:
  * Full keyboard/mouse controls on desktop.
  * Responsive on-screen touch joystick and virtual action buttons for mobile & tablets.

---

## 🎮 Controls

| Action | Desktop (Keyboard / Mouse) | Mobile (Touch) |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Left) |
| **Attack / Combo** | `Space`, `J`, or `Left Click` | ⚔️ Button |
| **Dash / Dodge** | `Shift` | 💨 Button |
| **Skill 1** | `K`, `Q`, or `Right Click` | 💥 Button |
| **Skill 2** | `L` or `E` | 🌪️ Button |
| **Ultimate** | `U` or `R` | ⚡ Button |
| **Pause** | `P` or `Esc` | ⏸️ Button |

---

## 🚀 How to Enable GitHub Pages

To host and play the game directly in your browser:

1. Open this repository on GitHub: [benjamin-brinkerhoff/mk](https://github.com/benjamin-brinkerhoff/mk).
2. Click on **Settings** (top navigation tab).
3. In the left sidebar under *Code and automation*, click **Pages**.
4. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5. Under **Branch**, select `main` and set the folder to `/ (root)`.
6. Click **Save**.
7. In a minute or two, your game will be live at:
   `https://benjamin-brinkerhoff.github.io/mk/`

---

## 🛠️ Local Development

Simply clone the repository and open `index.html` in any modern web browser:

```bash
git clone https://github.com/benjamin-brinkerhoff/mk.git
cd mk
python3 -m http.server 8000
```
