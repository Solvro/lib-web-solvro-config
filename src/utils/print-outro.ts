import * as p from "@clack/prompts";
import c from "picocolors";

import { REPO_URL } from "../constants";
import { formatLink } from "./format-link";

const PROJECT_DOCS_URL =
  "https://docs.solvro.pl/projects/creating#konfiguracja-repozytorium";

export const printOutro = () => {
  p.log.success("Konfiguracja zakończona pomyślnie!");
  p.note(
    `\
1. ${c.white(`${c.bold("Obowiązkowo")} zapoznaj się z ${c.cyan("dokumentacją tworzenia projektów")}:`)}
   ${formatLink(PROJECT_DOCS_URL)}
2. ${c.white(`Pamiętaj o zostawianiu nam ${c.yellow("gwiazdek na GitHubie")}! ⭐`)}
   ${formatLink(REPO_URL)}`,
    "Kolejne kroki",
  );
  p.outro("Miłego dnia! 👋");
};
