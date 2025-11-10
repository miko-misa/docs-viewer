---
title: 自然演繹法とその健全性・完全性
---

# 自然演繹法

## (sec-natural-target)= 対象とする命題論理

ここでは命題論理に対する自然演繹法を考えるが、その命題論理については結合子として$->, and, bot$のみを持つものとする。${->, and, bot}$は関数的に完全であるから、意味論的な範囲が制限されることはない。必ず、考えたい命題を意味的に等価に書き換えたものを考えることができる。ここで簡単に書き換えを明示しておく。

- **否定** : $not phi approx (phi -> bot)$
- **選言** : $phi or psi approx not ( not phi and not psi ) approx ((phi -> bot) and (psi -> bot)) -> bot$
- **同値** : $phi <-> psi approx (phi -> psi) and (psi -> phi)$

なおこれらは登場したら、書き換えの略記だと捉える。そのため、今後$not phi = (phi -> bot)$と$=$で結ぶことができる。
:::annotation
演繹体系は意味論から切り離して考えるべきものである。定義にから完全性と健全性を証明してはじめて繋がりを論じることができる。したがって、意味論的等価性$approx$を用いることはできない。上記の書き換えはあくまで意味論的に等価な命題論理式を考えるためのものであり、対象とする命題論理内で意味的等価性を用いることはできない。
:::

## (sec-natural-deduction-rule)= 推論規則

自然演繹法は、命題論理における推論を形式化するための方法の1つであり、主に以下のような**推論規則**から構成される。なお、公理はない。また、$Gamma$は仮定の命題の集合とし、$Gamma dots phi$は$Gamma$から$phi$が導出されたことを表す。

1. **連言の導入規則**
   $$
   Gamma tack.r.short phi, med Delta tack.r.short psi => Gamma union Delta tack.r.short (phi and psi)
   $$
   導出されている$phi, psi$から$phi and psi$を導出できる。
   :::prooftree
   rule(
   name:[$and$ I],
   $phi and psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta$][$dots.v$][$psi$]]
   )
   :::
2. **連言の消去規則**
   $$
   Gamma tack.r.short (phi and psi) => Gamma tack.r.short phi, med Gamma tack.r.short psi
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
   Gamma union {phi} tack.r.short psi => Gamma tack.r.short (phi -> psi)
   $$
   $psi$を導出できている場合、$phi -> psi$を導出できる。なおこの時、仮定に$phi$が含まれている場合、**解消(discharge)** と呼ばれる操作を行い、仮定の出現から1個以上の$phi$を取り除くことができる。解消については @sec-discharge で詳しく説明する。以下の証明図では、仮定から解消された$phi$がラベル$ell$で示されている。
   :::prooftree
   rule(
   name:[$-> "I"_ell$],
   $phi -> psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$[phi]^ell quad Gamma$][$dots.v$][$psi$]],
   )
   :::
4. **含意の消去規則**
   $$
   Gamma tack.r.short phi, med Delta tack.r.short (phi -> psi) => Gamma union Delta tack.r.short psi
   $$
   導出されている$phi$と$phi -> psi$から、$psi$を導出できる。
   :::prooftree
   rule(
   name:[$-> "E"$],
   $psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta$][$dots.v$][$phi -> psi$]],
   )
   :::
5. **矛盾の消去規則** （爆発則）
   $$
   Gamma tack.r.short bot => Gamma tack.r.short phi
   $$
   仮定から$bot$が導出できている場合、どんな命題$phi$も導出できる。$phi$が$Gamma$に含まれている必要はない。
   :::prooftree
   rule(
   name:[$bot "E"$],
   $phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$bot$]],
   )
   :::
   この規則は一見すると奇妙であるが、意味論に裏付けされている。 詳しくは @sec-explosion-rule を参照されたい。
