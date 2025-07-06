# @solvro/config

[![CI](https://github.com/Solvro/lib-web-solvro-config/workflows/CI/badge.svg)](https://github.com/Solvro/lib-web-solvro-config/actions/workflows/ci.yml)
[![Integration Tests](https://github.com/Solvro/lib-web-solvro-config/workflows/Integration%20Tests/badge.svg)](https://github.com/Solvro/lib-web-solvro-config/actions/workflows/integration-tests.yml)

## Instalacja

Wszystkie konfiguracje są zawarte w jednej paczce `@solvro/config`. Aby zainstalować:

### Tryb interaktywny (zalecany)

```sh
npx @solvro/config
```

I przeklikaj się przez kreatora, polecam klikać cały czas enter, to dostaniesz zalecane konfiguracje. Można uruchamiać pare razy :3

### Tryb nieinteraktywny (z flagami CLI)

Jeśli pracujesz w środowisku bez interaktywnej powłoki (np. CI/CD), możesz użyć flag CLI:

```sh
# Zainstaluj wszystkie narzędzia
npx @solvro/config --all

# Zainstaluj wybrane narzędzia
npx @solvro/config --eslint --prettier --commitlint

# Wymuś instalację bez sprawdzania Git
npx @solvro/config --force --all
```

#### Dostępne flagi

- `--all`, `-a` - zainstaluj wszystkie narzędzia (ESLint, Prettier, GitHub Actions, Commitlint)
- `--eslint` - zainstaluj konfigurację ESLint
- `--prettier` - zainstaluj konfigurację Prettier
- `--gh-action` - zainstaluj GitHub Actions
- `--commitlint` - zainstaluj konfigurację Commitlint
- `--force`, `-f` - pomiń sprawdzenie czy Git jest czysty
- `--help` - wyświetl pomoc

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

## Development & Testing

### Integration Tests

Projekt zawiera kompleksowe testy integracyjne, które testują instalację i działanie konfiguracji na świeżej aplikacji Next.js:

```sh
# Uruchom testy integracyjne lokalnie
npm run test:integration

# Lub bezpośrednio
./scripts/test-integration.sh
```

### Continuous Integration

Testy integracyjne są automatycznie uruchamiane w CI/CD dla:

- Różnych wersji Node.js (20, 22)
- Różnych wersji Next.js (latest, canary)
- Testowania poszczególnych narzędzi (ESLint, Prettier, Commitlint, GitHub Actions)
- Warunków błędów i edge cases

Testy obejmują:

- ✅ Tworzenie świeżej aplikacji Next.js
- ✅ Instalację @solvro/config
- ✅ Konfigurację wszystkich narzędzi
- ✅ Uruchamianie ESLint i Prettier
- ✅ Weryfikację formatowania kodu
- ✅ Build aplikacji Next.js
- ✅ Testowanie warunków błędów
