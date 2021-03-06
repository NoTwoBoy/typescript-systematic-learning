// 实现泛型GetReadonlyKeys<T>，该GetReadonlyKeys<T>返回对象的只读键的并集。

import { Equal, Expect } from '@type-challenges/utils'

interface Todo3 {
	readonly title: string
	readonly description: string
	completed: boolean
}

type Keys = GetReadonlyKeys<Todo3> // expected to be "title" | "description"

type IsEqual<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
	T
>() => T extends Y ? 1 : 2
	? A
	: B

type GetReadonlyKeys<T> = {
	[K in keyof T]-?: IsEqual<
		{ [O in K]: T[K] },
		{ -readonly [O in K]: T[K] },
		never,
		K
	>
}[keyof T]

// -----------------------------------------------------------------------------------

// 您需要实现一个类型级别的解析器，将 URL 查询字符串解析为对象文本类型。

// 一些详细的要求:

// 可以忽略查询字符串中键的值，但仍可对其进行解析为 true。例如: key是无值的，因此解析器的结果是{ key: true }.
// 复制键必须合并成一个键。如果具有相同键的不同值，则必须将值合并为元组类型
// 当一个键只有一个值时，该值不能包装成元组类型
// 如果具有相同键值的值出现多次，则必须将其视为一次, key=value&key=value必须只视为key=value。

type EmptyString2True<S extends string> = S extends '' ? true : S

type NewKeyValue<
	T extends Object,
	NK extends string,
	V extends any
> = NK extends keyof T
	? V extends T[NK]
		? T
		: {
				[K in keyof T]: K extends NK
					? T[K] extends Array<any>
						? [...(T[K] & Array<any>), EmptyString2True<V & string>]
						: [T[K], EmptyString2True<V & string>]
					: T[K]
		  }
	: Copy<T & { [key in NK]: EmptyString2True<V & string> }>

type QueryStringParser<
	S extends string,
	U extends object = {}
> = S extends `${infer K}=${infer L}`
	? L extends `${infer V}&${infer R}`
		? QueryStringParser<R, NewKeyValue<U, K, V>>
		: NewKeyValue<U, K, L>
	: U

type test = QueryStringParser<'a=1&b=2&c=3&a=2343'>

// -----------------------------------------------------------------------------------

// 在类型系统中实现 JavaScript 的 Array.slice 函数。Slice < Arr，Start，End > 接受树参数。输出应该是从索引 Start 到 End 的 Arr 子数组。负数的索引应该反向计数。

// 例如

type Arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
type Result20 = Slice<Arr1, 0, -4> // expected to be [3, 4]

type g = ParserNumber<-6, Arr1>

type GreaterOrEqual<
	T extends number,
	U extends number,
	E extends boolean = true,
	I extends Array<any> = [[], []]
> = I[0]['length'] extends T
	? I[1]['length'] extends U
		? E
		: false
	: I[1]['length'] extends U
	? true
	: GreaterOrEqual<T, U, E, [[...I[0], 0], [...I[1], 0]]>

type ParserNumber<
	T extends number,
	U extends Array<any>,
	R extends Array<any> = []
> = `${T}` extends `-${infer N}`
	? `${R['length']}` extends N
		? U['length']
		: ParserNumber<T, Pop<U>, [...R, 0]>
	: T

type SliceArray<
	T extends Array<number>,
	S extends number = 0,
	E extends number = T['length'],
	I extends Array<any> = [],
	R extends Array<any> = []
> = GreaterOrEqual<I['length'], S, true> extends true
	? GreaterOrEqual<E, I['length'], false> extends true
		? T extends [infer L, ...infer H]
			? SliceArray<H extends Array<number> ? H : [], S, E, [...I, L], [...R, L]>
			: R
		: R
	: T extends [infer L, ...infer H]
	? SliceArray<H extends Array<number> ? H : [], S, E, [...I, L], [...R]>
	: R

type Slice<
	T extends Array<number>,
	S extends number = 0,
	E extends number = T['length']
> = SliceArray<T, ParserNumber<S, T>, ParserNumber<E, T>>

// -----------------------------------------------------------------------------------

// 实现一个类型级别的整数比较器。我们提供了一个枚举来指示比较结果，如下所示:

// 如果 比... 更大 ，类型应是Comparison.Greater.
// 如果 及 是相等的，类型应该是Comparison.Equal.
// 如果 低于 ，类型应是Comparison.Lower.
// 请注意，a 和 b 可以是正整数，也可以是负整数或零，甚至一个是正整数，而另一个是负整数。

