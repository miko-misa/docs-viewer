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

# 直観主義論理と背理法
## 直観主義論理とは
自然演繹法にて私たちは背理法の規則を採用した。これは古典論理における重要な推論規則である。しかし、背理法を認めない立場も存在する。この立場は **直観主義論理(constructive logic)** と呼ばれる。 直観主義論理では弱い背理法は採用される。

:::prooftree
rule(
   name:[$-> "I"$],
   $not not phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma quad [not phi]^ell$][$dots.v$][$bot$]],
)
:::

しかし一方で、$not not phi$を$phi$に変換する強い背理法は認められない。つまり、以下の規則は認められない。
:::prooftree
rule(
   name:[$"RAA"$],
   $phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma quad [not phi]^ell$][$dots.v$][$bot$]],
)
:::
直観主義論理では、$not not phi$が導出できても、必ずしも$phi$が導出できるとは限らない。例えば、$phi$を「明日雨が降る」とすると、$not not phi$は「明日雨が降らないとは言えない」という意味になる。これは私たちが雨が降るかどうか確信を持てない場合に成り立つ。しかし、これは必ずしも「明日雨が降る」ということを意味しない。したがって、直観主義論理では強い背理法は認められないのである。

## 二重否定の消去
また、直観主義論理には以下のような選言性質という特性がある。

:::column
(thm-dp)=
@title: 直観主義論理の選言性質

もし、いかなる仮定なしに$phi or psi$が導出できるならば、いずれか一方の$phi$または$psi$が仮定なしに導出できる。
$$
tack.r.short phi or psi thin => thin tack.r.short phi "or" tack.r.short psi
$$

:::

もし直観主義論理で強い背理法が成り立つならば以下の手順で$not not (phi or not phi)$が導出できる。
:::prooftree
rule(
   name:[$-> "I"_2$],
   $not (phi or not phi) -> bot$,
   rule(
      name:[$-> "E"$],
      $bot$,
      rule(
         name:[$or "I"_R$],
         $phi or not phi$,
         rule(
            name:[$-> "I"_1$],
            $not phi$,
            rule(
               name:[$-> "E"$],
               $bot$,
               rule(
                  name:[$or "I"_L$],
                  $phi or not phi$,
                  $[phi]^1$,
               ),
               $[(phi or not phi) -> bot]^2$
            )
         )
      ),
      $[(phi or not phi) -> bot]^2$,
   )
)
:::

これはすべての仮定が解消されているので、仮定なしに$not not (phi or not phi)$が導出できたことになる。しかし、ここで原始命題$p eq.not bot$を用いて$phi = p$としてみると、$not not (p or not p)$が導出できる。これにもし、二重否定の消去
:::annotation
これを認めれば、強い背理法を認めることになる。
:::
を認めれば、$p or not p$が導出できる。@thm-dp を用いれば、$p$または$not p$が導出できることになる。しかし、これは直観主義論理の立場からは受け入れられない。なぜなら、原始命題$p$について仮定なしで導出できるとは限らないからである。したがって、直観主義論理では二重否定の消去は認められないのである。

## 直観主義論理における意味論
私たちが考えてきた命題論理の意味論は古典論理に基づいている。したがって、直観主義論理に対しては適用できない。適応すると、完全性が成り立たない。例えば、$phi or not phi$は直観主義論理では証明できないが、古典論理の意味論においては常に真となる。したがって、直観主義論理に対しては新たな意味論を定義する必要がある。代表的なものとして**ヘンキン意味論(Henkin semantics)** や**クリーン意味論(Kripke semantics)** がある。これらの意味論は直観主義論理の特性を反映しており、完全性定理も成り立つ。また、直観主義を採用した代数モデルとして**ヘイティング代数(Heyting algebra)** も存在する。クリーン意味論もヘイティング代数もある種の順序$<=$を用いて表現を行うことで共通している。

