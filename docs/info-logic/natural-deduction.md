---
title: 自然演繹法とその健全性・完全性
---

# 自然演繹法

## 対象とする命題論理

ここでは命題論理に対する自然演繹法を考えるが、その命題論理については結合子として$->, and, bot$のみを持つものとする。${->, and, bot}$は関数的に完全であるから、意味論的な範囲が制限されることはない。必ず、考えたい命題を意味的に等価に書き換えたものを考えることができる。ここで簡単に書き換えを明示しておく。

- **否定** : $not phi approx (phi -> bot)$
- **選言** : $phi or psi approx not ( not phi and not psi ) approx ((phi -> bot) and (psi -> bot)) -> bot$
- **同値** : $phi <-> psi approx (phi -> psi) and (psi -> phi)$

なおこれらは登場したら、書き換えの略記だと捉える。

## 推論規則と証明図

自然演繹法は、命題論理における推論を形式化するための方法の1つであり、主に以下のような**推論規則**から構成される。なお、公理はない。また、$Gamma$は仮定の命題の集合とし、$Gamma dots phi$は$Gamma$から$phi$が導出されたことを表す。

1. **連言の導入規則**
   $$
   Gamma tack.r phi, med Gamma tack.r psi "ならば" Gamma tack.r (phi and psi)
   $$
   導出されている$phi, psi$から$phi and psi$を導出できる。
   :::prooftree
   rule(
   name:[$and$ I],
   $phi and psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$psi$]]
   )
   :::
2. **連言の消去規則**
   $$
   Gamma tack.r (phi and psi) "ならば" Gamma tack.r phi, med Gamma tack.r psi
   $$
   導出されている$phi and psi$から$phi$もしくは$psi$を導出できる。以下の証明図は$phi$を導出する場合である。
   :::prooftree
   rule(
   name:[$and "E"_L$],
   $phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi and psi$]],
   )
   :::
   $"E"_L$は左($phi$)を導出するという意味であり、右($psi$)を導出する場合は$"E"_R$と表記する。
3. **含意の導入規則**
   $$
   Gamma,phi tack.r psi "ならば" Gamma tack.r (phi -> psi)
   $$
   $phi$を仮定して$psi$を導出できている場合
   :::annotation
   $phi$以外を仮定していてもよい
   :::
   、$phi -> psi$を導出できる。なお、使用した仮定は$[]$をつけて右上に数字を振る。この数字は含意の導入で使われる。以下の証明図では$ell$としている。
   :::prooftree
   rule(
   name:[$-> "I"_ell$],
   $phi -> psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$[phi]^ell quad Gamma$][$dots.v$][$psi$]],
   )
   :::
   このとき、$ell$番の仮定$phi$は仮定$Gamma$から取り除かれる。
4. **含意の消去規則**
   $$
   Gamma tack.r phi, med Gamma tack.r (phi -> psi) "ならば" Gamma tack.r psi
   $$
   導出されている$phi$と$phi -> psi$から、$psi$を導出できる。
   :::prooftree
   rule(
   name:[$-> "E"$],
   $psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi -> psi$]],
   )
   :::
5. **矛盾の消去規則** （爆発則）
   $$
   Gamma tack.r bot "ならば" Gamma tack.r phi
   $$
   仮定から$bot$が導出できている場合、どんな命題$phi$も導出できる。$phi$が$Gamma$に含まれている必要はない。
   :::prooftree
   rule(
   name:[$bot "E"$],
   $phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$bot$]],
   )
   :::
   この規則は一見すると奇妙であるが、意味論に裏付けされている。後述する。
6. **背理法** （古典論理）
   $$
   Gamma, not phi tack.r bot "ならば" Gamma tack.r phi
   $$
   $not phi approx phi -> bot$を仮定して$bot$が導出できている場合、$phi$を導出できる。使用した仮定には$[]$をつけて右上に数字を振る。以下の証明図では$ell$としている。
   :::prooftree
   rule(
   name:[$"RAA"_ell$],
   $phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$[phi -> bot]^ell quad Gamma$][$dots.v$][$bot$]],
   )
   :::
   このとき、$ell$番の仮定$phi$は仮定$Gamma$から取り除かれる。

各規則で書かれている図は **証明図(proof tree)** と呼ばれ自然演繹ではこの証明図を書いて導出を行う。証明図はいわゆる親と子をもつ木構造となっているが、親は0つから2つまで許可され、子は1つしか許可されないという意味で逆（下から上）の木構造である。最終的な木の最上部にあり、$[]$のついていない命題を仮定と呼ぶ。また、複数箇所に同じ仮定あるいは解決された仮定（$[]$のついた命題）がある場合はそれらは同一視され、解決するとすべての箇所で解決される。

