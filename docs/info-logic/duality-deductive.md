---
title: "双対性と演繹体系"
---

# 双対性
**双対性(duality)** とは一般的に、ある構造で定義された理論において、ある概念や具体的な記号や操作を「鏡映し」に入れかえても同じ性質を持っていたり定理が成り立ったりすることを指す。

命題論理における双対性とは、ある命題$phi$について論理和と論理積、真理値$top$と$bot$を入れ替えた命題を$phi^d$と定義したとき、任意の命題論理式$phi$および$psi$に対して以下の等価式が成り立つことを指す。なお、$()^d$の正確な定義は後述する。
$$
phi approx psi <=> phi^d approx psi^d
$$

つまり、$phi approx psi$が言えれば、$phi^d approx psi^d$も言え、またその逆も成り立つ。これを **双対性定理(duality theorem)** と呼ぶ。この証明は後述する。次に、$()^d$の定義を行い、補題を示した後に双対性定理の証明を行う。

**双対化** $()^d$とは命題論理上の写像であり、以下のように定義される。ただし、この変換は元の命題が${and, or, not}$の結合子のみを用いて構成されていることを前提とする。${and, or, not}$は関数的に完全なので、$phi, psi$は任意の命題について${and, or, not}$で書き直したもの$italic("PROP")_ast$とする。
$$
()^d &: italic("PROP")_ast -> italic("PROP")_ast\
p^d &= p quad ( p in italic("ATOM") \\ {bot} )\
bot^d &= not bot = top\
(not phi)^d &= not (phi^d)\
(phi and psi)^d &= phi^d or psi^d\
(phi or psi)^d &= phi^d and psi^d\
$$

$phi^d$は$phi$の **双対命題(dual proposition)** と呼ばれる。
次に、@lem-morgan-duality を示す。

:::column-toc
(lem-morgan-duality)=
@title: 【補題】ド・モルガン双対化

いかに双対化によく似た、**ド・モルガン双対化** $()^ast$
:::annotation
ド・モルガン双対化という名称は本書特有であり、他の文献では見られない可能性がある。ド・モルガンの法則に着想を得た名称であるが、ド・モルガンの法則そのものとは異なることに注意されたい。
:::
を以下のように定義する。ただし、$phi, psi$は任意の命題のうち${and, or, not}$の結合子のみを用いて構成されているものとする。

$$
()^ast &: italic("PROP")_ast -> italic("PROP")_ast\
p^ast &= not p quad ( p in italic("ATOM"))\
(not phi)^ast &= not (phi^ast)\
(phi and psi)^ast &= phi^ast or psi^ast\
(phi or psi)^ast &= phi^ast and psi^ast\
$$

相対化とは異なり、原始命題$p$に対しては$not p$に変換している。主張は以下である。
**【主張】**
任意の$phi in italic("PROP")_ast$について
$$
phi^ast approx not phi
$$
である。

**【証明】**
帰納法によって示す。
**基底部**
$phi$が原始命題$p$のとき、$p^ast = not p$であり、明らかに主張は成り立つ。

**帰納部**
$psi_1, psi_2$について主張が成り立つと仮定する。すなわち、$psi_1^ast approx not psi_1$および$psi_2^ast approx not psi_2$であるとする。このとき、以下の場合に分けて示す。

1. $phi = not psi_1$のとき、
   $$
   phi^ast &= (not psi_1)^ast\
   &= not(psi_1^ast) quad &&because "定義"\
   &approx not(not psi_1) quad &&because "仮定"\
   &approx not phi
   $$
   つまり、$phi^ast approx not phi$である。

2. $phi = psi_1 and psi_2$のとき、
   $$
   phi^ast &= (psi_1 and psi_2)^ast\
   &= psi_1^ast or psi_2^ast quad &&because "定義"\
   &approx not psi_1 or not psi_2 quad &&because "仮定"\
   &approx not(psi_1 and psi_2) quad &&because "ド・モルガンの法則"\
   &approx not phi
   $$
   つまり、$phi^ast approx not phi$である。

