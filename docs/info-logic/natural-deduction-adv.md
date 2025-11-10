---
title: 自然演繹法の発展と問題点
---

## 他の演算子について
@natural-deduction/sec-natural-target で述べたように、対象とする命題論理は$->, and, bot$のみを結合子として持つものである。したがって、他の結合子についてはそれらの書き換えとしてきた。しかし、自然演繹法においては、他の結合子についても直接導入・除去規則を定義することができる。以下にそれらを示し、私たちの制限された自然演繹でどのように示されるかみてみよう。

1. 選言の導入規則
   $$
   Gamma tack.r.short phi thick => thick Gamma tack.r.short phi or psi
   $$
   選言は以下のように書き換えていた。
   $$
   phi or psi eq.def not (not phi and not psi)
   $$
   私たちの自然演繹法における選言の導入規則は以下のようになる。
   :::prooftree
   rule(
      name:[$-> "I"_ell$],
      $(not phi and not psi) -> bot$,
      rule(
         name:[$-> "E"$],
         $bot$,
         $phi$,
         rule(
            name:[$and "E"_L$],
            $phi -> bot$,
            $[not phi and not psi]^ell$,
         )
      )
   )
   :::
   つまり、$phi$が導出できれば、$phi or psi$も導出できる。同様に、$psi$が導出できれば、$phi or psi$も導出できる。
   :::prooftree
   rule(
      name:[$or "I"_L$],
      $phi or psi$,
      $phi$
   )
   :::
2. 選言の除去規則
   $$
   Gamma tack.r.short phi or psi thick "and" thick Delta, phi tack.r.short sigma thick "and" thick Epsilon, psi tack.r.short sigma thick => thick Gamma union Delta union Epsilon tack.r.short sigma
   $$
   選言の除去規則は少し大掛かりである。選言$phi or psi$が導出でき、さらに$phi$から$sigma$が導出でき、$psi$からも$sigma$が導出できれば、$sigma$が導出できる。これは以下のように示される。
   :::prooftree
   rule(
      name:[$"RRA"_3$],
      $sigma$,
      rule(
         name:[$-> "E"$],
         $bot$,
         rule(
            name:[$and "I"$],
            $not phi and not psi$,
            rule(
               name:[$-> "I"_1$],
               $phi -> bot$,
               rule(
                  name:[$-> "E"$],
                  $bot$,
                  align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta quad [phi]^1$][$dots.v$][$sigma$]],
                  $[sigma -> bot]^3$,
               ),
            ),
            rule(
               name:[$-> "I"_2$],
               $psi -> bot$,
               rule(
                  name:[$-> "E"$],
                  $bot$,
                  align(center)[#stack(dir: ttb, spacing: 4pt)[$Epsilon quad [psi]^2$][$dots.v$][$sigma$]],
                  $[sigma -> bot]^3$,
               ),
            )
         ),
         align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$not (not phi and not psi) approx phi or psi$]],
      )
   )

   :::
   選言の除去規則を導入すると以下のように書ける。
   :::prooftree
   rule(
      name:[$or "E"_ell$],
      $sigma$,
      $phi or psi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta quad [phi]^ell$][$dots.v$][$sigma$]],
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Epsilon quad [psi]^ell$][$dots.v$][$sigma$]],
   )
   :::
3. 否定の導入規則
   $$
   Gamma, phi tack.r.short bot thick => thick Gamma tack.r.short not phi
   $$
   否定は以下のように書き換えていた。
   $$
   not phi eq.def phi -> bot
   $$
   否定の導入規則は以下のように示される。
   :::prooftree
   rule(
      name:[$not "I"_ell$],
      $not phi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma quad [phi]^ell$][$dots.v$][$bot$]],
   )
   :::
   ほとんど含意の導入規則と同じである。
4. 否定の除去規則
   $$
   Gamma tack.r.short phi thick "and" thick Delta tack.r.short not phi thick => thick Gamma union Delta tack.r.short bot
   $$
   否定の除去規則は以下のように示される。
   :::prooftree
   rule(
      name:[$not "E"$],
      $bot$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta$][$dots.v$][$not phi$]],
   )
   :::
5. 同値の導入規則
   $$
   Gamma, psi tack.r.short phi thick "and" thick Delta, phi tack.r.short psi thick => thick Gamma union Delta tack.r.short phi <-> psi
   $$
   同値は2つの含意の組み合わせで定義されていた。
   $$
   phi <-> psi eq.def (phi -> psi) and (psi -> phi)
   $$
   同値の導入規則は以下のように示される。
   :::prooftree
   rule(
      name:[$<-> "I"_ell$],
      $phi <-> psi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma quad [psi]^ell$][$dots.v$][$phi$]],
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta quad [phi]^ell$][$dots.v$][$psi$]],
   )
   :::
6. 同値の除去規則
   $$
   Gamma tack.r.short phi <-> psi thick "and" thick Delta tack.r.short phi thick => thick Gamma union Delta tack.r.short psi
   $$
   同値の除去規則は以下のように示される。
   :::prooftree
   rule(
      name:[$<-> "E"_L$],
      $phi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi <-> psi$]],
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta$][$dots.v$][$phi$]],
   )
   :::
   なお、$<-> "E"_L$は$phi <-> psi$の左から右への$phi -> psi$を取り出しを行う。同様に、右から左への取り出しは$<-> "E"_R$である。
