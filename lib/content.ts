// Educational content for the Learn More page, carried over from the original
// castlerocktabernacle.com/learnmore and cleaned up. Editable in one place.

export interface LearningGuide {
  title: string;
  summary: string;
  pdfUrl: string;
}

// Seven Learning Guides — titles, summaries, and PDFs from the original site.
export const learningGuides: LearningGuide[] = [
  {
    title: "The Lord's Way of Teaching",
    summary:
      "The Lord teaches His children through symbols — simple, powerful likenesses found in the scriptures, ordinances, and the world around us. As we study with faith, symbols help eternal principles become personal, memorable, and transformative, bearing record of Christ in both temporal and spiritual ways.",
    pdfUrl:
      "https://1bb21678-ff30-40c8-8f94-61b70172d45f.filesusr.com/ugd/645230_00bf456a9c414f1094a85620065fcf4c.pdf",
  },
  {
    title: "Holy Places",
    summary:
      "From the Garden of Eden to modern temples, the Lord has taught His children through sacred spaces set apart for His presence. Mountains, tabernacles, and temples all follow the same pattern: ascending step by step toward holiness, guided by covenants, mediation, and divine ordinances.",
    pdfUrl:
      "https://1bb21678-ff30-40c8-8f94-61b70172d45f.filesusr.com/ugd/645230_6b304c1605a54b0ba36da785abfd214b.pdf",
  },
  {
    title: "The Promise",
    summary:
      "God promised Israel that through His covenant they could become a holy nation and a kingdom of priests. Beginning with Abraham, priesthood authority was given to bless all nations, with symbols and ordinances pointing forward to Jesus Christ, the true High Priest, who would fully open the way back to God.",
    pdfUrl:
      "https://www.castlerocktabernacle.com/_files/ugd/645230_e7b61379d4774ddb85f50452ce1d23f2.pdf",
  },
  {
    title: "Organize Thyself",
    summary:
      "To receive the Lord in His sanctuary, Israel was organized around and focused on the Tabernacle. It mirrored His heavenly abode among them, and it was a shadow of the latter-day gathering of Israel around and in His holy house — teaching all who covenant with God who they are and to whom they belong.",
    pdfUrl:
      "https://www.castlerocktabernacle.com/_files/ugd/645230_b86244c65e644c8d97f98b5af0ba5ca7.pdf",
  },
  {
    title: "The Lord's Sanctuary",
    summary:
      "The Tabernacle reveals a progression of holiness — transcending this world toward heavenly space through the Atonement. Each part is a shadow or type of the Savior's mission and atoning sacrifice, a reminder of God's covenants with Israel and His desire to have us return to Him.",
    pdfUrl:
      "https://www.castlerocktabernacle.com/_files/ugd/645230_32e2a4676a6b4fb98350a7f613ff610d.pdf",
  },
  {
    title: "Atonement",
    summary:
      "The sacrificial ordinances provided atonement for the individual, the priest, and all of Israel — the Lord's way of teaching the process of repentance and the price of forgiveness. They foreshadowed the great and final sacrifice that would be made for all mankind by the Son of God.",
    pdfUrl:
      "https://www.castlerocktabernacle.com/_files/ugd/645230_c25c0f4d164d44169a7e1f4e6e2c17ff.pdf",
  },
  {
    title: "Salvation",
    summary:
      "The shadows and types of the Tabernacle prepare all to become holy and enter the Lord's presence — possible only through the sacrifice of the Son of God foreshadowed in its ordinances. The Tabernacle reveals the power of covenants and the saving grace of the Lord's Plan of Salvation: the Way back to Him.",
    pdfUrl:
      "https://www.castlerocktabernacle.com/_files/ugd/645230_ebfc746b17194a9cb8d3dc9523e4615f.pdf",
  },
];

export interface Video {
  youtubeId: string;
  title: string;
  description: string;
}

export interface VideoSection {
  title: string;
  intro: string;
  videos: Video[];
}

// "Messages of Christ" video series, produced and narrated by Daniel Smith.
// Grouped to follow the walk-through order of the Tabernacle itself.
export const videoSeries = {
  title: "Messages of Christ",
  narrator: "Daniel Smith",
  intro:
    "Videos from the Messages of Christ series, produced and narrated by Daniel Smith, bring further insight and depth — the vessels of the Tabernacle, the High Priest, the sacrificial ordinances, and their symbolism pointing to Jesus Christ and His mission.",
};