3. $phi = psi_1 or psi_2$のとき、
   $$
   phi^ast &= (psi_1 or psi_2)^ast\
   &= psi_1^ast and psi_2^ast quad &&because "定義"\
   &approx not psi_1 and not psi_2 quad &&because "仮定"\
   &approx not(psi_1 or psi_2) quad &&because "ド・モルガンの法則"\
   &approx not phi
   $$
   つまり、$phi^ast approx not phi$である。

以上により、任意の$phi in italic("PROP")_ast$について$phi^ast approx not phi$であることが示された。$square.filled$

:::

さらに以下の双対化に関する補題を示す。

:::column-toc
(lem-duality-bar)=
@title: 【補題】否定への置換
次のように置換写像$sigma ()$を定義する。
$$
sigma &: italic("PROP")_ast -> italic("PROP")_ast\
sigma (phi) &= phi[ not p slash p ]_( p in italic("ATOM") \\ {bot} )\
&= phi[ not p_1 slash p_1 ][ not p_2 slash p_2 ] dots [ not p_n slash p_n ]\
$$

これは、命題論理式$phi$に現れるすべての命題記号$p_i$を$not p_i$に置き換える写像である。主張は以下である。

**【主張】**
任意の$phi, psi in italic("PROP")_ast$について
$$
phi approx psi <=> sigma (phi) approx sigma (psi)
$$
である。

**【証明】**
$phi approx psi$であると仮定する。つまり、任意の付値$v$に対して$[|phi|]_v = [|psi|]_v$であるとする。このとき、任意の付値$v$に対して新たな付値$v_sigma$を以下のように定義する。
$$
v_sigma (p) &= cases( 0 &" if " v(p) = 1, 1 &" if " v(p) = 0, ) quad &&( p in italic("ATOM") \\ {bot} )\
v_sigma (bot) &= 0
$$
すると、任意の原始記号$p in italic("ATOM") \\ {bot} $について
$$
[| not p |]_v_sigma &= cases( 0 &" if " v_sigma (p) = 1, 1 &" if " v_sigma (p) = 0, )\
&= cases( 0 &" if " v(p) = 0, 1 &" if " v(p) = 1, )\
&= v(p) = [| p |]_v
$$

である。したがって、任意の付値$v$について
$$
[| sigma (phi) |]_v &= [| phi [ not p slash p ]_( p in italic("ATOM") \\ {bot} ) |]_v\
&= [| phi |]_v_sigma
$$

$psi$についても同様に$[| sigma (psi) |]_v = [| psi |]_v_sigma$である。
したがって、任意の付値$v$について
$$
[| sigma (phi) |]_v = [| phi |]_v_sigma = [| psi |]_v_sigma = [| sigma (psi) |]_v
$$
である。ゆえに、$sigma (phi) approx sigma (psi)$である。$square.filled$

:::


最後に、双対性定理を示す。


:::column-toc
(lem-duality-theorem)=
@title: 【定理】双対性定理

**【主張】**
任意の命題$phi, psi in italic("PROP")_ast$について

$$
phi approx psi <=> phi^d approx psi^d
$$
である。

**【証明】**
定義より、$()^d$はド・モルガン双対化$()^ast$による変換と命題記号を否定に置換する写像$sigma ()$を適用したものである。すなわち、任意の$phi in italic("PROP")_ast$について
$$
phi^d = sigma ( phi^ast )
$$
である。$phi approx psi$を仮定すると、@lem-morgan-duality より
$$
phi^ast approx not phi\
psi^ast approx not psi
$$
つまり、$phi^ast approx psi^ast$である。@lem-duality-bar より
$$
sigma ( phi^ast ) approx sigma ( psi^ast )
$$
すなわち、$phi^d approx psi^d$である。ここで、
$$
(phi^d)^d &= phi
$$
なので
:::annotation

ここでは$(phi^d)^d = phi$ であることを暗に用いている。本来は証明が必要だが定義よりある程度明らかである。

:::
、$phi^d approx psi^d$を仮定すると$phi approx psi$が導ける。よって
$$
phi approx psi <=> phi^d approx psi^d
$$
である。$square.filled$

:::

これにより、命題論理における双対性が示された。

