// 不使用 Omit 实现 TypeScript 的 Omit<T, K> 范型。

// Omit 会创建一个省略 K 中字段的 T 对象。

interface Todo {
	title: string
	description: string
	completed: boolean
}

type TodoPreview1 = MyOmit<Todo, 'description' | 'title'>

const todo1: TodoPreview1 = {
	completed: false,
}

type MyOmit<T, K extends keyof T> = Pick<
	T,
	{
		[O in keyof T]: O extends K ? never : O
	}[keyof T]
>

type MyOmit2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// 实现绝对类型。接受字符串、数字或大数的类型。输出应该是一个正数字符串

type Test = -100
type Result = Absolute<Test> // expected to be "100"

type Absolute<T extends string | number | bigint> = `${T}` extends `-${infer N}`
	? N
	: T

// 实现 Python 喜欢类型系统中的任何函数。类型接受 Array，如果 Array 中的任何元素为 true，则返回 true。如果 Array 为空，则返回 false。
type FalseArray = '' | 0 | false | [] | { [P in any]: never }

type AnyOf<T extends any[]> = T extends [infer H, ...infer T]
	? H extends FalseArray
		? AnyOf<T>
		: true
	: false

type AnyOf1<T extends any[]> = T[number] extends
	| 0
	| ''
	| false
	| []
	| { [key: string]: never }
	? false
	: true

type Sample1 = AnyOf<[1, '', false, [], {}]> // expected to be true.
type Sample2 = AnyOf<[0, '', false, [], {}]> // expected to be false.

// 不使用 ReturnType 实现 TypeScript 的 ReturnType<T> 范型。

const fn = (v: boolean) => {
	if (v) return 1
	else return 2
}

type a4 = MyReturnType<typeof fn> // 应推导出 "1 | 2"

type MyReturnType<T extends (...args: any[]) => any> = T extends (
	...args: any[]
) => infer R
	? R
	: never

// 实现一个通用的DeepReadonly<T>，它将对象的每个参数及其子对象递归地设为只读。

// 您可以假设在此挑战中我们仅处理对象。数组，函数，类等都无需考虑。但是，您仍然可以通过覆盖尽可能多的不同案例来挑战自己。

type X = {
	x: {
		a: 1
		b: 'hi'
	}
	y: 'hey'
}

type Expected = {
	readonly x: {
		readonly a: 1
		readonly b: 'hi'
	}
	readonly y: 'hey'
}

type DeepReadonly<T extends { [key: string]: any }> = {
	readonly [K in keyof T]: T[K] extends { [key: string]: any }
		? DeepReadonly<T[K]>
		: T[K]
}

let todo: DeepReadonly<X> // should be same as `Expected`

// 实现泛型TupleToUnion<T>，它覆盖元组的值与其值联合。

type Arr = ['1', '2', '3']

type a = TupleToUnion<Arr> // expected to be '1' | '2' | '3'

type TupleToUnion<T extends any[]> = T[number]

// 在 JavaScript 中我们很常会使用可串联（Chainable/Pipeline）的函数构造一个对象，但在 TypeScript 中，你能合理的给他附上类型吗？

// 在这个挑战中，你可以使用任意你喜欢的方式实现这个类型 - Interface, Type 或 Class 都行。你需要提供两个函数 option(key, value) 和 get()。在 option 中你需要使用提供的 key 和 value 扩展当前的对象类型，通过 get 获取最终结果。

// 你只需要在类型层面实现这个功能 - 不需要实现任何 TS/JS 的实际逻辑。

// 你可以假设 key 只接受字符串而 value 接受任何类型，你只需要暴露它传递的类型而不需要进行任何处理。同样的 key 只会被使用一次。

type Chainable<T = {}> = {
	option<K extends string, V extends any>(
		key: K,
		value: V
	): Chainable<T & { [key in K]: V }>
	get(): T
}

declare const config: Chainable

const result = config
	.option('foo', 123)
	.option('name', 'type-challenges')
	.option('bar', { value: 'Hello World' })
	.get()

// 期望 result 的类型是：
interface Result2 {
	foo: number
	name: string
	bar: {
		value: string
	}
}

// 实现一个通用Last<T>，它接受一个数组T并返回其最后一个元素的类型。

