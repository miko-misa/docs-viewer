---
title: 一階述語論理の意味論
---

# (fopl-semantic)= 一階述語論理の意味論
@fopl-define/sec-formの **意味論(semantics)** は、一階述語論理式の真偽値を決定するための体系であり、これまで文字列でしかなった一階述語論理に「意味」を与える。意味論は、@sec-structureや解釈(interpretation)といった概念を用いて、一階述語論理式がどのように評価されるかを定義する。

## (sec-universe)= ユニバース
一階述語論理の **ユニバース(universe)** は、解釈において対象となる要素の集合であり、通常は非空集合として定義される。一階述語論理では個体変数が存在したが、この個体変数が何を指示しているのかはユニバースによって決定される。また、$forall x$という量子化がどの集合全体での普遍性を表しているのかもユニバースによって決定される。

## (sec-structure)= 構造（ストラクチャ）
一階述語論理の **構造(structure)** とは、一階述語論理の@fopl-define/sec-signatureの記号に対して具体的な演算や関係を割り当てるものであり、@sec-universeを基にして定義される。以下のように定義される。

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

:::column-toc 
@title: 【注意】シミラリティタイプの一致

この先、一階述語論理のシグネチャ$L$とそれに対して考えている構造$cal(M)$は同じシミラリティタイプをもつものとする。
:::

## 拡張言語
一階述語論理の **拡張言語(extension language)** とは、元のシグネチャに新たな定数記号、関数記号、述語記号を追加したものである。あるシグネチャ$L = angle.l italic("Const"), italic("Func"), italic("Pred"), italic("ar") angle.r$について、それと同じシミラリティタイプをもつ構造$cal(M)$が与えられているとする。このとき、シグネチャ$L$の拡張言語$L(cal(M))$は$L$に対して、ユニバース$|cal(M)|$の各要素$v$に対応する新たな定数記号$overline(v)$を追加したものである。すでに、対応する定数記号が存在する場合は追加されない。

## 解釈
一階述語論理の **解釈(interpretation)** とは、シグネチャの記号と構造の要素を対応付けるものであり、これによりシグネチャに意味を与えることができる。この説では、あるシグネチャ$L$とそれとシミラリティタイプをもつ構造$cal(M)$が与えられているとする。このとき、すでに以下のような対応関係がある。

- 各述語記号$P_i in italic("Pred")$に対して、構造$cal(M)$の関係$R_i$が対応付けられている。アリティは一致している。
- 各関数記号$f_i in italic("Func")$に対して、構造$cal(M)$の関数$F_i$が対応付けられている。アリティは一致している。
- 各定数記号$c_i in italic("Const")$に対して、構造$cal(M)$の要素$C_i$が対応付けられている。

ある式、あるいは項$phi$の解釈は$[|phi|]_cal(M)$と表す。

### (sec-closed-term-iter)= 閉項の解釈
拡張言語$L(cal(M))$における@fopl-define/sec-closed-term$t$の解釈は@fopl-define/sec-term-mapを用いて以下のように定義される。

$$
[||]_cal(M) : italic("Term"_c) &-> M\
[|overline(v)|]_cal(M) &= v quad (overline(v) in.not italic("Const") and v in |cal(M)|)\
[|c_i|]_cal(M) &= C_i quad (c_i in italic("Const"))\
[|f_i (t_1, t_2, ..., t_n)|]_cal(M) &= F_i ([|t_1|]_cal(M), [|t_2|]_cal(M), ..., [|t_n|]_cal(M))\
&quad quad (f_i in italic("Func"), italic("ar")(f_i) = italic("ar")(F_i) = n, t_1, t_2, ..., t_n in italic("Term"))
$$

---

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

### 文の解釈
拡張言語$L(cal(M))$における@fopl-define/sec-sentence$phi$の解釈は@fopl-define/sec-fopl-mapを用いて以下のように定義される。ただし、$phi,psi$は文である。

$$
[||]_cal(M) : italic("Sent") &-> { 0, 1 }\
[| P_i (t_1, t_2, ..., t_n) |]_cal(M) &= cases(
  1 quad " if " quad ([|t_1|]_cal(M), [|t_2|]_cal(M), ..., [|t_n|]_cal(M)) in R_i,
  0 quad "otherwise"
)\
&quad quad (P_i in italic("Pred"), italic("ar")(P_i) = italic("ar")(R_i) = n > 0, t_1, t_2, ..., t_n in italic("Term")_c)\
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

