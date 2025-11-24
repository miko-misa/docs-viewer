---
title: 一階述語論理の定義
---

# (fopl-define)= 一階述語論理の定義
ここでは、一階述語論理の構文を定義する。これは、@prop-define/prop-defineの構文定義を拡張したものであり、個体変数、関数記号、述語記号、量化子を導入することで、より複雑な命題を表現できるようにしている。この定義は、命題論理の定義でおこなったように、一階述語論理の言語を形式的に定義するものであり、後に@fopl-semantic/fopl-semantic や証明体系を構築する基礎となる。

## (sec-abstract-fopl)= 一階述語論理とは
**一階述語論理(first-order predicate logic; FOPL)** は、命題論理を拡張した論理体系であり、個体変数、関数記号、述語記号、量化子を導入することで、より複雑な命題を表現し推論することが可能となる。命題論理が命題の真偽に基づいて推論を行うのに対し、一階述語論理は個体の性質や関係性に基づいて推論を行うことができる。まず、「一階述語論理」を「一階」と「述語論理」に分解してみよう。

「述語論理」とは、命題論理に述語と個体変数を導入した論理体系である。述語は、個体の性質や関係性を表現するための記号であり、個体変数は、特定の個体を指し示すための記号である。たとえば、「$"P"(x)$」は「$x$が$"P"$の性質を持つ」という意味を持つ述語であり、「$"R"(x, y)$」は「$x$と$y$が$"R"$の関係にある」という意味を持つ述語である。ここで、$x$や$y$は個体変数であり、色んな濃度や集合を指し示すことができるという点で原子命題とは異なる。また、$P$や$R$はある量の個体変数を受け取り、真偽値を返す関数となっており、命題論理における命題記号とは異なる。

「一階」とは、量化子の範囲を個体変数に限定することを意味する。これによって命題論理では表現できなかった「すべての個体」や「ある個体」に関する命題を表現できるようになる。たとえば、「すべての$x$について$"P"(x)$が成り立つ」という命題は、$forall x "P"(x)$と表現され、「ある$x$について$P(x)$が成り立つ」という命題は$exists x "P"(x)$と表現される。ここで、$forall$は全称量化子を表し、$exists$は存在量化子を表す。

:::column
(sec-higher-order)=
@title: 二階述語論理と高階述語論理

一階述語論理に対して、 **二階述語論理 (second-order predicate logic)** や **高階述語論理 (higher-order predicate logic)** も存在する。二階述語論理では、量化子の範囲が個体変数だけでなく、述語変数にも及ぶ。これにより、述語自体に対する命題を表現できるようになる。高階述語論理では、さらに高次の変数に対しても量化子を適用できるようになる。これにより、より複雑な命題を表現できるようになるが、計算可能性や決定可能性の問題が生じる。

たとえば、一階述語論理では帰納法公理を表現できない。これは端的に言えば「すべての性質$"X"$について、$"X(0)"$が成り立ち、$X(n)$から$n$の後者$S(n)$について$X(S(n))$が言えたらすべての$n$で$X(n)$が言える」ということであるが、これは書き下せば以下のようになる。
$$
forall X (X(0) and forall n (X(n) -> X(S(n))) -> forall n X(n))
$$

$X$は述語であるので、述語変数に対する量化子が必要となり、一階述語論理では表現できない。二階述語論理ではこれを表現できるため、数学の基礎付けにおいて重要な役割を果たす。
:::

## 論理記号
一階述語論理の **論理記号(logical symbol)** には、以下のようなものが含まれる。

- 個体変数
- 結合子
- 量化記号
- 括弧

### 個体変数
**個体変数(individual variable)** は個体を指し示すための記号であり、命題論理における命題記号とは異なり、さまざまな個体を指し示すことができる。たとえば、$x_1$が「アリス」を指し示し、$x_2$が「ボブ」を指し示すことができる。また、個体変数は可算無限個存在するとする。本書では個体変数は以下の集合$italic("Var")$の元とする。