type arr1 = ['a', 'b', 'c']
type arr2 = [3, 2, 1]

type tail1 = Last<arr1> // expected to be 'c'
type tail2 = Last<arr2> // expected to be 1

type Last<T extends any[]> = T extends [...infer T, infer K] ? K : never

// 实现一个通用Pop<T>，它接受一个数组T并返回一个没有最后一个元素的数组。

type arr3 = ['a', 'b', 'c', 'd']
type arr4 = [3, 2, 1]

type re1 = Pop<arr3> // expected to be ['a', 'b', 'c']
type re2 = Pop<arr4> // expected to be [3, 2]

type Pop<T extends any[]> = T extends [...infer T, infer K] ? T : never

// 额外：同样，您也可以实现Shift，Push和Unshift吗？
// Push 和 Unshift 见 simple.ts

type re3 = Shift<arr3> // expected to be ['b', 'c', 'd']
type re4 = Shift<arr4> // expected to be [2, 1]

type Shift<T extends any[]> = T extends [infer K, ...infer T] ? T : never

// 键入函数PromiseAll，它接受PromiseLike对象数组，返回值应为Promise<T>，其中T是解析的结果数组。

const promise1 = Promise.resolve(3)
const promise2 = 42
const promise3 = new Promise<string>((resolve, reject) => {
	setTimeout(resolve, 100, 'foo')
})

// expected to be `Promise<[number, number, string]>`
const p = Promise.all([promise1, promise2, promise3] as const)
const p1 = PromiseAll([promise1, promise2, promise3] as const)

declare function PromiseAll<T extends any[]>(
	value: readonly [...T]
): Promise<{ [K in keyof T]: T[K] extends Promise<infer R> ? R : T[K] }>

// 有时，您可能希望根据其属性在并集中查找类型。

// 在此挑战中，我们想通过在联合Cat | Dog中搜索公共type字段来获取相应的类型。换句话说，在以下示例中，我们期望LookUp<Dog | Cat, 'dog'>获得Dog，LookUp<Dog | Cat, 'cat'>获得Cat。

interface Cat {
	type: 'cat'
	breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
	type: 'dog'
	breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
	color: 'brown' | 'white' | 'black'
}

type MyDog = LookUp<Cat | Dog, 'dog'> // expected to be `Dog`
type MyCat = LookUp<Cat | Dog, 'Curl'> // expected to be `Cat`

type LookUp<T, U> = {
	[K in keyof T]: U extends T[K] ? T : never
}[keyof T]

// 实现 TrimLeft<T> ，它接收确定的字符串类型并返回一个新的字符串，其中新返回的字符串删除了原字符串开头的空白字符串。

type trimed = TrimLeft<'  Hello World  '> // 应推导出 'Hello World  '

type TrimLeft<T extends string> = T extends `${' ' | '\n' | '\t'}${infer T}`
	? TrimLeft<T>
	: T

// 实现 TrimRight<T> ，它接收确定的字符串类型并返回一个新的字符串，其中新返回的字符串删除了原字符串结尾的空白字符串。

type Trimed = TrimRight<'  Hello World  '> // 应推导出 '  Hello World'

type TrimRight<T extends string> = T extends `${infer T}${' ' | '\n' | '\t'}`
	? TrimRight<T>
	: T

// 实现 Trim<T>，它采用一个精确的字符串类型，并返回一个新的字符串，从两端删除空白。

type trimed1 = Trim<'  Hello World  '> // expected to be 'Hello World'

type Trim<T extends string> = T extends
	| `${' ' | '\n' | '\t'}${infer T}`
	| `${infer T}${' ' | '\n' | '\t'}`
	? Trim<T>
	: T

// 实现Capitalize<t>，它将字符串的第一个字母转换为大写，其余字母保持原样。

