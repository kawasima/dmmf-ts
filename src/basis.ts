import { Either } from "fp-ts/lib/Either";

type Parse<A,B,E> = (a: A) => Either<E, B>
type Calculation<A, B> = (a: A) => B
type Action<A,B,E> = (a: A) => Either<E, B>

