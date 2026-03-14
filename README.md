# Intern WebApp

En intern webapplikasjon bygget med Next.js 14, TypeScript, Prisma (SQLite) og TailwindCSS.

## Funksjoner

- 🔐 Innlogging med NextAuth (e-post + passord)
- 🎟️ Registrering kun med admin-generert passkode (engangsbruk)
- 📋 Oppgavestyring (aktive og ferdige)
- 📅 Ukeplanlegger
- ⚠️ Avviksregistrering
- 👤 Admin-panel for passkodegenerering

---

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Sett opp miljøvariabler

Kopier `.env.example` til `.env.local`:

```bash
cp .env.example .env.local
```

Rediger `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generer-en-sterk-hemmelig-nøkkel"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="din-admin@epost.no"
ADMIN_PASSWORD="ditt-sterke-passord"
```

> **Tips:** Generer NEXTAUTH_SECRET med: `openssl rand -base64 32`

### 3. Sett opp databasen

```bash
npm run db:generate    # Generer Prisma client
npm run db:push        # Opprett tabeller i SQLite
```

### 4. Opprett admin-bruker

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Eller legg til i `package.json` scripts og kjør:
```bash
npm run db:seed
```

### 5. Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000)

---

## Bruksflyt

### Første gang (admin-oppsett)
1. Logg inn på `/login` med admin-e-post og passord fra `.env.local`
2. Gå til **Admin panel** i sidemenyen
3. Klikk **Generer ny passkode** og kopier koden
4. Del koden med brukeren som skal registrere seg

### Ny bruker registrerer seg
1. Gå til `/register`
2. Fyll inn navn, e-post, passord og passkoden fra admin
3. Etter vellykket registrering → logg inn på `/login`

### Dashboard
- **Oppgaver** – Legg til, fullfør og slett oppgaver
- **Ferdige oppgaver** – Se fullførte oppgaver, marker som aktiv igjen
- **Ukeplan** – Planlegg aktiviteter per dag for gjeldende uke
- **Avvik** – Registrer avvik, oppdater status (åpen → behandles → løst)

---

## Prosjektstruktur

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── register/             # Brukerregistrering
│   │   ├── tasks/                # CRUD oppgaver
│   │   ├── weekplan/             # CRUD ukeplan
│   │   ├── avvik/                # CRUD avvik
│   │   └── admin/invite/         # Passkodegenerering (admin)
│   ├── dashboard/
│   │   ├── page.tsx              # Oversikt med 4 kort
│   │   ├── oppgaver/             # Aktive oppgaver
│   │   ├── ferdige/              # Fullførte oppgaver
│   │   ├── ukeplan/              # Ukeplanlegger
│   │   ├── avvik/                # Avviksregister
│   │   └── admin/                # Admin-panel
│   ├── login/                    # Innloggingsside
│   ├── register/                 # Registreringsside
│   └── page.tsx                  # Landingsside
├── components/
│   ├── Sidebar.tsx               # Navigasjonsmeny
│   ├── TaskList.tsx              # Oppgaveliste-komponent
│   ├── WeekPlanView.tsx          # Ukeplan-komponent
│   ├── DeviationList.tsx         # Avviksliste-komponent
│   └── AdminInvitePanel.tsx      # Admin passkode-panel
└── lib/
    ├── auth.ts                   # NextAuth konfigurasjon
    └── prisma.ts                 # Prisma klient singleton

prisma/
├── schema.prisma                 # Database-modeller
└── seed.ts                       # Admin-bruker seed
```

---

## Tech Stack

| Teknologi | Versjon | Bruk |
|-----------|---------|------|
| Next.js | 14 | App Router, SSR/SSG |
| TypeScript | 5 | Type-sikkerhet |
| Prisma | 5 | ORM og databaseklient |
| SQLite | – | Lokal database (lett å bytte til PostgreSQL) |
| NextAuth.js | 4 | Autentisering |
| TailwindCSS | 3 | Styling |
| bcryptjs | – | Passordhashing |

---

## Bytte til PostgreSQL (produksjon)

I `prisma/schema.prisma`, endre:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Og oppdater `DATABASE_URL` i `.env.local`:
```env
DATABASE_URL="postgresql://bruker:passord@localhost:5432/intern_app"
```

---

## Neste steg / Planlagte funksjoner

- [ ] Egendefinert styling (tema, farger, fonter)
- [ ] Brukeradministrasjon i admin-panel
- [ ] Notifikasjoner / påminnelser
- [ ] Eksport av oppgaver/ukeplan til PDF
- [ ] Navigering mellom uker i ukeplanen
- [ ] Søk og filtrering i oppgaver