type UpperChar<S extends string> = S extends 'a'
	? 'A'
	: S extends 'b'
	? 'B'
	: S extends 'c'
	? 'C'
	: S extends 'd'
	? 'D'
	: S extends 'e'
	? 'E'
	: S extends 'f'
	? 'F'
	: S extends 'g'
	? 'G'
	: S extends 'h'
	? 'H'
	: S extends 'i'
	? 'I'
	: S extends 'j'
	? 'J'
	: S extends 'k'
	? 'K'
	: S extends 'l'
	? 'L'
	: S extends 'm'
	? 'M'
	: S extends 'n'
	? 'N'
	: S extends 'o'
	? 'O'
	: S extends 'p'
	? 'P'
	: S extends 'q'
	? 'Q'
	: S extends 'r'
	? 'R'
	: S extends 's'
	? 'S'
	: S extends 't'
	? 'T'
	: S extends 'u'
	? 'U'
	: S extends 'v'
	? 'V'
	: S extends 'w'
	? 'W'
	: S extends 'x'
	? 'X'
	: S extends 'y'
	? 'Y'
	: S extends 'z'
	? 'Z'
	: S

type capitalized = MyCapitalize<'hello world'> // expected to be 'Hello world'

type MyCapitalize<T extends string> = T extends `${infer H}${infer T}`
	? `${UpperChar<H>}${T}`
	: UpperChar<T>

// 实现 Replace < s，From，To > ，在给定的字符串 s 中用 To 替换字符串 From

type replaced1 = Replace<'types are fun!', 'fun', 'awesome'> // expected to be 'types are awesome!'
type replaced2 = Replace<'types are fun!', 'types', 'type'> // expected to be 'type are fun!'
type replaced3 = Replace<'', 'types', 'type'> // expected to be ''

type Replace<
	T extends string,
	O extends string,
	N extends string
> = T extends `${infer L}${O}${infer R}` ? `${L}${N}${R}` : T

// 实现 ReplaceAll < s，From，To > ，它用 To 替换给定字符串 s 中的所有子字符串 From

type replaced = ReplaceAll<'t y p e s', ' ', ''> // expected to be 'types'

type ReplaceAll<
	T extends string,
	O extends string,
	N extends string
> = T extends `${infer L}${O}${infer R}` ? ReplaceAll<`${L}${N}${R}`, O, N> : T

// 实现一个范型 AppendArgument<Fn, A>，对于给定的函数类型 Fn，以及一个任意类型 A，返回一个新的函数 G。G 拥有 Fn 的所有参数并在末尾追加类型为 A 的参数。

type Fn = (a: number, b: string) => number

type Result3 = AppendArgument<Fn, boolean>
// 期望是 (a: number, b: string, x: boolean) => number

// with built-in type
type AppendArgument1<Fn extends (...args: any) => any, Type> = (
	...args: [...Parameters<Fn>, Type]
) => ReturnType<Fn>

type AppendArgument<F extends Function, A> = F extends (
	...arg: infer U
) => infer R
	? (...arg: [...U, A]) => R
	: F

// 实现将联合类型转换为包含联合排列的数组的排列类型。

type perm = Permutation<'A' | 'B' | 'C'> // ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']

type Permutation<T, U = T> = [U] extends [never]
	? []
	: T extends never
	? []
	: [T, ...Permutation<Exclude<U, T>>]

type LengthOfString<S extends string> = Split<S>['length']

const len: LengthOfString<'123456'> = 6

// 在这个挑战中，您需要编写一个接受数组并发出扁平数组类型的类型。

type flatten = Flatten<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, 5]

type Flatten<T extends any[]> = T extends [infer L, ...infer R]
	? L extends Array<any>
		? [...Flatten<L>, ...Flatten<R>]
		: [L, ...Flatten<R>]
	: T

type Flatten1<T extends any[]> = T extends [infer First, ...infer Rest]
	? [...(First extends any[] ? Flatten<First> : [First]), ...Flatten<Rest>]
	: []

// 实现向接口添加新字段的类型。类型接受三个参数。输出应该是带有新字段的对象

type Result1 = AppendToObject<{ id: '1' }, 'value', 4> // expected to be { id: '1', value: 4 }

type AppendToObject<T extends object, U extends string, V> = {
	[key in keyof T | U]: key extends keyof T ? T[key] : V
}

// 实现 String to Union 类型。键入 take String 参数。输出应该是输入字母的联合

type Result4 = StringToUnion<'123'> // expected to be "1" | "2" | "3"
type Result5 = StringToUnion1<'123'> // expected to be "1" | "2" | "3"

type StringToUnion<T extends string> = Split<T>[number]
type StringToUnion1<T extends string> = T extends `${infer A}${infer B}`
	? A | StringToUnion<B>
	: never

