---
title: "意味関数と代入"
---

# (semantic-func)= 意味関数

命題論理(@prop-define)の**意味関数(semantic function)** とは、命題論理の式に対して真偽値を割り当てる命題論理上の写像(@prop-define/sec-prop-map)である。まず、先述したように命題論理上の写像(@prop-define/sec-prop-map)では以下のような写像を先に準備する。これは写像を定義するために必要なものであったことは注意されたい。

$$
v:& italic("ATOM") -> {0, 1}\
F_not:& {0, 1} -> {0, 1}\
F_square:& {0, 1} times {0, 1} -> {0, 1}
$$

なお、$italic("ATOM")$から${0,1}$に対する写像は各命題記号に真偽値を割り当てる対応表のようなものであり、のちの議論のために$f$ではなく$v$と表記している。残りの 2 つについて、以下のように定義する。

$$
F_not (b) &= cases(1 & " if " b = 0 , 0 & " if " b = 1)\
F_and (b_1, b_2) &= cases(1 & " if " b_1 = 1 & " and " & b_2 = 1, 0 & " otherwise ")\
F_or (b_1, b_2) &= cases(0 & " if " b_1 = 0 & " and " & b_2 = 0, 1 & " otherwise ")\
F_(<->) (b_1, b_2) &= cases(1 & " if " b_1 = b_2 , 0 & " if " b_1 eq.not b_2 )\
F_(->) (b_1, b_2) &= cases(1 & " if " b_1 = 1 & " and " & b_2 = 1, 1 & " if " b_1 = 0, 0 & " otherwise")\
$$

これは、命題論理の各結合子の真理値表に対応している。すると、命題論理から${0, 1}$への写像$[| |]$を定義できる。

$$
[| |]_v &: italic("PROP") -> {0, 1}\
[| p |]_v &= v(p) & (p in italic("ATOM"))\
[| not phi |]_v &= F_not ([| phi |]_v) & (phi in italic("PROP"))\
[| phi square psi |]_v &= F_square ([| phi |]_v, [| psi |]_v) &quad (phi, psi in italic("PROP"))
$$

これは、命題論理上の写像にてすでに述べたことであり、命題論理の式に対して再帰的に写像$F_not$および$F_square$を適用していくことで、最終的に真偽値を割り当てるものである。この写像$[| |]_v$が付値$v$における命題論理の意味関数である。付値については @sec-valuation で詳述する。

## (sec-valuation)= 付値

命題論理の**付値(valuation)** とは、命題論理の式に含まれる命題記号に真偽値を割り当てる写像であり、上記の$v: italic("ATOM") -> {0, 1}$のことである。ただし、

$$
v(bot) = 0
$$

であることは強制される。これはいわば、命題論理を「計算」するための「文字」への「代入」のようなものである。命題論理式が情報論理学における対象であるため、それによって「計算」される真偽値は「命題論理式からの写像」という形で取り出す必要がある。なので、原始命題$p$に対して、$p=1$としてはならない。なぜなら、$=$（同一）の定義にこれは反しているからである。あくまで、付値$v$によって$p$が$1$に写されているだけである。

たとえば、命題論理式$phi$に含まれる命題記号が$p, q$で、付値$v$が以下のように定義されているとする。

$$
v(p) &= 1\
v(q) &= 0
$$

このとき、命題論理式$phi$を次のように決めてみると

$$
phi = p and not q
$$

付値$v$に基づく意味関数$[| phi |]_v$は以下のように計算される。

$$
[| phi |]_v &= [| p and not q |]_v\
&= F_and ([| p |]_v, [| not q |]_v)\
&= F_and (v(p), F_not ([| q |]_v))\
&= F_and (1, F_not (v(q)))\
&= F_and (1, F_not (0))\
&= F_and (1, 1)\
&= 1
$$

このように、付値$v$が与えられることで、命題論理式$phi$の真偽値を計算できるようになり、${0, 1}$へ写せた。つまり、ある意味で意味関数とは

$$
[| |]: (italic("ATOM") -> {0, 1}) times italic("PROP") -> {0, 1}
$$

であるとも言える。

## トートロジーとダブルターンスタイル

ダブルターンスタイルとは$models$という記号のことである。情報論理学において複数の重複しない定義が存在し非常に便利な記号なのだが、ここでは必要最低限の定義を行う。

ある命題の集合$Gamma subset.eq italic("PROP")$について

$$
[| phi |]_v = 1 quad (forall phi in Gamma)
$$

が成り立つような付値$v$を考える。これは複数あってもよい。このとき、

$$
Gamma models psi <=> [| psi |]_v = 1 quad (forall v)
$$

