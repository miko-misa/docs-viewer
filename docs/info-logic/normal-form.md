---
title: "標準形"
---

# (normal-form)= 関数的完全性

@prop-define/prop-defineにおける@prop-define/sec-connective
:::annotation
ここでは$bot$を含むことにする。結合子集合に$bot$がない場合は原子命題に$bot$が存在することに関係なく$bot$は命題論理式に出現しない。
:::
をいくつか選んで（これらをここでは結合子集合と呼ぶことにする）、それらだけで命題論理全体を表現できるとき、その結合子集合は **関数的に完全 ** であるといい、その性質を **関数的完全性 ** という。なお、ここでいう「表現」とは意味論的に等価な命題論理を構成することをいう。つまり、関数的に完全な結合子集合の結合子だけを使ってすべての命題論理と意味的に等価な式を作ることができると言うことである。

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
まずは、$flat^((n))$の@semantic-funcを$f$とする。$v$を任意の@semantic-func/sec-valuationとすれば

$$
f &: {0,1}^n -> {0,1}\
[|flat^((n))(phi_1,phi_2,dots,phi_n)|]_v &= f([|phi_1|]_v,[|phi_2|]_v,dots,[|phi_n|]_v)
$$

つまり、任意の$n$引数の関数$f$に対して、`OR`と`NOT`のみで構成された命題論理$tau$が存在することを示す。さらに、ここで @semantic-func/lem-substitution を用いると原子命題$p_1,p_2,dots,p_n$を用いて

$$
f([|p_1|]_v,[|p_2|]_v,dots,[|p_n|]_v) = [|tau|]_v
$$

となる、原子命題$p_1,p_2,dots,p_n$と$not,or$のみで作られた命題論理$tau$の存在をすべての$n$引数の関数$f$で証明すれば良い。

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
:::annotation
ここで、$f_1$は$bot$そのものであるので$bot$がなくても$tau$が存在していることが証明できている。結果的に$bot$がなくても関数的完全性が成り立つことになる。
:::

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

# 標準系

命題論理式を特定の形式に変形したものを **標準系 (normal form) ** という。代表的なものに **否定標準系 (negation normal form: "NNF") ** 、 **論理和標準形 (disjunctive normal form: DNF) ** 、 **論理積標準形 (conjunctive normal form: CNF) ** がある。以下でそれぞれを定義し、変形方法を示す。

## リテラル

命題論理式の **リテラル(literal)** とは、@prop-define/sec-atom $p$
:::annotation
$bot$も含むことに注意
:::
またはその否定$not p$のことである。$p$を正リテラル、$not p$を負リテラルという。

## 否定標準系

命題論理式$phi$が **否定標準系(negation normal form: "NNF")** であるとは、次の条件を満たすときである。

1. $phi$に含まれる結合子は$not, and, or, bot$のみである。
2. $not$は原子命題にのみ作用している。

たとえば、$(p and not q) or (not r and s)$は否定標準系であるが、$not (p or q)$や$not not p$は否定標準系ではない。

---

任意の命題$phi$に対して、等価な否定標準系$phi'$を構成することができる。これは${and, or, not, bot}$が関数的に完全であるためである。また次に説明するような変換を行う写像を定義することができる。

### 否定標準系への変換

写像$italic("NNF")$を以下のように定義する。なお、$p$は原子命題、$phi, psi$は任意の命題とする。

$$
italic("NNF") &: italic("PROP") -> italic("PROP")\
italic("NNF")(p) &= p\
italic("NNF")(not p) &= not p\
italic("NNF")(not not phi) &= italic("NNF")(phi)\
italic("NNF")(phi and psi) &= italic("NNF")(phi) and italic("NNF")(psi) \
italic("NNF")(phi or psi) &= italic("NNF")(phi) or italic("NNF")(psi) \
italic("NNF")(not (phi and psi)) &= italic("NNF")(not phi) or italic("NNF")(not psi) \
italic("NNF")(not (phi or psi)) &= italic("NNF")(not phi) and italic("NNF")(not psi) \
italic("NNF")(phi -> psi) &= italic("NNF")(not phi or psi) \
italic("NNF")(phi <-> psi) &= italic("NNF")((phi and psi) or (not phi and not psi)) \
italic("NNF")(not (phi -> psi)) &= italic("NNF")(phi and not psi) \
italic("NNF")(not (phi <-> psi)) &= italic("NNF")((phi and not psi) or (not phi and psi))
$$

このとき、任意の命題$phi$に対して、$phi approx italic("NNF")(phi)$であり、$italic("NNF")(phi)$は否定標準系である。
簡単にいえば、以下のような手順を踏む。

1. $<->$や$->$を$not, and, or$に書き換える。
2. $not$を内側に押し込む（ド・モルガンの法則を適用する）。
3. 二重否定を消去する。

## 論理和標準形と論理積標準形