$$
italic("Var") = {x_0, x_1, x_2, ...} = {x_i | i in NN}
$$

@fopl-semantic/fopl-semantic において、個体変数が何を指し示すのかは@fopl-semantic/sec-universeによって決定される。

### 結合子
一階述語論理の **結合子(connective)** は、命題論理と同様に、命題を結合して新たな命題を形成するための記号である。基本的に$and$、$or$、$not$、$->$、$<->$、$bot$を使用する。ここでこれらの集合を$italic("Conn")$とする。

$$
italic("Conn") = {and, or, not, ->, <->, bot}
$$

### 量化記号
**量化記号(quantifier)** は、個体変数に対する量化を表現するための記号であり、以下の2種類が存在する。

- 全称量化子: $forall$ (for all)
- 存在量化子: $exists$ (there exists)

### 括弧
一階述語論理では、命題の構造を明確にするために括弧が使用される。括弧は$($および$)$で表され、必ず対で使用される。

## 非論理記号
一階述語論理の **非論理記号(non-logical symbol)** には、以下のようなものが含まれる。

- 定数記号
- 述語記号
- 関数記号

### 定数記号
**定数記号(constant symbol)** は、特定の個体を指し示すための記号であり、個体変数とは異なり、特定の個体を固定的に指し示す。これは一階述語論理を定義する際に決められているものである。個体変数とは異なり、定数記号全体は任意の濃度を持つことができる。定数記号全体の集合を$italic("Const")$とする。

$$
italic("Const") = {c_i | i in I}
$$

ただし、$I$は任意の濃度を持つ集合であることに注意されたい。

### 述語記号
ここで扱う **述語記号 (predicate symbol)** は、ある数の個体を受け取り、真偽値を返す記号であり、述語記号全体は一階述語論理を定義する際に決められているものである。述語記号はその **アリティ (arity)** によって分類され、、アリティ$n$の述語記号は$n$個の個体を受け取る。述語記号全体の集合を$italic("Pred")$とする。なお、述語記号は有限個であるとする。また、本書では$=$を意味する特別な記号を述語記号として含めることにしており、$dot(=)$と表す。これが述語記号全体の中に含まれない可能性もある。

$$
italic("Pred") = {dot(=), P_1, P_2, ..., P_n}
$$

$italic("Pred")$の各元$P_i$にはアリティ$l_i$が対応しているとする。

### 関数記号
ここで扱う **関数記号 (function symbol)** は、ある数の個体を受け取り、別の個体を返す記号であり、関数記号全体は一階述語論理を定義する際に決められているものである。関数記号はその **アリティ (arity)** によって分類され、アリティ$n$の関数記号は$n$個の個体を受け取る。関数記号全体の集合を$italic("Func")$とする。なお、関数記号は有限個であるとする。

$$
italic("Func") = {f_1, f_2, ..., f_m}
$$

$italic("Func")$の各元$f_i$にはアリティ$k_i$が対応しているとする。

### アリティ
**アリティ(arity)** とは、関数記号および述語記号が受け取る個体の数を指す。たとえば、アリティ$2$の関数記号は2個の個体を受け取り、アリティ$0$の関数記号は個体を受け取らない。任意の関数記号および述語記号$X$に対して、そのアリティを$italic("ar")(X)$と表すことにする。

$$
italic("ar"): italic("Func") union italic("Pred") -> NN
$$

### 関数記号と述語記号に関する注意
関数記号および述語記号は$f_i$や$P_i$というような私達がよくしる関数のような書き方をしたが、実際には別のような書き方がされることがある。そのため、私たちが普段使っているさまざまな記号も関数記号や述語記号として扱うことができる。たとえば、加算を表す$+$はアリティ$2$の、階乗$!$はアリティ$1$の関数記号として扱うことができ、等号$=$や不等号$>$はアリティ$2$の述語記号として扱うことができる。どちらもいわゆる$X(x_1,x_2)$のような書き方はされていないことに注意されたい。

