// Implement the type version of Lodash.without, Without<T, U> takes an Array T,
// number or array U and returns an Array without the elements of U.
type Without<
  T extends any[],
  U extends T[number] | T[number][],
  A extends any[] = []
> = T extends [infer L, ...infer R]
  ? L extends [U extends any[] ? U : [U]][0][number]
    ? Without<R, U, A>
    : Without<R, U, [...A, L]>
  : A;

type Res = Without<[1, 2], 1>; // excepted to be [2]
type Res1 = Without<[1, 2, 4, 1, 5], [1, 2]>; // excepted to be [4, 5]
type Res2 = Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>; // excepted to be []