$phi$が@fopl-define/sec-sentence であるとき、自由変数がないため、$forall$や$exists$に対する解釈の定義よりすべての変数記号は何かの定数記号に置換されていてすべての項は @fopl-define/sec-closed-term になる。つまり、項$t$に対する解釈まで到達すると、これは@sec-closed-term-iter に帰着できる。

---

たとえば、@sec-closed-term-iter で定義したシグネチャ$L$と構造$cal(N)$が与えられているとする。なお、$|cal(N)| = {1, 2, 3}$という制限を加える。このとき、$[| forall x ( x + overline(0) dot(=) overline(0) + x ) |]_cal(N)$は以下のように計算される。

$$
[| forall x ( x + overline(0) dot(=) overline(0) + x ) |]_cal(N) &= min_( v in |cal(N)| ) ( [| ( overline(v) + overline(0) dot(=) overline(0) + overline(v) ) |]_cal(N) ) \
&= min( [| ( overline(1) + overline(0) dot(=) overline(0) + overline(1) ) |]_cal(N),
        [| ( overline(2) + overline(0) dot(=) overline(0) + overline(2) ) |]_cal(N),
        [| ( overline(3) + overline(0) dot(=) overline(0) + overline(3) ) |]_cal(N) ) \
&= min( R_(dot(=)) ([| overline(1) + overline(0) |]_cal(N), [| overline(0) + overline(1) |]_cal(N) ),
        R_(dot(=)) ([| overline(2) + overline(0) |]_cal(N), [| overline(0) + overline(2) |]_cal(N) ),
        R_(dot(=)) ([| overline(3) + overline(0) |]_cal(N), [| overline(0) + overline(3) |]_cal(N) ) ) \
&= min( R_(dot(=)) ( [| overline(1) |]_cal(N) + [| overline(0) |]_cal(N),
                      [| overline(0) |]_cal(N) + [| overline(1) |]_cal(N) ),\
&quad quad R_(dot(=)) ( [| overline(2) |]_cal(N) + [| overline(0) |]_cal(N),
                      [| overline(0) |]_cal(N) + [| overline(2) |]_cal(N) ),\
&quad quad R_(dot(=)) ( [| overline(3) |]_cal(N) + [| overline(0) |]_cal(N),
                      [| overline(0) |]_cal(N) + [| overline(3) |]_cal(N) ) ) \
&= min( R_(dot(=)) ( 1 + 0, 0 + 1 ),
        R_(dot(=)) ( 2 + 0, 0 + 2 ),
        R_(dot(=)) ( 3 + 0, 0 + 3 ) ) \
&= min( R_(dot(=)) (1, 1),
        R_(dot(=)) (2, 2),
        R_(dot(=)) (3, 3) ) \
&= min( 1, 1, 1 ) \
&= 1
$$

## 普遍閉包
一階述語論理の式$phi$の **普遍閉包(universal closure)** とは、式$phi$のすべての自由変数を量化したものであり、以下のように定義される。

一階述語論理の式$phi$の自由変数が$x_a_1, x_a_2, ..., x_a_n$であるとする。ただし、$a_1 < a_2 < ... < a_n$とする。このとき、式$phi$の普遍閉包$italic("Cl")(phi)$は以下のように定義される。
$$
italic("Cl")(phi) = (forall x_a_1) (forall x_a_2) ... (forall x_a_n) (phi)
$$

$italic("FV")(italic("Cl")(phi)) = emptyset$であり、普遍閉包は常に文となる。

## 充足関係
一階述語論理式$phi$について$[|italic("Cl")(phi)|]_cal(M) = 1$であるとき、構造$cal(M)$は式$phi$を **充足(satisfy)** しているといい
$$
cal(M) models phi
$$
と書く。$models$は充足関係を表す記号である。特に$phi$が文である場合、$[|phi|]_cal(M) = 1$であることが、構造$cal(M)$は式$phi$を充足しているということになる。

一階述語論理式$phi$を充足できる構造$cal(M)$が存在するとき、式$phi$は **充足可能(satisfiable)** であるという。つまり、ある構造$cal(M)$が存在して、$cal(M) models phi$が成り立つとき、式$phi$は充足可能であるという。