## (sec-signature)= シグネチャ
ここまでの説明を踏まえて、一階述語論理の **シグネチャ(signature)** $L$を以下のように定義する。

$$
L =  angle.l italic("Const"), italic("Func"), italic("Pred"), italic("ar")  angle.r
$$

つまり、一階述語論理のシグネチャは定数記号、関数記号、述語記号、およびアリティの組み合わせである。ここで、これらはあくまで一階述語論理で用いる「記号」を集めたものでありまだ意味は持たないことに注意されたい。また、一階述語論理においてはこれ自体がその言語を定義しているので言語$L$という表現も用いられる。

## シグネチャのシミラリティタイプ
シグネチャ$L$の **シミラリティタイプ(similarity type)** $tau_L$を以下のように定義する。

$$
r_i &= italic("ar")(P_i) quad (P_i in italic("Pred") \\ {dot(=)})\
a_i &= italic("ar")(f_i) quad (f_i in italic("Func"))\
kappa &= |italic("Const")| = |I|\
tau_L &= angle.l thin r_1, r_2, ..., r_n thin ; thin a_1, a_2, ..., a_m thin ; thin kappa thin angle.r
$$

ここで、$kappa$は定数記号の濃度を表す。シミラリティタイプはシグネチャから一意に決定されるアリティをまとめたものである。つまり、シグネチャにおける「記号」を忘れそのアリティ情報だけを残したものである。なお、述語記号$dot(=)$はシミラリティタイプの定義から除外していることに注意されたい。

## (sec-term)= 項
**項(term)** は、シグネチャ$L$と個体変数の集合$italic("Var")$に基づいて定義される。項全体は以下を満たす最小の集合$italic("Term")$である。

1. すべての個体変数$x in italic("Var")$は項である。
2. すべての定数記号$c in italic("Const")$は項である。
3. もし$f in italic("Func")$がアリティ$n$を持ち、$t_1, t_2, ..., t_n$が項であるならば、$f(t_1, t_2, ..., t_n)$も項である。

## (sec-form)= 一階述語論理式
 **一階述語論理式 (formula of first-order predicate logic)** をここでは単に **式 (formula)** あるいは **論理式 (logical formula)** と呼ぶことにする。式全体は以下を満たす最小の集合$italic("Form")$である。

1. $bot in italic("Form")$である。
2. もし$P in italic("Pred")$がアリティ$0$ならば、$P in italic("Form")$である。
3. もし$P in italic("Pred")$がアリティ$n > 0$を持ち、$t_1, t_2, ..., t_n in italic("Term")$であるならば、$P(t_1, t_2, ..., t_n) in italic("Form")$である。
4. もし$phi, psi in italic("Form")$であるならば、$(phi thin square thin psi) in italic("Form")$である。
5. もし$phi in italic("Form")$であるならば、$not phi in italic("Form")$である。
6. もし$phi in italic("Form")$であり、$x in italic("Var")$であるならば、$(forall x (phi)) in italic("Form")$である。
7. もし$phi in italic("Form")$であり、$x in italic("Var")$であるならば、$(exists x (phi)) in italic("Form")$である。

## 原子論理式・アトム・原子式
**原子論理式(atomic formula; atom)** とは、以下の条件を満たす一階述語論理式である。原子論理式全体の集合を$italic("ATOM")$とする。

1. $P in italic("Pred")$がアリティ$0$ならば、$P in italic("ATOM")$である。
2. $P in italic("Pred")$がアリティ$n > 0$を持ち、$t_1, t_2, ..., t_n in italic("Term")$であるならば、$P(t_1, t_2, ..., t_n) in italic("ATOM")$である。
3. $dot(=) in italic("Pred")$がアリティ$2$であり、$t_1, t_2 in italic("Term")$であるならば、$t_1 dot(=) t_2 in italic("ATOM")$である。
3番目の条件は2番目の条件の特別な場合であるが、等号$dot(=)$を特別に扱うために明示的に分けている。本書では以下単に原子式と呼ぶことにする。

項、原子論理式、および一階述語論理式の関係は以下のようになる。