// 将两种类型合并为一种新类型。第二种类型的键重写第一种类型的键。

type Merge<T extends object, U extends object> = {
	[K in keyof T | keyof U]: K extends keyof U
		? U[K]
		: K extends keyof T
		? T[K]
		: never
}

type c = Merge<{ a: 1 }, { a: 2; b: 3 }> //expected { a: 2, b: 3 }

// for-bar-baz -> forBarBaz 驼峰命名

type Result6 = CamelCase<'for-bar-baz'>

type CamelCase<T extends string> = T extends `${infer L}-${infer R}`
	? `${L}${CamelCase<MyCapitalize<R>>}`
	: T

// FooBarBaz -> for-bar-baz 肉串命名

type Result7 = KebabCase<Result6>
type Result8 = KebabCase<'Result6'>
type Result9 = KebabCase1<'Vue3TypeScript'>

type KebabCase1<T extends string> = T extends `${infer L}${infer R}`
	? Lowercase<L> extends L
		? `${L}${KebabCase<R>}`
		: `${L extends T[0] ? '' : '-'}${Lowercase<L>}${KebabCase<R>}`
	: T

type KebabCase<
	S extends string,
	P extends string = ''
> = S extends `${infer C}${infer R}`
	? C extends Lowercase<C>
		? `${C}${KebabCase<R, '-'>}`
		: `${P}${Lowercase<C>}${KebabCase<R, '-'>}`
	: S

type o1 = { a: 1; b: 2 }
type o2 = { c: 2; b: 3 }

type Result10 = Diff<o1, o2> // expected {a: 1, c: 2}

type Diff<T extends Object, U extends Object> = {
	[K in
		| Exclude<keyof T, keyof U>
		| Exclude<keyof U, keyof T>]: K extends keyof T
		? T[K]
		: K extends keyof U
		? U[K]
		: never
}

// 实现一个类型 IsNever，它接受输入类型 t。如果解析类型为 never，则返回 true，否则返回 false。

type A1 = IsNever<never> // expected to be true
type B = IsNever<undefined> // expected to be false
type C = IsNever<null> // expected to be false
type D = IsNever<[]> // expected to be false
type E = IsNever<number> // expected to be false

type IsNever<T> = [T] extends [never] ? true : false

// 实现一个类型 IsUnion，该类型接受输入类型 t，并返回 t 是否解析为联合类型。

type case1 = IsUnion<string> // false
type case2 = IsUnion<string | number> // true
type case3 = IsUnion<[string | number]> // false

type IsUnion<T, F = T> = T extends T
	? Array<F> extends Array<T>
		? false
		: true
	: never

// 实现一个类型 ReplaceKeys，在联合类型中替换键，如果某个类型没有这个键，只需跳过替换，a 类型有三个参数。

type NodeA = {
	type: 'A'
	name: string
	flag: number
}

type NodeB = {
	type: 'B'
	id: number
	flag: number
}

type NodeC = {
	type: 'C'
	name: string
	flag: number
}

type Nodes = NodeA | NodeB | NodeC

type ReplacedNodes = ReplaceKeys<
	Nodes,
	'name' | 'flag',
	{ name: number; flag: string }
> // {type: 'A', name: number, flag: string} | {type: 'B', id: number, flag: string} | {type: 'C', name: number, flag: string} // would replace name from string to number, replace flag from number to string.

type ReplacedNotExistKeys = ReplaceKeys<Nodes, 'name', { aa: number }> // {type: 'A', name: never, flag: number} | NodeB | {type: 'C', name: never, flag: number} // would replace name to never

type ReplaceKeys<U extends object, T extends keyof any, Y extends object> = {
	[P in keyof U]: P extends T ? (P extends keyof Y ? Y[P] : never) : U[P]
}

// 实现 RemoveIndexSignature < t > ，从对象类型中排除索引签名。

type Foo = {
	[key: string]: any
	foo(): void
}

type A2 = RemoveIndexSignature<Foo> // expected { foo(): void }

type RemoveIndexSignature<T extends Object> = {
	[K in keyof T as number extends K
		? never
		: string extends K
		? never
		: K]: T[K]
}

// 实现 PercentageParser。根据/^ (+ | -) ? (d *) ? (%) ? $/规则性来匹配 t 并获得三个匹配。