また、シグネチャ$L$の論理式$phi$は$L$と同じシミラリティタイプをもつすべての構造で充足するとき、
$$
models phi
$$
と書く。このとき、式$phi$は **恒真(valid)** であるという。

## 論理的帰結
$Gamma$を@fopl-define/sec-sentenceの集合とする。このとき、すべての$psi in Gamma$について$cal(M) models psi$が成り立つとき、構造$cal(M)$は$Gamma$を充足しているという。これを
$$
cal(M) models Gamma
$$
と書く。

ここで、文$phi in italic("Sent")$が$Gamma in cal(P)(italic("Sent"))$からの **論理的帰結(logical consequence)** であるとは、$cal(M) models Gamma$となるようなすべての構造$cal(M)$について、$cal(M) models phi$が成り立つときにいう。これを
$$
Gamma models phi
$$
と書く。ここまでの定義は命題論理に対して @semantic-func/sec-valuation で行ってきた議論を「構造」という概念に置き換えたものである。

## モデル
モデルという言葉は論理式と論理式の集合に対して用いられ、以下の2つ定義がある。

- 構造$cal(M)$が$phi in italic("Form")$を充足しているとき、$cal(M)$は式$phi$の **モデル(model)** であるという。
- 構造$cal(M)$が$Gamma in cal(P)(italic("Form"))$を充足しているとき、$cal(M)$は式集合$Gamma$の **モデル(model)** であるという。

## 割当による充足
一階述語論理の式$phi$の自由変数を$x_a_1, x_a_2, ..., x_a_n$とする。ただし、$a_1 < a_2 < ... < a_n$とする。このとき、$phi$が$v_1, v_2, ..., v_n in |cal(M)|$によって **充足される(satisfied by)** とは、
$$
[| phi[ overline(v_1) \/ x_a_1, overline(v_2) \/ x_a_2, ..., overline(v_n) \/ x_a_n ] |]_cal(M) = 1
$$

であることをいう。
ただし、$phi[ overline(v_1) \/ x_a_1, overline(v_2) \/ x_a_2, ..., overline(v_n) \/ x_a_n ] = phi[ overline(v_1) \/ x_a_1 ][ overline(v_2) \/ x_a_2 ] ... [ overline(v_n) \/ x_a_n ]$である。このとき、$phi[ overline(v_1) \/ x_a_1, overline(v_2) \/ x_a_2, ..., overline(v_n) \/ x_a_n ]$はすでに文となっており、含まれている全ての項は閉項となっていることに注意されたい。なお、この順番によらず、どの順番で置換しても同じ結果になることは以下の補題で示しており、複数の変数をこのように置換することは **同時代入** と呼ばれる。

:::column-toc
@title: 【補題】同時代入の順序の独立性

**【主張】**
文$phi$と自由変数$x, y in italic("FV")(phi)$および定数記号$overline(v), overline(w)$について、$x eq.not y$ならば以下が成り立つ。
$$
phi[ overline(v) \/ x ][ overline(w) \/ y ] = phi[ overline(w) \/ y ][ overline(v) \/ x ]
$$

**【証明】**
帰納法で示す。まず、項$t$について示す。

**基底部**
1. $t = x$のとき、
    $$
    t[ overline(v) \/ x ][ overline(w) \/ y ] &= overline(v)[ overline(w) \/ y ] = overline(v)\
    t[ overline(w) \/ y ][ overline(v) \/ x ] &= x[ overline(v) \/ x ] = overline(v)
    $$
2. $t = y$のとき、
    $$
    t[ overline(v) \/ x ][ overline(w) \/ y ] &= y[ overline(w) \/ y ] = overline(w)\
    t[ overline(w) \/ y ][ overline(v) \/ x ] &= overline(w)[ overline(v) \/ x ] = overline(w)
    $$
3. $t = z$ ($z eq.not x$かつ$z eq.not y$)のとき、
    $$
    t[ overline(v) \/ x ][ overline(w) \/ y ] &= z[ overline(v) \/ x ] = z\
    t[ overline(w) \/ y ][ overline(v) \/ x ] &= z[ overline(w) \/ y ] = z
    $$
4. $t = c_i$のとき、
    $$
    t[ overline(v) \/ x ][ overline(w) \/ y ] &= c_i[ overline(v) \/ x ] = c_i\
    t[ overline(w) \/ y ][ overline(v) \/ x ] &= c_i[ overline(w) \/ y ] = c_i
    $$

