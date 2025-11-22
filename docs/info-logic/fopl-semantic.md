---
title: 一階述語論理の意味論
---

# (fopl-semantic)= 一階述語論理の意味論
一階述語論理(@fopl-define)の **意味論(semantics)** は、一階述語論理式の真偽値を決定するための体系であり、これまで文字列でしかなった一階述語論理に「意味」を与える。意味論は、構造(structure)や解釈(interpretation)といった概念を用いて、一階述語論理式がどのように評価されるかを定義する。

## (sec-universe)= ユニバース
一階述語論理の **ユニバース(universe)** は、解釈において対象となる要素の集合であり、通常は非空集合として定義される。一階述語論理では個体変数が存在したが、この個体変数が何を指示しているのかはユニバースによって決定される。また、$forall x$という量子化がどの集合全体での普遍性を表しているのかもユニバースによって決定される。

## (sec-structure)= 構造（ストラクチャ）
一階述語論理の **構造(structure)** とは、一階述語論理のシグネチャ(@fopl-define/sec-signature)の記号に対して具体的な演算や関係を割り当てるものであり、ユニバースを基にして定義される。以下のように定義される。

一階述語論理の構造$cal(M)$は以下のように定義できる。

$$
cal(M) = angle.l M, R_1, R_2, ..., R_n, F_1, F_2, ..., F_m, { C_i | i in I } angle.r
$$

ただし、

- $M$はユニバースであり、非空集合である。
- $R_j$は$M$上の$italic("ar")(P_j) = n_j$項関係である。つまり、$R_j subset.eq M^(n_j)$である。
- $F_j$は$M$上の$italic("ar")(f_j) = m_j$項関数である。つまり、$F_j : M^(m_j) -> M$である。
- $C_i$は$M$の元である。つまり、${ C_i | i in I }$は$M$の部分集合である。

上記のとおり、構造自体の定義にはシグネチャとの関係は含まれていない。 しかし、解釈においてシグネチャの記号と構造の要素を対応付けることで、シグネチャに意味を与えることができる。そのために、以下に構造に関するシミラリティタイプを定義する。なお、関係に関して$dot(=)$は特別な関係なので、たびたび省略されることがある。また、ユニバース$M$を以下のように表現する。
$$
M = |cal(M)|
$$

## 構造のシミラリティタイプ
一階述語論理の構造$cal(M)$の **シミラリティタイプ(similarity type)** $tau_cal(M)$を以下のように定義する。ただし、$cal(M)$は @sec-structure で定義したものであるとする。

$$
r_i &= italic("ar")(R_i)\
a_i &= italic("ar")(F_i)\
kappa &= |{ C_i | i in I }| = |I|\
tau_cal(M) &= angle.l thin r_1, r_2, ..., r_n thin ; thin a_1, a_2, ..., a_m thin ; thin kappa thin angle.r
$$

構造のシミラリティタイプは構造から一意に決定されるアリティをまとめたものである。つまり、構造における「要素」を忘れそのアリティ情報だけを残したものである。ただし、ここでも$dot(=)$が省略されることがある。定義したシグネチャのシミラリティタイプ$tau_L$と構造$cal(M)$のシミラリティタイプ$tau_cal(M)$を一致させることで、シグネチャの記号と構造の要素を対応付けることができる。 これにより、シグネチャに意味を与えることができる。

たとえば、一階述語論理のシグネチャ$L$が以下のように与えられているとする。

- 定数記号: $italic("Const") = { 0, 1 }$
- 関数記号: $italic("Func") = { +, dot }$ ただし、$italic("ar")(+) = italic("ar")(dot) = 2$
- 述語記号: $italic("Pred") = { dot(=) }$ ただし、$italic("ar")(dot(=)) = 2$

このとき、シミラリティタイプは$angle.l ; 2, 2 ; 2 angle.r$となる。これに対応できる（同じシミラリティタイプをもつ）構造は以下のようなものがある。

- $angle.l NN, +, dot, { 0, 1 } angle.r$ 
- $angle.l RR, +, dot, { 0, 1 } angle.r$
- $angle.l M_n (CC), +, dot , { O, I } angle.r$

## 拡張言語
一階述語論理の **拡張言語(extension language)** とは、元のシグネチャに新たな定数記号、関数記号、述語記号を追加したものである。あるシグネチャ$L = angle.l italic("Const"), italic("Func"), italic("Pred"), italic("ar") angle.r$について、それとシミラリティタイプをもつ構造$cal(M)$が与えられているとする。このとき、シグネチャ$L$の拡張言語$L(cal(M))$は$L$に対して、ユニバース$|cal(M)|$の各要素$v$に対応する新たな定数記号$overline(v)$を追加したものである。すでに、対応する定数記号が存在する場合は追加されない。

## 解釈
一階述語論理の **解釈(interpretation)** とは、シグネチャの記号と構造の要素を対応付けるものであり、これによりシグネチャに意味を与えることができる。この説では、あるシグネチャ$L$とそれとシミラリティタイプをもつ構造$cal(M)$が与えられているとする。このとき、すでに以下のような対応関係がある。

