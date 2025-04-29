# @solvro/config

## Instalacja

Wszystkie konfiguracje są zawarte w jednej paczce `@solvro/config`. Aby zainstalować:

```sh
npx @solvro/config
```

I przeklikaj się przez kreatora, polecam klikać cały czas enter, to dostaniesz zalecane konfiguracje. Można uruchamiać pare razy :3

## Prettier

Aby użyć configu dodaj to pole w `package.json`:

```json
{
  "prettier": "@solvro/config/prettier"
}
```

## Eslint

Wymagany jest `eslint` w wersji `9` lub nowszej oraz package.json powinien mieć pole

```json
{
  "type": "module"
}
```

Konfiguracja eslinta:

```js
// eslint.config.js
import { solvro } from "@solvro/config/eslint";

export default solvro();
```

Config sam wykryje czy używasz NextJSa czy Adonisa.