6. **背理法** （古典論理）
   $$
   Gamma union {not phi} tack.r.short bot => Gamma tack.r.short phi
   $$
   $not phi approx phi -> bot$を仮定して$bot$が導出できている場合、$phi$を導出できる。$not phi$は解消される。
   :::prooftree
   rule(
   name:[$"RAA"_ell$],
   $phi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$[phi -> bot]^ell quad Gamma$][$dots.v$][$bot$]],
   )
   :::
   詳しくは @sec-reductio-ad-absurdum を参照されたい。
7. **仮定の追加=弱化**
   $$
   Gamma tack.r.short phi => Gamma union {psi} tack.r.short phi
   $$
   すでに導出されている$phi$に対して、仮定に新たな命題$psi$を追加しても、$phi$は導出できる。これは含意の導入規則と併せて用いられることが多く、証明図の上部に出現しないことが多い。なぜこのような規則が必要かは @sec-weakening を参照されたい。

## 証明図
各規則で書かれている図は **証明図(proof tree)** と呼ばれ自然演繹ではこの証明図を書いて導出を行う。証明図はいわゆる親と子をもつ木構造となっているが、親は0つから2つまで許可され、子は1つしか許可されないという意味でいつもみるものとは逆（下から上）の木構造
:::annotation
もっとも、「木」とは下から上に成長するものであるが。
:::
である。最終的な木の最上部にあり、解消されていない命題（$[]$がついていない命題）を仮定と呼ぶ。たとえば以下の模式的な証明図では$phi_1, phi_2, dots, phi_n$のみが仮定であり、$psi$が導出されている命題である。