- 変数と定数記号は項である。
- 項を用いて関数記号を適用することで新たな項を形成できる。
- 項を用いて述語記号を適用することで原子論理式を形成できる。
- 原子論理式に結合子や量化子を適用することで一階述語論理式を形成できる。

![画像](/term-and-fopl.png)

# 一階述語論理上の概念
## 項と論理式上の同一
命題論理と同様に項および論理式について、**同一(equality)** であるとは2つの文字列が一致していることを指し、それぞれ
$$
t &= s quad (t,s in italic("Term"))\
phi &= psi quad (phi, psi in italic("Term"))
$$
とかく。

## (sec-term-map)= 項上の写像
命題論理と同様に、項に対しても**写像(mapping; substitution)** を定義できる。項を任意の集合$A$に写す写像は@prop-define/sec-prop-mapと同様に再帰的に定義できる。ここではシグネチャ$L = (italic("Const"), italic("Func"), italic("Pred"), italic("ar"))$と集合$A$が与えられているとする。このとき、以下の写像が与えられているとする。

- 個体変数 $x in italic("Var")$ に対応する写像
  $$
  F_(italic("Var")): italic("Var") &-> A\
  x &|-> F_(italic("Var"))(x)
  $$
- 定数記号 $c in italic("Const")$ に対応する写像
  $$
  F_(italic("Const")): italic("Const") &-> A\
  c &|-> F_(italic("Const"))(c)
  $$
- 関数記号 $f_i in italic("Func")$ に対応する写像
  $$
  F_(f_i): A^(italic("ar")(f_i)) &-> A
  $$

このとき，項 $t in italic("Term")$ から集合 $A$ への写像
$$
hat(f): italic("Term") -> A
$$
を次のように再帰的に定義できる。

$$
hat(f)(x) &= F_(italic("Var"))(x) quad (x in italic("Var"))\
hat(f)(c) &= F_(italic("Const"))(c) quad (c in italic("Const"))\
hat(f)(f_i (t_1, t_2, ..., t_m)) &= F_(f_i)(hat(f)(t_1), hat(f)(t_2), ..., hat(f)(t_m))\
&quad quad (f_i in italic("Func"), m = italic("ar")(f_i), t_1, t_2, ..., t_m in italic("Term"))\
$$

## (sec-fopl-map)= 一階述語論理上の写像
命題論理と同様に、一階述語論理の式に対しても**写像(mapping; substitution)** を定義できる。式を任意の集合$A$に写す写像は@prop-define/sec-prop-mapと同様に再帰的に定義できる。ここではシグネチャ$L = (italic("Const"), italic("Func"), italic("Pred"), italic("ar"))$と集合$A$が与えられているとする。このとき、以下の写像が与えられているとする。

- 項$t in italic("Term")$に対応する写像
  $$
  F_(italic("Term")): italic("Term") &-> A\
  t &|-> F_(italic("Term"))(t)
  $$

- 単項結合子 $not$ に対応する写像
  $$
  F_(not): A &-> A\
  a &|-> F_(not)(a)
  $$

- 二項結合子 $square in italic("Conn") $ に対応する写像
  $$
  F_(square.stroked): A times A &-> A\
  a_1, a_2 &|-> F_(square.stroked)(a_1, a_2)
  $$

- 量化記号 $forall, exists$ に対応する写像
  $$
  F_(forall): A times italic("Var") &-> A\
  a, x &|-> F_(forall)(a, x)\
  F_(exists): A times italic("Var") &-> A\
  a, x &|-> F_(exists)(a, x)
  $$
- 述語 $P_i in italic("Pred")$ に対する写像
  $$
  F_(P_i): A^(italic("ar")(P_i)) &-> A
  $$

このとき，一階述語論理の式 $phi in italic("Form")$ から集合 $A$ への写像
$$
hat(f): italic("Form") -> A
$$
を次のように再帰的に定義できる。

