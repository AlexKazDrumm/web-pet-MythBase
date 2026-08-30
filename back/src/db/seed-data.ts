export interface SeedLocation {
  name: string;
  children?: SeedLocation[];
}

export interface SeedCreature {
  name: string;
  type: string;
  coverLink: string;
  description: string;
  locations: string[];
  altNames?: string[];
  nativeNames?: string[];
}

export const seedTypes = ["hero", "beast", "spirit"] as const;

export const seedLocations: SeedLocation[] = [
  {
    name: "Aethergard",
    children: [{ name: "Sunmarch" }, { name: "Hollow Fens" }],
  },
  {
    name: "Vaultlands",
    children: [{ name: "Iron Reach" }, { name: "The Underrun" }],
  },
  {
    name: "Drownward Sea",
    children: [{ name: "Saltglass Shoals" }],
  },
];

export const seedCreatures: SeedCreature[] = [
  {
    name: "Glimmerwyrm",
    type: "beast",
    coverLink: "glimmerwyrm.svg",
    description:
      "A slow, luminous serpent said to drift above marsh water on cold nights. Fen wardens track its glow to find safe crossings.",
    locations: ["Hollow Fens"],
    altNames: ["Lantern Serpent"],
    nativeNames: ["Fen-lys"],
  },
  {
    name: "Ember Verk",
    type: "hero",
    coverLink: "ember-verk.svg",
    description:
      "A wandering smith-champion of Sunmarch who is credited with sealing the first Underrun breach. Stories place her in two ages at once.",
    locations: ["Sunmarch", "Iron Reach"],
    altNames: ["The Sealed Hand"],
  },
  {
    name: "Hollow Choir",
    type: "spirit",
    coverLink: "hollow-choir.svg",
    description:
      "A group-voice heard in abandoned Vaultlands tunnels. It repeats the last words spoken near it, layered and out of time.",
    locations: ["The Underrun"],
    nativeNames: ["Vault-song"],
  },
  {
    name: "Saltglass Ray",
    type: "beast",
    coverLink: "saltglass-ray.svg",
    description:
      "A broad, translucent ray of the Saltglass Shoals whose wings harden in sunlight and soften again after dusk.",
    locations: ["Saltglass Shoals"],
  },
  {
    name: "Marn the Ferryless",
    type: "hero",
    coverLink: "marn-the-ferryless.svg",
    description:
      "A guide who crosses the Drownward Sea without a boat. Sailors leave a coin on the shoal rocks in the hope of calm water.",
    locations: ["Drownward Sea", "Saltglass Shoals"],
  },
  {
    name: "Iron Reach Sentinel",
    type: "spirit",
    coverLink: "iron-reach-sentinel.svg",
    description:
      "A standing shape seen at the Iron Reach gate. It does not move, but travellers report it is always facing them.",
    locations: ["Iron Reach"],
    altNames: ["The Facing One"],
  },
  {
    name: "Grovewalker Briar",
    type: "beast",
    coverLink: "grovewalker-briar.svg",
    description:
      "A thicket-walker of Hollow Fens that carries seedlings in its coat and plants them where the ground is bare.",
    locations: ["Hollow Fens", "Sunmarch"],
    nativeNames: ["Briar-kin"],
  },
  {
    name: "Sunmarch Herald",
    type: "hero",
    coverLink: "sunmarch-herald.svg",
    description:
      "A messenger-figure of Aethergard who is said to arrive one day before any large storm and leave one day after it clears.",
    locations: ["Sunmarch"],
  },
  {
    name: "Deep Tallow",
    type: "spirit",
    coverLink: "deep-tallow.svg",
    description:
      "A dripping light that pools in the lowest Underrun galleries. Miners say it marks air that is safe to breathe.",
    locations: ["The Underrun", "Iron Reach"],
    altNames: ["Candle-below"],
  },
  {
    name: "Aether Coil",
    type: "beast",
    coverLink: "aether-coil.svg",
    description:
      "A ribbon-bodied flyer of the Aethergard uplands. It follows trade caravans and is treated as a sign of an even road ahead.",
    locations: ["Aethergard", "Sunmarch"],
  },
  {
    name: "The Undertow Twins",
    type: "spirit",
    coverLink: "undertow-twins.svg",
    description:
      "Two matched currents in the Drownward Sea that are told of as siblings. One pulls out, the other brings back.",
    locations: ["Drownward Sea"],
    nativeNames: ["Ebb-and-Keep"],
  },
  {
    name: "Vault Warden Oll",
    type: "hero",
    coverLink: "vault-warden-oll.svg",
    description:
      "The keeper credited with mapping the whole Vaultlands network. Every junction stone is said to carry one of Oll's marks.",
    locations: ["Vaultlands", "Iron Reach", "The Underrun"],
    altNames: ["Mapmaker Oll"],
  },
];
