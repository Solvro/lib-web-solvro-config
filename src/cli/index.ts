import * as p from "@clack/prompts";
import c from "picocolors";

import { getProjectType } from "../utils/get-project-type";

p.intro(`${c.bold(c.bgBlue("  @solvro/config  "))}`);

const projectType = getProjectType();

const polishConfirm = async (props: p.ConfirmOptions) => {
  return p.confirm({
    active: "Tak",
    inactive: "Nie",
    ...props,
  });
};

if (projectType === "adonis") {
  const isConfirmed = await polishConfirm({
    message: `Wygląda jakbyś używał Adonisa. Czy to się zgadza?`,
  });

  if (!isConfirmed) {
    p.cancel("Zgłoś błąd na GitHubie :(, a my spróbujemy pomóc.");
    process.exit(1);
  }
}

if (projectType === "next") {
  const isConfirmed = await polishConfirm({
    message: `Wygląda jakbyś używał Next.js. Czy to się zgadza?`,
  });

  if (!isConfirmed) {
    p.cancel("Zgłoś błąd na GitHubie :(, a my spróbujemy pomóc.");
    process.exit(1);
  }
}

if (projectType === "node") {
  p.cancel(
    "Nie znaleziono ani Adonisa, ani Next.js. Musisz ręcznie konfigurować projekt.",
  );
  process.exit(1);
}

const additionalTools = await p.multiselect({
  message: `Które rzeczy Cię interesują? ${c.gray("zaznacz spacją, potwierdź enterem")}`,
  initialValues: ["eslint", "prettier", "gh-action"],
  options: [
    {
      value: "eslint",
      label: `${c.bold(c.blueBright("ESLint"))}`,
      hint: "sprawdzanie jakości kodu",
    },
    {
      value: "prettier",
      label: `${c.bold(c.yellowBright("Prettier"))}`,
      hint: "formatowanie",
    },
    {
      value: "gh-action",
      label: `${c.bold("GitHub Actions")}`,
      hint: "automatyczne testy na Githubie",
    },
  ],
  required: false,
});

await p.tasks([
  {
    title: "Instalowanie @solvro/config",
    task: async () => {
      await p.exec("npm install --save-dev @solvro/config");
    },
  },
]);
