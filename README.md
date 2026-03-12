# Six Sigma Black Belt — Statistical Reference for Beverage Industry

An interactive web app for Six Sigma Black Belt practitioners working in **production**, **QC labs**, and **auditing** in the beverage industry.

![HTML](https://img.shields.io/badge/HTML5-semantic-orange)
![CSS](https://img.shields.io/badge/CSS3-custom%20properties-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.1-pink)
![No build tools](https://img.shields.io/badge/build%20tools-none-green)

---

## Overview

Covers **9 statistical topic areas**, each illustrated with real beverage industry examples (filling lines, QC labs, sensory panels, supplier audits). No installation, no server, no build step — just open `index.html` in a browser.

---

## Project Structure

```
├── index.html          # Markup — all 9 tab sections
├── Six sigma_Beverage_stats_toolkit.xlsx    # Offline Excel calculation toolkit
├── css/
│   └── style.css       # All styles and design tokens
├── js/
│   └── main.js         # Navigation, modal, accordion, 17 Chart.js charts
├── README.md
├── CHANGELOG.md
└── .gitignore
```

---

## Sections

| # | Tab | Key tools covered |
|---|-----|-------------------|
| 1 | Quick Reference | Sigma/DPMO table, tool selection guide, normality check |
| 2 | Process Capability | Cp, Cpk, Pp, Ppk — formulas, step-by-step example, beverage benchmarks |
| 3 | Control Charts | I-MR, X-bar R, P-chart, Western Electric rules |
| 4 | MSA / Gauge R&R | Repeatability, Reproducibility, %GRR, ndc, Kappa, Bias |
| 5 | Hypothesis Tests | 1-sample t, 2-sample t, paired t, ANOVA, Chi-square |
| 6 | Regression | Pearson r, Spearman ρ, simple & multiple linear regression |
| 7 | DOE | Full factorial 2³, interaction plots, main effects, DOE type guide |
| 8 | Sampling & Auditing | AQL / ISO 2859-1, OC curve, sample size formulas |
| 9 | Non-Parametric | Mann-Whitney U, Kruskal-Wallis, Friedman, transformations |

---

|Excel Statistical Toolkit|
File Six sigma_Beverage_stats_toolkit.xlsx
Automated Calculators: Blue cells for input, results auto-calculate.
Visual Feedback: Cpk colour-coding and decision logic for Hypothesis tests (e.g., Reject/Fail to reject H₀).
Reference Constants: Integrated tables for Control Chart constants ($A_2$, $D_4$, $d_2$) and AQL sample sizes.
---

## Usage

**Local:**
1. Clone or download the repository
2. Open `index.html` in any modern browser

**GitHub Pages:**
1. Go to repository **Settings → Pages**
2. Source: `main` branch, `/ (root)`
3. The app will be live at `https://<username>.github.io/<repo>/`

> **Note:** Fonts and Chart.js load from CDN on the first open and are then cached by the browser.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup, 9 tab sections |
| CSS3 | Custom properties, responsive grid, all UI components |
| Vanilla JavaScript | Tab navigation, modal, accordion, all chart logic |
| [Chart.js 4.4.1](https://www.chartjs.org/) | 17 interactive charts (CDN) |
| [IBM Plex](https://fonts.google.com/specimen/IBM+Plex+Sans) | Typography (Google Fonts CDN) |

No npm, no bundler, no framework. Works offline after the first load.

---

## Contributing

Suggestions, corrections, and new beverage industry examples are welcome.  
Open an issue or submit a pull request.

---

## Author

**Matteo Ferrini** — Beverage Industry | Six Sigma Black Belt

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Matteo%20Ferrini-blue?logo=linkedin)](https://www.linkedin.com/in/matteo-ferrini-beverage/?originalSubdomain=nl)