- 各述語記号$P_i in italic("Pred")$に対して、構造$cal(M)$の関係$R_i$が対応付けられている。アリティは一致している。
- 各関数記号$f_i in italic("Func")$に対して、構造$cal(M)$の関数$F_i$が対応付けられている。アリティは一致している。
- 各定数記号$c_i in italic("Const")$に対して、構造$cal(M)$の要素$C_i$が対応付けられている。

けるある式あるいは項$phi$の解釈は$[|phi|]_cal(M)$と表す。

### 閉項の解釈
拡張言語$L(cal(M))$における閉項$t$の解釈は項上の写像(@fopl-define/sec-term-map)を用いて以下のように定義される。

$$
[||]_cal(M) : italic("Term"_c) &-> M\
[|overline(v)|]_cal(M) &= v quad (overline(v) in.not italic("Const") and v in |cal(M)|)\
[|c_i|]_cal(M) &= C_i quad (c_i in italic("Const"))\
[|f_i (t_1, t_2, ..., t_n)|]_cal(M) &= F_i ([|t_1|]_cal(M), [|t_2|]_cal(M), ..., [|t_n|]_cal(M))\
&quad quad (f_i in italic("Func"), italic("ar")(f_i) = italic("ar")(F_i) = n, t_1, t_2, ..., t_n in italic("Term"))
$$

たとえば、以下のようなシグネチャ$L$と構造$cal(N)$が与えられているとする。

- シグネチャ$L$:
  - 定数記号: $italic("Const") = { overline(0) }$
  - 関数記号: $italic("Func") = { +, overline(S) }$ ただし、$italic("ar")(+) = 2, italic("ar")(S) = 1$
  - 述語記号: $italic("Pred") = { dot(=) }$ ただし、$italic("ar")(dot(=)) = 2$
- 構造$cal(M)$:
  - ユニバース: $|cal(M)| = NN$ （自然数の集合）
  - 関係: $dot(=)$ は通常の等号関係
  - 関数: $+$ は通常の加算、$S$ は後者関数 $S: n |-> n + 1$
  - 定数: 自然数の$0$

このとき、$[| S(0) + S(S(S(0))) |]_cal(M)$は以下のように計算される。

$$
[| overline(S)(0) + overline(S)(overline(S)(overline(S)(0))) |]_cal(M) &= [| overline(S)(0) |]_cal(M) + [| overline(S)(overline(S)(overline(S)(0))) |]_cal(M) \
&= S([| 0 |]_cal(M)) + S([| overline(S)(overline(S)(0)) |]_cal(M)) \
&= S(0) + S(S([| overline(S)(0) |]_cal(M))) \
&= S(0) + S(S(S([| 0 |]_cal(M)))) \
&= S(0) + S(S(S(0))) \
&= 1 + 3 \
&= 4
$$

## 文の解釈
一階述語論理の文$phi$の解釈は一階述語論理上の写像(@fopl-define/sec-fopl-map)を用いて以下のように定義される。ただし、$phi,psi$は文である。

$$
[||]_cal(M) : italic("Sent") &-> { 0, 1 }\
[| P_i (t_1, t_2, ..., t_n) |]_cal(M) &= cases(
  1 quad " if " quad ([|t_1|]_cal(M), [|t_2|]_cal(M), ..., [|t_n|]_cal(M)) in R_i,
  0 quad "otherwise"
)\
&quad quad (P_i in italic("Pred"), italic("ar")(P_i) = italic("ar")(R_i) = n > 0, t_1, t_2, ..., t_n in italic("Term"))\
[|P_i |]_cal(M) &= cases(
  1 quad "if" quad () in R_i <=> R_i eq.not emptyset,
  0 quad "otherwise"
)\
&quad quad (P_i in italic("Pred"), italic("ar")(P_i) = italic("ar")(R_i) = 0)\
[| (phi and psi ) |]_cal(M) &= min( [|phi|]_cal(M), [|psi|]_cal(M) )\
[| (phi or psi ) |]_cal(M) &= max( [|phi|]_cal(M), [|psi|]_cal(M) )\
[| (not phi) |]_cal(M) &= cases(
  1 quad "if" quad [|phi|]_cal(M) = 0,
  0 quad "otherwise"
)\
[| (phi -> psi) |]_cal(M) &= cases(
  0 quad "if" quad [|phi|]_cal(M) = 1 and [|psi|]_cal(M) = 0,
  1 quad "otherwise"
)\
[| (phi <-> psi) |]_cal(M) &= cases(
  1 quad "if" quad [|phi|]_cal(M) = [|psi|]_cal(M),
  0 quad "otherwise"
)\
[| (forall x (phi)) |]_cal(M) &= min_( v in |cal(M)| ) ( [| phi[overline(v) \/ x] |]_cal(M) )\
[| (exists x (phi)) |]_cal(M) &= max_( v in |cal(M)| ) ( [| phi[overline(v) \/ x] |]_cal(M) )
$$



