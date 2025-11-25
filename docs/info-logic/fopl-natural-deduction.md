---
title: 一階述語論理の自然演繹法
---

# 一階述語論理の自然演繹法
ここでは、命題論理で考えていた導出について、一階述語論理に拡張した自然演繹法について説明する。

## 対象とする一階述語論理
@natural-deduction/sec-natural-target と同じように一階述語論理のうち一部を対象とする。具体的には結合子として${->, and, bot}$をもち、量化子として$forall$のみをもつ一階述語論理を対象とする。これらのみですべて一階述語論理について意味的等価な式を表現できることが知られている。この性質は **表現的完全性(expressive completeness)** とよばれ、命題論理の @normal-form/normal-form と同じようなものである。それ以外の記号は下のような略記として考える。

- **否定** : $not phi approx (phi -> bot)$
- **選言** : $phi or psi approx not ( not phi and not psi ) approx ((phi -> bot) and (psi -> bot)) -> bot$
- **同値** : $phi <-> psi approx (phi -> psi) and (psi -> phi)$
- **存在量化子** : $exists x phi approx not forall x not phi approx forall x (phi -> bot) -> bot$

原子式を原子命題のように扱い、量子化を無視すれば基本的には命題論理と自然演繹と同じである。ただし、量化子に関する特別な推論規則が必要になる。ここでは、命題論理に対する自然演繹法に対して異なる点を中心に説明する。

## 推論規則
一階述語論理に対する自然演繹法では、命題論理に対する自然演繹法の推論規則に加えて、量化子に関する以下の推論規則が必要になる。

1. **全称の導入規則**
   すべての$psi in Gamma$について$x in.not italic("FV")(psi)$ならば
   $$
   Gamma tack.r.short phi =>  Gamma tack.r.short forall x (phi)
   $$
   仮定に含まれない変数$x$について、命題$phi$が導出できるならば、$forall x (phi)$も導出できる。
   :::prooftree
   rule(
    name:[$forall "I"$],
    $forall x (phi)$,
    align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi$]],
   )
   :::
2. **全称の除去規則**
   $t "is free for" x "in" phi$ならば
   $$
    Gamma tack.r.short forall x (phi) =>  Gamma tack.r.short phi[t \/ x]
   $$
    $forall x (phi)$が導出でき、項$t$が変数$x$に自由に代入できるならば、$phi[t\/x]$も導出できる。
    :::prooftree
    rule(
     name:[$forall "E"$],
     $phi[t \/ x]$,
     align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$forall x (phi)$]],
    )
    :::

他の規則については @natural-deduction/sec-natural-deduction-rule と同様である。ただし、命題論理の$phi,psi$内に$forall$や$exists$が含まれているものと考えること。

## 存在量化子の導入と除去
存在量化子については、上で説明したように否定と全称量化子を用いて定義されるため、存在量化子に関する特別な導入規則や除去規則は必要ない。しかし、推論規則から正しく導出できることを確認しておく。

:::column-toc
@title: 存在量化子の導入

**【主張】**
推論規則を組み合わせることで、以下の存在量化子の導入ができる。
$t "is free for" x "in" phi$ならば
$$
Gamma tack.r.short phi[t \/ x] =>  Gamma tack.r.short exists x (phi)
$$

**【証明】**
これは以下のように実際に導出できる。
:::prooftree
rule(
  name:[$-> "I"_1$],
  $forall x(not phi) -> bot$,
  rule(
    name:[$-> "E"$],
    $bot$,
    rule(
      name:[$forall "E"$],
      $not phi[t \/ x]$,
      $[forall x (not phi)]^1$,
    ),
    $phi[t \/ x]$,
  )
)
:::

:::

:::column-toc
@title: 存在量化子の除去

**【主張】**
推論規則を組み合わせることで、以下の存在量化子の除去ができる。
$c$は定数記号もしくは変数記号で、$c "is free for" x "in" phi$である。また、$c$は$Gamma$や$Delta$内に現れないものとする。このとき、

$$
Gamma tack.r.short exists x (phi), Delta union {phi[c \/ x]} tack.r.short psi =>  Gamma union Delta tack.r.short psi
$$

**【証明】**
これは以下のように実際に導出できる。
:::prooftree
rule(
  name:[$"RAA"_1$],
  $psi$,
  rule(
    name:[$->"E"$],
    $bot$,
    rule(
      name:[$forall "I"$],
      $forall x (not phi)$,
      rule(
        name:[$-> "I"_2$],
        $not phi[c \/ x]$,
        rule(
          name:[$-> "E"$],
          $bot$,
          align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta quad [phi[c \/ x]]^2$][$dots.v$][$psi$]],
          $[not psi]^1$,
        ),
      ),
    ),
    align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$not forall x (not phi)$]],
  )
)
:::