$$
hat(f)(t) &= F_(italic("Term"))(t) quad (t in italic("Term"))\
&quad quad (P_i in italic("Pred"), n = italic("ar")(P_i), t_1, t_2, ..., t_n in italic("Term"))\
hat(f)(P_i (t_1, t_2, ..., t_n)) &= F_(P_i)(hat(f)(t_1), hat(f)(t_2), ..., hat(f)(t_n))\
&quad quad (f_i in italic("Func"), m = italic("ar")(f_i), t_1, t_2, ..., t_m in italic("Term"))\
hat(f)(not phi) &= F_(not)(hat(f)(phi)) quad (phi in italic("Form"))\
hat(f)(phi square thin psi) &= F_(square.stroked)(hat(f)(phi), hat(f)(psi))\
&quad quad (square in italic("Conn"), phi, psi in italic("Form"))\
hat(f)(forall x (phi)) &= F_(forall)(hat(f)(phi), x) quad (x in italic("Var"), phi in italic("Form"))\
hat(f)(exists x (phi)) &= F_(exists)(hat(f)(phi), x) quad (x in italic("Var"), phi in italic("Form"))
$$

つまり、一階述語論理上の写像は、個体変数、定数記号、述語記号、関数記号、結合子、量化子に対応する写像を用いて再帰的に定義される。次はこの写像として、自由変数と束縛変数の概念を定義する。

## 自由変数と束縛変数
一階述語論理の式における **自由変数 (free variable)** と
**束縛変数 (bound variable)** の概念は、論理式内の変数の出現に対してその量子化の影響を表すものである。自由変数とは、式内で量子化されていない変数のことであり、束縛変数とは式内で量子化されている変数のことである。以下に例を示す。

1. $forall x (P(x) and Q(y))$
    - 自由変数: $y$
    - 束縛変数: $x$
2. $exists y (R(x, y) or S(z))$
    - 自由変数: $x, z$
    - 束縛変数: $y$
3. $forall x (P(x) -> Q(y)) and forall y (P(x) -> R(y))$
    - 自由変数: 2つ目の$x$と1つ目の$y$
    - 束縛変数: 1つ目の$x$と2つ目の$y$

ある論理式の自由変数の集合は、変数の全体集合$italic("Var")$の部分集合であり、それを取り出すための写像$italic("FV")(phi)$を定義できる。

$$
italic("FV"): italic("Form") &-> cal(P)(italic("Var"))\
italic("FV")(P_i (t_1, t_2, ..., t_n)) &= italic("FV")(t_1) union italic("FV")(t_2) union ... union italic("FV")(t_n) \
&quad quad (P_i in italic("Pred"), n = italic("ar")(P_i), t_1, t_2, ..., t_n in italic("Term"))\
italic("FV")(not phi) &= italic("FV")(phi) quad (phi in italic("Form"))\
italic("FV")(phi square thin psi) &= italic("FV")(phi) union italic("FV")(psi) \
&quad quad (square in italic("Conn"), phi, psi in italic("Form"))\
italic("FV")(forall x (phi)) &= italic("FV")(phi) \\ {x} quad (x in italic("Var"), phi in italic("Form"))\
italic("FV")(exists x (phi)) &= italic("FV")(phi) \\ {x} quad (x in italic("Var"), phi in italic("Form"))
$$

なお、項$t in italic("Term")$に対する自由変数の集合を求める写像は以下のように定義される。
$$
italic("FV"): italic("Term") &-> cal(P)(italic("Var"))\
italic("FV")(x) &= {x} quad (x in italic("Var"))\
italic("FV")(c) &= emptyset quad (c in italic("Const"))\
italic("FV")(f(t_1, t_2, ..., t_n)) &= italic("FV")(t_1) union italic("FV")(t_2) union ... union italic("FV")(t_n) \
&quad quad (f in italic("Func"), n = italic("ar")(f), t_1, t_2, ..., t_n in italic("Term"))
$$

この定義により、任意の一階述語論理式に対して、その自由変数の集合を正確に特定できるようになる。たとえば、式$forall x (P(x, y) and Q(y))$に対しては、以下の手順で自由変数を求めることができる。