**帰納部**
$t = f_i (t_1, t_2, ..., t_n)$のとき、すべての$k = 1, 2, ..., n$について
$$
t_k [ overline(v) \/ x ][ overline(w) \/ y ] = t_k [ overline(w) \/ y ][ overline(v) \/ x ]
$$
が成り立つことを仮定する。よって、
$$
t[ overline(v) \/ x ][ overline(w) \/ y ] &= f_i ( t_1[ overline(v) \/ x ][ overline(w) \/ y ], t_2[ overline(v) \/ x ][ overline(w) \/ y ], ..., t_n[ overline(v) \/ x ][ overline(w) \/ y ] )\
&= f_i ( t_1[ overline(w) \/ y ][ overline(v) \/ x ], t_2[ overline(w) \/ y ][ overline(v) \/ x ], ..., t_n[ overline(w) \/ y ][ overline(v) \/ x ] )\
&= t[ overline(w) \/ y ][ overline(v) \/ x ]
$$

次に、これを基に一階述語論理の式について考えるが、$x$や$y$は自由変数であるため、式に対する代入の定義（@fopl-define/sec-substitution）から$phi$に対する代入は式の構文一切変化させず、項に対する代入に帰着できる。つまり、項に到達するまでに$[ overline(v) \/ x ][ overline(w) \/ y ]$と$[ overline(w) \/ y ][ overline(v) \/ x ]$に差がない。項に対する代入についてはすでに示したので、すべての式$phi$に対して$phi[ overline(v) \/ x ][ overline(w) \/ y ] = phi[ overline(w) \/ y ][ overline(v) \/ x ]$が成り立つ。

:::

さらに、より一般的な解釈の定義を以下に参考までに示す。

:::column
@title: より一般的な解釈の定義

**変数割当(variable assignment)** $s$とは、自由変数からユニバースの元への写像であり、$s: italic("FV")(phi) -> |cal(M)|$である。このとき、項（@fopl-define/sec-closed-term でなくてもよい）に対する解釈$[| t |]^cal(M)_s$を以下のように定義しなおす。
$$
[||]^cal(M)_s : italic("Term") &-> |cal(M)|\
[| x_i |]^cal(M)_s &= s(x_i) quad (x_i in italic("FV")(phi))\
[|overline(v)|]^cal(M)_s &= v quad (overline(v) in.not italic("Const") and v in |cal(M)|)\
[| c_i |]^cal(M)_s &= C_i quad (c_i in italic("Const"))\
[| f_i (t_1, t_2, ..., t_n) |]^cal(M)_s &= F_i ([|t_1|]^cal(M)_s, [|t_2|]^cal(M)_s, ..., [|t_n|]^cal(M)_s)\
&quad quad (f_i in italic("Func"), italic("ar")(f_i) = italic("ar")(F_i) = n, t_1, t_2, ..., t_n in italic("Term"))
$$

一階述語論理式（@fopl-define/sec-sentence でなくてもよい）に対する解釈$[||]^cal(M)_s$は先ほど定義した$[||]_cal(M)$と同じように定義される。この構造$cal(M)$と変数割当$s$の組$(cal(M), s)$こそが、**解釈(interpretation)** であるといえる。この定義では、項や式に自由変数が含まれていても普遍閉包を取る必要がなくなる。

:::

## 意味的等価性
一階述語論理式$phi$と$psi$が **意味的等価(semantically equivalent)** であるとは、$models (phi <-> psi)$が成り立つことをいい、
$$
phi approx psi
$$
と書く。つまり、すべての構造$cal(M)$について$[| phi |]_cal(M) = [| psi |]_cal(M)$が成り立つとき、式$phi$と$psi$は意味的等価であるという。


:::column-toc
@title: 【補題】意味的等価性に関する補題

**【主張】**
文$phi,psi$と構造$cal(M)$について以下が成り立つ。

1. $cal(M) models (phi and psi) <=> cal(M) models phi$ かつ $cal(M) models psi$
2. $cal(M) models (phi or psi) <=> cal(M) models phi$ または $cal(M) models psi$
3. $cal(M) models (not phi) <=> cal(M) models phi$ でない
4. $cal(M) models (phi -> psi) <=> (cal(M) models phi$ ならば $cal(M) models psi)$
5. $cal(M) models (phi <-> psi) <=> cal(M) models phi$ と $cal(M) models psi$ は同値
6. $cal(M) models (forall x (phi)) <=> $ すべての$v in |cal(M)|$ について $cal(M) models phi[ overline(v) \/ x ]$
7. $cal(M) models (exists x (phi)) <=> $ ある$v in |cal(M)|$ が存在して $cal(M) models phi[ overline(v) \/ x ]$

