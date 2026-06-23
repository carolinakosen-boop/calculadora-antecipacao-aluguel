---
name: testing-calculadora-antecipacao
description: Test the rental advance calculator end-to-end. Use when verifying UI, color theme, or calculation changes.
---

# Testing the Calculadora de Antecipacao de Aluguel

## Overview

Static site (HTML/CSS/JS) in `/docs` folder. No build step, no CI. Serve locally and test in the browser.

## Setup

1. Start a local server:
   ```bash
   cd /home/ubuntu/repos/calculadora-antecipacao-aluguel/docs
   python3 -m http.server 8080 &
   ```
2. Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080` should return `200`.
3. Bird image check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/mellro-bird.png` should return `200`.

## Key Test Values

Standard test case for calculation verification:

| Input | Value |
|---|---|
| Aluguel mensal | R$ 2.000,00 |
| Prazo do contrato | 24 meses |
| Meses a antecipar | 12 meses |
| Taxa de juros | 2,50% a.m. |

**Expected outputs:**
- Valor antecipado estimado: **R$ 20.515,53**
- Valor total sem desconto: **R$ 24.000,00**
- Desconto total (juros): **- R$ 3.484,47**
- Percentual de desconto: **14,52%**
- Month table: 12 rows, first row value presente = R$ 1.951,22

The formula is present value: `VP = Sum(Aluguel / (1 + taxa)^n)` for n=1..N.

## Color Theme

Current palette (as of PR #2):
- Primary blue: `#0352a4` (Mell.ro brand blue)
- Accent green: `#16a34a`
- Background: light blue/green gradient (`#e8f4fd`, `#f0fdf4`, `#e8f1fb`)
- Highlight card bg: `#e8f1fb`

To verify no old purple colors remain:
```bash
grep -riE '#6366f1|#4f46e5|#818cf8|#8b5cf6|indigo|purple' docs/style.css docs/index.html
```
Should return zero matches.

## What to Test

### Visual / Color Tests
- Bird mascot visible in header (~48px desktop, ~36px mobile), left of title
- Title gradient: blue (left) to green (right), no purple
- Button gradient: blue to green, white text readable
- Background: light blue/green tones, no pink/purple/lavender
- Focus rings on inputs: blue glow, not purple
- Highlight card: light blue background

### Calculation Tests
- Use the standard test values above
- Verify all 4 result cards match expected values exactly
- Verify 12-row month-by-month table renders
- Check disclaimer text appears at bottom

### Responsive Tests
- Use Chrome DevTools responsive mode (Ctrl+Shift+M with DevTools open)
- At ~400px width: bird scales down, form stacks vertically, layout doesn't overflow

## Tips

- The currency input has a mask — type digits only (e.g., type `200000` for R$ 2.000,00)
- The interest rate input also has a mask — type `250` for 2,50%
- Results panel appears with slide-down animation after clicking "Calcular Antecipacao"
- No authentication or API calls — everything is client-side
- No CI configured — rely on local testing only
- GitHub Pages deploys from `/docs` folder on `main` branch

## Devin Secrets Needed

None. This is a fully static client-side app with no authentication.