// 结构应该是: [ + 或减，数字，单位]如果没有捕获，默认是一个空字符串。

type PString1 = ''
type PString2 = '+85%'
type PString3 = '-85%'
type PString4 = '85%'
type PString5 = '85'

type R1 = PercentageParser<PString1> // expected ['', '', '']
type R2 = PercentageParser<PString2> // expected ["+", "85", "%"]
type R3 = PercentageParser<PString3> // expected ["-", "85", "%"]
type R4 = PercentageParser<PString4> // expected ["", "85", "%"]
type R5 = PercentageParser<PString5> // expected ["", "85", ""]

type GetHead<S> = S extends `${infer H & ('+' | '-')}${infer _}` ? H : ''

type GetTail<S> = S extends `${infer _}%` ? '%' : ''

type PercentageParser<S extends string> =
	S extends `${GetHead<S>}${infer C}${GetTail<S>}`
		? [GetHead<S>, C, GetTail<S>]
		: never

// 从字符串中删除指定的字符。

type Butterfly1 = DropChar1<' b u t t e r f l y', ' '> // 'butterfly' 字符串过长会报错
type Butterfly = DropChar<' b u t t e r f l y ! 1 2 3 4 5 6 7 8 9 7 8 9', ' '> // 'butterfly!' 较好的实现

type DropChar1<
	S extends string,
	D extends string
> = S extends `${infer H}${infer T}`
	? H extends D
		? DropChar1<T, D>
		: `${H}${DropChar1<T, D>}`
	: S

type DropChar<
	S extends string,
	D extends string
> = S extends `${infer H}${D}${infer T}` ? `${H}${DropChar<T, D>}` : S

// 给定一个数字(总是正数)作为类型。你的类型应该返回减少一个的数字。

type Zero = MinusOne<1> // 0
type FiftyFour = MinusOne<55> // 54

type BaseDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
type BaseDigitsStringUnion = `${BaseDigits[number]}`

type TupleGeneratorHepler<
	T extends BaseDigitsStringUnion,
	U extends any[] = []
> = BaseDigits[T] extends U['length'] ? U : TupleGeneratorHepler<T, [...U, any]>

type ExpandTupleBy10x<T extends any[]> = [
	...T,
	...T,
	...T,
	...T,
	...T,
	...T,
	...T,
	...T,
	...T,
	...T
]

type TupleGenerator<
	T extends string,
	U extends any[] = []
> = T extends `${infer FirstDigit}${infer Rest}`
	? FirstDigit extends BaseDigitsStringUnion
		? TupleGenerator<
				Rest,
				[...ExpandTupleBy10x<U>, ...TupleGeneratorHepler<FirstDigit>]
		  >
		: U
	: U

type MinusOne<T extends number> = TupleGenerator<`${T}`> extends [
	_: any,
	...rest: infer Rest
]
	? Rest['length']
	: 0

// 从 t 中选择一组属性，它们的类型可以分配给 u。

type OnlyBoolean = PickByType<
	{
		name: string
		count: number
		isReadonly: boolean
		isEnable: boolean
	},
	boolean
> // { isReadonly: boolean; isEnable: boolean; }

type PickByType<T extends object, U> = {
	[K in keyof T as T[K] extends U ? K : never]: T[K]
}

// 实现 StartsWith < t，u > ，它需要两个精确的字符串类型，并返回 t 是否以 u 开头

type a1 = StartsWith<'abc', 'ac'> // expected to be false
type b1 = StartsWith<'abc', 'ab'> // expected to be true
type c1 = StartsWith<'abc', 'abcd'> // expected to be false

type StartsWith<T extends string, U extends string> = T extends `${U}${infer R}`
	? true
	: false

type a2 = EndsWith<'abc', 'ac'> // expected to be false
type b2 = EndsWith<'abc', 'bc'> // expected to be true
type c2 = EndsWith<'abc', 'abcd'> // expected to be false

type EndsWith<T extends string, U extends string> = T extends `${infer L}${U}`
	? true
	: false

// 实现一个带有两个类型参数 t 和 k 的泛型 PartialByKeys < t，k > 。

// K 指定 t 的属性集，这些属性应该设置为可选的。当不提供 k 时，它应该使所有属性都是可选的，就像正常的 Partial < t > 一样。
interface User {
	name: string
	age: number
	address: string
}