**【証明】**
1から5までは、同様に示せるのでここでは例として1を示し、6,7も示す。

**1の証明**
$cal(M) models (phi and psi)$を仮定すると、$[| (phi and psi) |]_cal(M) = 1$である。よって、

$$
&[| (phi and psi) |]_cal(M) = 1\
<=> &min( [|phi|]_cal(M), [|psi|]_cal(M) ) = 1\
<=> &[|phi|]_cal(M) = 1 quad "and" quad [|psi|]_cal(M) = 1
$$

$cal(M) models phi$かつ$cal(M) models psi$と同値である。

**6の証明**
$cal(M) models (forall x (phi))$を仮定すると、$[| (forall x (phi)) |]_cal(M) = 1$である。よって、

$$
&[| (forall x (phi)) |]_cal(M) = 1\
<=> &min_( v in |cal(M)| ) ( [| phi[overline(v) \/ x] |]_cal(M) ) = 1\
<=> &forall v in |cal(M)|, [| phi[overline(v) \/ x] |]_cal(M) = 1
$$

$forall v in |cal(M)|, cal(M) models phi[ overline(v) \/ x ]$と同値である。

**7の証明**
$cal(M) models (exists x (phi))$を仮定すると、$[| (exists x (phi)) |]_cal(M) = 1$である。 よって、
$$
&[| (exists x (phi)) |]_cal(M) = 1\
<=> &max_( v in |cal(M)| ) ( [| phi[overline(v) \/ x] |]_cal(M) ) = 1\
<=> &exists v in |cal(M)|, [| phi[overline(v) \/ x] |]_cal(M) = 1
$$

$exists v in |cal(M)|, cal(M) models phi[ overline(v) \/ x ]$と同値である。
:::

## 意味論の性質
一階述語論理の意味論と意味的等価性をここまでで定義した。それらを用いることで一階述語論理の「書き換え」を行うことができる。命題論理では以下のようなド・モルガンの法則があった。

$$
not (phi and psi) approx (not phi) or (not psi)\
not (phi or psi) approx (not phi) and (not psi)
$$

一階述語論理においても結合子の意味論は命題論理のものと同じなので同様の法則が成り立つ。加えて、一階述語論理特有の量子化に関連する性質がいくつか存在する。

:::column-toc
@title: 【定理】否定と量子化の交換

**【主張】**
一階述語論理の式$phi in italic("Form")$について以下が成り立つ。

1. $not (forall x (phi)) approx exists x (not phi)$
2. $not (exists x (phi)) approx forall x (not phi)$
3. $forall x (phi) approx not exists x (not phi)$
4. $exists x (phi) approx not forall x (not phi)$

**【証明】**
1から4までは、同様に示せるのでここでは例として1を示す。

任意の構造$cal(M)$について示す。まず、$cal(M) models not (forall x (phi))$を仮定する。このとき、$[| not (forall x (phi)) |]_cal(M) = 1$である。よって、
$$
&[| not (forall x (phi)) |]_cal(M) = 1\
<=> &[| (forall x (phi)) |]_cal(M) = 0\
<=> &min_( v in |cal(M)| ) ( [| phi[overline(v) \/ x] |]_cal(M) ) = 0\
<=> &exists v in |cal(M)|, [| phi[overline(v) \/ x] |]_cal(M) = 0\
<=> &exists v in |cal(M)|, [| not phi[overline(v) \/ x] |]_cal(M) = 1\
<=> &max_( v in |cal(M)| ) ( [| not phi[overline(v) \/ x] |]_cal(M) ) = 1\
<=> &[| exists x (not phi) |]_cal(M) = 1
$$

つまり、$cal(M) models exists x (not phi)$であり、同値変形のみであるため、逆も成り立つ。これがすべての構造で成り立つので、
$$
models (not (forall x (phi)) <-> exists x (not phi))
$$
が成り立ち、$not (forall x (phi)) approx exists x (not phi)$が成り立つ。

:::

