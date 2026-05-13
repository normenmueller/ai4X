# ai4X User Journey

<!--
scout  = LLM-Interview
curate = LLM-Matching
spawn  = mechanisch
-->

Die ai4X User Journey startet in einem lokalen Verzeichnis - z.B.:

```
~/Sandbox/ai4x-tst/proja
>
```

Dort möchte man ein neues Vorhaben starten. Dafür benötigt man ein Team. Ein Team aus Exerperten deren kognitive Fähigkeiten und Zusammenarbeitsmodell optimal auf das Vorhaben bzw. die darin herrschenden Bedarfe abgestimmt und ausgerichtet sind.

## Bedarfsidentifikation (`scout`)

Zuerst müssen aber die eigentliche Bedafe identifiziert werden - wir gehen davon aus, dass der Nutzer meist mit dem "WIE" ins Rennen geht, statt mit dem "WAS". Also führen wir ein geregeltes, methodisches Interview durch:

```
~/Sandbox/ai4x-tst/proja
> ai4x scout --runtime altman

╭──────────────────────────────────────────────╮
│ >_ OpenAI Codex (v0.130.0)                   │
│                                              │
│ model:     gpt-5.5 medium   /model to change │
│ directory: ~/Sandbox/ai4x-tst/proja          │
╰──────────────────────────────────────────────╯

  Tip: GPT-5.5 is now available in Codex. It's our strongest agentic coding
  model yet, built to reason through large codebases, check assumptions
  with tools, and keep going until the work is done.

  Learn more: https://openai.com/index/introducing-gpt-5-5/


› Write tests for @filename

  gpt-5.5 medium · ~
```

[...]

Das Ergebnis ist:

```
~/Sandbox/ai4x-tst/proja
> tree -a -L 3 .
.
└── .ai4x
    ├── config.yaml
    └── spc
        ├── AI4X
        └── Needs.hs

4 directories, 2 files
```

## Teamkuration (`curate`)

[...]

Hinweis: mMn sollte `curate` das Mapping-Ergebnis (welche Need → welche Caps) transparent protokollieren, damit der PO es reviewen kann!

## Host-specific Activation (`spawn`)

[...]