:::

これは以下のように存在量子化に関する規則として書くこともできる。

1. **存在量化子の導入規則**
    $t "is free for" x "in" phi$ならば
    :::prooftree
    rule(
      name:[$exists "I"$],
      $exists x (phi)$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$phi[t \/ x]$]],
    )
    :::
2. **存在量化子の除去規則**
    $c$は定数記号もしくは変数記号で、$c "is free for" x "in" phi$である。また、$c$は$Gamma$や$Delta$内の式に現れないものとする。このとき、
    :::prooftree
    rule(
      name:[$exists "E"_1$],
      $psi$,
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Gamma$][$dots.v$][$exists x (phi)$]],
      align(center)[#stack(dir: ttb, spacing: 4pt)[$Delta thick thick [phi[c \/ x]]^1$][$dots.v$][$psi$]],
    )
    :::

## 自然演繹法の健全性
一階述語論理に対する自然演繹法についても、命題論理の場合と同様に健全性（@duality-deductive/sec-soundness-completeness ）が成り立つ。一階述語論理の場合はトートロジーではなく @fopl-semantic/sec-logical-consequence との健全性を考えなければならない。今回は、式も文でも健全性が成り立つために解釈を構造$cal(M)$と割当$s$の組み合わせとして考える。これは @fopl-semantic/sec-general-interpretation で説明したものである。

:::column-toc
@title: 【定理】一階述語論理の自然演繹法の健全性

**【主張】**
$Gamma subset.eq italic("Form"), phi in italic("Form")$に対して、以下が成り立つ。
$$
Gamma tack.r.short phi  =>  Gamma models phi
$$

**【証明】**
解釈$(cal(M), s)$は任意の一階述語論理の原子式$p$に対して意味関数で${0,1}$の値を割り当てる。そのために、これは命題論理における付値と同じように振る舞う。したがって、@natural-deduction/thm-natural-deduction-soundness がそのまま有効である。異なるのは帰納部で全称量化子に関する証明が必要であることである。

ある式集合$Gamma$内のすべての式$phi$について
$$
[|phi|]_s^cal(M) = 1
$$
を満たすような解釈$(cal(M), s)$全体を$V(Gamma)$とする。

1. **全称の導入規則**
   $phi$が集合$Gamma$から導出された式であり、$Gamma models phi$を満たしているとする。全称の導入規則により$forall x (phi)$が導出されたとしよう。このとき、どんな解釈$(cal(M), s) in V(Gamma)$についても
   $$
   [|psi|]^cal(M)_s = 1 (psi in Gamma)
   $$
   が成り立っている。しかし、全称の導入規則の仮定より$Gamma$内のすべての式は変数$x$を含まない。つまり、$x$に対する割当はなんでも良く、$x$に対するユニバース内すべてへの割当を$V(Gamma)$は内包している。よって、$x$を$a$に割り当てた時を考えると
   $$
   &forall a in |cal(M)|,  [|phi[overline(a) \/ x]|]_s^cal(M) = 1\
   => &min_(a in |cal(M)|) [|phi[overline(a) \/ x]|]_s^cal(M) = 1\
   => &[|forall x (phi)|]_s^cal(M) = 1 quad (because "definition")
   $$
   である。これがすべての解釈$(cal(M), s) in V(Gamma)$について成り立つため、$Gamma models forall x (phi)$である。
2. **全称の除去規則**
    $forall x (phi)$が集合$Gamma$から導出された式であり、$Gamma models forall x (phi)$を満たしているとする。全称の除去規則により$phi[t \/ x]$が導出されたとしよう。つまり、どんな解釈$(cal(M), s) in V(Gamma)$についても
    $$
    &[|forall x (phi)|]^cal(M)_s = 1\
    => &min_(a in |cal(M)|) [|phi[overline(a) \/ x]|]^cal(M)_s = 1\
    => &[|phi[overline(v) \/ x]|]^cal(M)_s = 1
    $$
    である。ただし、$v$はユニバースの任意の元である。ここで、
    $$
    v = [| t |]^cal(M)_s
    $$
    とおくと
    $$
    [|overline(v)|]^cal(M)_s = v = [| t |]^cal(M)_s
    $$
    であるので、
    $$
    [|phi[overline(v) \/ x]|]^cal(M)_s = [|phi[t \/ x]|]^cal(M)_s
    $$
    が成り立つ。したがって、
    $$
    [|phi[t \/ x]|]^cal(M)_s = 1
    $$
    である。これがすべての解釈$(cal(M), s) in V(Gamma)$について成り立つため、$Gamma models phi[t \/ x]$である。

以上より、すべての推論規則について健全性が成り立つため、自然演繹法全体についても健全性が成り立つことが示された。$square.filled$

:::