:::column-toc
@title: 【定理】量子化の交換と削除

**【主張】**
一階述語論理の式$phi in italic("Form")$について以下が成り立つ。

1. $forall x (forall y (phi)) approx forall y (forall x (phi))$
2. $exists x (exists y (phi)) approx exists y (exists x (phi))$
3. $x in.not italic("FV")(phi)$のとき$forall x (phi) approx phi$
4. $x in.not italic("FV")(phi)$のとき$exists x (phi) approx phi$

**【証明】**
1と2、3と4は同様に示せるのでここでは例として1と3を示す。

**1の証明**
任意の構造$cal(M)$について示す。まず、$cal(M) models forall x (forall y (phi))$を仮定する。このとき、$[| forall x (forall y (phi)) |]_cal(M) = 1$である。よって、
$$
&[| forall x (forall y (phi)) |]_cal(M) = 1\
<=> &min_( v in |cal(M)| ) ( [| forall y (phi)[overline(v) \/ x] |]_cal(M) ) = 1\
<=> &forall v in |cal(M)|, [| forall y (phi)[overline(v) \/ x] |]_cal(M) = 1\
<=> &forall v in |cal(M)|, min_( w in |cal(M)| ) ( [| phi[overline(v) \/ x, overline(w) \/ y] |]_cal(M) ) = 1\
<=> &forall v in |cal(M)|, forall w in |cal(M)|, [| phi[overline(v) \/ x, overline(w) \/ y] |]_cal(M) = 1\
<=> &forall w in |cal(M)|, forall v in |cal(M)|, [| phi[overline(v) \/ x, overline(w) \/ y] |]_cal(M) = 1\
<=> &forall w in |cal(M)|, [| forall x (phi)[overline(w) \/ y] |]_cal(M) = 1\
<=> &[| forall y (forall x (phi)) |]_cal(M) = 1
$$ 

つまり、$cal(M) models forall y (forall x (phi))$であり、同値変形のみであるため、逆も成り立つ。これがすべての構造で成り立つので、
$$
models (forall x (forall y (phi)) <-> forall y (forall x (phi)))
$$
が成り立ち、$forall x (forall y (phi)) approx forall y (forall x (phi))$が成り立つ。

**3の証明**
任意の構造$cal(M)$について示す。まず、$cal(M) models forall x (phi)$を仮定する。このとき、$[| forall x (phi) |]_cal(M) = 1$である。また、$x in.not italic("FV")(phi)$であるとすると、$phi[overline(v) \/ x] = phi$が成り立つ。よって、
$$
&[| forall x (phi) |]_cal(M) = 1\
<=> &min_( v in |cal(M)| ) ( [| phi[overline(v) \/ x] |]_cal(M) ) = 1\
<=> &min_( v in |cal(M)| ) ( [| phi |]_cal(M) ) = 1\
<=> &[| phi |]_cal(M) = 1
$$
つまり、$cal(M) models phi$であり、同値変形のみであるため、逆も成り立つ。これがすべての構造で成り立つので、
$$
models (forall x (phi) <-> phi)
$$
が成り立ち、$forall x (phi) approx phi$が成り立つ。

:::

:::column-toc
@title: 【定理】量子化と論理結合子の分配

**【主張】**
一階述語論理の式$phi,psi in italic("Form")$について以下が成り立つ。
1. $forall x (phi and psi) approx (forall x (phi)) and (forall x (psi))$
2. $exists x (phi or psi) approx (exists x (phi)) or (exists x (psi))$
3. $x in.not italic("FV")(psi)$のとき$forall x (phi or psi) approx (forall x (phi)) or (psi)$
4. $x in.not italic("FV")(psi)$のとき$exists x (phi and psi) approx (exists x (phi)) and (psi)$