type UserPartialName = PartialByKeys<User, 'name'> // { name?:string; age:number; address:string }

type PartialByKeys<T, U> = Copy<
	{
		[K in keyof T]?: T[K]
	} & {
		[K in Exclude<keyof T, U>]: T[K]
	}
>

type Copy<T> = { [K in keyof T]: T[K] }

type PartialByKeys1<T extends object, U extends keyof T> = Copy<
	MyOmit<T, U> & {
		[K in keyof T & U]?: T[K]
	}
>

// 实现一个通用 RequiredByKeys < t，k > ，它接受两个类型参数 t 和 k。

// K 指定 t 的属性集，这些属性应该设置为必需的。当没有提供 k 时，它应该使所有属性都像普通的 Required < t > 一样被要求。

type UserPartialName1 = RequiredByKeys<User, 'name'> // { name: string; age?: number; address?: string }

type RequiredByKeys<T extends object, U extends keyof T> = Copy<
	{
		[K in Exclude<keyof T, U>]?: T[K]
	} & {
		[K in keyof T & U]: T[K]
	}
>

// 实现通用的可变性 < t > ，它使 t 中的所有属性都可变(而不是只读)。
interface Todo4 {
	readonly title: string
	readonly description: string
	readonly completed: boolean
}

type MutableTodo = Mutable<Todo> // { title: string; description: string; completed: boolean; }

type Mutable<T> = {
	-readonly [K in keyof T]: T[K]
}

// 从 t 中选择一组类型不能分配给 u 的属性。

type OmitBoolean = OmitByType<
	{
		name: string
		count: number
		isReadonly: boolean
		isEnable: boolean
	},
	boolean
> // { name: string; count: number }

type OmitByType<T extends object, U extends T[keyof T]> = {
	[K in keyof T as T[K] extends U ? never : K]: T[K]
}

// 实现 Object.entries 的类型版本
interface Model {
	name: string
	age: number
	locations: string[] | null
}

type modelEntries = ObjectEntries1<Model> // ['name', string] | ['age', number] | ['locations', string[] | null];

type ObjectEntries<T extends object> = {
	[K in keyof T]: [K, T[K]]
}[keyof T]

type ObjectEntries1<T, U extends keyof T = keyof T> = U extends infer Prop
	? [Prop, T[U]]
	: never

// 给定一个只包含字符串类型的 tuple 类型 t 和一个类型 u，递归地构建一个对象。

type a5 = TupleToNestedObject<['a'], string> // {a: string}
type b5 = TupleToNestedObject<['a', 'b'], number> // {a: {b: number}}
type c5 = TupleToNestedObject<[], boolean> // boolean. if the tuple is empty, just return the U type

type TupleToNestedObject<T extends string[], U> = T extends [
	infer L,
	...infer R
]
	? {
			[key in L extends string ? L : never]: R extends string[]
				? TupleToNestedObject<R, U>
				: U
	  }
	: U

// 实现类型版本的 Array.reverse

type a6 = Reverse<['a', 'b']> // ['b', 'a']
type b6 = Reverse<['a', 'b', 'c']> // ['c', 'b', 'a']

type Reverse<T extends any[]> = T extends [...infer U, infer R]
	? [R, ...Reverse<U>]
	: []

// 实现 lodash 的 _. flip 的类型版本。

// Fliparganuments < t > 类型需要函数类型 t，并返回一个新的函数类型，该类型具有相同的返回类型 t，但是返回的参数是反向的。

type Flipped = FlipArguments<
	(arg0: string, arg1: number, arg2: boolean) => void
>
// (arg0: boolean, arg1: number, arg2: string) => void

type FlipArguments<T> = T extends (...args: infer Args) => infer ReturnType
	? (...args: Reverse<Args>) => ReturnType
	: never

// 递归地将数组平坦到深度倍。

type a7 = FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2> // [1, 2, 3, 4, [5]]. flattern 2 times
type b7 = FlattenDepth<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, [[5]]]. Depth defaults to be 1

// 如果提供了深度，则保证是正整数。

type FlattenDepth<
	T extends any[],
	U extends number = 1,
	A extends any[] = []
