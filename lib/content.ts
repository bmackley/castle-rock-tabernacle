// Educational content for the Learn More page, modeled on the original site's
// "Learning Guides" and "Messages of Christ" video series. Editable in one place.

export interface LearningGuide {
  slug: string;
  title: string;
  summary: string;
}

export const learningGuides: LearningGuide[] = [
  {
    slug: "the-lords-way-of-teaching",
    title: "The Lord's Way of Teaching",
    summary:
      "How God uses symbols, types, and shadows throughout scripture and sacred spaces to teach eternal truths — and why the Tabernacle was a classroom in cloth and gold.",
  },
  {
    slug: "holy-places",
    title: "Holy Places",
    summary:
      "Mountains, tabernacles, and temples as environments of covenant, preparation, and progression — places set apart where heaven and earth meet.",
  },
  {
    slug: "the-promise",
    title: "The Promise",
    summary:
      "Priesthood authority and the work of the High Priest, and how every ordinance pointed forward to Christ as the ultimate and eternal High Priest.",
  },
  {
    slug: "organize-thyself",
    title: "Organize Thyself",
    summary:
      "How the Tabernacle organized the camp of Israel around the presence of God, reflecting heavenly patterns of order, worship, and consecration.",
  },
  {
    slug: "the-courtyard",
    title: "The Courtyard",
    summary:
      "The brazen altar and the laver — sacrifice and cleansing — and how the first steps into the Tabernacle teach repentance and renewal.",
  },
  {
    slug: "the-holy-place",
    title: "The Holy Place",
    summary:
      "The lampstand, the table of showbread, and the altar of incense — light, sustenance, and prayer in the daily worship of the priests.",
  },
  {
    slug: "the-holy-of-holies",
    title: "The Holy of Holies",
    summary:
      "The veil, the ark of the covenant, and the mercy seat — the meeting place of God and man, and its fulfillment in the Atonement of Jesus Christ.",
  },
];

export interface VideoMessage {
  title: string;
  description: string;
}

// "Messages of Christ" video series (narrated by Daniel Smith on the original
// site). Add a real `url` field per item when video hosting is decided.
export const videoSeries = {
  title: "Messages of Christ",
  narrator: "Daniel Smith",
  intro:
    "A short video series walking through the vessels of the Tabernacle, the High Priest, and the sacrificial ordinances — and the way each one testifies of the Savior.",
  episodes: [
    {
      title: "The Vessels of the Tabernacle",
      description:
        "An introduction to the furnishings of the Tabernacle and the symbolism woven into each one.",
    },
    {
      title: "The High Priest",
      description:
        "The garments and calling of the High Priest, and how his ministry foreshadows Christ.",
    },
    {
      title: "The Sacrificial Ordinances",
      description:
        "The offerings and the Day of Atonement, and their fulfillment in the Savior's sacrifice.",
    },
  ] as VideoMessage[],
};