:::prooftree
rule(
   name:[$"R"$],
   $psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$phi_1$][$dots.v$][$quad$][$quad$][$quad$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$phi_2$][$dots.v$][$dots.v$][$quad$][$quad$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$dots$][$dots.v$][$dots.v$][$dots.v$][$quad$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[$phi_n$][$dots.v$][$dots.v$][$dots.v$][$dots.v$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[][$[sigma_1]^1$][$dots.v$][$dots.v$][$dots.v$][$dots.v$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[][$[sigma_2]^2$][$dots.v$][$dots.v$][$dots.v$][$quad$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[][$dots$][$dots.v$][$dots.v$][$quad$][$quad$]],
   align(center)[#stack(dir: ttb, spacing: 4pt)[][$[sigma_m]^m$][$dots.v$][$quad$][$quad$][$quad$]],
)
:::

$sigma_1, sigma_2, dots, sigma_m$は解消されている命題であり、この証明図は$phi_1, phi_2, dots, phi_n tack.r.short psi$を表していることになる。

## (sec-discharge)= 解消
**解消(discharge)** とは、証明図において仮定から1個以上の命題を取り除く操作を指す。たとえば、含意の導入規則や背理法では、証明図の一部で仮定として用いた命題が最終的に解消される。解消された命題は証明図の最上部には現れても仮定ではなくなる。自然演繹のルールから、導出の木は下から上に見ていくと、1つまたは2つの枝分かれがあるため、解消を行わないと仮定は広義単調増加する。しかし、解消を行うことで減らすことができ、それが唯一の仮定の減少を許す操作となる。解消は証明図の中でラベル付けされ、解消を行なった操作（含意の導入または背理法）でそのラベルを用いる。@sec-natural-deduction-rule で示した証明図では$ell$がそのラベルで基本的に数字を用いる。

なお、解消は前提とした命題の出現すべてに対して行う必要はない。たとえば、$phi$を2回仮定として用いている場合、1回だけ解消しても良い。また、弱化を用いると1つも解消しないことも可能である。

## (sec-reductio-ad-absurdum)= 背理法
背理法は古典論理に特有の規則であり、ある命題$phi$の否定$not phi$を仮定して矛盾が導出できる場合、$phi$を導出できるという規則である。直観主義論理ではこの規則は許可されない。背理法は一見すると含意の導入規則に含まれているように見える。
:::prooftree
rule(
   name:[$-> "I"_1$],
   $(phi -> bot) -> bot$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$[phi -> bot]^1 quad Gamma$][$dots.v$][$bot$]],
)
:::
しかし、ここで導出されている$(phi -> bot) -> bot$は$phi$であるとは限らない。なぜなら、直観主義論理においては$phi$と$(phi -> bot) -> bot$は意味論的に等価ではないからである。そもそも、推論規則において意味論的等価性を前提とすることはできない。推論規則上は$(phi -> bot) -> bot$と$phi$は別の命題であり、同じものとして扱うことはできない。したがって、背理法は含意の導入規則とは別に定義される必要がある。

## (sec-explosion-rule)= 爆発則
爆発則は一見すると奇妙な規則であるが、意味論に裏付けされている。すなわち、仮定から$bot$が導出できている場合、どんな命題$phi$も導出できるという規則であるが、これは次のように説明できる。

意味論において、$Gamma models bot$とは,$Gamma$内のすべての命題$phi$について$[|phi|]_v = 1$となる共通の付値$v$が存在しないことを意味する。なぜなら、$[|bot|]_v = 0$であるからである。つまり、$Gamma$内で矛盾が発生している。

ここで、$phi tack.r.short psi$のとき、これは端的に$phi -> psi$が成り立っててほしい。つまり、$Gamma = {phi_1, phi_2, dots, phi_n} tack.r.short psi$について$phi_1 and phi_2 and ... and phi_n -> psi$が成り立つ。しかしながら、$Gamma$が矛盾しており$phi_1 and phi_2 and ... and phi_n$が常に偽である場合、$->$の意味論的規則から$psi$が何であれ、これは真となっててほしい。真となるものは、導出されるべきという完全性を課せば、$psi$には任意の命題を入れることができなければならず、それがルールとなっている。したがって、爆発則は意味論的に正当化される。

改めて述べるが、この規則も自然演繹が完全性と健全性を持つことに寄与しており、上の説明のように完全性から導かれたり、他の理論から導かれるルールではない。つまり、完全性と健全性のためにこの規則が必要である、ということである。

## (sec-weakening)= 弱化
弱化とは、すでに導出されている命題に対して、仮定に新たな命題を追加しても、導出される命題は変わらないという規則である。仮定は必ず用いなければならないわけではないので、仮定に新たな命題を追加しても導出される命題は変わらない。

しかし一方で元の仮定に矛盾する仮定を追加しても良いのかと思うかもしれない。たとえば、$p$を仮定しているときに$not p$を追加しても良いのか、ということである。しかし、今回考えているのは **導出可能性** である。導出を最後まで到達させることは必要ない。仮定の中で何が言えるのかが重要であり、矛盾するから何も言えない、ということにはならない。（むしろ矛盾するなら爆発則より有利になることもあるかもしれない。）

しかし、弱化は名前の通り主張を弱くしてしまう。たとえば、$phi_1, phi_2 tack.r.short psi$を導出したいと考えたとき、弱化を用いて$phi_3$を仮定に追加してしまうと、$phi_1, phi_2, phi_3 tack.r.short psi$を導出することになり、主張が弱くなってしまう。証明を行う際、できれば仮定は少ない方が良い。さらに言うなら、仮定がない方がより良い。

一方で、証明したい内容が$phi_1, phi_2, phi_3 tack.r.short psi$であったのに、$phi_1, phi_2 tack.r.short psi$が導出できたとしても、弱化を用いて$phi_1, phi_2, phi_3 tack.r.short psi$を導出できるため、問題はない。証明において使わない仮定があっても良いのである。

さらに、弱化は含意の導入規則と併せて用いることにより仮定の数を維持することができる。弱化で仮定$Gamma$に命題$phi$を追加し、含意の導入規則でその命題$phi$を解消することで、$Gamma$に対して含意を導入できるからである。以下のような証明図があり得る。
:::prooftree
rule(
   name:[$-> "I"_1$],
   $phi -> psi$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$psi$]],
)
:::
$psi$が$phi$を含まない$Gamma$のみで導出されている場合から、仮定に$phi$を追加し、$Gamma union {phi} tack.r.short psi$を得て、すぐに含意の導入規則を適用して$Gamma tack.r.short (phi -> psi)$を得ることができる。この場合、証明図に$phi$は現れないため、書かなくてよいが、含意の導入にはラベルを表記している。ラベルを参照して見つからない場合、弱化が行われていると考える。

