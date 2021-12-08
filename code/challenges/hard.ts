// 实现类似Vue的类型支持的简化版本。

// 通过提供函数名称SimpleVue（类似于Vue.extend或defineComponent），它应该正确地推断出计算和方法内部的this类型。

// 在此挑战中，我们假设SimpleVue接受带有data，computed和methods字段的Object作为唯一参数，

// -data是一个简单的函数，它返回一个公开上下文this的对象，但是您无法访问data中的数据本身或其他计算机值或方法。

// -computed是将上下文作为this的函数的对象，进行一些计算并返回结果。计算结果应作为简单的返回值而不是函数显示给上下文。

// -methods是函数的对象，其上下文也与this相同。方法可以访问data，computed以及其他methods公开的字段。 computed与methods的不同之处在于按原样公开的功能。

// SimpleVue的返回值类型可以是任意的。

const instance = SimpleVue({
  data() {
    return {
      firstname: "Type",
      lastname: "Challenges",
      amount: 10,
    };
  },
  computed: {
    fullname() {
      return this.firstname + " " + this.lastname;
    },
    name() {
      this.fullname();
    },
  },
  methods: {
    hi() {
      alert(this.fullname.toLowerCase());
    },
  },
});

type A = Record<string, any>;

interface Options<D, C extends A, M> {
  data: (this: void) => D;
  computed: C & ThisType<D & C>;
  methods: M & ThisType<M & { [P in keyof C]: ReturnType<C[P]> }>;
}

declare function SimpleVue<D, C extends A, M>(options: Options<D, C, M>): any;

// 实现一个类型 uniontuple，它将联合转换为元组。

// 正如我们所知，联合是一个无序的结构，但是元组是一个有序的结构，这意味着我们不应该预先假设任何秩序将被保留在一个联合条款之间，当联合被创建或转换。

// 因此，在这个挑战中，输出元组中元素的任何排列都是可以接受的。

// 您的类型应该解析为以下两种类型之一，但不是它们的联合！

type tup = UnionToTuple<1>; // [1], and correct
type tup1 = UnionToTuple<"any" | "a">; // ['any','a'], and correct

type UnionToTuple<T, R extends any[] = [], U = T> = [T] extends [never]
  ? R
  : T extends T
  ? UnionToTuple<Exclude<U, T>, [...R, T]>
  : [];