$$
italic("FV")(forall x (P(x, y) and Q(y))) &= italic("FV")(P(x, y) and Q(y)) \\ {x}\
&= (italic("FV")(P(x, y)) union italic("FV")(Q(y))) \\ {x}\
&= ((italic("FV")(x) union italic("FV")(y)) union italic("FV")(y)) \\ {x}\
&= (({x} union {y}) union {y}) \\ {x}\
&= {y}
$$

### (sec-closed-term)= 閉項
**閉項(closed term)** とは、自由変数を含まない、つまり$italic("FV")(t) = emptyset$となる項$t$である。つまり、閉項はすべての変数が定数記号または関数記号によって構成されている項である。閉項全体の集合を$italic("Term"_c)$とする。

### (sec-sentence)= 文・閉式
**文(sentence; closed formula; closed logical formula)** とは、自由変数を含まない、つまり$italic("FV")(phi) = emptyset$となる一階述語論理式である。つまり、文はすべての変数が量子化されている式$phi$である。文全体の集合を$italic("Sent")$とする。

## (sec-substitution)= 代入
**代入(substitution)** とは、ある一階述語論理式における特定の部分式を別の式に置き換える操作であり写像として定義される。代入は、変数の置換や部分式の置換など、さまざまな形で行われる。

自由変数$x in italic("Var")$を項$t in italic("Term")$に置き換える代入$[t\/x]$を以下のように定義する。

$$
[t\/x]: italic("Term") &-> italic("Term")\
(y)[t\/x] &= cases(
  t quad "if " y = x,
  y quad "if " y eq.not x
) quad (y in italic("Var"))\
(c)[t\/x] &= c quad (c in italic("Const"))\
(f(t_1, t_2, ..., t_n))[t\/x] &= f(t_1[t\/x], t_2[t\/x], ..., t_n [t\/x])\
&quad quad (f in italic("Func"), n = italic("ar")(f), t_1, t_2, ..., t_n in italic("Term"))\
\
[t\/x]: italic("Form") &-> italic("Form")\
(P_i (t_1, t_2, ..., t_n))[t\/x] &= P_i (t_1 [t\/x], t_2 [t\/x], ..., t_n [t\/x])\
&quad quad (P_i in italic("Pred"), n = italic("ar")(P_i), t_1, t_2, ..., t_n in italic("Term"))\
(not phi)[t\/x] &= not (phi [t\/x]) quad (phi in italic("Form"))\
(phi square thin psi)[t\/x] &= (phi [t\/x]) square thin (psi [t\/x])\
&quad quad (square in italic("Conn"), phi, psi in italic("Form"))\
(forall y (phi))[t\/x] &= cases(
  forall y (phi) quad "if " y = x,
  forall y (phi [t\/x]) quad "if " y eq.not x
) quad (y in italic("Var"), phi in italic("Form"))\
(exists y (phi))[t\/x] &= cases(
  exists y (phi) quad "if " y = x,
  exists y (phi [t\/x]) quad "if " y eq.not x
) quad (y in italic("Var"), phi in italic("Form"))\
$$

この定義からもわかる通り、自由変数に対してのみ代入が行われ、束縛変数に対しては影響を与えないことに注意されたい。

論理式内に存在する置き換えるための指標$dollar$を **プレースホルダー(placeholder)** という。このプレースホルダーを別の論理式$psi$に置き換える代入$[psi\/dollar]$を以下のように定義する。
$$
[psi\/dollar]: italic("Form") &-> italic("Form")\
phi [psi\/dollar] &= cases(
  psi quad "if " phi = dollar,
  phi quad "if " phi eq.not dollar
) quad (phi in italic("Form"))\
(phi_1 square thin phi_2) [psi\/dollar] &= (phi_1 [psi\/dollar]) square thin (phi_2 [psi\/dollar])\
&quad quad (square in italic("Conn"), phi_1, phi_2 in italic("Form"))\
(not phi) [psi\/dollar] &= not (phi [psi\/dollar]) quad (phi in italic("Form"))\
(forall x (phi)) [psi\/dollar] &= forall x (phi [psi\/dollar]) quad (x in italic("Var"), phi in italic("Form"))\
(exists x (phi)) [psi\/dollar] &= exists x (phi [psi\/dollar]) quad (x in italic("Var"), phi in italic("Form"))\
$$