## BHK解釈
直観主義論理における命題の意味を理解するためには **BHK解釈(Brouwer-Heyting-Kolmogorov interpretation)** を用いることができる。BHK解釈では、命題の意味をその命題の証明の存在に基づいて定義する。命題$phi$の証明とは、$phi$が真であることを示す構成的な手順である。

- $phi and psi$の証明は、$phi$の証明と$psi$の証明の組である。
- $phi or psi$の証明は、$phi$の証明または$psi$の証明のいずれかである。
- $phi -> psi$の証明は、$phi$の任意の証明から$psi$の証明を構成する手順である。
- $not phi$の証明は、$phi$の証明が存在しないことを示す手順である。

つまり、証明はただ単にその真偽を示すだけでなく、その命題がどのようにして真であるかを具体的に示すものである。BHK解釈は直観主義論理の基礎を成しており、命題の意味を理解するための重要な枠組みを提供している。これによっても、背理法が直観主義論理で認められない理由が説明できる。$not not phi$とは$not phi$を証明するどんな手順を持ってきてもそれは矛盾$bot$に導くような手順があることを意味する。しかし、これは必ずしも$phi$の具体的な証明手順が存在することを意味しない。したがって、直観主義論理では$not not phi$から$phi$を導くことはできないのである。

# 自然演繹法の問題点と拡張
## シーケント計算
自然演繹法は非常に直感的で理解しやすい推論体系である。しかし、いくつかの問題点も存在する。

1. 証明図が`DAG`構造
   自然演繹法の証明図は木構造ではなく、**DAG(Directed Acyclic Graph、有向非巡回グラフ)** 構造を持つ。含意の導入規則や背理法の規則では上位の命題をさかのぼって指定し、解消を行う。つまり、上から下への一方向の構造ではなく、複数の場所から同じ命題に参照が飛ぶことがある。これにより、証明図の管理が複雑になる。
2. 弱化によって見えない仮定が生まれる
   弱化の規則により、証明図の中で実際には使用されていない仮定が存在することがある。これにより、証明図の理解が難しくなる場合がある。
3. 双対性の消失
   自然演繹法では、導入規則と除去規則が$and$、$or$に対して非対称的であり、双対性が失われている。例えば、$and$の消去規則と$or$の導入規則は対称的である。
   :::prooftree
   rule(
      name:[$and "E"_L$],
      $phi$,
      $phi and psi$,
   )
   :::
   :::prooftree
   rule(
      name:[$or "I"_L$],
      $phi or psi$,
      $phi$,
   )
   :::
   一方で、$and$の導入規則と$or$の除去規則は非対称的である。
   :::prooftree
   rule(
      name:[$and "I"$],
      $phi and psi$,
      $phi$,
      $psi$,
   )
   :::
   :::prooftree
   rule(
      name:[$or "E"_ell$],
      $sigma$,
      $phi or psi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta quad [phi]^ell$][$dots.v$][$sigma$]],
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Epsilon quad [psi]^ell$][$dots.v$][$sigma$]],
   )
   ::::
   この非対称性は証明図の構造を複雑にし、理解を難しくする要因となっている。


これらの問題点を解決するために、**シーケント計算(sequent calculus)** という別の推論体系が提案された。シーケント計算では、証明図が木構造となり、双対性が保たれるように設計されている。これにより、証明図の管理が容易になり、理解しやすくなる。また、シーケント計算では仮定の管理も明確であり、見えない仮定の問題も解決される。具体的には、シーケント計算では **シーケント(sequent)** という形式を用いて推論を行う。シーケントは以下のような形式を持つ。
$$
Gamma tack.r.short Delta
$$
ここで、$Gamma$は前件(antecedent)と呼ばれ、仮定の集合を表す。$Delta$は後件(succedent)と呼ばれ、結論の集合を表す。
:::annotation
シークエント計算の前件と後件は線形リストとして表現されることもあるがここでは集合として扱っている。
:::
シーケント計算では、各命題論理の結合子に対して導入規則と除去規則が定義されており、これらの規則を用いてシーケントから新たなシーケントを導出していく。