## 自然演繹の例

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

## 自然演繹の健全性
あらためて、健全性とは以下が成り立つことを言うのであった。

$$
Gamma tack.r.short phi => Gamma models phi
$$

これを構造に関する数学的帰納法で示す。

:::column-toc
(thm-natural-deduction-soundness)=
@title: 自然演繹の健全性

**【主張】**
自然演繹は健全である。すなわち、$Gamma tack.r.short phi$ならば$Gamma models phi$である。

**【証明】**
$Gamma tack.r.short phi$が言えるのであれば、すべての$sigma in Gamma$について$[|sigma|]_v = 1$となる付値$v$に対して$[|phi|]_v = 1$であることを示す。

**基底部**
推論規則が何もないとき、つまり仮定$phi$そのものについて考える。このとき、$[|phi|]_v = 1$となる付値$v$について$[|phi|]_v = 1$であるから、$Gamma models phi$が成り立つ。

**帰納部**
各推論規則について、帰納法の仮定を用いて示す。

ここで以下の略記を定義する。
ある命題集合$Gamma$について、すべての$sigma in Gamma$について$[|sigma|]_v = 1$となる付値$v$の集合を$V(Gamma)$とする。

$$
V & : cal(P) ( italic("PROP") ) -> { v : italic("ATOM") -> {0, 1} }\
V(Gamma) &= { v : italic("ATOM") -> {0, 1} | forall sigma in Gamma, [|sigma|]_v = 1 }
$$

大事なのは、$[|sigma|]_v = 1 (v in V(Gamma))$であることが言えるならば、$Gamma models sigma$が成り立つということである。

1. **連言の導入規則**
   $phi$と$psi$がそれぞれ命題集合$Gamma,Delta$から導出された命題であり
      - $[|phi|]_v = 1 quad (v in V(Gamma))$
      - $[|psi|]_v = 1 quad (v in V(Delta))$

   であると仮定する。

   連言の導入規則より、$Gamma union Delta tack.r.short (phi and psi)$である。このとき、$v in V(Gamma union Delta) => v in V(Gamma), thin v in V(Delta)$なので、$v in V(Gamma union Delta)$について、
   $$
   [|phi and psi|]_v = min( [|phi|]_v, [|psi|]_v ) = min(1, 1) = 1
   $$
   であるから、$Gamma union Delta models (phi and psi)$が成り立つ。
2. **連言の消去規則**
   $phi and psi$が命題集合$Gamma$から導出された命題であり、$[|phi and psi|]_v = 1 quad (v in V(Gamma))$であると仮定する。連言の消去規則より$Gamma tack.r.short phi$である。$v in V(Gamma)$について、
   $$
   [|phi|]_v = 1
   $$
   であるから、$Gamma models phi$が成り立つ。なぜなら、$[|phi]_v = 0$であるとすると、$[|phi and psi|]_v = min( [|phi|]_v, [|psi|]_v ) = min(0, [|psi|]_v ) = 0$となり、矛盾するからである。
   同様に連言の消去規則より、$Gamma tack.r.short psi$となり、$Gamma models psi$も成り立つ。
3. **含意の導入規則**
   $psi$が集合命題$Gamma union {phi}$から導出された命題であり、$[|psi|]_v = 1 quad (v in V(Gamma union {phi}))$であると仮定する。含意の導入規則より、$Gamma tack.r.short (phi -> psi)$である。このとき、付値$v^prime in V(Gamma)$について考える。

   $[|phi|]_(v^prime) = 1$の場合、定義より$Gamma$全体にも$phi$にも意味関数を$1$とするので、$v^prime in Gamma union {phi}$である。つまり、$[|psi|]_(v^prime) = 1$である。よって、付値$v^prime$について、
   $$
   [|phi -> psi|]_(v^prime) &= cases(
      1 & quad "if" [|phi|]_(v^prime) = 0,
      [|psi|]_(v^prime) & quad "if" [|phi|]_(v^prime) = 1,
   )\
   &= cases(
      1 & quad "if" [|phi|]_(v^prime) = 0,
      1 & quad "if" [|phi|]_(v^prime) = 1,
   )\
   &= 1
   $$
   であるから、$Gamma models (phi -> psi)$が成り立つ。以上の議論は$phi in Gamma$においても問題なく成り立つことに注意されたい。
