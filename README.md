# Przewodnik Stylu Solvro

<a aria-label="NPM version" href="https://www.npmjs.com/package/@solvro/config">
  <img alt="" src="https://img.shields.io/npm/v/@solvro/config.svg?style=flat-square&labelColor=000000">
</a>
<a aria-label="License" href="https://github.com/Solvro/lib-web-solvro-config/blob/main/LICENSE.md">
  <img alt="" src="https://img.shields.io/npm/l/@solvro/config.svg?style=flat-square&labelColor=000000">
</a>
<a aria-label="CI status" href="https://github.com/Solvro/lib-web-solvro-config/actions/workflows/ci.yml?query=event%3Apush+branch%3Amain">
  <img alt="" src="https://img.shields.io/github/actions/workflow/status/Solvro/lib-web-solvro-config/ci.yml?event=push&branch=main&style=flat-square&labelColor=000000">
</a>

## Wprowadzenie

To repozytorium zawiera przewodnik stylu Solvro, w tym konfiguracje dla popularnych narzędzi do lintowania i stylizacji.

Dostępne są następujące konfiguracje, zaprojektowane do wspólnego użycia:

- [Prettier](#prettier)
- [ESLint](#eslint)
- [TypeScript](#typescript)

## Wkład

Prosimy o zapoznanie się z naszym [przewodnikiem dotyczącym kontrybucji](https://github.com/Solvro/lib-web-solvro-config/blob/main/CONTRIBUTING.md) przed utworzeniem pull requesta.

## Instalacja

Wszystkie konfiguracje są zawarte w jednym pakiecie `@solvro/config`. Aby zainstalować:

```sh
# Jeśli używasz npm
npm i --save-dev @solvro/config

# Jeśli używasz pnpm
pnpm i --save-dev @solvro/config
```

Niektóre konfiguracje ESLint wymagają zależności pośrednich (peer dependencies). Informacje o nich znajdziesz w sekcji [ESLint](#eslint).

## Prettier

> Uwaga: Prettier jest zależnością pośrednią tego pakietu i powinien być zainstalowany w głównym katalogu projektu.  
> Szczegóły: https://prettier.io/docs/en/install.html

Aby użyć wspólnej konfiguracji Prettiera, dodaj w `package.json`:

```json
{
  "prettier": "@solvro/config/prettier"
}
```

## ESLint

> Uwaga: ESLint jest zależnością pośrednią tego pakietu i powinien być zainstalowany w głównym katalogu projektu.  
> Szczegóły: https://eslint.org/docs/user-guide/getting-started#installation-and-usage

Konfiguracja ESLint jest zaprojektowana jako kompozycyjna.

Dostępne są następujące konfiguracje bazowe, które powinny być zawsze pierwsze w `extends`:

- `@solvro/config/eslint/browser`
- `@solvro/config/eslint/node`

Dodatkowe konfiguracje:

- `@solvro/config/eslint/jest`
- `@solvro/config/eslint/jest-react` (z zasadami dla `@testing-library/react`)
- `@solvro/config/eslint/next` (wymaga `@next/eslint-plugin-next` w tej samej wersji co `next`)
- `@solvro/config/eslint/playwright-test`
- `@solvro/config/eslint/react`
- `@solvro/config/eslint/typescript` (wymaga `typescript` i [dodatkowej konfiguracji](#konfiguracja-eslint-dla-typescripta))
- `@solvro/config/eslint/vitest`

Ze względu na problem z rozpoznawaniem ścieżek konfiguracji przez ESLint, użyj `require.resolve`.

Przykład dla Next.js:

```js
module.exports = {
  extends: [
    require.resolve("@solvro/config/eslint/browser"),
    require.resolve("@solvro/config/eslint/react"),
    require.resolve("@solvro/config/eslint/next"),
  ],
};
```

### Konfiguracja ESLint dla TypeScripta

Niektóre reguły wymagają dodatkowych informacji o typach. Podaj ścieżkę do `tsconfig.json`.

Szczegóły: https://typescript-eslint.io/docs/linting/type-linting

```js
const { resolve } = require("node:path");

const project = resolve(__dirname, "tsconfig.json");

module.exports = {
  root: true,
  extends: [
    require.resolve("@solvro/config/eslint/node"),
    require.resolve("@solvro/config/eslint/typescript"),
  ],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
};
```

### Konfiguracja własnych komponentów dla `jsx-a11y`

Aby dostosować komponenty do `jsx-a11y` w React, np. `Button` jako `button`:

```js
module.exports = {
  root: true,
  extends: [require.resolve("@solvro/config/eslint/react")],
  settings: {
    "jsx-a11y": {
      components: {
        Article: "article",
        Button: "button",
        Image: "img",
        Input: "input",
        Link: "a",
        Video: "video",
      },
    },
  },
};
```

### Konfiguracja zasięgu za pomocą `overrides`

Konfiguracje ESLint można ograniczać do konkretnych ścieżek, aby reguły nie wpływały na inne części projektu.

Przykład dla plików testowych:

```js
module.exports = {
  extends: [require.resolve("@solvro/config/eslint/node")],
  overrides: [
    {
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      extends: [require.resolve("@solvro/config/eslint/jest")],
    },
  ],
};
```

### Uwaga na rozszerzenia plików

Domyślnie reguły TypeScript dotyczą `.ts` i `.tsx`. Przy użyciu `overrides` musisz uwzględnić rozszerzenia:

```js
module.exports = {
  overrides: [
    { files: [`directory/**/*.[jt]s?(x)`], rules: { "my-rule": "off" } },
  ],
};
```

## TypeScript

Ten przewodnik dostarcza wiele konfiguracji TypeScript zgodnie z wersjami Node.js:

| Wersja Node.js | Konfiguracja TypeScript            |
| -------------- | ---------------------------------- |
| v16            | `@solvro/config/typescript/node16` |
| v18            | `@solvro/config/typescript/node18` |
| v20            | `@solvro/config/typescript/node20` |

Aby użyć, w `tsconfig.json`:

```json
{
  "extends": "@solvro/config/typescript/node16"
}
```

Bazowa konfiguracja dostępna jest jako [`@solvro/config/typescript`](./typescript/tsconfig.base.json).