### 代入可能性
**代入可能性(substitutability)** とは、ある代入について、その代入が論理式に対して適切に行えるかどうかを示す概念である。束縛されていない変数が代入によって束縛されてしまうことを防ぐために、代入可能性の条件が生じる。ある一階述語論理式$phi$に対して、変数$x in italic("Var")$を項$t in italic("Term")$に置き換える代入$[t\/x]$が代入可能であるとは、$phi$が以下の条件を満たす場合をいう。

- 項$t$に含まれるすべての変数が、式$phi$内の$x$の位置で束縛されていない。

これは「$t "is free for" x "in" phi$」といい、そうでない場合は代入は定義されないということにする。

また、ある一階述語論理式$phi$に対して、プレースホルダー$dollar$を式$psi in italic("Form")$に置き換える代入$[psi\/dollar]$が代入可能であるとは、$phi$が以下の条件を満たす場合をいう。

- 式$phi$内のプレースホルダーの位置で、式$psi$に含まれるすべての自由変数が束縛されていない。

これは「$psi "is free for" dollar "in" phi$」といい、そうでない場合は代入は定義されないということにする。

:::column
@title: 代入可能性を厳密に定義する

代入可能性の条件をより厳密に定義するには再帰的に行う。以下にその説明を行う。


---

変数$x in italic("Var")$を項$t in italic("Term")$に置き換える代入$[t\/x]$を考える。

- $phi in italic("ATOM")$のとき
  $t "is free for" x "in" phi$である。
- $phi = not psi$であるとき
  $t "is free for" x "in" psi$であるならば、$t "is free for" x "in" phi$である。
- $phi = psi_1 square thin psi_2$であるとき
  $t "is free for" x "in" psi_1$かつ$t "is free for" x "in" psi_2$であるならば、$t "is free for" x "in" phi$である。
- $phi = forall y (psi)$または$phi = exists y (psi)$であるとき
  - $y = x$であるならば、$t "is free for" x "in" phi$である
    :::annotation
    $x$に対する量化が新たに導入されるため、一見すると代入できないように思えるが、代入の定義では式が変化しないという扱いになるため、問題は生じない。よって、代入可能とする。
    :::
  - $y eq.not x$であるとき
    $t "is free for" x "in" psi$かつ$y in.not italic("FV")(t)$であるならば、$t "is free for" x "in" phi$である。

---

次に、プレースホルダー$dollar$を式$psi in italic("Form")$に置き換える代入$[psi\/dollar]$を考える。

- $phi in italic("ATOM")$のとき
  $psi "is free for" dollar "in" phi$である。
- $phi = not sigma$であるとき
  $psi "is free for" dollar "in" sigma$であるならば、$psi "is free for" dollar "in" phi$である。
- $phi = sigma_1 square thin sigma_2$であるとき
  $psi "is free for" dollar "in" sigma_1$かつ$psi "is free for" dollar "in" sigma_2$であるならば、$psi "is free for" dollar "in" phi$である。
- $phi = forall x (sigma)$または$phi = exists x (sigma)$であるとき
  $psi "is free for" dollar "in" sigma$かつ$x in.not italic("FV")(psi)$であるならば、$psi "is free for" dollar "in" phi$である。
:::

たとえば、式$exists x(y < x)$に対して、代入$[x\/y]$を考えてしまうと、束縛されていなかった$y$が$x$に置き換えられた結果、$exists x(x < x)$となり$y$だったものが束縛されてしまうため、これは代入可能ではない。一方で、式$exists y (y < z)$に対して、代入$[x\/z]$は代入可能である。