4. **含意の消去規則**
   $phi$と$phi -> psi$がそれぞれ$Gamma,Delta$から導出された命題であり、
   - $[|phi|]_v = 1 quad (v in V(Gamma))$
   - $[|phi -> psi|]_v = 1 quad (v in V(Delta))$

   であると仮定する。含意の消去規則より、$Gamma union Delta tack.r.short psi$である。このとき、$v in V(Gamma union Delta) => v in V(Gamma), thin v in V(Delta)$なので、$v in V(Gamma union Delta)$について、
   $[|phi -> psi|]_v = 1$および$[|phi|]_v = 1$であることから、含意の定義より$[|psi|]_v = 1$である。したがって、$Gamma union Delta models psi$が成り立つ。
5. **矛盾の消去規則** （爆発則）
   $bot$が$Gamma$から導出された命題で$[|bot|]_v = 1 quad (v in V(Gamma))$と仮定する。矛盾の消去規則より、$Gamma tack.r.short phi$である。このとき、$bot$の定義より$[|bot|]_v = 0$であることから$V(Gamma) = emptyset$。その0個の元$v$について、任意の命題$phi$について$[|phi|]_v = 1$である。また言い方を変えると、
   $$
   sigma in Gamma, [|sigma|]_v = 1 => [|phi|]_v = 1
   $$
   の左辺が成り立たないのでこの式が成り立つ。したがって、$Gamma models phi$が成り立つ。
6. **背理法** （古典論理）
   $bot$が集合命題$Gamma union {not phi}$から導出された命題であり、$[|bot|]_v = 1 quad (v in V(Gamma union {not phi}))$であると仮定する。しかし、$[|bot|] = 0$なので$V(Gamma union {phi}) = emptyset$である。背理法の規則より、$Gamma tack.r.short phi$である。このとき、付値$v^prime in V(Gamma)$について考える。

   - $[|phi|]_(v^prime) = 1$の場合、$[|phi|]_(v^prime) = 1$であることは自明である。
   - $[|phi|]_(v^prime) = 0$の場合、定義より $[|not phi|]_(v^prime) = 1$である。定義より,$Gamma$のすべての元にも$not phi$にも意味関数を$1$とするので、$v^prime in V(Gamma union {not phi})$である。しかし、これは$V(Gamma union {not phi}) = emptyset$と矛盾する。したがって、この場合は起こりえない。

   よって、付値$v^prime in V(Gamma)$について、$[|phi|]_(v^prime) = 1$であるから、$Gamma models phi$が成り立つ。
7. **弱化**
   $phi$が$Gamma$から導出された命題であり、$[|phi|]_v = 1 quad (v in V(Gamma))$であると仮定する。弱化の規則より、$Gamma union {psi} tack.r.short phi$である。このとき、$v^prime in V(Gamma union {psi})$となる付値$v^prime$について考えるが、これは$v^prime in V(Gamma)$でもある。したがって、
   $$
   [|phi|]_(v^prime) = 1
   $$
   であるから、$Gamma union {psi} models phi$が成り立つ。

以上で、すべての推論規則について示したので、自然演繹は健全であることが示された。$square.filled$

:::

## 自然演繹の完全性
完全性とは以下が成り立つことであった。
$$
Gamma models phi => Gamma tack.r.short phi
$$

この証明は極大無矛盾集合を用いて行う。この自然演繹の推測規則から以下の補題を順に示せる。

:::column-toc
(lem-max-cons-closure)=
@title:【補題】極大無矛盾集合の演繹閉包性

**【主張】**
極大無矛盾集合を$Gamma$とする。このとき、以下が成り立つ。
$$
Gamma tack.r.short phi => phi in Gamma
$$