さらに、解決された仮定は証明図の最上部になくても良く、いくつでも追加できる。たとえば、$phi -> (psi -> phi)$はトートロジー
:::annotation
「トートロジーであるから証明できてほしい」という気持ちがここに入っている。本来はこの規則を持っている自然演繹が完全性を持っているから正当化されるのであって逆の因果である。
:::
であるが、これは以下の証明図で示される。
:::prooftree
rule(
name:[$-> "I"_1$],
$phi -> (psi -> phi)$,
rule(
name:[$-> "I"_2$],
$psi -> phi$,
$[phi]^1$,
)
)
:::

このとき$-> "I"_2$で用いた（解決した）$psi$は証明図の最上部には存在しないが、問題はない。

---

例として$(p -> q) and (not p -> r) => (p and q) or (not p and r)$を証明してみる。これは$(p -> q)$と$(not p -> r)$を仮定した時に

$$
( ((p and q) -> bot) and (((p -> bot) and r) -> bot) ) -> bot
$$

であることを証明する。なお、上式の左辺を$phi$とする。まずは$p$を背理法を用いて導出する。
:::prooftree
rule(
   name:[$"RAA"_2$],
   $p$,
   rule(
      name:[$-> "E"$],
      $bot$,
      rule(
         name:[$and "I"$],
         $not p and r$,
         $[not p]^2$,
         rule(
            name:[$-> "E"$],
            $r$,
            $not p -> r$,
            $[not p]^2$,
         )
      ),
      rule(
         name:[$and "E"_R$],
         $not p and r -> bot$,
         $[phi]^1$,
      )
   )
)
:::

なお、$phi$については最終的に解決されるのでラベルは1とした。次に$dots p$を上の証明図の略記とすると、以下のように書ける。
:::prooftree
rule(
   name:[$-> "I"_1$],
   $phi -> bot$,
   rule(
      name:[$-> "E"$],
      $bot$,
      rule(
         name:[$and "I"$],
         $p and q$,
         align(center)[#stack(dir: ttb, spacing: 4pt)[$dots.v$][$p$]],
         rule(
            name:[$-> "E"$],
            $q$,
            $p -> q$,
            align(center)[#stack(dir: ttb, spacing: 4pt)[$dots.v$][$p$]],
         )
      ),
      rule(
         name:[$and "E"_L$],
         $p and q -> bot$,
         $[phi]^1$,
      )
   )
)
:::

なお全体図は以下のようになる。

:::prooftree
rule(
   name:[$-> "I"_1$],
   $phi -> bot$,
   rule(
      name:[$-> "E"$],
      $bot$,
      rule(
         name:[$and "I"$],
         $p and q$,
         rule(
            name:[$"RAA"_2$],
            $p$,
            rule(
               name:[$-> "E"$],
               $bot$,
               rule(
                  name:[$and "I"$],
                  $not p and r$,
                  $[not p]^2$,
                  rule(
                     name:[$-> "E"$],
                     $r$,
                     $not p -> r$,
                     $[not p]^2$,
                  )
               ),
               rule(
                  name:[$and "E"_R$],
                  $not p and r -> bot$,
                  $[phi]^1$,
               )
            )
         ),
         rule(
            name:[$-> "E"$],
            $q$,
            $p -> q$,
            rule(
               name:[$"RAA"_2$],
               $p$,
               rule(
                  name:[$-> "E"$],
                  $bot$,
                  rule(
                     name:[$and "I"$],
                     $not p and r$,
                     $[not p]^2$,
                     rule(
                        name:[$-> "E"$],
                        $r$,
                        $not p -> r$,
                        $[not p]^2$,
                     )
                  ),
                  rule(
                     name:[$and "E"_R$],
                     $not p and r -> bot$,
                     $[phi]^1$,
                  )
               )
            ),
         )
      ),
      rule(
         name:[$and "E"_L$],
         $p and q -> bot$,
         $[phi]^1$,
      )
   )
)
:::

## 爆発則
爆発則は一見すると奇妙な規則であるが、意味論に裏付けされている。すなわち、仮定から$bot$が導出できている場合、どんな命題$phi$も導出できるという規則であるが、これは次のように説明できる。

意味論において、$Gamma models bot$とは,$Gamma$内のすべての命題$phi$について$[|phi|]_v = 1$となる共通の付値$v$が存在しないことを意味する。なぜなら、$[|bot|]_v = 0$であるからである。つまり、$Gamma$内で矛盾が発生している。

ここで、$phi tack.r psi$のとき、これは端的に$phi -> psi$が成り立っててほしい。つまり、$Gamma = {phi_1, phi_2, dots, phi_n} tack.r psi$について$phi_1 and phi_2 and ... and phi_n -> psi$が成り立つ。しかしながら、$Gamma$が矛盾しており$phi_1 and phi_2 and ... and phi_n$が常に偽である場合、$->$の規則から$phi$が何であれ、これは真となっててほしい。真となるものは、導出されるべきという完全性を課せば、$phi$には任意の命題を入れることができなければならず、それがルールとなっている。したがって、爆発則は意味論的に正当化される。

改めて述べるが、この規則も自然演繹が完全性と健全性を持つことに寄与しており、上の説明のように完全性から導かれたり、他の理論から導かれるルールではない。つまり、完全性と健全性のためにこの規則が必要である、ということである。
