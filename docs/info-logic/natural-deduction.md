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
   Gamma tack.r.short phi, med Delta tack.r.short psi => Gamma union Delta tack.r.short (phi and psi)
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
   Gamma tack.r.short psi => Gamma \\ {phi} tack.r.short (phi -> psi)
   $$
   $phi$を仮定して、もしくは仮定せずに$psi$を導出できている場合
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
   このとき、仮定$phi$は$Gamma$に含まれている場合$Gamma$から取り除かれる。$phi$がそもそも仮定に含まれていない場合について下で詳しく述べる。
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
   align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi -> psi$]],
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
   この規則は一見すると奇妙であるが、意味論に裏付けされている。後述する。
6. **背理法** （古典論理）
   $not phi in Gamma$であるとき、
   $$
   Gamma tack.r.short bot => Gamma \\ {not phi} tack.r.short phi
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

ここで、$phi tack.r.short psi$のとき、これは端的に$phi -> psi$が成り立っててほしい。つまり、$Gamma = {phi_1, phi_2, dots, phi_n} tack.r.short psi$について$phi_1 and phi_2 and ... and phi_n -> psi$が成り立つ。しかしながら、$Gamma$が矛盾しており$phi_1 and phi_2 and ... and phi_n$が常に偽である場合、$->$の規則から$phi$が何であれ、これは真となっててほしい。真となるものは、導出されるべきという完全性を課せば、$phi$には任意の命題を入れることができなければならず、それがルールとなっている。したがって、爆発則は意味論的に正当化される。

改めて述べるが、この規則も自然演繹が完全性と健全性を持つことに寄与しており、上の説明のように完全性から導かれたり、他の理論から導かれるルールではない。つまり、完全性と健全性のためにこの規則が必要である、ということである。

## 自然演繹の健全性
あらためて、健全性とは以下が成り立つことを言うのであった。

$$
Gamma tack.r.short phi => Gamma models phi
$$

これを構造に関する数学的帰納法で示す。

:::column-toc
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
   $psi$が集合命題$Gamma$から導出された命題であり、$[|psi|]_v = 1 quad (v in V(Gamma))$であると仮定する。含意の導入規則より、$Gamma \\ {phi} tack.r.short (phi -> psi)$である。このとき、付値$v^prime in V(Gamma \\ {phi})$について考える。

   [|phi|]_(v^prime) = 1の場合、定義より$Gamma$から$phi$を除いた集合の元$sigma$に対しても、$[|sigma|]_(v^prime) = 1$であるから、$v^prime in V(Gamma)$である。したがって、$[|psi|]_(v^prime) = 1$である。よって、付値$v^prime$について、
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
   であるから、$Gamma \\ {phi} models (phi -> psi)$が成り立つ。以上の議論は$phi in.not Gamma$においても問題なく成り立つことに注意されたい。
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
   $bot$が集合命題$Gamma$から導出された命題であり、$[|bot|]_v = 1 quad (v in V(Gamma))$であると仮定する。ただし、$not phi in Gamma$である。しかし、$[|bot|] = 0$なので$V(Gamma) = emptyset$である。背理法の規則より、$Gamma \\ {not phi} tack.r.short phi$である。このとき、付値$v^prime in V(Gamma \\ {not phi})$について考える。

   - $[|phi|]_(v^prime) = 1$の場合、$[|phi|]_(v^prime) = 1$であることは自明である。
   - $[|phi|]_(v^prime) = 0$の場合、定義より$[|not phi|]_(v^prime) = 1$である。定義より,$Gamma$から$not phi$を除いた集合の元$sigma$に対しても、$[|sigma|]_(v^prime) = 1$であるから、
      $$
      [|sigma|]_(v^prime) = 1 quad forall sigma in Gamma
      $$
      であり、$v^prime in V(Gamma)$である。しかし、これは$V(Gamma) = emptyset$と矛盾する。したがって、この場合は起こりえない。

   よって、付値$v^prime in V(Gamma \\ {not phi})$について、$[|phi|]_(v^prime) = 1$であるから、$Gamma \\ {not phi} models phi$が成り立つ。

以上で、すべての推論規則について示したので、自然演繹は健全であることが示された。$square.filled$

:::