export const videoSections: VideoSection[] = [
  {
    title: "Start with the Tabernacle",
    intro:
      "An overview of the Tabernacle of Moses — what it was, what it looked like, and the pattern it shares with Eden and the temple.",
    videos: [
      {
        youtubeId: "wVUcJUJBFMU",
        title: "The Tabernacle and the Messiah",
        description:
          "For over 400 years the Tabernacle was the place where the Lord communed with His people and taught them about the coming Messiah, even Jesus Christ.",
      },
      {
        youtubeId: "ceZHlc55HCg",
        title: "3D Tabernacle of Moses",
        description:
          "Ever wonder what the Tabernacle of Moses might have looked like? Experience it like never before with this incredible 3D model.",
      },
      {
        youtubeId: "1mFGsLEpKKk",
        title: "Tabernacle of Moses",
        description:
          "Highlights of a full Tabernacle replica — a glimpse of what walking through the ancient sanctuary feels like.",
      },
      {
        youtubeId: "vQRQZqn3XPU",
        title: "The Temple Hidden in the Garden of Eden",
        description:
          "Hidden within the Bible is a sacred blueprint — a lost paradise, the tragedy of exile, and the promise of return to God's presence through the Messiah.",
      },
      {
        youtubeId: "EuRj9tLHXr4",
        title: "The Tabernacle and the Temple",
        description:
          "The layout and symbolic progression found in both the ancient Tabernacle of Moses and modern temples.",
      },
    ],
  },
  {
    title: "The Courtyard",
    intro:
      "The gate, the altar of sacrifice, and the bronze laver — the first steps toward the presence of God.",
    videos: [
      {
        youtubeId: "9opTZb54IA8",
        title: "Finding Christ in the Gate & Courtyard",
        description:
          "How the Tabernacle gate and courtyard relate to the Savior, with 3D models that show the Tabernacle like never before.",
      },
      {
        youtubeId: "aq0jhO1KDw4",
        title: "Tabernacle Courtyard — 3D Animation",
        description:
          "How the courtyard was constructed, as described in Exodus 27 and Exodus 38.",
      },
      {
        youtubeId: "-c5uWzQfILg",
        title: "Finding Christ in the Altar of Sacrifice",
        description:
          "At the bronze altar Israel learned that only through the shedding of blood could sins be remitted — sacrifices that pointed to the cross of Calvary.",
      },
      {
        youtubeId: "luYWCpE_P_U",
        title: "Altar of Sacrifice — 3D Animation",
        description:
          "How the altar of sacrifice was constructed, as described in Exodus 27 and Exodus 38.",
      },
      {
        youtubeId: "5W0drJ2ClQw",
        title: "The Bronze Laver, Explained",
        description:
          "Priests washed at the laver before serving in the Tabernacle. Its cleansing waters teach that only through the Savior can we become spiritually clean.",
      },
      {
        youtubeId: "WmNE4nxsW6Q",
        title: "Bronze Laver — 3D Animation",
        description:
          "How the bronze laver was constructed, as described in Exodus 30 and Exodus 38.",
      },
    ],
  },
  {
    title: "The Holy Place",
    intro:
      "The table of showbread, the golden menorah, and the altar of incense — light, sustenance, and prayer in the daily worship of the priests.",
    videos: [
      {
        youtubeId: "HnIOkumUNTw",
        title: "The Table of Showbread, Explained",
        description:
          "Each Sabbath the priests shared the twelve loaves in the Lord's presence. Jesus called Himself the bread of life — partake, and live forever.",
      },
      {
        youtubeId: "GYoJNm53KEk",
        title: "Table of Showbread — 3D Animation",
        description:
          "How the table of showbread was constructed, as described in Exodus 25 and Exodus 37.",
      },
      {
        youtubeId: "S9wLTu1ygSo",
        title: "Finding Christ in the Golden Menorah",
        description:
          "The menorah was the only source of light in the holy place — teaching us of our true source of light, even Jesus Christ.",
      },
      {
        youtubeId: "3CiAixEI8go",
        title: "Golden Menorah — 3D Animation",
        description:
          "How the golden menorah was constructed, as described in Exodus 25 and Exodus 37.",
      },
      {
        youtubeId: "ZS79wnUUl7A",
        title: "The Altar of Incense, Explained",
        description:
          "Morning and evening the priest burned incense before the veil, offering prayers for all Israel — a symbol of prayer joined to the Savior's sacrifice.",
      },
      {
        youtubeId: "STrFTcP2kAs",
        title: "Altar of Incense — 3D Animation",
        description:
          "How the golden altar of incense was constructed, as described in Exodus 30 and Exodus 37.",
      },
    ],
  },
  {
    title: "The Holy of Holies & the Day of Atonement",
    intro:
      "Beyond the veil: the ark of the covenant, the mercy seat, and the one day each year the high priest entered.",
    videos: [
      {
        youtubeId: "3a9g8Q7_Wpk",
        title: "Ark of the Covenant, Explained",
        description:
          "The ark stood beyond the veil in the Holy of Holies, entered only on the Day of Atonement — symbolizing the Atonement of Jesus Christ that covers and blots out our sins.",
      },
      {
        youtubeId: "aLKsk3lJf4Y",
        title: "Ark of the Covenant — 3D Animation",
        description:
          "How the Ark of the Covenant was constructed, as described in Exodus 25 and Exodus 37.",
      },
      {
        youtubeId: "4UYT-0AmlnA",
        title: "Understanding the Day of Atonement",
        description:
          "Yom Kippur, the most holy day of the Jewish calendar — no other ancient ritual comes closer to the full meaning of the Atonement of Jesus Christ.",
      },
      {
        youtubeId: "fssPmwOhRf0",
        title: "The Day of Atonement — Leviticus 16",
        description:
          "A reenactment of the Day of Atonement — the scapegoat, the sacrifices, and the high priest entering the Holy of Holies — drawn directly from Leviticus 16.",
      },
    ],
  },
  {
    title: "The Priesthood",
    intro: "The priests who served, their garments, and the Great High Priest they pointed to.",
    videos: [
      {
        youtubeId: "T6h2KhLtFAg",
        title: "Jesus Christ the Great High Priest",
        description:
          "Why Jesus Christ is called the Great High Priest by Paul in the book of Hebrews, and by others.",
      },
      {
        youtubeId: "mznSvWsv0Xc",
        title: "The Jewish Priestly Garments",
        description:
          "The priestly garments as described in Exodus 28, including the clothing of the High Priest and of the ordinary priest.",
      },
    ],
  },
];