なお、この逆は自明である。

**【証明】**
背理法により示す。まず、$Gamma tack.r.short phi$である。$phi in.not Gamma$と仮定する。このとき、極大性より$Gamma union {phi}$は無矛盾でない。つまり、$Gamma union {phi} tack.r.short bot$である。このとき、含意の導入規則より、$Gamma tack.r.short (phi -> bot) approx not phi$である。さらに、$Gamma tack.r.short phi$であったので、含意の消去規則より、$Gamma tack.r.short bot$である。

:::prooftree
rule(
   name:[$-> "E"$],
   $bot$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   rule(
      name:[$-> "I"_1$],
      $phi -> bot$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma quad [phi]^1$][$dots.v$][$bot$]],
   )
)
:::

しかし、これは$Gamma$の無矛盾性に反する。したがって、$phi in Gamma$である。$square.filled$

:::

:::column-toc
(lem-max-cons-1)=
@title:【補題】極大無矛盾集合の二分決定性

**【主張】**
極大無矛盾集合を$Gamma$とする。このとき、すべての命題論理式$phi in italic("PROP")$について$phi in Gamma$または$not phi in Gamma$のいずれかが成り立つ。

**【証明】**
$Gamma$は無矛盾であるので、$phi in Gamma$かつ$not phi in Gamma$となることはない。

- $Gamma union {phi}$が無矛盾であるとする。このとき、極大性より$phi in Gamma$である。
- $Gamma union {phi}$が無矛盾でないとする。つまり$Gamma union {phi} tack.r.short bot$である。このとき、含意の導入規則より、$Gamma tack.r.short (phi -> bot) approx not phi$である。したがって、@lem-max-cons-closure より$not phi in Gamma$である。

よって$phi in Gamma$または$not phi in Gamma$のいずれかが成り立つ。$square.filled$

:::

:::column-toc
(lem-max-cons-imp-bicond)=
@title:【補題】極大無矛盾集合における含意—所属の同値性

**【主張】**
極大無矛盾集合を$Gamma$とする。このとき、すべての命題論理式$phi, psi in italic("PROP")$について以下が成り立つ。

$$
(phi -> psi) in Gamma <=> (phi in Gamma => psi in Gamma)
$$

**【証明】**
まず$(phi -> psi) in Gamma => (phi in Gamma => psi in Gamma)$を示す。
$(phi -> psi) in Gamma$であるとする。その上で$phi in Gamma$であると仮定する。すると、自然演繹の含意の消去規則より$Gamma tack.r.short psi$である。なぜなら$Gamma$内に仮定$phi -> psi$および$phi$が存在するからである。
:::prooftree
rule(
name:[$-> "E"$],
$psi$,
$phi -> psi$,
$phi$
)
:::

したがって、@lem-max-cons-closure より$psi in Gamma$である。

次に$(phi in Gamma => psi in Gamma) => (phi -> psi) in Gamma$を示す。
$(phi in Gamma => psi in Gamma)$であると仮定する。以下$phi in Gamma$かどうかで場合分けを行う。

1. $phi in Gamma$のとき、仮定から$psi in Gamma$である。この2つの仮定に対し、弱化および含意の導入規則より$Gamma tack.r.short (phi -> psi)$である。
   :::prooftree
   rule(
      name:[$-> "I"_1$],
      $phi -> psi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$psi$]],
   )
   :::
   このとき、@lem-max-cons-closure より$(phi -> psi) in Gamma$である。
2. $phi in.not Gamma$のとき、@lem-max-cons-1 より $not phi in Gamma$である。すなわち、$(phi -> bot) in Gamma$である。このとき、以下の証明図より$Gamma tack.r.short (phi -> psi)$である。
   :::prooftree
   rule(
      name:[$-> "I"_1$],
      $phi -> psi$,
      rule(
         name:[$bot "E"$],
         $psi$,
         rule(
            name:[$-> "E"$],
            $bot$,
            $[phi]^1$,
            $phi -> bot$,
         )
      )
   )
   :::
   このとき、@lem-max-cons-closure より$(phi -> psi) in Gamma$である。