> = A['length'] extends U
	? T
	: T extends [infer L, ...infer R]
	? [
			...(L extends any[] ? FlattenDepth<L, U, [...A, 1]> : [L]),
			...FlattenDepth<R, U, A>
	  ]
	: T

// 块、元素、修饰符方法(BEM)是一个流行的 CSS 类变数命名原则。

// 例如，块组件将表示为 btn，取决于块的元素将表示为 btn _ price，改变块风格的修饰符将表示为 btn---big 或 btn _ price-- warning。

// 实现由这三个参数生成字符串并的 BEM < b，e，m > 。其中 b 是字符串文字，e 和 m 是字符串数组(可以是空的)。

type WithEorM<
	S extends string,
	M extends string,
	R extends string = ''
> = R extends '' ? S : `${S}${M}${R}`

type BEM<
	B extends string,
	E extends string = '',
	M extends string = ''
> = WithEorM<WithEorM<B, '_', E>, '--', M>

type a9 = BEM<'btn', 'price', 'warning'>
type b9 = BEM<'btn', 'price'>
type c9 = BEM<'btn'>

// 实现 just-flip-object 的类型。例如:

type a10 = Flip<{ a: 'x'; b: 'y'; c: 'z' }> // {x: 'a', y: 'b', z: 'c'}
type b10 = Flip<{ a: 1; b: 2; c: 3 }> // {1: 'a', 2: 'b', 3: 'c'}
type c10 = Flip<{ a: false; b: true }> // {false: 'a', true: 'b'}

// 不需要支持嵌套的对象和不能作为对象键(如数组)的值

type Flip<T extends Record<any, any>> = {
	[K in keyof T as `${T[K]}`]: K
}

type Flip1<T extends object> = {
	[K in keyof T as T[K] extends symbol | number | string
		? T[K]
		: T[K] extends boolean
		? `${T[K]}`
		: never]: K
}

// 实现一个通用的斐波纳契数列 < t > 获取一个数字 t 并返回它对应的斐波那契数列。

// 序列开始: 1,1,2,3,5,8,13,21,34,55,89,144，..。

type Result11 = Fibonacci<0> // []
type Result12 = Fibonacci<1> // [1]
type Result13 = Fibonacci<3> // [1, 1, 2]
type Result14 = Fibonacci<8> // [1, 1, 2, 3, 5, 8, 13, 21]
type Result15 = Fibonacci<20> // 20 => max length:[1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765]

type isInteger<T extends number> = `${T}` extends `${infer L}.${infer R}`
	? false
	: true

type Fibonacci<
	T extends number,
	U extends any[] = [],
	F extends any[] = [],
	S extends any[] = [1]
> = isInteger<T> extends true
	? T extends 0
		? U
		: [1, ...U]['length'] extends T
		? [1, ...U]
		: Fibonacci<T, [...U, [...F, ...S]['length']], S, [...F, ...S]>
	: never

//  在这个挑战中，你应该实现类型更大的 < t，u > 像 t > u

//  负数不需要考虑。

type a11 = GreaterThan<2, 1> //should be true

type a12 = GreaterThan<1, 1> //should be false

type a13 = GreaterThan<1, 2> //should be false

type GreaterThan<
	T extends number,
	U extends number,
	F extends any[] = [],
	S extends any[] = []
> = F['length'] extends T
	? false
	: S['length'] extends U
	? true
	: GreaterThan<T, U, [...F, 1], [...S, 1]>

// 在这个挑战中，你应该实现一个类型 Zip < t，u > ，t 和 u 必须是 Tuple

type exp = Zip<[1, 2], [true, false]> // expected to be [[1, true], [2, false]]

type Zip<T extends any[], U extends any[]> = T extends [infer L, ...infer R]
	? U extends [infer F, ...infer S]
		? [[L, F], ...Zip<R, S>]
		: []
	: []

//  实现一个类型 IsTuple，该类型接受输入类型 t 并返回 t 是否为 tuple 类型。

type case4 = IsTuple<[number]> // true
type case5 = IsTuple<readonly [number]> // true
type case6 = IsTuple<number[]> // false

type IsTuple<T> = T extends readonly any[]
	? number extends T['length']
		? false
		: true
	: false