# 演繹体系
これまで命題論理の意味論的側面について説明してきた。命題論理がどのような構文を持っているのか、またその命題に対して意味的な等価性を定義してきた。しかし、私たちはこの命題論理を正しく運用して結論を得るための規則を持ち合わせていない。好き勝手に原始命題と結合子を命題論理の定義に合わせて並べても、それが証明にはならない。そこで、**演繹体系(deductive system)** を導入する。 演繹体系とは、命題論理式を操作するための一連の規則であり、これにより新たな命題論理式を証明できるようになる。演繹体系にはその証明の最初に正しいと決められている公理と証明に使える道具にあたる推論規則が含まれている。命題論理に対しては主に以下の3つの演繹体系が知られている。

- 自然演繹法(natural deduction)
- シーケント計算(sequent calculus)
- ヒルベルト・アッカーマン体系(Hilbert-Ackermann system)

また、これらの演繹体系はすべて**完全性(completeness)** と**健全性(soundness)** を満たすことが知られている。この二つの性質は、演繹体系と意味論的等価性が矛盾しないことを保証するものであり、演繹体系に必要な重要な性質である。

## 導出
**導出(derivation)** とは、ある命題論理式が演繹体系の規則に従って他の命題論理式から導かれる過程を指す。ある仮定$phi_1, phi_2, dots, phi_n$から命題論理式$psi$が導出できるとき、
$$
{phi_1, phi_2, dots, phi_n} &tack.r.short psi\
phi_1, phi_2, dots, phi_n &tack.r.short psi
$$
と表記し、この性質を**導出可能性(derivability)** と呼ぶ。もし、仮定なしに$psi$が導出されるならば、単に$&tack.r.short psi$と表記する。なお、左辺の命題の集合は$Gammma$や$Delta$などのギリシャ文字で表されることも多い。

## 健全性と完全性
$Gamma$を命題の集合とする。
演繹体系が**健全性(soundness)** を満たすとは、任意の命題論理式$phi$について
$$
Gamma tack.r.short phi => Gamma models phi
$$
であることを指す。つまり、演繹体系によって導出された命題論理式は意味論的にも正しいことを保証する。
:::annotation
$Gamma tack.r.short phi$であるというのは、ある演繹体系の規則に従って$Gamma$から$phi$が導出できることを指す。一方、$Gamma models phi$であるというのは、意味論的に$Gamma$が成り立つときに必ず$phi$も成り立つことを指す。
:::
次に、演繹体系が**完全性(completeness)** を満たすとは、任意の命題論理式$phi$について
$$
Gamma tack.r.short phi arrow.l.double Gamma models phi
$$
であることを指す。これは、意味論的に正しい命題論理式はすべて演繹体系によって導出できることを保証する。

演繹体系では、健全性と完全性の両方を満たすことが重要である。これにより、安心して演繹体系を用いて命題論理式を操作し、証明を行うことができる。

## 極大無矛盾集合
**無矛盾(consistent)** とはある命題集合$Gamma$について、$Gamma$から矛盾が導出されないことを指す。すなわち、
$$
Gamma &tack.r.not bot
$$
が成り立つことを意味する。このとき、$Gamma$は **無矛盾集合(consistent set)** と呼ばれる。ここで、$Gamma$が**極大無矛盾集合(maximal consistent set)** であるとは、命題集合$Gamma$が以下の2つの条件を満たすことを指す。

1. **無矛盾性**: $Gamma$は無矛盾である。すなわち、$Gamma &tack.r.not bot$である。
2. **極大性**: $Gamma$に新たな命題$phi$を追加した集合$Gamma union {phi}$が無矛盾であるならば、$phi in Gamma$である。すなわち、これ以上に大きい無矛盾集合は存在しない。

:::column-toc
(lem-prop-countable)=
@title:【補題】命題論理全体の集合は加算濃度

**【主張】**
$$
| italic("PROP") | = aleph_0
$$

