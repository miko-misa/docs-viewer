---
title: 一階述語論理の充足不能性の判定
---

# 一階述語論理の充足不能性の判定
一階述語論理はとても表現力がその分、扱いが難しい。そのため、コンピュータを用いて自動的に証明を行う研究が盛んに行われている。その中で特に重要な役割を果たすのが **エルブランの定理 (Herbrand's theorem)** である。この定理は、一階述語論理の充足可能性を、より単純な命題論理の充足可能性に帰着させるものであり、自動定理証明において基礎的な役割を果たしている。ここでは、エルブランの定理を証明するために必要な概念を紹介し、最終的に定理の証明を示す。

## スコーレム標準形
エルブランの定理を理解するためには、まず **スコーレム標準形 (Skolem normal form)** を理解する必要がある。スコーレム標準形とは、すべての存在量化子が関数記号に置き換えられた一階述語論理式のことである。具体的には以下のように変換される。

1. 式$phi$を冠頭標準形に変換する。これを$phi'$とする。
2. $psi$を冠頭標準形とする。$phi'$が以下のような形になっているとき、
   $$
   forall x_1 forall x_2 ... forall x_n exists y ( psi )
   $$
   以下のように変換する。
   $$
   forall x_1 forall x_2 ... forall x_n ( psi [ f(x_1, x_2, ..., x_n) \/ y ] )
   $$
   ここで、$f$は新しい関数記号であり、$y$に依存する変数$x_1, x_2, ..., x_n$を引数として取る。
3. すべての存在量化子について同様の変換を行う。

この変換により、元の式$phi$とスコーレム標準形$phi_s$は意味的に等価である。改めて、スコーレム標準形とは以下の2つの条件を満たす式である。

1. 冠頭標準形である。
2. 全称量化子のみを含み、存在量化子は含まない。

## コンパクト性
**コンパクト性 (compactness)** は、一階述語論理の重要な性質であり、無限集合の充足可能性を有限部分集合の充足可能性に帰着させるものである。具体的には、以下で示す。

:::column-toc
(thm-compactness-prop)=
@title: 【定理】命題論理のコンパクト性

**【主張】**
以下の2つは同値である。

1. 論理式の無限集合$Gamma$が充足不能（@semantic-func/sec-satisfiable）である。
2. $Gamma$の有限部分集合$Gamma_0 subset.eq Gamma$が充足不能である。

**【証明】**
2から1は明らかであるので、1から2を示す。示したい命題の対偶をとると、論理式の無限集合$Gamma$が充足可能であるならば、$Gamma$のすべての有限部分集合$Gamma_0 subset.eq Gamma$が充足可能であることを示せばよい。

$Gamma$が充足可能であるならば、ある付値$v$が存在して
$$
[| phi |]_v = 1 quad (forall phi in Gamma)
$$
を満たす。したがって、$Gamma$の任意の有限部分集合$Gamma_0 subset.eq Gamma$についても
$$
[| phi |]_v = 1 quad (forall phi in Gamma_0)
$$
が成り立つ。よって、$Gamma_0$も充足可能である。 $square.filled$
:::

:::column-toc
(thm-compactness-fopl)=
@title: 【定理】一階述語論理のコンパクト性

**【主張】**
以下の2つは同値である。

1. 一階述語論理式の無限集合$Gamma$が充足不能（@fopl-semantic/sec-satisfaction）である。
2. $Gamma$の有限部分集合$Gamma_0 subset.eq Gamma$が充足不能である。

**【証明】**
2から1は明らかであるので、1から2を示す。示したい命題の対偶をとると、論理式の無限集合$Gamma$が充足可能であるならば、$Gamma$のすべての有限部分集合$Gamma_0 subset.eq Gamma$が充足可能であることを示せばよい。
$Gamma$が充足可能であるならば、ある構造$cal(M)$と割り当て$s$が存在して
$$
[| phi |]_s^cal(M) = 1 quad (forall phi in Gamma)
$$
を満たす。したがって、$Gamma$の任意の有限部分集合$Gamma_0 subset.eq Gamma$についても
$$
[| phi |]_s^cal(M) = 1 quad (forall phi in Gamma_0)
$$
が成り立つ。よって、$Gamma_0$も充足可能である。 $square.filled$
:::

## エルブランユニバース
**エルブランユニバース (Herbrand universe)** とは、ある一階述語論理式$phi$のすべての定数記号と関数記号を用いて構成される項の集合である。$phi$に$c_1, c_2, ..., c_n$という定数記号と$f_1, f_2, ..., f_m$という関数記号が含まれているとき、エルブランユニバース$italic("HU")(phi)$は以下の条件を満たす最小の集合である。

1. すべての定数記号$c_i$は$italic("HU")(phi)$に含まれる。
   ない場合、新しい定数記号$c$を導入して$italic("HU")(phi)$に含める。
2. $f_j$がアリティ$k$の関数記号であり、$t_1, t_2, ..., t_k in italic("HU")(phi)$であるとき、$f_j (t_1, t_2, ..., t_k) in italic("HU")(phi)$である。

ただし、これ以降は、$phi$は文であり、スコーレム標準形であると仮定する。
## エルブラン基底
**エルブラン基底 (Herbrand base)** とは、ある一階述語論理式$phi$のすべての述語記号とエルブランユニバースを用いて構成される原子式の集合である。$phi$に$P_1, P_2, ..., P_l$という述語記号が含まれているとき、エルブラン基底$italic("HB")(phi)$は以下の条件を満たす最小の集合である。

1. $P_i$がアリティ$k$の述語記号であり、$t_1, t_2, ..., t_k in italic("HU")(phi)$であるとき、$P_i (t_1, t_2, ..., t_k) in italic("HB")(phi)$である。

## エルブラン構造
**エルブラン構造 (Herbrand structure)** とは、ある一階述語論理式$phi$に対して、そのエルブランユニバースをユニバースとし、すべての定数記号と関数記号をそのまま解釈する @fopl-semantic/sec-structure である。つまり、エルブラン構造$cal(H)(phi)$は以下のように定義される。

1. ユニバース$|cal(H)(phi)| = italic("HU")(phi)$である。
2. すべての定数記号$c_i$に対して、対応する定数元は$c_i$自身である。
3. すべての関数記号$f_j$に対して、対応する関数は$f_j$自身である。
4. 述語記号の解釈は任意に定められる。述語記号$P_i$に対応する関係を$R_i subset.eq |cal(H)(phi)|^k$とする。

2,3について、これはたとえば自然数をユニバースとする構造$cal(M)$において、定数記号$overline(1)$を$1$として、$overline(+)$を加算関数として解釈すると
$$
[|overline(1) + overline(1)|]_cal(M) &= [|overline(1)|]_cal(M) + [|overline(1)|]_cal(M) \
&= 1 + 1\
&= 2
$$
となるのに対して、エルブラン構造では
$$
[|overline(1) + overline(1)|]_(cal(H)(phi)) = overline(1) + overline(1)
$$
から進まない。一方で、エルブラン構造では述語記号の解釈は任意に定められるため、たとえば述語記号$P$がアリティ$1$であるとき、$P(overline(1))$を真とし、$P(overline(1) + overline(1))$を偽とすることも可能である。

## エルブラン充足可能性
一階述語論理式$phi in italic("Form")$が **エルブラン充足可能(Herbrand satisfiable)** であるとは、あるエルブラン構造$cal(H)(phi)$が存在して
$$
cal(H)(phi) models phi <=> [| phi |]_(cal(H)(phi)) = 1
$$
を満たすことである。

## 一階述語論理を命題論理へ
ここまでに述べた概念を用いて話を進めよう。$phi$は以下のようなスコーレム標準形の文であるとする。
$$
forall x_1 forall x_2 ... forall x_n ( psi(x_1, x_2, ..., x_n) )
$$
すると、$x_1, x_2, ..., x_n$にエルブランユニバース$italic("HU")(phi)$の元をすべての組み合わせて代入して得られる集合$Phi$は
$$
Phi = { psi[x_1, x_2, ..., x_n \/ t_1, t_2, ..., t_n] | t_1, t_2, ..., t_n in italic("HU")(phi) }
$$
である。ここで、この集合の元に着目すると全称量化子はなく、あるのは原子式と結合子だけである。この原子式はすべてエルブラン基底$italic("HB")(phi)$に含まれるものである。これを原子命題と見なすと、集合の元は命題論理である。つまり、$Phi$は命題論理式の集合であると見なせる。さらに、付値$v$を以下のように定める。
$$
[| P_i (t_1, t_2, ..., t_k) |]_v = cases(
    1 & quad "if " P_i (t_1, t_2, ..., t_k) in [|P_i|]_(cal(H)(phi)),
    0 & quad "otherwise"
  )
$$

つまり、エルブラン構造$cal(H)(phi)$における述語記号の解釈をそのまま命題論理における付値として用いるのである。

## エルブランの定理
以上の準備を踏まえて、エルブランの定理を示す。

:::column-toc
(thm-herbrand)=
@title: 【定理】エルブランの定理

**【主張】**
一階述語論理式$phi in italic("Form")$がスコーレム標準形であるとき、以下は同値である。

1. $phi$は充足不能である。
2. 命題論理式の集合$Phi$の部分集合$Phi_0 subset.eq Phi$が充足不能である。

**【証明】**
1から2を示す。$phi$が充足不能であるならば、、すべてのエルブラン構造$cal(H)(phi)$について
$$
cal(H)(phi) tack.r.double.not phi <=> [| phi |]_(cal(H)(phi)) = 0
$$
が成り立つ。したがって、エルブラン構造$cal(H)(phi)$に対応する付値$v$についても
$$
[| psi[x_1, x_2, ..., x_n \/ t_1, t_2, ..., t_n] |]_v = 0 quad (forall t_1, t_2, ..., t_n in italic("HU")(phi))
$$
が成り立つ。よって、命題論理式の集合$Phi$も充足不能である。ここで、@thm-compactness-prop より、$Phi$の部分集合$Phi_0 subset.eq Phi$が充足不能である。

逆は対偶を考えれば同様に示せる。$square.filled$
:::


:::column-toc
@title: 【例】エルブランの定理の応用例


たとえば、$forall x (p(c) and (p(x) -> q(f(x))) and not q(x))$という式をが充足不能であることを示そう。ただし、$c$は定数記号、$f$はアリティ$1$の関数記号、$p, q$はアリティ$1$の述語記号であるとする。この式はスコーレム標準形である。

**【主張】**
$forall x (p(c) and (p(x) -> q(f(x))) and not q(x))$は充足不能である。

**【証明】**
エルブランユニバース$italic("HU")(phi)$は
$$
italic("HU")(phi) = { c, f(c), f(f(c)), f(f(f(c))), ... }
$$
である。$phi$の$x$に$c$を代入してみると
$$
p(c) and (p(c) -> q(f(c))) and not q(c)
$$
となる。つぎに、$x$に$f(c)$で代入すると
$$
p(c) and (p(f(c)) -> q(f(f(c)))) and not q(f(c))
$$
となる。ここで原子命題に置き換えてみる。具体的には、$p(c) = p_0$、$p(f(c)) = p_1$、$q(f(c)) = q_1$、$q(f(f(c))) = q_2$と置き換える。すると、上記の式は
$$
p_0 and (p_0 -> q_1) and not q_0\
p_0 and (p_1 -> q_2) and not q_1
$$
となる。以下の証明図から

:::prooftree
rule(
  name:[$->"E"$],
  $bot$,
  rule(
    name:[$and"E"$],
    $not q_1$,
    $p_0 and (p_1 -> q_2) and not q_1$
  ),
  rule(
    name:[$->"E"$],
    $q_1$,
    rule(
      name:[$and"E"$],
      $p_0 -> q_1$,
      $p_0 and (p_0 -> q_1) and not q_0$
    ),
    rule(
      name:[$and"E"$],
      $p_0$,
      $p_0 and (p_1 -> q_2) and not q_1$
    )
  )
)
:::

より、$Phi_0 = {
  p_0 and (p_0 -> q_1) and not q_0,
  p_0 and (p_1 -> q_2) and not q_1
}$について$Phi_0 tack.r bot$が成り立つ。このとき、@natural-deduction/thm-natural-deduction-soundness より、$Phi_0 models bot$でありこれは充足不能である。したがって、エルブランの定理より、元の式$phi$も充足不能であることが示された。

:::