いずれの時も$(phi -> psi) in Gamma$である。

以上より、$(phi -> psi) in Gamma <=> (phi in Gamma => psi in Gamma)$は示された。$square.filled$

:::

:::column-toc
(lem-max-cons-val-exist)=
@title: 【補題】無矛盾性と付値の存在

**【主張】**
以下の2つは同値である。

1. 命題集合$Gamma$が無矛盾である
2. すべての$phi in Gamma$について$[|phi|]_v = 1$となる付値$v$が存在する。

**【証明】**
$(2) => (1)$はすぐに示せる。これは @thm-natural-deduction-soundness の系である。
もし$(2)$が成り立つ上で$Gamma$が無矛盾ではない、つまり$Gamma tack.r.short bot$であるとすると、@thm-natural-deduction-soundness より、$Gamma models bot$である。しかし、$[|bot|]_v = 1$となる付値$v$が存在しないため、これは仮定$(2)$に反し矛盾が生じる。

$(1) => (2)$を示す。@duality-deductive/lem-max-consistent-existence より、$Gamma subset.eq Gamma^ast$を満たす極大無矛盾集合$Gamma^ast$が存在する。ここで、付値$v$を以下のように定義する。
$$
v(p) &= cases(
   1 & quad "if" p in Gamma^ast,
   0 & quad "if" p in.not Gamma^ast,
) quad (p in italic("ATOM"))
$$
ただし、$Gamma^ast$が極大無矛盾集合であることから、$bot in.not Gamma^ast$であることに注意されたい。$phi in Gamma^ast <=> [|phi|]_v = 1$を数学的帰納法で示す。

**基底部**
$phi$が原子命題$p$であるとき、$p in Gamma^ast$であるならば$v(p) = 1$であり、$[|p|]_v = v(p) = 1$である。$p in.not Gamma^ast$であるならば$v(p) = 0$であり、$[|p|]_v = v(p) = 0$である。よって、基底部は成り立つ。

**帰納部**
以下が成り立っていると仮定する。
$$
[|phi_1|]_v = 1 <=> phi_1 in Gamma^ast\
[|phi_2|]_v = 1 <=> phi_2 in Gamma^ast
$$
このとき、自然演繹で用いる論理結合子は$and, ->$であるので、これらについて示す。
- **連言**
  $phi = phi_1 and phi_2$であるとする。このとき、
  $$
  [|phi_1 and phi_2|]_v = 1 &<=> min( [|phi_1|]_v, [|phi_2|]_v ) = 1\
  &<=> [|phi_1|]_v = 1 quad "and" quad [|phi_2|]_v = 1\
  &attach(limits(<=>), t: "A") phi_1 in Gamma^ast quad "and" quad phi_2 in Gamma^ast\
  &attach(limits(<=>), t: "B") Gamma^ast tack.r.short phi_1 quad "and" quad Gamma^ast tack.r.short phi_2\
  &attach(limits(<=>), t: "C") Gamma^ast tack.r.short (phi_1 and phi_2)\
  &attach(limits(<=>), t: "D") (phi_1 and phi_2) in Gamma^ast
  $$
  であるから、連言について成り立つ。なお、A, B, C, Dはそれぞれ以下の補題または性質を用いている。
   - A: 帰納法の仮定
   - B: @lem-max-cons-closure （逆は自明）
   - C: $=>$は自然演繹の連言の導入規則、$arrow.l.double$は連言の消去規則
   - D: @lem-max-cons-closure （逆は自明）