**【証明】**
**1の証明**
任意の構造$cal(M)$で$[|forall x (phi and psi)|]_cal(M) = 1$であるとする。すると、
$$
& [|forall x (phi and psi)|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|(phi and psi)[overline(v) \/ x]|]_cal(M)) = 1\
<=> &forall v in |cal(M)|, [|(phi and psi)[overline(v) \/ x]|]_cal(M) = 1\
<=> &forall v in |cal(M)|, ([|phi[overline(v) \/ x]|]_cal(M) = 1 "かつ" [|psi[overline(v) \/ x]|]_cal(M) = 1)\
<=> &forall v in |cal(M)|, [|phi[overline(v) \/ x]|]_cal(M) = 1 "かつ" forall v in |cal(M)|, [|psi[overline(v) \/ x]|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|phi[overline(v) \/ x]|]_cal(M)) = 1 "かつ" max_(v in |cal(M)|) ([|phi[overline(v) \/ x]|]_cal(M)) = 1\
<=> &[|forall x (phi)|]_cal(M) = 1 "かつ" [|forall x (psi)|]_cal(M) = 1\
<=> &[|forall x (phi) and forall x (psi)|]_cal(M) = 1
$$
よって、$forall x (phi and psi) approx (forall x (phi)) and (forall x (psi))$である。

**2の証明**
任意の構造$cal(M)$で$[|exists x (phi or psi)|]_cal(M) = 1$であるとする。すると、
$$
& [|exists x (phi or psi)|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|(phi or psi)[overline(v) \/ x]|]_cal(M)) = 1\
<=> &exists v in |cal(M)|, [|(phi or psi)[overline(v) \/ x]|]_cal(M) = 1\
<=> &exists v in |cal(M)|, ([|phi[overline(v) \/ x]|]_cal(M) = 1 "または" [|psi[overline(v) \/ x]|]_cal(M) = 1)\
<=> &exists v in |cal(M)|, [|phi[overline(v) \/ x]|]_cal(M) = 1 "または" exists v in |cal(M)|, [|psi[overline(v) \/ x]|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|phi[overline(v) \/ x]|]_cal(M)) = 1 "または" max_(v in |cal(M)|) ([|phi[overline(v) \/ x]|]_cal(M)) = 1\
<=> &[|exists x (phi) or exists x (psi)|]_cal(M) = 1
$$
よって、$exists x (phi or psi) approx (exists x (phi)) or (exists x (psi))$である。

**3の証明**
$x in.not italic("FV")(psi)$であると仮定する。任意の構造$cal(M)$で$[|forall x (phi or psi)|]_cal(M) = 1$であるとする。すると、
$$
& [|forall x (phi or psi)|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|(phi or psi)[overline(v) \/ x]|]_cal(M)) = 1\
<=> &forall v in |cal(M)|, [|(phi or psi)[overline(v) \/ x]|]_cal(M) = 1\
<=> &forall v in |cal(M)|, ([|phi[overline(v) \/ x]|]_cal(M) = 1 "または" [|psi[overline(v) \/ x]|]_cal(M) = 1)\
<=> &forall v in |cal(M)|, ([|phi[overline(v) \/ x]|_cal(M) = 1 "または" [|psi|]_cal(M) = 1)\
<=> & (forall v in |cal(M)|, [|phi[overline(v) \/ x]|]_cal(M) = 1) "または" [|psi|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|phi[overline(v) \/ x]|]_cal(M)) = 1 "または" [|psi|]_cal(M) = 1\
<=> &[|forall x (phi) or psi|]_cal(M) = 1
$$
よって、$forall x (phi or psi) approx (forall x (phi)) or (psi)$である。

**4の証明**
$x in.not italic("FV")(psi)$であると仮定する。任意の構造$cal(M)$で$[|exists x (phi and psi)|]_cal(M) = 1$であるとする。すると、
$$
& [|exists x (phi and psi)|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|(phi and psi)[overline(v) \/ x]|]_cal(M)) = 1\
<=> &exists v in |cal(M)|, [|(phi and psi)[overline(v) \/ x]|]_cal(M) = 1\
<=> &exists v in |cal(M)|, ([|phi[overline(v) \/ x]|]_cal(M) = 1 "かつ" [|psi[overline(v) \/ x]|]_cal(M) = 1)\
<=> &exists v in |cal(M)|, ([|phi[overline(v) \/ x]|]_cal(M) = 1 "かつ" [|psi|]_cal(M) = 1)\
<=> & (exists v in |cal(M)|, [|phi[overline(v) \/ x]|]_cal(M) = 1) "かつ" [|psi|]_cal(M) = 1\
<=> &max_(v in |cal(M)|) ([|phi[overline(v) \/ x]|]_cal(M)) = 1 "かつ" [|psi|]_cal(M) = 1\
<=> &[|exists x (phi) and psi|]_cal(M) = 1
$$
よって、$exists x (phi and psi) approx (exists x (phi)) and (psi)$である。
:::