と定義する。ここで注意すべきなのが、付値$v^prime$について$[|psi|]_(v^prime) = 1 => [|phi|]_(v^prime) = 1 med (phi in Gamma)$が成り立つとは限らないことである。あくまで、$Gamma$内のすべての命題について$[|phi|]_v = 1$となる共通の付値$v$の存在が先である。それ以外について$psi$の意味関数がどうなるかは関係ない。
また、ある命題$phi$が **トートロジー(tautology)** であるとは任意の付値$v$について$[| phi |]_v = 1$であることをいい、

$$
[| phi |] = 1\
models phi
$$

などと書く。

練習がてらに以下の命題について証明してみよう。

:::column
@title:【補題】含意とトートロジーに関する補題

**【主張】**
$models ( phi -> psi)$ならば任意の付値$v$について

$$
[| phi |]_v <= [| psi |]_v
$$

である。
:::annotation
ここで$<=$は単に実数上の大小関係と同じであり、$0 <= 0, 0 <= 1, 1 <= 1$のときに成り立つ関係である。
:::

**【証明】**
$models ( phi -> psi)$であるとき、任意の付値$v$について

$$
[| phi -> psi |]*v &= 1\
F_(->)([| phi |]_v, [| psi |]_v) &= 1
$$

なので、$[| phi |]_v, [| psi |]_v$の組は

$$
([| phi |]_v, [| psi |]_v) = (0, 0), (0, 1), (1, 1)
$$

である。いづれにしても$[| phi |]_v <= [| psi |]_v$である。$square.filled$

:::

## 意味論的等価性

命題論理の式$phi, psi in italic("PROP")$が **意味論的等価(semantic equivalence)** であるとは、任意の付値$v$について

$$
models (phi -> psi)\
<=> [| phi |]_v = [| psi |]_v
$$

であることをいい、

$$
phi equiv psi\
phi approx psi
$$

などと書く。

---

たとえば、

$$
(p and q) != not(not p or not q)
$$

であるが、任意の付値$v$について$[| p and q |]_v = [| not(not p or not q) |]_v$であるため、

$$
(p and q) approx not(not p or not q)
$$

である。

:::column-toc
@title:【定理】意味論的等価性は同値関係

**【主張】**
意味論的等価性$approx$は同値関係
:::annotation
同値関係とは関係$R$のうち以下の3つの性質をもつものである。

1. **反射律**: $a R a$である。
2. **対称律**: $a R b$ならば$b R a$である。
3. **推移律**: $a R b$かつ$b R c$ならば$a R c$である。

:::
である。

**【証明】**
任意の命題論理式$phi, psi, sigma in italic("PROP")$に対して以下を示す。

1. **反射律**: $phi approx phi$である。
2. **対称律**: $phi approx psi$ならば$psi approx phi$である。
3. **推移律**: $phi approx psi$かつ$psi approx sigma$ならば$phi approx sigma$である。

---

**反射律**
任意の付値$v$について

$$
[| phi |]_v = [| phi |]_v
$$

であるため、$phi approx phi$である。

---

**対称律**
$phi approx psi$を仮定する。つまり、任意の付値$v$について

$$
[| phi |]_v = [| psi |]_v
$$

である。したがって、任意の付値$v$について

$$
[| psi |]_v = [| phi |]_v
$$

であり、$psi approx phi$である。

---

**推移律**
$phi approx psi$かつ$psi approx sigma$を仮定する。つまり、任意の付値$v$について

$$
[| phi |]_v &= [| psi |]_v\
[| psi |]_v &= [| sigma |]_v
$$

である。したがって、任意の付値$v$について

$$
[| phi |]_v = [| sigma |]_v
$$

であり、$phi approx sigma$である。$square.filled$

:::

# 代入

命題論理の **代入(substitution)** とは命題論理上に定義された写像の一種で、命題論理の原始命題(@prop-define/sec-atom)の出現を別の命題論理で置き換えることである。出現とは命題論理で命題記号が文字列として書かれている部分のことである。正確な定義は以下である。

原始命題$p in italic("ATOM")$に対する命題論理$psi in italic("PROP")$の代入$[psi slash p]$とは以下のような写像である。ただし、$p in italic("ATOM")$および$psi in italic("PROP")$である。

$$
[psi slash p] &: italic("PROP") -> italic("PROP")&&\
q[psi slash p] &= cases(
  psi &" if " q = p,
  bot &" if " q = bot,
  q &" otherwise ",) quad &&( q in italic("ATOM") )\
(not phi)[psi slash p] &= not(phi[psi slash p]) quad &&(phi in italic("PROP"))\
(phi_1 square phi_2)[psi slash p] &= (phi_1[psi slash p])square(phi_2[psi slash p]) quad &&(phi_1,phi_2 in italic("PROP"))
$$

