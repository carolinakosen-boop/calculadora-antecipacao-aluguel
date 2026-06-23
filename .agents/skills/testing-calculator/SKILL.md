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

### Standard test case (flat rate discount)

| Input | Value |
|---|---|
| Aluguel mensal | R$ 2.000,00 |
| Prazo do contrato | 24 meses |
| Meses a antecipar | 12 meses |
| Taxa de desconto | 2,50% |

**Expected outputs:**
- Valor antecipado estimado: **R$ 23.400,00**
- Valor total sem desconto: **R$ 24.000,00**
- Desconto total (juros): **- R$ 600,00**
- Percentual de desconto: **2,50%**
- Month table: 12 rows, each row: R$ 2.000,00 aluguel / R$ 50,00 desconto / R$ 1.950,00 valor liquido
- Footer: R$ 24.000,00 / R$ 23.400,00

The formula is flat percentage: `Desconto = ValorTotal * (taxa / 100)`, `ValorAntecipado = ValorTotal - Desconto`.
All monthly rows are uniform (same desconto/liquido per month) since the rate is flat, not compound.

### Secondary test case (different rate)

| Input | Value |
|---|---|
| Aluguel mensal | R$ 1.000,00 |
| Prazo do contrato | 12 meses |
| Meses a antecipar | 6 meses |
| Taxa de desconto | 5,00% |

**Expected outputs:**
- Valor antecipado estimado: **R$ 5.700,00**
- Valor total sem desconto: **R$ 6.000,00**
- Desconto total: **- R$ 300,00**
- Percentual: **5,00%**
- Each row: R$ 50,00 desconto / R$ 950,00 liquido

## UI Labels

Current labels (as of PR #4):
- Rate field label: **"Taxa de desconto"** (NOT "Taxa de juros mensal")
- Rate suffix: **"%"** (NOT "% a.m.")
- Table headers: **Mes | Aluguel | Desconto | Valor liquido** (NOT "Fator de desconto" or "Valor presente")

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
- Verify table rows are **uniform** (same desconto per row = flat rate confirmed)
- Check disclaimer text appears at bottom
- Test with a second set of inputs to confirm formula works generally

### Responsive Tests
- Use Chrome DevTools responsive mode (Ctrl+Shift+M with DevTools open)
- At ~400px width: bird scales down, form stacks vertically, layout doesn't overflow

## Tips

- The currency input has a mask — type digits only (e.g., type `200000` for R$ 2.000,00)
- The rate input does NOT auto-format — type the value directly with comma (e.g., `2,50` not `250`)
- Results panel appears with slide-down animation after clicking "Calcular Antecipacao"
- No authentication or API calls — everything is client-side
- No CI configured — rely on local testing only
- GitHub Pages deploys from `/docs` folder on `main` branch

## Devin Secrets Needed

None. This is a fully static client-side app with no authentication.
