interface ISuccess<T> extends Array<T | null> {
  0: T;
  1: null;
}

interface IFailure<E> extends Array<E | null> {
  0: null;
  1: E;
}

type Result<T, E = Error> = ISuccess<T> | IFailure<E>;

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as E];
  }
}