- **含意**
  $phi = phi_1 -> phi_2$であるとする。このとき、
  $$
  [|phi_1 -> phi_2|]_v = 1 &<=> 1 = cases(
     1 & quad "if" [|phi_1|]_v = 0,
     [|phi_2|]_v & quad "if" [|phi_1|]_v = 1,
  )\
  &<=> (( [|phi_1|]_v = 1 ) quad => quad ( [|phi_2|]_v = 1 ))\
  &attach(limits(<=>), t: "A") (( phi_1 in Gamma^ast ) quad => quad ( phi_2 in Gamma^ast ))\
  &attach(limits(<=>), t: "B") ( phi_1 -> phi_2 ) in Gamma^ast
  $$
  であるから、含意について成り立つ。なお、A, B, C, Dはそれぞれ以下の補題または性質を用いている。
   - A: 帰納法の仮定
   - B: @lem-max-cons-imp-bicond

いづれの場合も、$[|phi|]_v = 1 <=> phi in Gamma^ast$が成り立つ。したがって、すべての$phi in Gamma^ast$について$[|phi|]_v = 1$である。特に、$Gamma subset.eq Gamma^ast$であったので、すべての$phi in Gamma$についても$[|phi|]_v = 1$である。

以上より証明は完了した。$square.filled$
:::

@lem-max-cons-val-exist の系として、以下が成り立つ。

:::column-toc
(cor-cons-val-exist)=
@title:【系】導出可能性と付値の存在の同値性

**【主張】**
以下の2つは同値である。

1. $Gamma tack.r.not phi$
2. すべての$phi in Gamma$について$[|phi|]_v = 1$となる付値$v$が存在し、かつ$[|phi|]_v = 0$である。

**【証明】**
$Gamma tack.r.not phi$であるとする。このとき、$Gamma tack.r.short bot$であるなら、矛盾の消去規則より、$Gamma tack.r.short phi$であるので不適。したがって$Gamma$は無矛盾である。また、$Gamma union {not phi} tack.r.short bot$であるなら、背理法の規則より、$Gamma tack.r.short phi$であるので不適。したがって、$Gamma union {not phi}$も無矛盾である。

当然、$Gamma tack.r.short phi$なら$Gamma union {not phi} tack.r.short bot$であり、$Gamma union {not phi}$は無矛盾ではない。
:::prooftree
rule(
   name:[$-> "E"$],
   $bot$,
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   $phi -> bot$,
)
:::

なので、

- $Gamma tack.r.not phi$
- $Gamma union {not phi}$は無矛盾である

は同値である。ここで、@lem-max-cons-val-exist より、

- $Gamma union {not phi}$は無矛盾である
- すべての$psi in Gamma union {not phi}$について$[|psi|]_v = 1$となる付値$v$が存在する
- すべての$psi in Gamma$について$[|psi|]_v = 1$となる付値$v$が存在し、かつ$[|not phi|]_v = 1$である

は同値である。ここで、$[|not phi|]_v = 1$は$[|phi|]_v = 0$と同値である。したがって、以下の2つは同値である。

1. $Gamma tack.r.not phi$
2. すべての$phi in Gamma$について$[|phi|]_v = 1$となる付値$v$が存在し、かつ$[|phi|]_v = 0$である。

以上で証明が完了した。$square.filled$

:::

さて、@cor-cons-val-exist を用いて、自然演繹の完全性を示す。

:::column-toc
(thm-natural-deduction-completeness)=
@title: 【定理】自然演繹の完全性

**【主張】**
自然演繹は完全である。すなわち、$Gamma models phi$ならば$Gamma tack.r.short phi$である。

**【証明】**
対偶を示す。すなわち、$Gamma tack.r.not phi$ならば$Gamma tack.r.double.not phi$であることを示す。

$Gamma tack.r.not phi$であるとする。このとき、@cor-cons-val-exist より、すべての$psi in Gamma$について$[|psi|]_v = 1$となる付値$v$が存在し、かつ$[|phi|]_v = 0$である。したがって、すべての$sigma in Gamma$について$[|sigma|]_v = 1$となる付値$v$に対して$[|phi|]_v = 0$であるから、$Gamma models phi$の定義である
$$
forall v : italic("ATOM") -> {0, 1}, ( forall sigma in Gamma, [|sigma|]_v = 1 ) => [|phi|]_v = 1
$$

は成り立たない。したがって、$Gamma tack.r.double.not phi$である。$square.filled$
:::