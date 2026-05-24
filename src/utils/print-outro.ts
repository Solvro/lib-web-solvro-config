import * as p from "@clack/prompts";
import c from "picocolors";

import { REPO_URL } from "../constants";
import { formatLink } from "./format-log";

export const printOutro = () => {
  p.log.success("Konfiguracja zakończona pomyślnie!");
  p.note(
    `\
1. ${c.white(`${c.bold("Obowiązkowo")} zapoznaj się z ${c.cyan("dokumentacją tworzenia projektów")}:`)}
   ${formatLink("https://docs.solvro.pl/projects/creating")}
2. ${c.white(`Pamiętaj o zostawianiu nam ${c.yellow("gwiazdek na GitHubie")}! ⭐`)}
   ${formatLink(REPO_URL)}`,
    "Kolejne kroki",
  );
  p.outro("Miłego dnia! 👋");
};
