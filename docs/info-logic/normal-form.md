---
title: "標準形"
---

# 関数的完全性

命題論理における論理結合子をいくつか選んで（これらをここでは結合子集合と呼ぶことにする）、それらだけで命題論理全体を表現できるとき、その結合子集合は **関数的に完全** であるといい、その性質を **関数的完全性** という。なお、ここでいう「表現」とは意味論的に等価な命題論理を構成することをいう。つまり、関数的に完全な結合子集合の結合子だけを使ってすべての命題論理と意味的に等価な式を作ることができると言うことである。

${not, and}, {not, or}, {not, ->}$などは関数的完全性を有することが知られている。また、@sec-sheffer で紹介する$|$はそれ1つだけで関数的に完全である。ここでは、${not, or}$の関数的完全性を証明してみよう。

:::column-toc
@title: ANDとNOTの関数的完全性

**【主張】**
${not, or}$は関数的に完全である。

**【証明】**
さまざまな証明方法があるが、ここでは Shannon 展開
:::annotation
Shannon展開とは、ある命題に関して論理式を展開する方法である。命題$p$に関して式$phi$を展開すると、次のようになる。

$$
phi = (p and phi[top slash p]) or (not p and phi[bot slash p])
$$

:::
を用いた方法を紹介する。
ここで証明したいのは、$phi_1,phi_2,dots,phi_n$の$n$個を結合する結合子$flat^((n))(phi_1,phi_2,dots,phi_n)$
:::annotation
ここで、$flat^((n))$は任意の$n$個の引数を取る結合子であり、たとえば以下のようなものは3つの引数を取る結合子$flat^((3))$の1例である。

$$
flat^((3))(phi_1, phi_2, phi_3) = (phi_1 and phi_2) and (phi_3 or phi_1) and not phi_2
$$

:::
と意味的等価な、${not, or}$だけを使った式$tau$が存在することである。

$$
flat^((n))(phi_1, phi_2, phi_3, dots, phi_n) approx tau
$$

これを$flat$の引数の個数$n$について帰納的に示す。
まずは、$flat^((n))$の意味関数を$f$とする。$v$を任意の付値とすれば

$$
f &: {0,1}^n -> {0,1}\
[|flat^((n))(phi_1,phi_2,dots,phi_n)|]_v &= f([|phi_1|]_v,[|phi_2|]_v,dots,[|phi_n|]_v)
$$

つまり、任意の$n$引数の関数$f$に対して、`OR`と`NOT`のみで構成された命題論理$tau$が存在することを示す。さらに、ここで @semantic-func/lem-substitution を用いると原始命題$p_1,p_2,dots,p_n$を用いて

$$
f([|p_1|]_v,[|p_2|]_v,dots,[|p_n|]_v) = [|tau|]_v
$$

となる、原始命題$p_1,p_2,dots,p_n$と$not,or$のみで作られた命題論理$tau$の存在をすべての$n$引数の関数$f$で証明すれば良い。

**基底部**
$n=1$のとき、$f$には以下の4通りがありえる。

$$
f_1 &: {0,1} |-> {0, 0}\
f_2 &: {0,1} |-> {1, 0}\
f_3 &: {0,1} |-> {0, 1}\
f_4 &: {0,1} |-> {1, 1}
$$

それぞれ、以下のように$tau$を定義すればいい。

$$
tau = cases(
not ( not p_1 or p_1) & " if " f=f_1\
not p_1 & " if " f=f_2\
p_1 & " if " f=f_3\
not p_1 or p_1 & " if " f=f_4
)
$$

よって$tau$が存在する。

**帰納部**

まず、$n-1$引数関数$f_bot,f_top$を以下のように決める。

$$
f([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v, 0) &= f_bot ([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v)\
f([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v, 1) &= f_top ([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v)
$$

このとき$f_bot,f_top$は$n-1$個の引数を持つことに注意すると、仮定から

$$
f_bot &= [|tau_bot|]_v\
f_top &= [|tau_top|]_v
$$

となる結合子として$not,or$のみを用いた$tau_bot,tau_top in italic("PROP")$が存在する。ここで、

$$
hat(tau) = (p_n -> tau_top) and (not p_n -> tau_bot)
$$

とすれば$f([|p_1|]_v,[|p_2|]_v,dots,[|p_n|]_v) = [|hat(tau)|]_v$である。
実際、
**( i )** $[|p_n|]_v=0$のとき、

$$
[|hat(tau)|]_v &= [|(p_n -> tau_top) and (not p_n -> tau_bot)|]_v\
&= min([|p_n -> tau_top|]_v, [|not p_n -> tau_bot|]_v)\
&= min(1, [|tau_bot|]_v) quad &&because [|p_n|]_v=0\
&= [|tau_bot|]_v quad &&because 0 <= [|tau_bot|]_v <= 1\
&= f_bot ([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v)\
&= f([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v, 0)\
&= f([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v, [|p_n|]_v) quad &&because [|p_n|]_v=0
$$

**( ii )** $[|p_n|]_v=1$のとき、

$$
[|hat(tau)|]_v &= [|(p_n -> tau_top) and (not p_n -> tau_bot)|]_v\
&= min([|p_n -> tau_top|]_v, [|not p_n -> tau_bot|]_v)\
&= min([|tau_top|]_v, 1) quad &&because [|p_n|]_v=1\
&= [|tau_top|]_v quad &&because 0 <= [|tau_top|]_v <= 1\
&= f_top ([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v)\
&= f([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v, 1)\
&= f([|p_1|]_v,[|p_2|]_v,dots,[|p_(n-1)|]_v, [|p_n|]_v) quad &&because [|p_n|]_v=1
$$

である。さて、$hat(tau)$は次のように書き換えられる。

$$
hat(tau) &approx (not p_n or tau_top) and ( not not p_n or tau_bot )\
&approx not ( not ( not p_n or tau_top ) or not ( p_n or tau_bot ) )
$$

これを$tau$とする。$tau_top,tau_bot$が$not,or$のみで構成されているので、$tau$も$not,or$のみで構成されている。そして、$f([|p_1|]_v,[|p_2|]_v,dots,[|p_n|]_v) = [|tau|]_v$である。つまり、$n$引数関数$f$に対しても$tau$が存在する。

ゆえに、${not, or}$は関数的に完全である。$square.filled$

:::

## (sec-sheffer)= シェファーの縦棒

新たな結合子としてシェファーの縦棒$|$を以下のように定義する。

$$
F_| &: {0,1} times {0,1} -> {0,1}\
F_|(b_1, b_2) &= cases(0 & " if " b_1 = 1 & " and " & b_2 = 1, 1 & " otherwise ")\
&= F_not (F_and (b_1, b_2))\
[| phi | psi |]_v &= F_|([|phi|]_v,[|psi|]_v)
$$

この演算は`NAND`と呼ばれ、これだけで関数的に完全である。そのため、コンピュータはこの`NAND`回路を組み合わせて作られている。