**【証明】**
まず、原始命題の集合$italic("ATOM")$が可算無限集合であることから、$italic("ATOM")$の元を$p_1, p_2, p_3, dots$と列挙できる。そこに、有限集合の結合子を加えても可算無限集合であることに注意する。この集合を$Sigma$とする。なお、これはアルファベットと呼ばれるものである。このアルファベットを$n$個並べた文字列全体の集合は$Sigma^n$と表される。なお、その定義は以下のとおりである。
$$
Sigma^n &= Sigma times Sigma times dots times Sigma\
&= { (a_1, a_2, dots, a_n) | a_i in Sigma med (1 <= i <= n) }
$$
ここで、$Sigma^n = Sigma^(n-1) times Sigma$であることに注意する。
ここで$|Sigma^n| = aleph_0$を示す。
$n = 1$のとき、$|Sigma^1| = |Sigma| = aleph_0$である。
次に、$|Sigma^(n-1)| = aleph_0$であると仮定する。このとき、$|Sigma| = aleph_0$でることから、
$$
f &: Sigma &-> NN\
g &: Sigma^(n-1) &-> NN\
$$
となる全単射$f, g$が存在する。ここで、以下の写像$h$を定義する。
$$
h &: Sigma^n -> NN\
h ((a_1, a_2, dots, a_n)) &= 1/2(i+j)(i+j+1) + j
$$
なお、$i = f(a_1)$、$j = g((a_2, a_3, dots, a_n))$である。$h$はカントールのペアリング関数を用いたものであり、全単射であることが知られている。したがって、$|Sigma^n| = aleph_0$であることが示された。ゆえに、任意の$n in NN$について$|Sigma^n| = aleph_0$である。

次に、全単射
$$
k_1: NN times NN &-> union.big_n=0^infinity Sigma^n\
$$
は明らかに存在し、上の結果から全単射
$$
k_2: NN &-> NN times NN\
$$
もそんざいする。したがって、合成写像
$$
k_1 circle k_2: NN &-> union.big_(n=0)^infinity Sigma^n =: Sigma^ast\
$$
も全単射である。ゆえに、$| Sigma^ast | = aleph_0$である。最後に、命題論理式はある長さの文字列のなかで、ルールに基づいて構成されたものであるので$italic("PROP") subset.eq Sigma^ast$である。ここで、$italic("PROP")$は明らかに無限集合であることに注意すると、$| italic("PROP") | = aleph_0$であることが示された。
:::annotation
ここで、加算集合より真に小さい無限集合は存在しないことを用いている。これは、ZFCの公理系で証明可能だがここでは省略する。
:::
$square.filled$

:::


:::column-toc
@title:【補題】極大無矛盾集合の構成

**【主張】**
任意の無矛盾集合$Gamma$について、ある極大無矛盾集合$Gamma^ast$が存在して、$Gamma subset.eq Gamma^ast$である。

**【証明】**
@lem-prop-countable より、命題論理全体の集合$italic("PROP")$は可算無限集合である。したがって、$italic("PROP")$の元を$phi_1, phi_2, phi_3, dots$と列挙できる。ここで、以下のように命題集合$Gamma_n$を帰納的に定義する。
$$
Gamma_0 &= Gamma\
Gamma_(n+1) &= cases(
   Gamma_n union { phi_(n+1) } &" if " Gamma_n union { phi_(n+1) } &tack.r.not bot ,
   Gamma_n &" otherwise "
)
$$
このとき、
$$
Gamma^ast = union.big_(n=0)^infinity Gamma_n
$$
である。これは極大無矛盾集合である。

まず、無矛盾性を示す。任意の有限な部分集合$Delta subset.eq Gamma^ast$を取る。このとき、ある$N in NN$が存在して、$Delta subset.eq Gamma_N$である。なぜなら、$Delta$は有限集合であり、各元はある$Gamma_n$に含まれているからである。したがって、$Gamma_N &tack.r.not bot$であることから、$Delta &tack.r.not bot$である。ゆえに、$Gamma^ast &tack.r.not bot$である。

次に、極大性を示す。ある命題$phi in italic("PROP")$について、$Gamma^ast union { phi } &tack.r.not bot$であるとする。このとき、ある$M in NN$が存在して、$phi = phi_(M)$である。したがって、$Gamma_M union { phi_(M) } &tack.r.not bot$であることから、定義より$phi_(M) in Gamma_(M+1) subset.eq Gamma^ast$である。ゆえに、極大性が成り立つ。

以上により、任意の無矛盾集合$Gamma$について、ある極大無矛盾集合$Gamma^ast$が存在することが示された。

:::