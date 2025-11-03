---
title: 自然演繹法とその健全性・完全性
---

# 自然演繹法
## 推論規則
自然演繹法は、命題論理における推論を形式化するための方法の一つであり、主に以下のような**推論規則**から構成される。なお、公理はない。

:::prooftree
rule(
  name: [$→$ I, $1$],
  $(F a ∧ G a) → (G a ∧ F a)$,
  rule(
    name: [$and$ I],
    $G a ∧ F a$,
    rule(
      name: [$and$ E],
      $G a$,
      [$[F a ∧ G a]^1$],
    ),
    rule(
      name: [$and$ E],
      $F a$,
      $[F a ∧ G a]^1$,
    ),
  ),
),
:::