命題論理式$phi$が **論理和標準形(disjunctive normal form: DNF)** であるとは、次の条件を満たすときである。

1. $phi$は論理和の形をしている。すなわち、$phi = tau_1 or tau_2 or dots or tau_m$である。
2. 各$tau_i$は論理積の形をしている。すなわち、$tau_i = ell_(i 1) and ell_(i 2) and dots and ell_(i k)$であり、各$ell_(i j)$はリテラルである。

つまり、論理和標準形とは形式的には以下のような式である。ただし、$ell_(i j)$はリテラルである。

$$
phi &= (ell_(1 1) and ell_(1 2) and dots and ell_(1 k_1)) or (ell_(2 1) and ell_(2 2) and dots and ell_(2 k_2)) or dots or (ell_(m 1) and ell_(m 2) and dots and ell_(m k_m))\
&= or.big_(1 <= i <= m) and.big_(1 <= j <= k_i) ell_(i j)
$$

---

命題論理式$phi$が **論理積標準形(conjunctive normal form: CNF)** であるとは、次の条件を満たすときである。

1. $phi$は論理積の形をしている。すなわち、$phi = tau_1 and tau_2 and dots and tau_m$である。
2. 各$tau_i$は論理和の形をしている。すなわち、$tau_i = ell_(i 1) or ell_(i 2) or dots or ell_(i k)$であり、各$ell_(i j)$はリテラルである。

つまり、論理積標準形とは形式的には以下のような式である。ただし、$ell_(i j)$はリテラルである。

$$
phi &= (ell_(1 1) or ell_(1 2) or dots or ell_(1 k_1)) and (ell_(2 1) or ell_(2 2) or dots or ell_(2 k_2)) and dots and (ell_(m 1) or ell_(m 2) or dots or ell_(m k_m))\
&= and.big_(1 <= i <= m) or.big_(1 <= j <= k_i) ell_(i j)
$$

---

任意の命題論理式$phi$に対して、等価な論理和標準形および論理積標準形を構成することができる。これは${and, or, not, bot}$が関数的に完全であるためである。また次に説明するような変換を行う写像を定義することができる。

### 論理和標準形・論理積標準形への変換

写像$italic("DNF")$を以下のように定義する。なお、$phi, psi$は任意の否定標準形、$ell$はリテラルとする。なお、$italic("DNF")(phi) = phi_1 or phi_2 or dots or phi_n$, $italic("DNF")(psi) = psi_1 or psi_2 or dots or psi_m$とする。

$$
italic("DNF") &: italic("PROP") -> italic("PROP")\
italic("DNF") (ell) &= ell\
italic("DNF") (phi or psi) &= italic("DNF")(phi) or italic("DNF")(psi) \
italic("DNF") (phi and psi) &= or.big_(1 <= i <= n) or.big_(1 <= j <= m) (phi_i and psi_j) \
$$

同様に写像$italic("CNF")$を以下のように定義する。なお、$phi, psi$は任意の否定標準形、$ell$はリテラルとする。なお、$italic("CNF")(phi) = phi_1 and phi_2 and dots and phi_n$, $italic("CNF")(psi) = psi_1 and psi_2 and dots and psi_m$とする。

$$
italic("CNF") &: italic("PROP") -> italic("PROP")\
italic("CNF") (ell) &= ell\
italic("CNF") (phi or psi) &= and.big_(1 <= i <= n) and.big_(1 <= j <= m) (phi_i or psi_j) \
italic("CNF") (phi and psi) &= italic("CNF")(phi) and italic("CNF")(psi) \
$$

---

このとき、任意の命題$phi$に対して、$phi approx italic("DNF")(italic("NNF")(phi))$および$phi approx italic("CNF")(italic("NNF")(phi))$であり、$italic("DNF")(italic("NNF")(phi))$は論理和標準形、$italic("CNF")(italic("NNF")(phi))$は論理積標準形である。
簡単にいえば、以下のような手順を踏む。

1. $phi$を否定標準系に変換する。
2. 分配律を適用して論理和標準形または論理積標準形に変換する。
   分配律とは以下の等価式である。
   $$
    (phi_1 or phi_2 or dots or phi_m) and (psi_1 or psi_2 or dots or psi_n) &approx or.big_(1 <= i <= m) or.big_(1 <= j <= n) (phi_i and psi_j) \
    (phi_1 and phi_2 and dots and phi_m) or (psi_1 and psi_2 and dots and psi_n) &approx and.big_(1 <= i <= m) and.big_(1 <= j <= n) (phi_i or psi_j)
   $$

---

なお、得られた標準形が最小であるかどうかは保証しない。場合によっては$p_1 and p_1 and p_1$のような項もしくは標準形が得られることがあり、これを$p_1$に丸め込むアルゴリズムは内包されていない。また、$bot$を丸め込むこともできないので$p_1 or bot$という項もしくは標準形が得られることもある。これらを、とくに前者を機械的に解こうとするのは困難である。