enum Comparison {
	Greater,
	Equal,
	Lower,
}

type Exp10<
	T extends string,
	R extends any[] = []
> = T extends `${infer A}e+${infer B}`
	? B
	: T extends `${infer A}e-${infer B}`
	? `-${B}`
	: T extends `${infer F}${infer REST}`
	? Exp10<REST, [...R, F]>
	: R extends [infer E, ...infer REST]
	? `${REST['length']}`
	: never

type IsNegStr<T extends string> = T extends `-${string}` ? true : false
type AbsStr<T extends string> = T extends `-${infer E}` ? E : T

type SingleDigitComparator<
	A extends string,
	B extends string,
	R extends any[] = []
> = A extends `${R['length']}`
	? B extends `${R['length']}`
		? Comparison.Equal
		: Comparison.Lower
	: B extends `${R['length']}`
	? Comparison.Greater
	: SingleDigitComparator<A, B, [...R, 0]>

type SameDigitComparator<
	A extends string,
	B extends string
> = A extends `${infer A1}${infer AR}`
	? B extends `${infer B1}${infer BR}`
		? SingleDigitComparator<A1, B1> extends infer R
			? R extends Comparison.Equal
				? SameDigitComparator<AR, BR>
				: R
			: never
		: never
	: Comparison.Equal

type PositiveIntStringComparator<
	A extends string,
	B extends string
> = A extends B
	? Comparison.Equal
	: IntStringComparator<Exp10<A>, Exp10<B>> extends infer R
	? R extends Comparison.Equal
		? SameDigitComparator<A, B>
		: R
	: never

type IntStringComparator<A extends string, B extends string> = A extends B
	? Comparison.Equal
	: IsNegStr<A> extends true
	? IsNegStr<B> extends true
		? PositiveIntStringComparator<AbsStr<B>, AbsStr<A>>
		: Comparison.Lower
	: IsNegStr<B> extends true
	? Comparison.Greater
	: PositiveIntStringComparator<AbsStr<A>, AbsStr<B>>

type Comparator<A extends number, B extends number> = IntStringComparator<
	`${A}`,
	`${B}`
>

type cases = [
	Expect<Equal<Comparator<1e-64, 1e-63>, Comparison.Lower>>,
	Expect<Equal<Comparator<9e-64, 1e-63>, Comparison.Lower>>,
	Expect<Equal<Comparator<1e-62, 1e-63>, Comparison.Greater>>,
	Expect<Equal<Comparator<0.1e-62, 1e-63>, Comparison.Equal>>,
	Expect<Equal<Comparator<1e-63, 1e-63>, Comparison.Equal>>,
	Expect<Equal<Comparator<1e64, 1e64>, Comparison.Equal>>,
	Expect<Equal<Comparator<1e64, 2e64>, Comparison.Lower>>,
	Expect<Equal<Comparator<1e65, 2e64>, Comparison.Greater>>,
	Expect<Equal<Comparator<3e64, 2e64>, Comparison.Greater>>,
	Expect<Equal<Comparator<1e21, 9e20>, Comparison.Greater>>,
	Expect<Equal<Comparator<5, 5>, Comparison.Equal>>,
	Expect<Equal<Comparator<5, 6>, Comparison.Lower>>,
	Expect<Equal<Comparator<5, 8>, Comparison.Lower>>,
	Expect<Equal<Comparator<5, 0>, Comparison.Greater>>,
	Expect<Equal<Comparator<-5, 0>, Comparison.Lower>>,
	Expect<Equal<Comparator<0, 0>, Comparison.Equal>>,
	Expect<Equal<Comparator<0, -5>, Comparison.Greater>>,
	Expect<Equal<Comparator<5, -3>, Comparison.Greater>>,
	Expect<Equal<Comparator<5, -7>, Comparison.Greater>>,
	Expect<Equal<Comparator<-5, -7>, Comparison.Greater>>,
	Expect<Equal<Comparator<-5, -3>, Comparison.Lower>>,
	Expect<Equal<Comparator<-25, -30>, Comparison.Greater>>,
	Expect<Equal<Comparator<15, -23>, Comparison.Greater>>,
	Expect<Equal<Comparator<40, 37>, Comparison.Greater>>,
	Expect<Equal<Comparator<-36, 36>, Comparison.Lower>>,
	Expect<Equal<Comparator<27, 27>, Comparison.Equal>>,
	Expect<Equal<Comparator<-38, -38>, Comparison.Equal>>
]