// 你认识罗达什吗？块在其中是一个非常有用的函数，现在让我们实现它。Chunk < t，n > 接受两个必需的类型参数，t 必须是一个元组，n 必须是一个整数 > = 1

type exp1 = Chunk<[1, 2, 3], 2> // expected to be [[1, 2], [3]]
type exp2 = Chunk<[1, 2, 3], 4> // expected to be [[1, 2, 3]]
type exp3 = Chunk<[1, 2, 3], 1> // expected to be [[1], [2], [3]]

type Chunk<
	T extends any[],
	U extends number,
	R extends any[] = []
> = R['length'] extends U
	? [R, ...Chunk<T, U>]
	: T extends [infer L, ...infer A]
	? Chunk<A, U, [...R, L]>
	: R extends []
	? R
	: [R]

// 一个常见的 JavaScript 函数，现在让我们用类型来实现它。填充 < t，n，开始？，完结? > ，如您所见，Fill 接受四种类型的参数，其中 t 和 n 是必需的参数，Start 和 End 是可选参数。这些参数的要求是: t 必须是一个元组，n 可以是任何类型的值，Start 和 End 必须是大于或等于0的整数。

type exp4 = Fill<[1, 2, 3], 0> // expected to be [0, 0, 0]
type exp5 = Fill<[1, 2, 3, 4, 5, 6], 100, 2, 4> // expected to be [1, 2, 100, 100, 5, 6]
type exp6 = Fill<[2, 4, 6, 8, 10, 12, 14, 16, 18, 20], 666, 6> // expected to be [2, 4, 6, 8, 10, 12, 666, 666, 666, 666]

// 为了模拟真实的函数，测试可能包含一些边界条件，希望你能喜欢

type Fill<
	T extends any[],
	U extends any,
	S extends number = 0,
	E extends number = T['length'],
	A extends any[] = []
> = T extends [infer L, ...infer R]
	? A['length'] extends S
		? S extends E
			? [...A, ...T]
			: Fill<R, U, [...A, U]['length'] & number, E, [...A, U]>
		: Fill<R, U, S, E, [...A, L]>
	: A

// 实现 math.trunk 的类型版本，该版本接受字符串或数字，并通过删除任何小数位来返回数字的整数部分。

type A3 = Trunc<12.34> // 12

type Trunc<T extends number> = `${T}` extends `${infer L}.${infer R}` ? L : T

// 实现类型版本的 Array.lastIndexOf，LastIndexOf < t，u > 接受一个 Array t，任何 u，并返回 Array t 中最后一个 u 的索引

type Res18 = LastIndexOf<[1, 2, 3, 2, 1], 2> // 3
type Res19 = LastIndexOf<[0, 0, 0], 2> // -1

type LastIndexOf<
	T extends any[],
	U extends any,
	A extends any[] = [],
	I extends number = -1
> = T extends [infer F, ...infer R]
	? LastIndexOf<R, U, [...A, F], F extends U ? A['length'] : I>
	: I

type LastIndexOf1<T extends any[], U> = T extends [...infer I, infer L]
	? L extends U
		? I['length']
		: LastIndexOf<I, U>
	: -1

// 实现 MapTypes < t，r > ，它将把对象 t 中的类型转换为类型 r 定义的不同类型，类型 r 具有以下结构

type StringToNumber = {
	mapFrom: string // value of key which value is string
	mapTo: number // will be transformed for number
}

type MapTypes<T extends {}, U extends { mapFrom: any; mapTo: any }> = {
	[K in keyof T]: T[K] extends U['mapFrom'] ? U['mapTo'] : T[K]
}

// 例子:
type res = MapTypes<{ iWillBeANumberOneDay: string }, StringToNumber> // gives { iWillBeANumberOneDay: number; }

// 请注意，用户可以提供类型的联合:

type StringToDate = { mapFrom: string; mapTo: Date }
type res1 = MapTypes<
	{ iWillBeNumberOrDate: string },
	StringToDate | StringToNumber
> // gives { iWillBeNumberOrDate: number | Date; }

// 如果这个类型在我们的地图中不存在，就让它保持原样:

type res2 = MapTypes<
	{ iWillBeANumberOneDay: string; iWillStayTheSame: Function },
	StringToNumber
> // gives { iWillBeANumberOneDay: number, iWillStayTheSame: Function }
