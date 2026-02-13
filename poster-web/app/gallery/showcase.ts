import { Tracing } from "trace_events";

export type ShowcaseItem = {
  id: string;
  src: string;        // must live in /public
  prompt: string;
  tags?: string[];
  aspect?: string;
  alt?:  string;
};

export const SHOWCASE: ShowcaseItem[] = [
  {
    id: "catering-01",
    src: "/showcase/fiction1.png",
    prompt:
      "",
    tags: ["Cinematic", "Sci-Fi"],
    aspect: "16:9",
  },
  {
    id: "catering-02",
    src: "/showcase/catering2.png",
    prompt:
      "",
    tags: ["Noir", "Thriller"],
    aspect: "4:3",
  },
  {
    id: "catering-03",
    src: "/showcase/catering3.png",
    prompt:
      "",
    tags: ["Animation", "Family"],
    aspect: "1:1",
  },
  {
    id: "fiction-01",
    src: "/showcase/fiction1.png",
    prompt:
      "",
    tags: ["Horror", "Minimal"],
    aspect: "16:9",
  },
  {
    id: "fiction-02",
    src: "/showcase/fiction2.png",
    prompt:
      "",
    tags: ["Horror", "Minimal"],
    aspect: "16:9",
  },
  {
    id: "fiction-03",
    src: "/showcase/fiction3.png",
    prompt:
      "",
    tags: ["Horror", "Minimal"],
    aspect: "16:9",
  },
  {
    id: "futurist-01",
    src: "/showcase/futurist1.png",
    prompt:
      "",
    tags: ["Horror", "Minimal"],
    aspect: "3:4",
  },
  {
    id: "futurist-02",
    src: "/showcase/futurist2.png",
    prompt:
      "Minimal horror poster, foggy forest, single red accent, heavy negative space, eerie atmosphere, subtle grain, cinematic",
    tags: ["Horror", "Minimal"],
    aspect: "3:4",
  },
  {
    id: "kid-01",
    src: "/showcase/kid-minion.png",
    prompt:
      "Minimal horror poster, foggy forest, single red accent, heavy negative space, eerie atmosphere, subtle grain, cinematic",
    tags: ["Horror", "Minimal"],
    aspect: "3:4",
  },
  {
    id: "mysterious-01",
    src: "/showcase/mysterious.png",
    prompt:
      "Minimal horror poster, foggy forest, single red accent, heavy negative space, eerie atmosphere, subtle grain, cinematic",
    tags: ["Horror", "Minimal"],
    aspect: "3:4",
  },
  {
    id: "savana-01",
    src: "/showcase/savana1.png",
    prompt:
      "Minimal horror poster, foggy forest, single red accent, heavy negative space, eerie atmosphere, subtle grain, cinematic",
    tags: ["Horror", "Minimal"],
    aspect: "3:4",
  },
  {
    id: "savana-02",
    src: "/showcase/savana2.png",
    prompt:
      "Minimal horror poster, foggy forest, single red accent, heavy negative space, eerie atmosphere, subtle grain, cinematic",
    tags: ["Horror", "Minimal"],
    aspect: "3:4",
  },
];