この写像は命題論理$phi$に対する作用を左からではなく右から行う表記法が取られている。つまり$phi[psi slash p] = [psi slash p](phi)$である。意味関数や他の写像と同様に命題論理に対して再帰的に作用しており、その際論理結合子の構造はそのまま維持する。原始命題まで到達すると、置き換える対象にのみ作用し、置き換え先に置き換える。

---

たとえば、命題論理式$phi$が

$$
phi = p and (q or not p)
$$

であり、原始命題$p$に対して命題論理式$psi$が

$$
psi = r -> not s
$$

であるとき、代入$[psi slash p]$を$phi$に作用させると、次のようになる。

$$
phi[psi slash p] &= (p and (q or not p))[psi slash p]\
&= (p[psi slash p]) and ((q or not p)[psi slash p])\
&= psi and (q[psi slash p] or (not p)[psi slash p])\
&= psi and (q or not(phi[psi slash p]))\
&= (r -> not s) and (q or not psi)\
&= (r -> not s) and (q or not (r -> not s))
$$

:::column-toc
(lem-substitution)=
@title:代入補題

代入に関する補題として、以下の主張がある。
**【主張】**
$phi_1 approx phi_2$ならば任意の命題論理式$psi in italic("PROP")$および原始命題$p in italic("ATOM")$に対して

$$
psi[phi_1 slash p] approx psi[phi_2 slash p]
$$

である。

**【証明】**
$phi_1 approx phi_2$を仮定する。つまり、

$$
models (phi_1 -> phi_2)
$$

であり、任意の付値$v$について

$$
[| phi_1 |]_v = [| phi_2 |]_v
$$

である。示したい命題を命題論理に関する構造的帰納法で証明する。

---

**基底部**

$psi in italic("ATOM")$の場合を考える。このとき、以下の 2 つの場合がある。

( i ) $psi = p$のとき、

$$
psi[phi_1 slash p] &= p[phi_1 slash p] = phi_1\
psi[phi_2 slash p] &= p[phi_2 slash p] = phi_2
$$

であり、$phi_1 approx phi_2$より$psi[phi_1 slash p] approx psi[phi_2 slash p]$である。

( ii ) $psi != p$のとき、

$$
psi[phi_1 slash p] &= psi\
psi[phi_2 slash p] &= psi
$$

であり、明らかに$psi[phi_1 slash p] approx psi[phi_2 slash p]$である。

---

**帰納部**

$psi$が命題論理式であり、示したい命題が$psi_1, psi_2 in italic("PROP")$に対して成り立つと仮定する。つまり任意の付値$v$について、

$$
psi_1[phi_1 slash p] &approx psi_1[phi_2 slash p]\
<=> [| psi_1[phi_1 slash p] |]_v &= [| psi_1[phi_2 slash p] |]_v
$$

および

$$
psi_2[phi_1 slash p] &approx psi_2[phi_2 slash p]\
<=> [| psi_2[phi_1 slash p] |]_v &= [| psi_2[phi_2 slash p] |]_v
$$

であるとする。示したい命題が$psi$に対して成り立つことを示す。$psi$の形状に応じて場合分けを行う。任意の付値$v$について

( i ) $psi = not psi_1$のとき、

$$
[| psi[phi_1 slash p] |]_v &= [| (not psi_1)[phi_1 slash p] |]_v\
&= [| not (psi_1[phi_1 slash p]) |]_v\
&= F_not ([| psi_1[phi_1 slash p] |]_v)\
&= F_not ([| psi_1[phi_2 slash p] |]_v) quad because psi_1[phi_1 slash p] approx psi_1[phi_2 slash p]\
&= [| not (psi_1[phi_2 slash p]) |]_v\
&= [| psi[phi_2 slash p] |]_v
$$

である。

( ii ) $psi = psi_1 square psi_2$のとき、

$$
[| psi[phi_1 slash p] |]_v &= [| (psi_1 square psi_2)[phi_1 slash p] |]_v\
&= [| (psi_1[phi_1 slash p]) square (psi_2[phi_1 slash p]) |]_v\
&= F_square ([| psi_1[phi_1 slash p] |]_v, [| psi_2[phi_1 slash p] |]_v)\
&= F_square ([| psi_1[phi_2 slash p] |]_v, [| psi_2[phi_2 slash p] |]_v) quad because "仮定より"\
&= [| (psi_1[phi_2 slash p]) square (psi_2[phi_2 slash p]) |]_v\
&= [| psi[phi_2 slash p] |]_v
$$

である。

以上により、任意の命題論理式$psi in italic("PROP")$および原始命題$p in italic("ATOM")$に対して

$$
psi[phi_1 slash p] approx psi[phi_2 slash p]
$$

であることが示された。$square.filled$

:::
